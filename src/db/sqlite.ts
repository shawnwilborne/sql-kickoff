// SQLite engine backed by sql.js (compiled to WebAssembly).

import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import type { DbEngine, QueryResult, SchemaMap } from './types';
import { buildSeedSql } from '../data/seed';

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({ locateFile: () => sqlWasmUrl });
  }
  return sqlJsPromise;
}

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

// sql.js doesn't expose result-column types, so infer a display type from the
// first non-null value in each column.
function inferColumnTypes(columns: string[], values: unknown[][]): string[] {
  return columns.map((_, col) => {
    for (const row of values) {
      const v = row[col];
      if (v === null || v === undefined) continue;
      if (typeof v === 'number') return Number.isInteger(v) ? 'INTEGER' : 'REAL';
      if (typeof v === 'bigint') return 'INTEGER';
      if (typeof v === 'boolean') return 'INTEGER';
      if (v instanceof Uint8Array) return 'BLOB';
      return 'TEXT';
    }
    return 'NULL';
  });
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
    if (!last) return { columns: [], columnTypes: [], rows: [] };
    const rows = last.values as unknown[][];
    return { columns: last.columns, columnTypes: inferColumnTypes(last.columns, rows), rows };
  }

  async getSchema(): Promise<SchemaMap> {
    const schema: SchemaMap = {};
    const tables = this.db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
    );
    const tableNames = tables[0]?.values.map((r) => String(r[0])) ?? [];
    for (const table of tableNames) {
      const info = this.db.exec(`PRAGMA table_info(${quoteIdent(table)});`);
      const nameIdx = info[0]?.columns.indexOf('name') ?? 1;
      schema[table] = info[0]?.values.map((r) => String(r[nameIdx])) ?? [];
    }
    return schema;
  }

  async loadSample(): Promise<void> {
    this.db.run('DROP TABLE IF EXISTS workouts; DROP TABLE IF EXISTS members;');
    this.db.run(buildSeedSql('sqlite'));
  }

  async close(): Promise<void> {
    this.db.close();
  }
}
