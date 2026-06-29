import { useState } from 'react';
import { useDatabase } from '../db/DatabaseContext';
import { useProgress } from '../state/progress';
import { updateCollection, type Collection } from '../state/collections';
import { COLUMN_TYPES, COLUMN_TYPE_LABELS, type ColumnType } from '../util/columnTypes';

interface Props {
  collection: Collection;
  onClose: () => void;
}

export function CollectionEditor({ collection, onClose }: Props) {
  const { loadCsv, status } = useDatabase();
  const { pushToast } = useProgress();
  const [columns, setColumns] = useState<string[]>([...collection.columns]);
  const [types, setTypes] = useState<ColumnType[]>(
    collection.columns.map((_, i) => (collection.column_types?.[i] ?? 'text') as ColumnType),
  );
  const [rows, setRows] = useState<string[][]>(collection.rows.map((r) => [...r]));
  const [editing, setEditing] = useState<{ r: number; c: number } | null>(null);
  const [draft, setDraft] = useState('');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  const markDirty = () => setDirty(true);

  // ---- cell editing (single active cell uses a local draft for speed) ----
  const startEdit = (r: number, c: number) => {
    setEditing({ r, c });
    setDraft(rows[r][c] ?? '');
  };
  const commitEdit = () => {
    if (!editing) return;
    const { r, c } = editing;
    setRows((rs) => rs.map((row, i) => (i === r ? row.map((v, j) => (j === c ? draft : v)) : row)));
    setEditing(null);
    setDirty(true);
  };

  // ---- columns ----
  const renameColumn = (c: number, name: string) => {
    setColumns((cs) => cs.map((v, i) => (i === c ? name : v)));
    markDirty();
  };
  const changeType = (c: number, t: ColumnType) => {
    setTypes((ts) => ts.map((v, i) => (i === c ? t : v)));
    markDirty();
  };
  const deleteColumn = (c: number) => {
    if (columns.length <= 1) {
      pushToast({ kind: 'error', text: 'A table needs at least one column.' });
      return;
    }
    setColumns((cs) => cs.filter((_, i) => i !== c));
    setTypes((ts) => ts.filter((_, i) => i !== c));
    setRows((rs) => rs.map((row) => row.filter((_, i) => i !== c)));
    markDirty();
  };
  const addColumn = () => {
    let n = columns.length + 1;
    let name = `column_${n}`;
    while (columns.includes(name)) {
      n += 1;
      name = `column_${n}`;
    }
    setColumns((cs) => [...cs, name]);
    setTypes((ts) => [...ts, 'text']);
    setRows((rs) => rs.map((row) => [...row, '']));
    markDirty();
  };

  // ---- rows ----
  const deleteRow = (r: number) => {
    setRows((rs) => rs.filter((_, i) => i !== r));
    markDirty();
  };
  const addRow = () => {
    setRows((rs) => [...rs, columns.map(() => '')]);
    markDirty();
  };

  const save = async () => {
    setBusy(true);
    try {
      await updateCollection(collection.id, { columns, column_types: types, rows });
      await loadCsv(collection.table_name, columns, types, rows);
      pushToast({
        kind: 'success',
        text: `Saved "${collection.table_name}" (${rows.length} rows) and reloaded it into the database.`,
      });
      setDirty(false);
      onClose();
    } catch (e) {
      pushToast({ kind: 'error', text: 'Save failed: ' + (e instanceof Error ? e.message : String(e)) });
    } finally {
      setBusy(false);
    }
  };

  const back = () => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    onClose();
  };

  return (
    <div className="collection-editor">
      <div className="ce-toolbar">
        <button type="button" className="secondary" onClick={back}>
          ← Back
        </button>
        <span className="ce-title">
          Editing <code>{collection.table_name}</code> · {rows.length} rows
        </span>
        <div className="spacer" />
        <button type="button" className="secondary" onClick={addRow}>
          + Row
        </button>
        <button type="button" className="secondary" onClick={addColumn}>
          + Column
        </button>
        <button type="button" onClick={() => void save()} disabled={!dirty || busy || status !== 'ready'}>
          💾 {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
      <p className="muted small">
        Click a cell to edit. Change a column's name or type in the header. Saving rewrites the table
        in the database, so queries reflect your edits.
      </p>

      <div className="table-wrap ce-grid">
        <table className="result-table">
          <thead>
            <tr>
              <th className="ce-corner" />
              {columns.map((col, c) => (
                <th key={c} className="ce-colhead">
                  <input
                    className="ce-colname"
                    value={col}
                    onChange={(e) => renameColumn(c, e.target.value)}
                    aria-label={`Column ${c + 1} name`}
                  />
                  <div className="ce-coltools">
                    <select
                      className="ce-typesel"
                      value={types[c]}
                      onChange={(e) => changeType(c, e.target.value as ColumnType)}
                    >
                      {COLUMN_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {COLUMN_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="ce-delcol"
                      title="Delete column"
                      onClick={() => deleteColumn(c)}
                    >
                      🗑
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                <td className="ce-rownum">
                  <span>{r + 1}</span>
                  <button type="button" className="ce-delrow" title="Delete row" onClick={() => deleteRow(r)}>
                    ✕
                  </button>
                </td>
                {row.map((cell, c) => {
                  const isEd = editing?.r === r && editing?.c === c;
                  return (
                    <td key={c} className="ce-cell" onClick={() => !isEd && startEdit(r, c)}>
                      {isEd ? (
                        <input
                          autoFocus
                          className="ce-cellinput"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              commitEdit();
                            } else if (e.key === 'Escape') {
                              setEditing(null);
                            }
                          }}
                        />
                      ) : cell === '' ? (
                        <span className="muted">—</span>
                      ) : (
                        cell
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="muted">No rows yet — use “+ Row” to add one.</p>}
    </div>
  );
}
