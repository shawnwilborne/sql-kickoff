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

const KEY = 'sqlkickoff.leaderboard.v1';

// A few demo classmates so the board isn't lonely on first run. They are clearly
// marked "(demo)" and exist only to give a new student some targets to pass.
const DEMO_ENTRIES: LeaderboardEntry[] = [
  {
    name: 'Maya (demo)',
    xp: 1450,
    level: 4,
    levelTitle: 'Data Detective',
    badges: 6,
    challengesCompleted: 8,
    sqliteChallenges: 5,
    postgresChallenges: 3,
    lastActive: '2026-06-16',
  },
  {
    name: 'Diego (demo)',
    xp: 920,
    level: 3,
    levelTitle: 'Query Builder',
    badges: 4,
    challengesCompleted: 5,
    sqliteChallenges: 4,
    postgresChallenges: 1,
    lastActive: '2026-06-15',
  },
  {
    name: 'Priya (demo)',
    xp: 480,
    level: 2,
    levelTitle: 'Table Explorer',
    badges: 3,
    challengesCompleted: 3,
    sqliteChallenges: 2,
    postgresChallenges: 1,
    lastActive: '2026-06-14',
  },
];

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(DEMO_ENTRIES));
      return [...DEMO_ENTRIES];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LeaderboardEntry[]) : [];
  } catch {
    return [...DEMO_ENTRIES];
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
