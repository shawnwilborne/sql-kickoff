import type { EngineMode } from '../game/rules';

export type { EngineMode };

export interface QueryResult {
  columns: string[];
  /** Display type per column (e.g. "INTEGER", "text", "date"), aligned to columns. */
  columnTypes: string[];
  rows: unknown[][];
}

/** Map of table name -> column names, used to power autocomplete. */
export type SchemaMap = Record<string, string[]>;

/** A browser SQL engine (SQLite via sql.js, or PostgreSQL via PGlite). */
export interface DbEngine {
  readonly mode: EngineMode;
  /** Run one or more SQL statements; returns the rows of the last result set. */
  run(sql: string): Promise<QueryResult>;
  /** Drop and recreate the sample dataset. */
  loadSample(): Promise<void>;
  /** Introspect the current tables and their columns (for autocomplete). */
  getSchema(): Promise<SchemaMap>;
  /** Release resources held by the engine. */
  close(): Promise<void>;
}
