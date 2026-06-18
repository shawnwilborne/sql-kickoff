// PostgreSQL engine backed by PGlite (Postgres compiled to WebAssembly).

import { PGlite } from '@electric-sql/pglite';
import type { DbEngine, QueryResult } from './types';
import { buildSeedSql } from '../data/seed';

interface PgField {
  name: string;
}
interface PgResult {
  rows: Array<Record<string, unknown>>;
  fields: PgField[];
}

export class PgliteEngine implements DbEngine {
  readonly mode = 'postgres' as const;
  private db: PGlite;

  private constructor(db: PGlite) {
    this.db = db;
  }

  static async create(): Promise<PgliteEngine> {
    const db = new PGlite();
    // Force initialization (PGlite is lazy) but start with an empty database;
    // the sample dataset loads on demand.
    await db.query('SELECT 1;');
    return new PgliteEngine(db);
  }

  async run(sql: string): Promise<QueryResult> {
    // exec() runs multiple statements and rejects on SQL errors. We pick the
    // last statement that produced columns so the user sees their query result.
    const results = (await this.db.exec(sql)) as unknown as PgResult[];
    const withFields = results.filter((r) => r.fields && r.fields.length > 0);
    const last = withFields[withFields.length - 1];
    if (!last) return { columns: [], rows: [] };
    const columns = last.fields.map((f) => f.name);
    const rows = last.rows.map((row) => columns.map((c) => row[c]));
    return { columns, rows };
  }

  async loadSample(): Promise<void> {
    await this.db.exec('DROP TABLE IF EXISTS workouts; DROP TABLE IF EXISTS members;');
    await this.db.exec(buildSeedSql('postgres'));
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}
