import type { ReactNode } from 'react';
import type { QueryResult } from '../db/types';

function formatCell(value: unknown): ReactNode {
  if (value === null || value === undefined) return <span className="null">NULL</span>;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
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
            {result.columns.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>{formatCell(cell)}</td>
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
