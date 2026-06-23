import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { levelForXp } from '../game/rules';
import { useProgress } from '../state/progress';

interface Row {
  name: string;
  xp: number;
  badges: string[];
  completed_challenges: string[];
  sqlite_challenges: number;
  postgres_challenges: number;
  last_active: string;
}

export function LeaderboardTab() {
  const { progress } = useProgress();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('profiles')
        .select('name,xp,badges,completed_challenges,sqlite_challenges,postgres_challenges,last_active')
        .order('xp', { ascending: false })
        .limit(100);
      if (cancelled) return;
      if (err) setError(err.message);
      else {
        setError(null);
        setRows((data ?? []) as Row[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // Refetch when the player's own XP changes so they see themselves move.
  }, [progress.xp]);

  return (
    <div className="leaderboard-tab">
      <h2 className="section-title">🏆 Class Leaderboard</h2>
      <p className="muted small">
        Live leaderboard, synced to Supabase across everyone signed in to the class. Your XP and
        badges update here automatically.
      </p>

      {error && <div className="banner-error">Could not load the leaderboard: {error}</div>}

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
            {loading && (
              <tr>
                <td colSpan={9} className="lb-empty muted">
                  Loading leaderboard…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="lb-empty muted">
                  No scores yet — run a query or complete a challenge to get on the board!
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((e, i) => {
                const info = levelForXp(e.xp);
                const isMe = e.name === progress.name;
                return (
                  <tr key={`${e.name}-${i}`} className={isMe ? 'me' : ''}>
                    <td>{i + 1}</td>
                    <td>
                      {e.name}
                      {isMe ? ' (you)' : ''}
                    </td>
                    <td>{e.xp}</td>
                    <td>
                      {info.level} · {info.title}
                    </td>
                    <td>{e.badges?.length ?? 0}</td>
                    <td>{e.completed_challenges?.length ?? 0}</td>
                    <td>{e.sqlite_challenges}</td>
                    <td>{e.postgres_challenges}</td>
                    <td>{e.last_active}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
