import type { EngineMode } from '../game/rules';

export type { EngineMode };

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
}

/** A browser SQL engine (SQLite via sql.js, or PostgreSQL via PGlite). */
export interface DbEngine {
  readonly mode: EngineMode;
  /** Run one or more SQL statements; returns the rows of the last result set. */
  run(sql: string): Promise<QueryResult>;
  /** Drop and recreate the sample dataset. */
  loadSample(): Promise<void>;
  /** Release resources held by the engine. */
  close(): Promise<void>;
}
