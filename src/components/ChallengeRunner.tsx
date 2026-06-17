import { useRef, useState } from 'react';
import { useRunQuery, type RunOutcome } from '../state/useRunQuery';
import { useProgress } from '../state/progress';
import { useDatabase } from '../db/DatabaseContext';
import type { Challenge } from '../game/challenges';
import { ResultsTable } from './ResultsTable';

interface Props {
  challenge: Challenge;
  showScenario?: boolean;
  showResult?: boolean;
  hintPenalty?: boolean;
  onOutcome?: (outcome: RunOutcome) => void;
}

export function ChallengeRunner({
  challenge,
  showScenario = true,
  showResult = true,
  hintPenalty = false,
  onOutcome,
}: Props) {
  const runAndScore = useRunQuery();
  const { progress, useHint } = useProgress();
  const { status } = useDatabase();
  const [sql, setSql] = useState('');
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const hintedRef = useRef(false);

  const completed = progress.completedChallenges.includes(challenge.id);

  const run = async () => {
    setBusy(true);
    const out = await runAndScore(sql, challenge);
    setOutcome(out);
    onOutcome?.(out);
    setBusy(false);
  };

  const revealHint = () => {
    setHintShown(true);
    if (hintPenalty && !hintedRef.current) {
      hintedRef.current = true;
      useHint();
    }
  };

  return (
    <div className={`challenge card ${completed ? 'completed' : ''}`}>
      <div className="ch-head">
        <h3>{challenge.title}</h3>
        {completed && <span className="ch-done">✅ Completed</span>}
      </div>
      {showScenario && <p className="ch-scenario">{challenge.scenario}</p>}
      <p className="ch-concept">
        🎯 <strong>{challenge.requiredConcept}</strong> · 🏆 {challenge.xp} XP
      </p>
      <textarea
        className="sql-editor"
        value={sql}
        placeholder="Write your SQL here…"
        onChange={(e) => setSql(e.target.value)}
        spellCheck={false}
        rows={3}
        aria-label={`SQL editor for ${challenge.title}`}
      />
      <div className="ch-actions">
        <button type="button" onClick={run} disabled={busy || status !== 'ready'}>
          ▶ Run query
        </button>
        <button type="button" className="secondary" onClick={revealHint}>
          💡 Hint{hintPenalty ? ' (−25 XP)' : ''}
        </button>
      </div>
      {hintShown && (
        <p className="ch-hint">
          <code>{challenge.hint}</code>
        </p>
      )}
      {outcome && (
        <div className={`feedback feedback-${outcome.status}`}>
          <span>{outcome.feedback}</span>
          {outcome.error && <code className="err-detail">{outcome.error}</code>}
        </div>
      )}
      {showResult && outcome?.result && <ResultsTable result={outcome.result} />}
    </div>
  );
}
