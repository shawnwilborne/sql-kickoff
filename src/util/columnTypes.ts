// Column type inference + dialect-aware SQL generation for uploaded data, so
// students don't have to CAST text columns on every query.

import type { EngineMode } from '../db/types';

export type ColumnType = 'text' | 'integer' | 'numeric' | 'boolean' | 'date';

export const COLUMN_TYPES: ColumnType[] = ['text', 'integer', 'numeric', 'boolean', 'date'];

export const COLUMN_TYPE_LABELS: Record<ColumnType, string> = {
  text: 'Text',
  integer: 'Integer',
  numeric: 'Number (decimal)',
  boolean: 'Boolean',
  date: 'Date',
};

const INT_RE = /^-?\d+$/;
const NUM_RE = /^-?\d+(\.\d+)?$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TRUE_VALUES = new Set(['true', 't', 'yes', 'y']);
const FALSE_VALUES = new Set(['false', 'f', 'no', 'n']);

/** Guess a column's type from its (string) values; empties are ignored. */
export function inferColumnType(values: string[]): ColumnType {
  let any = false;
  let allInt = true;
  let allNum = true;
  let allDate = true;
  let allBool = true;
  for (const raw of values) {
    const v = (raw ?? '').trim();
    if (v === '') continue;
    any = true;
    const low = v.toLowerCase();
    if (!INT_RE.test(v)) allInt = false;
    if (!NUM_RE.test(v)) allNum = false;
    if (!DATE_RE.test(v)) allDate = false;
    if (!TRUE_VALUES.has(low) && !FALSE_VALUES.has(low)) allBool = false;
  }
  if (!any) return 'text';
  if (allBool) return 'boolean';
  if (allInt) return 'integer';
  if (allNum) return 'numeric';
  if (allDate) return 'date';
  return 'text';
}

export function inferColumnTypes(columns: string[], rows: string[][]): ColumnType[] {
  return columns.map((_, i) => inferColumnType(rows.map((r) => r[i] ?? '')));
}

function quoteValue(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** SQL column type for a dialect. */
export function sqlColumnType(type: ColumnType, dialect: EngineMode): string {
  switch (type) {
    case 'integer':
      return 'INTEGER';
    case 'numeric':
      return dialect === 'postgres' ? 'NUMERIC' : 'REAL';
    case 'boolean':
      return dialect === 'postgres' ? 'BOOLEAN' : 'INTEGER';
    case 'date':
      return dialect === 'postgres' ? 'DATE' : 'TEXT';
    default:
      return 'TEXT';
  }
}

/** Build a typed SQL literal; values that don't fit the type become NULL. */
export function sqlLiteral(value: string, type: ColumnType, dialect: EngineMode): string {
  const v = (value ?? '').trim();
  if (v === '') return 'NULL';
  switch (type) {
    case 'integer':
      return INT_RE.test(v) ? v : 'NULL';
    case 'numeric':
      return NUM_RE.test(v) ? v : 'NULL';
    case 'boolean': {
      const low = v.toLowerCase();
      if (TRUE_VALUES.has(low) || low === '1') return dialect === 'postgres' ? 'TRUE' : '1';
      if (FALSE_VALUES.has(low) || low === '0') return dialect === 'postgres' ? 'FALSE' : '0';
      return 'NULL';
    }
    case 'date':
      return DATE_RE.test(v) ? quoteValue(v) : 'NULL';
    default:
      return quoteValue(v);
  }
}
