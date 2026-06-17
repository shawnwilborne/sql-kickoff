import { useRef, useState, type ChangeEvent } from 'react';
import { useDatabase } from '../db/DatabaseContext';
import { useProgress } from '../state/progress';
import { parseCsv, sanitizeTableName } from '../util/csv';

export function CsvUpload() {
  const { loadCsv } = useDatabase();
  const { recordCsvUpload, pushToast } = useProgress();
  const inputRef = useRef<HTMLInputElement>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const { columns, rows } = parseCsv(text);
      if (columns.length === 0) {
        pushToast({ kind: 'error', text: 'That file has no columns to import.' });
        return;
      }
      const table = sanitizeTableName(file.name);
      await loadCsv(table, columns, rows);
      recordCsvUpload();
      setInfo(`Loaded ${rows.length} row${rows.length === 1 ? '' : 's'} into "${table}". Try: SELECT * FROM "${table}";`);
    } catch (e) {
      pushToast({
        kind: 'error',
        text: 'Could not load that CSV: ' + (e instanceof Error ? e.message : String(e)),
      });
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="csv-upload">
      <div className="csv-row">
        <button type="button" className="secondary" onClick={() => inputRef.current?.click()}>
          📤 Upload CSV
        </button>
        <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={onChange} />
      </div>
      <p className="warning small">
        ⚠️ Use classroom or synthetic datasets only. Do not upload private, sensitive, regulated, or
        real client/patient data.
      </p>
      {info && <p className="muted small">{info}</p>}
    </div>
  );
}
