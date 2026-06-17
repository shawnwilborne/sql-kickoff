// Friendly, soccer-flavored feedback messages for successes and errors.

import { stripLiterals, type Keyword } from './rules';

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const GENERIC_SUCCESS = [
  'Nice pass!',
  'Great cross!',
  'Clean finish! Your query matched the business request.',
];

/** Praise after a correctly solved challenge, tailored to the concepts used. */
export function successChallengeFeedback(keywords: Keyword[]): string {
  const set = new Set(keywords);
  if (set.has('IN') && set.has('BETWEEN')) return 'Pro move! You combined IN and BETWEEN.';
  if (set.has('JOIN')) return 'Top corner! Your JOIN connected the tables perfectly.';
  if (set.has('GROUP BY')) return 'Great vision! You grouped the data like a playmaker.';
  if (set.has('BETWEEN')) return 'Clean finish! You nailed the BETWEEN range.';
  if (set.has('LIKE')) return 'Sharp! Your LIKE pattern picked out exactly the right rows.';
  if (set.has('OR') || set.has('AND')) return 'Great combo! You chained conditions like a midfield maestro.';
  if (set.has('WHERE')) return 'Goal! You used WHERE correctly.';
  return pick(GENERIC_SUCCESS);
}

/** Encouraging message when a query ran but didn't match the challenge. */
export const PARTIAL_FEEDBACK =
  "Good run! That executed, but it doesn't match the challenge yet — check the hint.";

/** Map a raw engine error into a friendly, actionable nudge. */
export function errorFeedback(message: string, sql: string): string {
  const lower = message.toLowerCase();
  const cleaned = stripLiterals(sql);

  if (/\bselect\b/i.test(cleaned) && !/\bfrom\b/i.test(cleaned)) {
    return 'Almost there. Did you include the table name after FROM?';
  }
  if (/no such table|relation .* does not exist|table .* does/.test(lower)) {
    return "Blocked by the defender — that table isn't on the pitch. Try `members` or `workouts` after FROM.";
  }
  if (/no such column|column .* does not exist/.test(lower)) {
    return "Try adding quotes around text values like 'Miami'. Column names use no quotes; text values use single quotes.";
  }
  if (/syntax/.test(lower)) {
    return 'Blocked by the defender. Check your syntax and try again.';
  }
  return 'Blocked by the defender. Check your syntax and try again.';
}

// Soccer "Kickoff" stage call-outs, indexed by how far the ball has advanced.
export const KICKOFF_STAGES = ['Kickoff', 'Pass', 'Cross', 'Shoot'] as const;
export const KICKOFF_ADVANCE_CALLS = ['Nice pass!', 'Great cross!', 'GOAL! 🥅⚽'];
export const KICKOFF_BLOCK_CALL = 'Blocked by the defender. Check your syntax and try again.';
