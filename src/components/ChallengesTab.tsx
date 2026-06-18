import { STARTER_CHALLENGES, PRO_CHALLENGES, TOTAL_CHALLENGES } from '../game/challenges';
import { ChallengeRunner } from './ChallengeRunner';
import { SampleDataBanner } from './SampleDataBanner';
import { useProgress } from '../state/progress';

export function ChallengesTab() {
  const { progress } = useProgress();

  return (
    <div className="challenges-tab">
      <SampleDataBanner />
      <p className="muted">
        Completed {progress.completedChallenges.length} / {TOTAL_CHALLENGES} challenges. Each one is a
        real business request — write SQL to satisfy it.
      </p>

      <h2 className="section-title">⭐ Starter Challenges</h2>
      <div className="challenge-grid">
        {STARTER_CHALLENGES.map((c) => (
          <ChallengeRunner key={c.id} challenge={c} />
        ))}
      </div>

      <h2 className="section-title">🔥 Pro Challenges</h2>
      <div className="challenge-grid">
        {PRO_CHALLENGES.map((c) => (
          <ChallengeRunner key={c.id} challenge={c} />
        ))}
      </div>
    </div>
  );
}
