import type { ReactNode } from 'react';
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

export function ResultsTable({ result }: { result: QueryResult }) {
  if (result.columns.length === 0) {
    return <p className="muted small">Statement ran — no rows to display.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="result-table">
        <thead>
          <tr>
            {result.columns.map((col, i) => {
              const type = result.columnTypes[i] ?? '';
              return (
                <th key={i} title={type ? `${col} — ${type}` : col} className="col-head">
                  {col}
                  {type && <span className="col-type-tip">{type}</span>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, ri) => (
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
      <div className="muted small">
        {result.rows.length} row{result.rows.length === 1 ? '' : 's'}
      </div>
    </div>
  );
}
