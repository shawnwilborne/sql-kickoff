import { useState } from 'react';
import { useRunQuery, type RunOutcome } from '../state/useRunQuery';
import { useDatabase } from '../db/DatabaseContext';
import { ResultsTable } from './ResultsTable';
import { SqlEditor } from './SqlEditor';

const DEFAULT_SQL = `-- Your database starts empty.
-- Load a saved dataset from the "My Data" tab (or the sample data from the
-- Challenges tab), then query it. Tip: start typing for table, column, and
-- keyword suggestions.
SELECT 'Welcome to SQL Kickoff!' AS message;`;

export function QueryConsole() {
  const runAndScore = useRunQuery();
  const { status, schema, mode } = useDatabase();
  const [sql, setSql] = useState(DEFAULT_SQL);
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setOutcome(await runAndScore(sql));
    setBusy(false);
  };

  return (
    <div className="console">
      <div className="console-toolbar">
        <button type="button" onClick={run} disabled={busy || status !== 'ready'}>
          ▶ Run query
        </button>
        <span className="muted small kbd-hint">⌘/Ctrl + Enter</span>
      </div>
      <SqlEditor
        value={sql}
        onChange={setSql}
        onSubmit={run}
        schema={schema}
        mode={mode}
        minHeight="140px"
        placeholder="Write SQL here — start typing for suggestions…"
      />
      {outcome && (
        <div className={`feedback feedback-${outcome.status}`}>
          <span>{outcome.feedback}</span>
          {outcome.error && <code className="err-detail">{outcome.error}</code>}
        </div>
      )}
      {outcome?.result && <ResultsTable result={outcome.result} />}
    </div>
  );
}
