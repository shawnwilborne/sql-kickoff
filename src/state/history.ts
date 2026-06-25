import { supabase } from '../lib/supabase';
import type { EngineMode } from '../db/types';

export interface HistoryRow {
  id: number;
  query: string;
  engine: EngineMode;
  status: 'success' | 'invalid' | 'error';
  row_count: number;
  columns: string[];
  column_types: string[];
  rows: unknown[][];
  error: string | null;
  created_at: string;
}

export interface HistoryEntry {
  query: string;
  engine: EngineMode;
  status: 'success' | 'invalid' | 'error';
  row_count: number;
  columns: string[];
  column_types: string[];
  rows: unknown[][];
  error: string | null;
}

// Cap what we store so a huge result set doesn't bloat the row.
const MAX_STORED_ROWS = 100;

/** Insert one run into the signed-in user's history (fire-and-forget friendly). */
export async function recordQuery(userId: string, entry: HistoryEntry): Promise<void> {
  const rows = entry.rows.slice(0, MAX_STORED_ROWS);
  const { error } = await supabase.from('query_history').insert({
    user_id: userId,
    query: entry.query,
    engine: entry.engine,
    status: entry.status,
    row_count: entry.row_count,
    columns: entry.columns,
    column_types: entry.column_types,
    rows,
    error: entry.error,
  });
  if (error) {
    // Non-fatal: history is a nice-to-have, never block the query flow.
    console.warn('Could not save query history:', error.message);
  }
}

/** Load the current user's most recent queries (RLS scopes this to them). */
export async function loadHistory(limit = 100): Promise<HistoryRow[]> {
  const { data, error } = await supabase
    .from('query_history')
    .select('id,query,engine,status,row_count,columns,column_types,rows,error,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as HistoryRow[];
}

/** Delete all of the current user's history. */
export async function clearHistory(userId: string): Promise<void> {
  const { error } = await supabase.from('query_history').delete().eq('user_id', userId);
  if (error) throw new Error(error.message);
}
