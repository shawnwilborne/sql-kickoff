import { useProgress } from '../state/progress';
import { TOTAL_CHALLENGES } from '../game/challenges';

export function ProgressPanel() {
  const { progress, level } = useProgress();
  const pct =
    level.nextFloor === null ? 100 : Math.min(100, Math.round((level.intoLevel / level.span) * 100));

  return (
    <div className="progress-panel card">
      <div className="pp-name">{progress.name || 'Player'}</div>
      <div className="pp-level">
        Level {level.level}: {level.title}
      </div>
      <div className="xp-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="xp-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="pp-xp">
        {level.nextFloor === null
          ? `XP: ${progress.xp} — Max level!`
          : `XP: ${progress.xp} / ${level.nextFloor}`}
      </div>
      <div className="pp-stats">
        <span>🏅 Badges: {progress.badges.length}</span>
        <span>
          🎯 Challenges: {progress.completedChallenges.length} / {TOTAL_CHALLENGES}
        </span>
      </div>
    </div>
  );
}
