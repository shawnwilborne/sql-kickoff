import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { QueryResult } from '../db/types';

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function renderCell(value: unknown): ReactNode {
  if (value === null || value === undefined) return <span className="null">NULL</span>;
  return formatValue(value);
}

const NUMERIC_TYPES = new Set([
  'integer', 'int', 'int2', 'int4', 'int8', 'numeric', 'real', 'float4', 'float8', 'double',
]);

function compare(a: unknown, b: unknown, numeric: boolean): number {
  const an = a === null || a === undefined;
  const bn = b === null || b === undefined;
  if (an && bn) return 0;
  if (an) return 1; // nulls last
  if (bn) return -1;
  if (numeric) return Number(a) - Number(b);
  return String(a).localeCompare(String(b));
}

interface SortState {
  col: number;
  dir: 'asc' | 'desc';
}

export function ResultsTable({ result }: { result: QueryResult }) {
  const [sort, setSort] = useState<SortState | null>(null);
  const [menu, setMenu] = useState<{ col: number; x: number; y: number } | null>(null);

  // Reset sort/menu when a genuinely new result arrives (stable across re-renders
  // that pass a fresh object with identical content, e.g. the History tab).
  const sig = result.columns.join('') + '#' + result.rows.length;
  useEffect(() => {
    setSort(null);
    setMenu(null);
  }, [sig]);

  // Close the menu on scroll / resize / Escape (it's fixed-positioned).
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const rows = useMemo(() => {
    if (!sort) return result.rows;
    const numeric = NUMERIC_TYPES.has((result.columnTypes[sort.col] ?? '').toLowerCase());
    return [...result.rows].sort((ra, rb) => {
      const c = compare(ra[sort.col], rb[sort.col], numeric);
      return sort.dir === 'asc' ? c : -c;
    });
  }, [result, sort]);

  if (result.columns.length === 0) {
    return <p className="muted small">Statement ran — no rows to display.</p>;
  }

  const openMenu = (col: number, e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMenu({ col, x: r.left, y: r.bottom + 2 });
  };
  const copyText = (t: string) => void navigator.clipboard?.writeText(t);

  return (
    <div className="table-wrap grid-wrap">
      <table className="result-table">
        <thead>
          <tr>
            {result.columns.map((col, i) => {
              const type = (result.columnTypes[i] ?? '').toLowerCase();
              return (
                <th key={i} className="col-head">
                  <button
                    type="button"
                    className="col-head-btn"
                    onClick={(e) => openMenu(i, e)}
                    title={type ? `${col} · ${type}` : col}
                  >
                    <span className="col-name">{col}</span>
                    {type && <span className="col-type-inline">{type}</span>}
                    {sort?.col === i && <span className="sort-ind">{sort.dir === 'asc' ? '↑' : '↓'}</span>}
                    <span className="col-chevron">⌄</span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} title={formatValue(cell)}>
                  {renderCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="muted small grid-foot">
        {result.rows.length} row{result.rows.length === 1 ? '' : 's'}
        {sort && ` · sorted by ${result.columns[sort.col]} ${sort.dir}`}
      </div>

      {menu &&
        createPortal(
          <>
            <div className="menu-backdrop" onClick={() => setMenu(null)} />
            <div className="col-menu" style={{ left: menu.x, top: menu.y }}>
              <button type="button" onClick={() => { setSort({ col: menu.col, dir: 'asc' }); setMenu(null); }}>
                ↑ Sort ascending
              </button>
              <button type="button" onClick={() => { setSort({ col: menu.col, dir: 'desc' }); setMenu(null); }}>
                ↓ Sort descending
              </button>
              <div className="col-menu-sep" />
              <button type="button" onClick={() => { copyText(result.columns[menu.col]); setMenu(null); }}>
                ⧉ Copy name
              </button>
              <button
                type="button"
                onClick={() => {
                  copyText(result.rows.map((r) => formatValue(r[menu.col])).join('\n'));
                  setMenu(null);
                }}
              >
                ⧉ Copy column
              </button>
              {sort && (
                <>
                  <div className="col-menu-sep" />
                  <button type="button" onClick={() => { setSort(null); setMenu(null); }}>
                    ✕ Clear sort
                  </button>
                </>
              )}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
