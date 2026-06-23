import { useState, type KeyboardEvent } from 'react';
import { useRunQuery, type RunOutcome } from '../state/useRunQuery';
import { useDatabase } from '../db/DatabaseContext';
import { useProgress } from '../state/progress';
import { ResultsTable } from './ResultsTable';
import { CsvUpload } from './CsvUpload';

const DEFAULT_SQL = `-- Your database starts empty.
-- Use "Load / reset sample data" below to load practice tables, or upload a CSV.
-- Then write SELECT queries against your data.
SELECT 'Welcome to SQL Kickoff!' AS message;`;

export function QueryConsole() {
  const runAndScore = useRunQuery();
  const { reloadSample, status } = useDatabase();
  const { recordSampleLoad, pushToast } = useProgress();
  const [sql, setSql] = useState(DEFAULT_SQL);
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setOutcome(await runAndScore(sql));
    setBusy(false);
  };

  const onSample = async () => {
    try {
      await reloadSample();
      recordSampleLoad();
      pushToast({ kind: 'success', text: 'Sample dataset loaded. Tables: members, workouts.' });
    } catch (e) {
      pushToast({
        kind: 'error',
        text: 'Could not load sample: ' + (e instanceof Error ? e.message : String(e)),
      });
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      void run();
    }
  };

  return (
    <div className="console">
      <div className="console-toolbar">
        <button type="button" onClick={run} disabled={busy || status !== 'ready'}>
          ▶ Run query
        </button>
        <span className="muted small kbd-hint">⌘/Ctrl + Enter</span>
        <div className="spacer" />
        <button type="button" className="secondary" onClick={onSample} disabled={status !== 'ready'}>
          ↺ Load / reset sample data
        </button>
      </div>
      <textarea
        className="sql-editor"
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        rows={6}
        aria-label="SQL editor"
      />
      {outcome && (
        <div className={`feedback feedback-${outcome.status}`}>
          <span>{outcome.feedback}</span>
          {outcome.error && <code className="err-detail">{outcome.error}</code>}
        </div>
      )}
      {outcome?.result && <ResultsTable result={outcome.result} />}
      <CsvUpload />
    </div>
  );
}
