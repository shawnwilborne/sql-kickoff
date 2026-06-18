// Local, browser-only leaderboard persisted in localStorage.

export interface LeaderboardEntry {
  name: string;
  xp: number;
  level: number;
  levelTitle: string;
  badges: number;
  challengesCompleted: number;
  sqliteChallenges: number;
  postgresChallenges: number;
  lastActive: string; // ISO date (YYYY-MM-DD)
}

// Bumped to v2 so existing browsers drop the old seeded demo classmates.
const KEY = 'sqlkickoff.leaderboard.v2';

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LeaderboardEntry[]) : [];
  } catch {
    return [];
  }
}

/** Insert or update the current student's entry (keyed by name) and persist. */
export function upsertEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  const list = loadLeaderboard().filter((e) => e.name !== entry.name);
  list.push(entry);
  list.sort((a, b) => b.xp - a.xp);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota / privacy-mode errors; the board stays in memory.
  }
  return list;
}
