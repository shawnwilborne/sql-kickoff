import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { DbEngine, EngineMode, QueryResult, SchemaMap } from './types';
import { SqliteEngine } from './sqlite';
import { PgliteEngine } from './pglite';

type DbStatus = 'loading' | 'ready' | 'error';

interface DatabaseContextValue {
  mode: EngineMode;
  status: DbStatus;
  error: string | null;
  /** Current tables -> columns, for editor autocomplete. */
  schema: SchemaMap;
  run: (sql: string) => Promise<QueryResult>;
  switchMode: (mode: EngineMode) => Promise<void>;
  reloadSample: () => Promise<void>;
  loadCsv: (tableName: string, columns: string[], rows: string[][]) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

async function createEngine(mode: EngineMode): Promise<DbEngine> {
  return mode === 'sqlite' ? SqliteEngine.create() : PgliteEngine.create();
}

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function quoteValue(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<DbEngine | null>(null);
  const [mode, setMode] = useState<EngineMode>('postgres');
  const [status, setStatus] = useState<DbStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<SchemaMap>({});

  const refreshSchema = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;
    try {
      setSchema(await engine.getSchema());
    } catch {
      // Ignore introspection errors; autocomplete just won't have tables.
    }
  }, []);

  // Initialize the default engine once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const engine = await createEngine('postgres');
        if (cancelled) {
          await engine.close();
          return;
        }
        engineRef.current = engine;
        setStatus('ready');
        void refreshSchema();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const switchMode = useCallback(
    async (next: EngineMode) => {
      if (next === mode && engineRef.current) return;
      setStatus('loading');
      setError(null);
      try {
        const previous = engineRef.current;
        engineRef.current = null;
        if (previous) await previous.close();
        const engine = await createEngine(next);
        engineRef.current = engine;
        setMode(next);
        setStatus('ready');
        void refreshSchema();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setStatus('error');
      }
    },
    [mode, refreshSchema],
  );

  const run = useCallback(
    async (sql: string) => {
      const engine = engineRef.current;
      if (!engine) throw new Error('The database is still warming up. Try again in a moment.');
      const result = await engine.run(sql);
      // If the query changed the schema, refresh autocomplete data.
      if (/\b(create|drop|alter)\b/i.test(sql)) void refreshSchema();
      return result;
    },
    [refreshSchema],
  );

  const reloadSample = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) throw new Error('The database is still warming up. Try again in a moment.');
    await engine.loadSample();
    await refreshSchema();
  }, [refreshSchema]);

  const loadCsv = useCallback(
    async (tableName: string, columns: string[], rows: string[][]) => {
      const engine = engineRef.current;
      if (!engine) throw new Error('The database is still warming up. Try again in a moment.');
      const table = quoteIdent(tableName);
      const cols = columns.map(quoteIdent).join(', ');
      const colDefs = columns.map((c) => `${quoteIdent(c)} TEXT`).join(', ');
      const values = rows
        .map((row) => `(${columns.map((_, i) => quoteValue(row[i] ?? '')).join(', ')})`)
        .join(',\n  ');
      let sql = `DROP TABLE IF EXISTS ${table};\nCREATE TABLE ${table} (${colDefs});`;
      if (rows.length > 0) {
        sql += `\nINSERT INTO ${table} (${cols}) VALUES\n  ${values};`;
      }
      await engine.run(sql);
      await refreshSchema();
    },
    [refreshSchema],
  );

  return (
    <DatabaseContext.Provider
      value={{ mode, status, error, schema, run, switchMode, reloadSample, loadCsv }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDatabase must be used within a DatabaseProvider');
  return ctx;
}
