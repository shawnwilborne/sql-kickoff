import { useCallback } from 'react';
import { useDatabase } from '../db/DatabaseContext';
import { useProgress } from './progress';
import { useAuth } from './auth';
import { recordQuery } from './history';
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
 * Run a query against the active engine and apply all side effects: concept XP,
 * badges, challenge completion, and saving the run to the user's cloud history.
 */
export function useRunQuery() {
  const { run, mode } = useDatabase();
  const { recordSuccessfulQuery, recordQueryError, recordChallengeComplete } = useProgress();
  const { user } = useAuth();

  return useCallback(
    async (sql: string, challenge?: Challenge): Promise<RunOutcome> => {
      const trimmed = sql.trim();
      if (!trimmed) {
        return { status: 'error', feedback: 'Type a query first, then press Run.' };
      }

      const saveHistory = (status: RunStatus, result?: QueryResult, error?: string) => {
        if (!user) return;
        void recordQuery(user.id, {
          query: trimmed,
          engine: mode,
          status,
          row_count: result?.rows.length ?? 0,
          columns: result?.columns ?? [],
          column_types: result?.columnTypes ?? [],
          rows: result?.rows ?? [],
          error: error ?? null,
        });
      };

      let result: QueryResult;
      try {
        result = await run(trimmed);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        recordQueryError();
        saveHistory('error', undefined, message);
        return { status: 'error', error: message, feedback: errorFeedback(message, trimmed) };
      }

      recordSuccessfulQuery(trimmed, mode);
      const keywords = detectKeywords(trimmed);

      if (challenge) {
        const verdict = challenge.validate(result, trimmed);
        if (verdict.ok) {
          recordChallengeComplete(challenge.id, mode);
          saveHistory('success', result);
          return { status: 'success', result, feedback: successChallengeFeedback(keywords) };
        }
        saveHistory('invalid', result);
        return { status: 'invalid', result, feedback: verdict.message ?? PARTIAL_FEEDBACK };
      }

      saveHistory('success', result);
      return { status: 'success', result, feedback: 'Query ran successfully. ⚽' };
    },
    [run, mode, recordSuccessfulQuery, recordQueryError, recordChallengeComplete, user],
  );
}
