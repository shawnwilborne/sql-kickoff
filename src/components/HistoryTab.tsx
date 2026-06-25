import { useCallback, useEffect, useState } from 'react';
import { loadHistory, clearHistory, type HistoryRow } from '../state/history';
import { useAuth } from '../state/auth';
import { ResultsTable } from './ResultsTable';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function HistoryTab() {
  const { user } = useAuth();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await loadHistory(100));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onClear = async () => {
    if (!user) return;
    if (!window.confirm('Delete your entire query history? This cannot be undone.')) return;
    setBusy(true);
    try {
      await clearHistory(user.id);
      setRows([]);
      setExpanded(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="history-tab">
      <div className="history-head">
        <h2 className="section-title">🕓 Query History</h2>
        <div className="history-actions">
          <button type="button" className="secondary" onClick={() => void refresh()} disabled={loading}>
            ↻ Refresh
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => void onClear()}
            disabled={busy || rows.length === 0}
          >
            🗑 Clear
          </button>
        </div>
      </div>
      <p className="muted small">
        Your last 100 queries — text, results, and time — saved privately to your account.
      </p>

      {error && <div className="banner-error">Could not load history: {error}</div>}
      {loading && <p className="muted">Loading your history…</p>}
      {!loading && rows.length === 0 && !error && (
        <p className="muted">No queries yet — run something in Practice or Challenges to start your history.</p>
      )}

      <div className="history-list">
        {rows.map((r) => {
          const isOpen = expanded === r.id;
          return (
            <div key={r.id} className="history-item card">
              <button
                type="button"
                className="history-row-head"
                onClick={() => setExpanded(isOpen ? null : r.id)}
                aria-expanded={isOpen}
              >
                <span className={`hist-badge hist-${r.status}`}>{r.status}</span>
                <code className="hist-query" title={r.query}>
                  {r.query}
                </code>
                <span className="hist-meta">
                  <span className="hist-engine">{r.engine === 'postgres' ? 'PostgreSQL' : 'SQLite'}</span>
                  {r.status !== 'error' && (
                    <span>
                      {r.row_count} row{r.row_count === 1 ? '' : 's'}
                    </span>
                  )}
                  <span>{formatTime(r.created_at)}</span>
                  <span className="hist-caret">{isOpen ? '▾' : '▸'}</span>
                </span>
              </button>
              {isOpen && (
                <div className="history-detail">
                  <pre className="hist-query-full">{r.query}</pre>
                  {r.status === 'error' ? (
                    <div className="feedback feedback-error">
                      <code className="err-detail">{r.error}</code>
                    </div>
                  ) : (
                    <ResultsTable
                      result={{ columns: r.columns, columnTypes: r.column_types, rows: r.rows }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
