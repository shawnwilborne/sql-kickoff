import { supabase } from '../lib/supabase';

export interface Collection {
  id: number;
  name: string;
  table_name: string;
  columns: string[];
  rows: string[][];
  row_count: number;
  created_at: string;
}

const COLS = 'id,name,table_name,columns,rows,row_count,created_at';
const MAX_SAVED_ROWS = 5000;

/** Persist an uploaded dataset as a collection on the user's account. */
export async function saveCollection(
  userId: string,
  data: { name: string; table_name: string; columns: string[]; rows: string[][] },
): Promise<Collection> {
  const rows = data.rows.slice(0, MAX_SAVED_ROWS);
  const { data: inserted, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name: data.name,
      table_name: data.table_name,
      columns: data.columns,
      rows,
      row_count: data.rows.length,
    })
    .select(COLS)
    .single();
  if (error) throw new Error(error.message);
  return inserted as Collection;
}

/** List the current user's collections (RLS scopes this to them). */
export async function listCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select(COLS)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Collection[];
}

export async function deleteCollection(id: number): Promise<void> {
  const { error } = await supabase.from('collections').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
