// Core gamification rules: levels, XP values, SQL-concept detection, and badges.

export type EngineMode = 'sqlite' | 'postgres';

// ---------------------------------------------------------------------------
// Levels
// ---------------------------------------------------------------------------

export interface LevelDef {
  level: number;
  title: string;
  floor: number; // XP required to reach this level
}

// Thresholds chosen so the L3 -> L4 boundary lands at 1200, matching the
// Progress Panel example in the requirements ("XP: 850 / 1200").
export const LEVELS: LevelDef[] = [
  { level: 1, title: 'SQL Rookie', floor: 0 },
  { level: 2, title: 'Table Explorer', floor: 300 },
  { level: 3, title: 'Query Builder', floor: 600 },
  { level: 4, title: 'Data Detective', floor: 1200 },
  { level: 5, title: 'Analytics Pro', floor: 2000 },
  { level: 6, title: 'SQL Captain', floor: 3000 },
];

export interface LevelInfo {
  level: number;
  title: string;
  floor: number;
  /** XP at which the next level begins, or null at the max level. */
  nextFloor: number | null;
  /** XP accumulated within the current level band. */
  intoLevel: number;
  /** XP span of the current level band (Infinity at max level). */
  span: number;
}

export function levelForXp(xp: number): LevelInfo {
  let current = LEVELS[0];
  for (const def of LEVELS) {
    if (xp >= def.floor) current = def;
  }
  const next = LEVELS.find((l) => l.level === current.level + 1) ?? null;
  return {
    level: current.level,
    title: current.title,
    floor: current.floor,
    nextFloor: next ? next.floor : null,
    intoLevel: xp - current.floor,
    span: next ? next.floor - current.floor : Infinity,
  };
}

// ---------------------------------------------------------------------------
// XP values for non-concept actions
// ---------------------------------------------------------------------------

export const XP = {
  csvUpload: 50,
  sampleLoad: 25,
  firstQuery: 100,
  fixQuery: 150,
  challenge: 250,
  hintPenalty: 25,
} as const;

// ---------------------------------------------------------------------------
// SQL keyword + concept detection
// ---------------------------------------------------------------------------

export type Keyword =
  | 'SELECT'
  | 'FROM'
  | 'WHERE'
  | 'AND'
  | 'OR'
  | 'IN'
  | 'LIKE'
  | 'BETWEEN'
  | 'ORDER BY'
  | 'GROUP BY'
  | 'HAVING'
  | 'JOIN';

const KEYWORD_PATTERNS: { kw: Keyword; re: RegExp }[] = [
  { kw: 'SELECT', re: /\bselect\b/i },
  { kw: 'FROM', re: /\bfrom\b/i },
  { kw: 'WHERE', re: /\bwhere\b/i },
  { kw: 'AND', re: /\band\b/i },
  { kw: 'OR', re: /\bor\b/i },
  { kw: 'IN', re: /\bin\s*\(/i },
  { kw: 'LIKE', re: /\blike\b/i },
  { kw: 'BETWEEN', re: /\bbetween\b/i },
  { kw: 'ORDER BY', re: /\border\s+by\b/i },
  { kw: 'GROUP BY', re: /\bgroup\s+by\b/i },
  { kw: 'HAVING', re: /\bhaving\b/i },
  { kw: 'JOIN', re: /\bjoin\b/i },
];

/** Remove string/identifier literals so we never match keywords inside quotes. */
export function stripLiterals(sql: string): string {
  return sql
    .replace(/'(?:[^']|'')*'/g, "''")
    .replace(/"(?:[^"]|"")*"/g, '""')
    .replace(/--[^\n]*/g, ' ');
}

/** Detect which SQL keywords a successful query used. */
export function detectKeywords(sql: string): Keyword[] {
  const cleaned = stripLiterals(sql);
  // The AND inside "BETWEEN x AND y" is part of BETWEEN, not a boolean AND.
  // Neutralize it so BETWEEN doesn't also award the AND/OR concept.
  const forAnd = cleaned.replace(/\bbetween\b\s+[^()]+?\s+and\b/gi, ' between ');
  return KEYWORD_PATTERNS.filter(({ kw, re }) =>
    kw === 'AND' ? re.test(forAnd) : re.test(cleaned),
  ).map(({ kw }) => kw);
}

export function usesCreateTable(sql: string): boolean {
  return /\bcreate\s+table\b/i.test(stripLiterals(sql));
}

// ---------------------------------------------------------------------------
// Concept groups (XP awarded once per group)
// ---------------------------------------------------------------------------

export type ConceptKey =
  | 'select'
  | 'where'
  | 'and_or'
  | 'filter'
  | 'order_by'
  | 'group_by'
  | 'join';

export interface ConceptDef {
  key: ConceptKey;
  label: string;
  xp: number;
  keywords: Keyword[];
}

export const CONCEPTS: ConceptDef[] = [
  { key: 'select', label: 'SELECT', xp: 50, keywords: ['SELECT'] },
  { key: 'where', label: 'WHERE', xp: 75, keywords: ['WHERE'] },
  { key: 'and_or', label: 'AND / OR', xp: 100, keywords: ['AND', 'OR'] },
  { key: 'filter', label: 'IN / LIKE / BETWEEN', xp: 125, keywords: ['IN', 'LIKE', 'BETWEEN'] },
  { key: 'order_by', label: 'ORDER BY', xp: 100, keywords: ['ORDER BY'] },
  { key: 'group_by', label: 'GROUP BY', xp: 150, keywords: ['GROUP BY'] },
  { key: 'join', label: 'JOIN', xp: 200, keywords: ['JOIN'] },
];

/** Which concept groups are present in a query, given its detected keywords. */
export function conceptsUsed(keywords: Keyword[]): ConceptDef[] {
  const set = new Set(keywords);
  return CONCEPTS.filter((c) => c.keywords.some((k) => set.has(k)));
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGES: BadgeDef[] = [
  { id: 'first-query', name: 'First Query', emoji: '🎯', description: 'Ran your first successful query.' },
  { id: 'csv-uploader', name: 'CSV Uploader', emoji: '📤', description: 'Uploaded a CSV dataset.' },
  { id: 'where-warrior', name: 'WHERE Warrior', emoji: '🛡️', description: 'Filtered rows with WHERE.' },
  { id: 'filter-master', name: 'Filter Master', emoji: '🧲', description: 'Used IN, LIKE, or BETWEEN.' },
  { id: 'debugger', name: 'Debugger', emoji: '🐞', description: 'Fixed a failed query and reran it.' },
  { id: 'schema-builder', name: 'Schema Builder', emoji: '🏗️', description: 'Created a table with CREATE TABLE.' },
  { id: 'postgres-explorer', name: 'Postgres Explorer', emoji: '🐘', description: 'Ran a query in PostgreSQL mode.' },
  { id: 'sqlite-sprinter', name: 'SQLite Sprinter', emoji: '⚡', description: 'Ran a query in SQLite mode.' },
  { id: 'data-detective', name: 'Data Detective', emoji: '🕵️', description: 'Completed 5 challenges.' },
  { id: 'challenge-champion', name: 'Challenge Champion', emoji: '🏆', description: 'Completed every challenge.' },
];

export const BADGE_BY_ID = new Map(BADGES.map((b) => [b.id, b]));
