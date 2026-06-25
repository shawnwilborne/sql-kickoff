// PostgreSQL engine backed by PGlite (Postgres compiled to WebAssembly).

import { PGlite } from '@electric-sql/pglite';
import type { DbEngine, QueryResult, SchemaMap } from './types';
import { buildSeedSql } from '../data/seed';

interface PgField {
  name: string;
  dataTypeID: number;
}
interface PgResult {
  rows: Array<Record<string, unknown>>;
  fields: PgField[];
}

// Common PostgreSQL type OIDs -> readable names.
const PG_TYPES: Record<number, string> = {
  16: 'boolean',
  17: 'bytea',
  20: 'int8',
  21: 'int2',
  23: 'int4',
  25: 'text',
  700: 'float4',
  701: 'float8',
  1042: 'bpchar',
  1043: 'varchar',
  1082: 'date',
  1083: 'time',
  1114: 'timestamp',
  1184: 'timestamptz',
  1700: 'numeric',
  114: 'json',
  3802: 'jsonb',
  2950: 'uuid',
};

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
    if (!last) return { columns: [], columnTypes: [], rows: [] };
    const columns = last.fields.map((f) => f.name);
    const columnTypes = last.fields.map((f) => PG_TYPES[f.dataTypeID] ?? 'unknown');
    const rows = last.rows.map((row) => columns.map((c) => row[c]));
    return { columns, columnTypes, rows };
  }

  async getSchema(): Promise<SchemaMap> {
    const results = (await this.db.exec(
      "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position;",
    )) as unknown as PgResult[];
    const schema: SchemaMap = {};
    for (const row of results[0]?.rows ?? []) {
      const table = String(row.table_name);
      const column = String(row.column_name);
      (schema[table] ??= []).push(column);
    }
    return schema;
  }

  async loadSample(): Promise<void> {
    await this.db.exec('DROP TABLE IF EXISTS workouts; DROP TABLE IF EXISTS members;');
    await this.db.exec(buildSeedSql('postgres'));
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}
