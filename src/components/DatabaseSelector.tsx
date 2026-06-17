import { useState } from 'react';
import { useDatabase } from '../db/DatabaseContext';
import type { EngineMode } from '../db/types';

const LABELS: Record<EngineMode, string> = {
  sqlite: 'SQLite',
  postgres: 'PostgreSQL',
};

export function DatabaseSelector() {
  const { mode, status, switchMode } = useDatabase();
  const [pending, setPending] = useState<EngineMode | null>(null);

  const request = (next: EngineMode) => {
    if (next === mode || status === 'loading') return;
    setPending(next);
  };

  const confirm = async () => {
    const next = pending;
    setPending(null);
    if (next) await switchMode(next);
  };

  return (
    <div className="db-selector">
      <span className="db-label">Database Mode</span>
      <div className="segmented" role="group" aria-label="Database mode">
        <button
          type="button"
          className={mode === 'sqlite' ? 'active' : ''}
          onClick={() => request('sqlite')}
          disabled={status === 'loading'}
        >
          SQLite
        </button>
        <button
          type="button"
          className={mode === 'postgres' ? 'active' : ''}
          onClick={() => request('postgres')}
          disabled={status === 'loading'}
        >
          PostgreSQL
        </button>
      </div>
      {status === 'loading' && <span className="db-status">Loading engine…</span>}
      <p className="db-help muted small">
        SQLite is great for quick practice. PostgreSQL mode is closer to Supabase and professional
        cloud databases.
      </p>

      {pending && (
        <div className="modal-backdrop">
          <div className="modal card">
            <h3>Switch to {LABELS[pending]}?</h3>
            <p>
              Switching database engines will reset your current session. Download or copy anything
              you want to keep.
            </p>
            <p className="muted small">Your XP, badges, and progress are kept — only the database resets.</p>
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setPending(null)}>
                Cancel
              </button>
              <button type="button" onClick={confirm}>
                Switch engine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
