import { useCallback } from 'react';
import { useDatabase } from '../db/DatabaseContext';
import { useProgress } from './progress';
import { detectKeywords } from '../game/rules';
import { errorFeedback, successChallengeFeedback, PARTIAL_FEEDBACK } from '../game/feedback';
import type { QueryResult } from '../db/types';
import type { Challenge } from '../game/challenges';

export type RunStatus = 'success' | 'invalid' | 'error';

export interface RunOutcome {
  status: RunStatus;
  result?: QueryResult;
  error?: string;
  feedback: string;
}

/**
 * Run a query against the active engine and apply all scoring side effects:
 * concept XP, badges, and (when a challenge is supplied) challenge completion.
 */
export function useRunQuery() {
  const { run, mode } = useDatabase();
  const { recordSuccessfulQuery, recordQueryError, recordChallengeComplete } = useProgress();

  return useCallback(
    async (sql: string, challenge?: Challenge): Promise<RunOutcome> => {
      const trimmed = sql.trim();
      if (!trimmed) {
        return { status: 'error', feedback: 'Type a query first, then press Run.' };
      }

      let result: QueryResult;
      try {
        result = await run(trimmed);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        recordQueryError();
        return { status: 'error', error: message, feedback: errorFeedback(message, trimmed) };
      }

      recordSuccessfulQuery(trimmed, mode);
      const keywords = detectKeywords(trimmed);

      if (challenge) {
        const verdict = challenge.validate(result, trimmed);
        if (verdict.ok) {
          recordChallengeComplete(challenge.id, mode);
          return { status: 'success', result, feedback: successChallengeFeedback(keywords) };
        }
        return { status: 'invalid', result, feedback: verdict.message ?? PARTIAL_FEEDBACK };
      }

      return { status: 'success', result, feedback: 'Query ran successfully. ⚽' };
    },
    [run, mode, recordSuccessfulQuery, recordQueryError, recordChallengeComplete],
  );
}
