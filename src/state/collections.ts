import { supabase } from '../lib/supabase';
import type { ColumnType } from '../util/columnTypes';

export interface Collection {
  id: number;
  name: string;
  table_name: string;
  columns: string[];
  column_types: ColumnType[];
  rows: string[][];
  row_count: number;
  created_at: string;
}

const COLS = 'id,name,table_name,columns,column_types,rows,row_count,created_at';
const MAX_SAVED_ROWS = 5000;

/** Persist an uploaded dataset (with its chosen column types) as a collection. */
export async function saveCollection(
  userId: string,
  data: {
    name: string;
    table_name: string;
    columns: string[];
    column_types: ColumnType[];
    rows: string[][];
  },
): Promise<Collection> {
  const rows = data.rows.slice(0, MAX_SAVED_ROWS);
  const { data: inserted, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name: data.name,
      table_name: data.table_name,
      columns: data.columns,
      column_types: data.column_types,
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

/** Save edits (columns, types, rows) back to an existing collection. */
export async function updateCollection(
  id: number,
  data: { columns: string[]; column_types: ColumnType[]; rows: string[][] },
): Promise<void> {
  const rows = data.rows.slice(0, MAX_SAVED_ROWS);
  const { error } = await supabase
    .from('collections')
    .update({
      columns: data.columns,
      column_types: data.column_types,
      rows,
      row_count: data.rows.length,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteCollection(id: number): Promise<void> {
  const { error } = await supabase.from('collections').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
