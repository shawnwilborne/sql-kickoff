import { useEffect, useState } from 'react';
import { loadLeaderboard, type LeaderboardEntry } from '../state/leaderboard';
import { useProgress } from '../state/progress';

export function LeaderboardTab() {
  const { progress } = useProgress();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries([...loadLeaderboard()].sort((a, b) => b.xp - a.xp));
  }, [progress]);

  return (
    <div className="leaderboard-tab">
      <h2 className="section-title">🏆 Class Leaderboard</h2>
      <p className="muted small">
        This leaderboard is stored locally in this browser for classroom practice. It is not
        submitted or saved to a server.
      </p>
      <div className="table-wrap">
        <table className="result-table leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>XP</th>
              <th>Level</th>
              <th>Badges</th>
              <th>Challenges</th>
              <th>SQLite</th>
              <th>Postgres</th>
              <th>Last active</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.name} className={e.name === progress.name ? 'me' : ''}>
                <td>{i + 1}</td>
                <td>
                  {e.name}
                  {e.name === progress.name ? ' (you)' : ''}
                </td>
                <td>{e.xp}</td>
                <td>
                  {e.level} · {e.levelTitle}
                </td>
                <td>{e.badges}</td>
                <td>{e.challengesCompleted}</td>
                <td>{e.sqliteChallenges}</td>
                <td>{e.postgresChallenges}</td>
                <td>{e.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
