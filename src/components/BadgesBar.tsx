import { BADGES } from '../game/rules';
import { useProgress } from '../state/progress';

export function BadgesBar() {
  const { progress } = useProgress();
  const earned = new Set(progress.badges);

  return (
    <div className="badges-bar">
      {BADGES.map((b) => (
        <div
          key={b.id}
          className={`badge ${earned.has(b.id) ? 'earned' : 'locked'}`}
          title={`${b.name} — ${b.description}`}
        >
          <span className="badge-emoji">{earned.has(b.id) ? b.emoji : '🔒'}</span>
          <span className="badge-name">{b.name}</span>
        </div>
      ))}
    </div>
  );
}
