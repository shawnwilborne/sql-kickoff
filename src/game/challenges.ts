// Challenge definitions + validation.
//
// Expected answers are derived from the seed data so they always stay in sync.
// Validation is intentionally forgiving for a classroom setting: it checks that
// the required concept is present AND that the result has the expected number of
// rows (and, where relevant, the expected columns). It does not demand an exact
// column list, so students can SELECT * or pick specific columns.

import type { QueryResult } from '../db/types';
import { MEMBERS, WORKOUTS } from '../data/seed';
import { detectKeywords, type Keyword } from './rules';

export type ChallengeTier = 'starter' | 'pro';

export interface ValidationResult {
  ok: boolean;
  message?: string;
}

export interface Challenge {
  id: string;
  tier: ChallengeTier;
  title: string;
  scenario: string;
  requiredConcept: string;
  hint: string;
  xp: number;
  validate: (result: QueryResult, sql: string) => ValidationResult;
}

// --- Expected answers derived from the dataset -----------------------------

const TOTAL = MEMBERS.length;
const MIAMI = MEMBERS.filter((m) => m.city === 'Miami').length;
const PREMIUM = MEMBERS.filter((m) => m.tier === 'Premium').length;
const SCORE_GT_80 = MEMBERS.filter((m) => m.score > 80).length;
const PREMIUM_MIA_ORL = MEMBERS.filter(
  (m) => m.tier === 'Premium' && (m.city === 'Miami' || m.city === 'Orlando'),
).length;
const GMAIL = MEMBERS.filter((m) => m.email.endsWith('@gmail.com')).length;
const SCORE_70_90 = MEMBERS.filter((m) => m.score >= 70 && m.score <= 90).length;
const CITIES_OVER_5 = (() => {
  const counts = new Map<string, number>();
  for (const m of MEMBERS) counts.set(m.city, (counts.get(m.city) ?? 0) + 1);
  return [...counts.values()].filter((n) => n > 5).length;
})();
const WORKOUT_COUNT = WORKOUTS.length;

// --- Validation helpers ----------------------------------------------------

const has = (sql: string, kw: Keyword) => detectKeywords(sql).includes(kw);
const rowCount = (r: QueryResult) => r.rows.length;
const hasColumns = (r: QueryResult, names: string[]) => {
  const cols = r.columns.map((c) => c.toLowerCase());
  return names.every((n) => cols.includes(n.toLowerCase()));
};

const countMismatch = (got: number, expected: number, noun: string): ValidationResult => ({
  ok: false,
  message: `Close! That ran, but it returned ${got} row${got === 1 ? '' : 's'} — I expected ${expected} ${noun}. Check your conditions.`,
});

const needConcept = (concept: string): ValidationResult => ({
  ok: false,
  message: `That ran, but the challenge wants you to use ${concept}. Give it a try.`,
});

// --- Challenges ------------------------------------------------------------

export const CHALLENGES: Challenge[] = [
  // ---------------- Starter ----------------
  {
    id: 'show-all-members',
    tier: 'starter',
    title: 'Show all members',
    scenario: 'The coach wants to see the full member roster before the season starts.',
    requiredConcept: 'SELECT … FROM',
    hint: 'SELECT * FROM members;',
    xp: 250,
    validate: (r, sql) => {
      if (!has(sql, 'SELECT') || !has(sql, 'FROM')) return needConcept('SELECT … FROM');
      if (rowCount(r) !== TOTAL) return countMismatch(rowCount(r), TOTAL, 'members');
      return { ok: true };
    },
  },
  {
    id: 'select-names-cities',
    tier: 'starter',
    title: 'Select names and cities',
    scenario: 'Marketing needs just the name and city for every member.',
    requiredConcept: 'SELECT specific columns',
    hint: 'SELECT name, city FROM members;',
    xp: 250,
    validate: (r, sql) => {
      if (!has(sql, 'SELECT') || !has(sql, 'FROM')) return needConcept('SELECT … FROM');
      if (!hasColumns(r, ['name', 'city']))
        return { ok: false, message: 'Make sure your result includes a name column and a city column.' };
      if (rowCount(r) !== TOTAL) return countMismatch(rowCount(r), TOTAL, 'members');
      return { ok: true };
    },
  },
  {
    id: 'find-miami',
    tier: 'starter',
    title: 'Find Miami members',
    scenario: 'A Miami pop-up event needs the list of members who train in Miami.',
    requiredConcept: 'WHERE',
    hint: "SELECT * FROM members WHERE city = 'Miami';",
    xp: 250,
    validate: (r, sql) => {
      if (!has(sql, 'WHERE')) return needConcept('WHERE');
      if (rowCount(r) !== MIAMI) return countMismatch(rowCount(r), MIAMI, 'Miami members');
      return { ok: true };
    },
  },
  {
    id: 'find-premium',
    tier: 'starter',
    title: 'Find Premium members',
    scenario: 'The loyalty team wants every member on the Premium tier.',
    requiredConcept: 'WHERE',
    hint: "SELECT * FROM members WHERE tier = 'Premium';",
    xp: 250,
    validate: (r, sql) => {
      if (!has(sql, 'WHERE')) return needConcept('WHERE');
      if (rowCount(r) !== PREMIUM) return countMismatch(rowCount(r), PREMIUM, 'Premium members');
      return { ok: true };
    },
  },
  {
    id: 'score-above-80',
    tier: 'starter',
    title: 'Find members with score above 80',
    scenario: 'Coaching wants to recognize members whose fitness score is above 80.',
    requiredConcept: 'WHERE with a comparison',
    hint: 'SELECT * FROM members WHERE score > 80;',
    xp: 250,
    validate: (r, sql) => {
      if (!has(sql, 'WHERE')) return needConcept('WHERE');
      if (rowCount(r) !== SCORE_GT_80) return countMismatch(rowCount(r), SCORE_GT_80, 'members');
      return { ok: true };
    },
  },

  // ---------------- Pro ----------------
  {
    id: 'premium-miami-orlando',
    tier: 'pro',
    title: 'Premium members in Miami or Orlando',
    scenario: 'A VIP regional event invites Premium members from Miami or Orlando.',
    requiredConcept: 'WHERE with AND + OR (or IN)',
    hint: "SELECT * FROM members WHERE tier = 'Premium' AND (city = 'Miami' OR city = 'Orlando');",
    xp: 250,
    validate: (r, sql) => {
      if (!has(sql, 'WHERE')) return needConcept('WHERE');
      if (!has(sql, 'OR') && !has(sql, 'IN')) return needConcept('OR (or IN) to match two cities');
      if (rowCount(r) !== PREMIUM_MIA_ORL)
        return countMismatch(rowCount(r), PREMIUM_MIA_ORL, 'members');
      return { ok: true };
    },
  },
  {
    id: 'gmail-users',
    tier: 'pro',
    title: 'Find Gmail users',
    scenario: 'The email team wants every member using a Gmail address.',
    requiredConcept: 'LIKE',
    hint: "SELECT * FROM members WHERE email LIKE '%@gmail.com';",
    xp: 250,
    validate: (r, sql) => {
      if (!has(sql, 'LIKE')) return needConcept('LIKE');
      if (rowCount(r) !== GMAIL) return countMismatch(rowCount(r), GMAIL, 'Gmail users');
      return { ok: true };
    },
  },
  {
    id: 'scores-70-90',
    tier: 'pro',
    title: 'Find members with scores between 70 and 90',
    scenario: 'A tier review looks at members whose score is between 70 and 90.',
    requiredConcept: 'BETWEEN',
    hint: 'SELECT * FROM members WHERE score BETWEEN 70 AND 90;',
    xp: 250,
    validate: (r, sql) => {
      if (!has(sql, 'BETWEEN')) return needConcept('BETWEEN');
      if (rowCount(r) !== SCORE_70_90) return countMismatch(rowCount(r), SCORE_70_90, 'members');
      return { ok: true };
    },
  },
  {
    id: 'cities-over-5',
    tier: 'pro',
    title: 'Find cities with more than 5 members',
    scenario: 'Operations wants to know which cities have more than 5 members.',
    requiredConcept: 'GROUP BY + HAVING',
    hint: 'SELECT city, COUNT(*) FROM members GROUP BY city HAVING COUNT(*) > 5;',
    xp: 250,
    validate: (r, sql) => {
      if (!has(sql, 'GROUP BY')) return needConcept('GROUP BY');
      if (!has(sql, 'HAVING')) return needConcept('HAVING to filter the groups');
      if (rowCount(r) !== CITIES_OVER_5) return countMismatch(rowCount(r), CITIES_OVER_5, 'cities');
      return { ok: true };
    },
  },
  {
    id: 'join-workouts',
    tier: 'pro',
    title: 'Join members to workouts',
    scenario: 'Reporting wants each member shown next to the workouts they logged.',
    requiredConcept: 'JOIN',
    hint: 'SELECT m.name, w.type, w.calories FROM members m JOIN workouts w ON w.member_id = m.id;',
    xp: 250,
    validate: (r, sql) => {
      if (!has(sql, 'JOIN')) return needConcept('JOIN');
      if (rowCount(r) === 0)
        return { ok: false, message: 'Your JOIN returned no rows — check the ON condition linking the tables.' };
      if (rowCount(r) !== WORKOUT_COUNT)
        return {
          ok: false,
          message: `Almost! An inner join of members and workouts returns ${WORKOUT_COUNT} rows (one per workout). Check your ON condition.`,
        };
      return { ok: true };
    },
  },
];

export const TOTAL_CHALLENGES = CHALLENGES.length;
export const STARTER_CHALLENGES = CHALLENGES.filter((c) => c.tier === 'starter');
export const PRO_CHALLENGES = CHALLENGES.filter((c) => c.tier === 'pro');
export const CHALLENGE_BY_ID = new Map(CHALLENGES.map((c) => [c.id, c]));
