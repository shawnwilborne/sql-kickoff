import { useRef, useState } from 'react';
import { STARTER_CHALLENGES, PRO_CHALLENGES } from '../game/challenges';
import { KICKOFF_ADVANCE_CALLS, KICKOFF_BLOCK_CALL, KICKOFF_STAGES } from '../game/feedback';
import { ChallengeRunner } from './ChallengeRunner';
import { useProgress } from '../state/progress';
import type { RunOutcome } from '../state/useRunQuery';

type SubMode = 'starter' | 'pro';

// ---------------------------------------------------------------------------
// Pitch (Starter mode visual)
// ---------------------------------------------------------------------------

function Pitch({ stage, shake }: { stage: number; shake: boolean }) {
  const ballX = 50 + stage * 100; // 0->50, 1->150, 2->250, 3->350
  return (
    <svg className={`pitch ${shake ? 'shake' : ''}`} viewBox="0 0 420 200" role="img" aria-label="Soccer pitch">
      <rect x="0" y="0" width="420" height="200" rx="10" className="pitch-grass" />
      <rect x="6" y="6" width="408" height="188" rx="6" className="pitch-line-fill" />
      <line x1="210" y1="6" x2="210" y2="194" className="pitch-line" />
      <circle cx="210" cy="100" r="34" className="pitch-line" fill="none" />
      {/* Goal on the right */}
      <rect x="396" y="66" width="14" height="68" className="goal" />
      <line x1="396" y1="66" x2="396" y2="134" className="pitch-line" />
      {/* Defenders guarding the box */}
      <circle cx="300" cy="74" r="9" className="defender" />
      <circle cx="300" cy="126" r="9" className="defender" />
      {/* Ball */}
      <g className="ball-group" style={{ transform: `translateX(${ballX - 50}px)` }}>
        <circle cx="50" cy="100" r="11" className="ball" />
        <text x="50" y="104" className="ball-emoji" textAnchor="middle">⚽</text>
      </g>
      {/* Stage labels */}
      {KICKOFF_STAGES.map((label, i) => (
        <text key={label} x={50 + i * 100} y="180" textAnchor="middle" className={`stage-label ${i <= stage ? 'reached' : ''}`}>
          {label}
        </text>
      ))}
    </svg>
  );
}

function StarterKickoff() {
  const starters = STARTER_CHALLENGES;
  const [stage, setStage] = useState(0);
  const stageRef = useRef(0);
  const [goals, setGoals] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [call, setCall] = useState('Answer SQL questions to pass, cross, and shoot. 3 correct = GOAL!');
  const [shake, setShake] = useState(false);

  const handleOutcome = (o: RunOutcome) => {
    if (o.status === 'success') {
      const next = stageRef.current + 1;
      if (next >= 3) {
        stageRef.current = 0;
        setStage(0);
        setGoals((g) => g + 1);
        setCall(KICKOFF_ADVANCE_CALLS[2]); // GOAL!
      } else {
        stageRef.current = next;
        setStage(next);
        setCall(KICKOFF_ADVANCE_CALLS[next - 1]); // Nice pass! / Great cross!
      }
      setQIndex((i) => (i + 1) % starters.length);
      setStep((s) => s + 1);
    } else {
      setCall(KICKOFF_BLOCK_CALL);
      setShake(true);
      window.setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="kickoff-starter">
      <div className="scoreboard">
        <div className="score-item">
          <span className="score-num">{goals}</span>
          <span className="score-label">Goals</span>
        </div>
        <div className="score-item">
          <span className="score-num">{stage} / 3</span>
          <span className="score-label">Build-up</span>
        </div>
      </div>
      <Pitch stage={stage} shake={shake} />
      <p className={`kickoff-call ${shake ? 'blocked' : ''}`}>{call}</p>
      <ChallengeRunner
        key={`starter-${step}`}
        challenge={starters[qIndex]}
        showScenario
        showResult={false}
        onOutcome={handleOutcome}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pro League (Pro mode dashboard)
// ---------------------------------------------------------------------------

function ProLeague() {
  const pros = PRO_CHALLENGES;
  const { progress } = useProgress();
  const [proIndex, setProIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [possession, setPossession] = useState(50);
  const [shots, setShots] = useState(0);
  const [goals, setGoals] = useState(0);
  const [blocks, setBlocks] = useState(0);
  const [call, setCall] = useState('Welcome to the SQL Pro League. Solve real queries to dominate the match.');

  const handleOutcome = (o: RunOutcome) => {
    if (o.status === 'success') {
      setShots((s) => s + 1);
      setGoals((g) => g + 1);
      setPossession((p) => Math.min(85, p + 8));
      setProIndex((i) => (i + 1) % pros.length);
      setStep((s) => s + 1);
      setCall('GOAL! Clean finish — possession swings your way. ⚽');
    } else {
      setBlocks((b) => b + 1);
      setPossession((p) => Math.max(20, p - 6));
      setCall(KICKOFF_BLOCK_CALL);
    }
  };

  return (
    <div className="kickoff-pro">
      <div className="match-dashboard">
        <div className="possession">
          <div className="possession-head">
            <span>You {possession}%</span>
            <span>CPU {100 - possession}%</span>
          </div>
          <div className="possession-bar">
            <div className="possession-you" style={{ width: `${possession}%` }} />
          </div>
        </div>
        <div className="match-stats">
          <div className="stat">
            <span className="stat-num">{goals}</span>
            <span className="stat-label">Goals</span>
          </div>
          <div className="stat">
            <span className="stat-num">{shots}</span>
            <span className="stat-label">Shots</span>
          </div>
          <div className="stat">
            <span className="stat-num">{blocks}</span>
            <span className="stat-label">Blocked</span>
          </div>
          <div className="stat">
            <span className="stat-num">{progress.xp}</span>
            <span className="stat-label">XP</span>
          </div>
        </div>
      </div>
      <p className="kickoff-call">{call}</p>
      <ChallengeRunner
        key={`pro-${step}`}
        challenge={pros[proIndex]}
        showScenario
        showResult={false}
        hintPenalty
        onOutcome={handleOutcome}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------

export function KickoffMode() {
  const [sub, setSub] = useState<SubMode>('starter');

  return (
    <div className="kickoff-mode">
      <div className="kickoff-header">
        <h2 className="section-title">⚽ SQL Kickoff Mode</h2>
        <div className="segmented" role="group" aria-label="Kickoff sub-mode">
          <button type="button" className={sub === 'starter' ? 'active' : ''} onClick={() => setSub('starter')}>
            Starter Kickoff
          </button>
          <button type="button" className={sub === 'pro' ? 'active' : ''} onClick={() => setSub('pro')}>
            SQL Pro League
          </button>
        </div>
      </div>
      <p className="muted small">
        {sub === 'starter'
          ? 'Each correct answer advances the ball — pass, cross, and shoot your way to a goal.'
          : 'Solve real SQL challenges on a FIFA-style match dashboard. Hints cost a little XP but keep you moving.'}
      </p>
      {sub === 'starter' ? <StarterKickoff /> : <ProLeague />}
    </div>
  );
}
