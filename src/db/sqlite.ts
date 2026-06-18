// SQLite engine backed by sql.js (compiled to WebAssembly).

import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import type { DbEngine, QueryResult } from './types';
import { buildSeedSql } from '../data/seed';

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({ locateFile: () => sqlWasmUrl });
  }
  return sqlJsPromise;
}

export class SqliteEngine implements DbEngine {
  readonly mode = 'sqlite' as const;
  private db: Database;

  private constructor(db: Database) {
    this.db = db;
  }

  static async create(): Promise<SqliteEngine> {
    const SQL = await getSqlJs();
    // Start with an empty database; the sample dataset loads on demand.
    return new SqliteEngine(new SQL.Database());
  }

  async run(sql: string): Promise<QueryResult> {
    // exec() throws on SQL errors and returns one entry per result-producing
    // statement; we surface the last one (what the user is asking to see).
    const results = this.db.exec(sql);
    const last = results[results.length - 1];
    if (!last) return { columns: [], rows: [] };
    return { columns: last.columns, rows: last.values as unknown[][] };
  }

  async loadSample(): Promise<void> {
    this.db.run('DROP TABLE IF EXISTS workouts; DROP TABLE IF EXISTS members;');
    this.db.run(buildSeedSql('sqlite'));
  }

  async close(): Promise<void> {
    this.db.close();
  }
}
