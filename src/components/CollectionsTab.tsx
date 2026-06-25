import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useAuth } from '../state/auth';
import { useDatabase } from '../db/DatabaseContext';
import { useProgress } from '../state/progress';
import { parseCsv, sanitizeTableName } from '../util/csv';
import {
  saveCollection,
  listCollections,
  deleteCollection,
  type Collection,
} from '../state/collections';

export function CollectionsTab() {
  const { user } = useAuth();
  const { loadCsv, status } = useDatabase();
  const { recordCsvUpload, pushToast } = useProgress();
  const inputRef = useRef<HTMLInputElement>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const handleFile = async (file: File) => {
    if (!user) return;
    setBusy(true);
    try {
      const text = await file.text();
      const { columns, rows } = parseCsv(text);
      if (columns.length === 0) {
        pushToast({ kind: 'error', text: 'That file has no columns to import.' });
        return;
      }
      const table = sanitizeTableName(file.name);
      await saveCollection(user.id, {
        name: file.name.replace(/\.[^.]+$/, ''),
        table_name: table,
        columns,
        rows,
      });
      await loadCsv(table, columns, rows);
      recordCsvUpload();
      pushToast({
        kind: 'success',
        text: `Saved & loaded "${table}" (${rows.length} rows). Query it in Practice.`,
      });
      await refresh();
    } catch (e) {
      pushToast({ kind: 'error', text: 'Upload failed: ' + (e instanceof Error ? e.message : String(e)) });
    } finally {
      setBusy(false);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  };

  const load = async (c: Collection) => {
    try {
      await loadCsv(c.table_name, c.columns, c.rows);
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
        Upload a CSV to save it as a collection on your account. Any time you sign in, pick a
        collection to load it into the database and query it.
      </p>

      <div className="upload-box card">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || status !== 'ready'}
        >
          📤 {busy ? 'Uploading…' : 'Upload CSV'}
        </button>
        <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={onChange} />
        <p className="warning small">
          ⚠️ Use classroom or synthetic datasets only. Do not upload private, sensitive, regulated,
          or real client/patient data.
        </p>
      </div>

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
              {c.columns.map((col) => (
                <span key={col} className="coll-col">
                  {col}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
