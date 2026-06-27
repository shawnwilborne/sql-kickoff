import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useAuth } from '../state/auth';
import { useDatabase } from '../db/DatabaseContext';
import { useProgress } from '../state/progress';
import { parseCsv, sanitizeTableName } from '../util/csv';
import {
  inferColumnTypes,
  COLUMN_TYPES,
  COLUMN_TYPE_LABELS,
  type ColumnType,
} from '../util/columnTypes';
import {
  saveCollection,
  listCollections,
  deleteCollection,
  type Collection,
} from '../state/collections';

interface Pending {
  name: string;
  table: string;
  columns: string[];
  types: ColumnType[];
  rows: string[][];
}

export function CollectionsTab() {
  const { user } = useAuth();
  const { loadCsv, status } = useDatabase();
  const { recordCsvUpload, pushToast } = useProgress();
  const inputRef = useRef<HTMLInputElement>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCollections(await listCollections());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onFile = async (file: File) => {
    try {
      const text = await file.text();
      const { columns, rows } = parseCsv(text);
      if (columns.length === 0) {
        pushToast({ kind: 'error', text: 'That file has no columns to import.' });
        return;
      }
      setPending({
        name: file.name.replace(/\.[^.]+$/, ''),
        table: sanitizeTableName(file.name),
        columns,
        types: inferColumnTypes(columns, rows),
        rows,
      });
    } catch (e) {
      pushToast({ kind: 'error', text: 'Could not read that CSV: ' + (e instanceof Error ? e.message : String(e)) });
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void onFile(file);
    e.target.value = '';
  };

  const setType = (i: number, type: ColumnType) => {
    setPending((p) => (p ? { ...p, types: p.types.map((t, j) => (j === i ? type : t)) } : p));
  };

  const confirmUpload = async () => {
    if (!user || !pending) return;
    setBusy(true);
    try {
      await saveCollection(user.id, {
        name: pending.name,
        table_name: pending.table,
        columns: pending.columns,
        column_types: pending.types,
        rows: pending.rows,
      });
      await loadCsv(pending.table, pending.columns, pending.types, pending.rows);
      recordCsvUpload();
      pushToast({
        kind: 'success',
        text: `Saved & loaded "${pending.table}" (${pending.rows.length} rows). Query it in Practice.`,
      });
      setPending(null);
      await refresh();
    } catch (e) {
      pushToast({ kind: 'error', text: 'Save failed: ' + (e instanceof Error ? e.message : String(e)) });
    } finally {
      setBusy(false);
    }
  };

  const load = async (c: Collection) => {
    try {
      await loadCsv(c.table_name, c.columns, (c.column_types ?? []) as ColumnType[], c.rows);
      pushToast({ kind: 'success', text: `Loaded "${c.table_name}". Try: SELECT * FROM ${c.table_name};` });
    } catch (e) {
      pushToast({ kind: 'error', text: 'Could not load: ' + (e instanceof Error ? e.message : String(e)) });
    }
  };

  const remove = async (c: Collection) => {
    if (!window.confirm(`Delete collection "${c.name}"? This cannot be undone.`)) return;
    try {
      await deleteCollection(c.id);
      await refresh();
    } catch (e) {
      pushToast({ kind: 'error', text: 'Could not delete: ' + (e instanceof Error ? e.message : String(e)) });
    }
  };

  return (
    <div className="collections-tab">
      <h2 className="section-title">📚 My Data</h2>
      <p className="muted small">
        Upload a CSV to save it as a collection. Column types are detected automatically (and you
        can adjust them) so you can query without casting. Pick any saved collection to load it.
      </p>

      <div className="upload-box card">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
          📤 Upload CSV
        </button>
        <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={onChange} />
        <p className="warning small">
          ⚠️ Use classroom or synthetic datasets only. Do not upload private, sensitive, regulated,
          or real client/patient data.
        </p>
      </div>

      {pending && (
        <div className="upload-preview card">
          <h3>
            Review “{pending.name}” — {pending.rows.length} rows
          </h3>
          <p className="muted small">
            Set the type for each column, then save. Values that don't fit a type become NULL.
          </p>
          <div className="table-wrap">
            <table className="result-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                  <th>Sample values</th>
                </tr>
              </thead>
              <tbody>
                {pending.columns.map((col, i) => (
                  <tr key={col}>
                    <td>
                      <code>{col}</code>
                    </td>
                    <td>
                      <select
                        className="type-select"
                        value={pending.types[i]}
                        onChange={(e) => setType(i, e.target.value as ColumnType)}
                      >
                        {COLUMN_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {COLUMN_TYPE_LABELS[t]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="muted small">
                      {pending.rows
                        .map((r) => r[i])
                        .filter((v) => (v ?? '').trim() !== '')
                        .slice(0, 3)
                        .join(', ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="preview-actions">
            <button type="button" onClick={() => void confirmUpload()} disabled={busy || status !== 'ready'}>
              💾 {busy ? 'Saving…' : 'Save & Load'}
            </button>
            <button type="button" className="secondary" onClick={() => setPending(null)} disabled={busy}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <div className="banner-error">{error}</div>}
      {loading && <p className="muted">Loading your collections…</p>}
      {!loading && collections.length === 0 && !error && (
        <p className="muted">No collections yet — upload a CSV to create your first one.</p>
      )}

      <div className="collection-list">
        {collections.map((c) => (
          <div key={c.id} className="collection-item card">
            <div className="coll-head">
              <div>
                <h3>{c.name}</h3>
                <p className="muted small">
                  table <code>{c.table_name}</code> · {c.row_count} rows ·{' '}
                  {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="coll-actions">
                <button type="button" onClick={() => void load(c)} disabled={status !== 'ready'}>
                  ↺ Load
                </button>
                <button type="button" className="secondary" onClick={() => void remove(c)} title="Delete">
                  🗑
                </button>
              </div>
            </div>
            <div className="coll-cols">
              {c.columns.map((col, i) => (
                <span key={col} className="coll-col">
                  {col}
                  <span className="coll-col-type">{c.column_types?.[i] ?? 'text'}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
