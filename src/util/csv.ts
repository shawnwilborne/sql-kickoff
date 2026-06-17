// Minimal CSV parser supporting quoted fields, embedded commas/newlines, and
// escaped quotes (""). Good enough for classroom CSVs.

export interface ParsedCsv {
  columns: string[];
  rows: string[][];
}

function dedupe(headers: string[]): string[] {
  const seen = new Map<string, number>();
  return headers.map((h) => {
    const count = seen.get(h) ?? 0;
    seen.set(h, count + 1);
    return count === 0 ? h : `${h}_${count + 1}`;
  });
}

export function parseCsv(text: string): ParsedCsv {
  const records: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  const endField = () => {
    row.push(field);
    field = '';
  };
  const endRow = () => {
    endField();
    records.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      endField();
    } else if (ch === '\n') {
      endRow();
    } else if (ch === '\r') {
      // ignore; \r\n handled by the \n branch
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) endRow();

  const nonEmpty = records.filter((r) => r.some((c) => c.trim() !== ''));
  if (nonEmpty.length === 0) return { columns: [], rows: [] };

  const header = dedupe(nonEmpty[0].map((h, i) => h.trim() || `col${i + 1}`));
  const rows = nonEmpty.slice(1).map((r) => header.map((_, i) => r[i] ?? ''));
  return { columns: header, rows };
}

export function sanitizeTableName(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  let name = base.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
  if (!name || /^[0-9]/.test(name)) name = `t_${name}`;
  return name || 'uploaded_data';
}
