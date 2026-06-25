import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql, SQLite, PostgreSQL, type SQLNamespace } from '@codemirror/lang-sql';
import { keymap, EditorView } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { editorTheme, editorHighlight } from './editorTheme';
import type { EngineMode, SchemaMap } from '../db/types';

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Run handler bound to Cmd/Ctrl+Enter. */
  onSubmit?: () => void;
  /** Tables -> columns, powering table & column autocomplete. */
  schema?: SchemaMap;
  mode?: EngineMode;
  minHeight?: string;
  placeholder?: string;
}

export function SqlEditor({
  value,
  onChange,
  onSubmit,
  schema,
  mode = 'sqlite',
  minHeight = '120px',
  placeholder,
}: Props) {
  const extensions = useMemo(() => {
    const dialect = mode === 'postgres' ? PostgreSQL : SQLite;
    const exts = [
      // Schema enables table + column completion; keywords complete by default.
      sql({ dialect, schema: schema as SQLNamespace | undefined, upperCaseKeywords: false }),
      EditorView.lineWrapping,
      editorHighlight,
    ];
    if (onSubmit) {
      exts.unshift(
        Prec.highest(
          keymap.of([
            {
              key: 'Mod-Enter',
              preventDefault: true,
              run: () => {
                onSubmit();
                return true;
              },
            },
          ]),
        ),
      );
    }
    return exts;
  }, [schema, mode, onSubmit]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={editorTheme}
      minHeight={minHeight}
      placeholder={placeholder}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
        autocompletion: true,
      }}
      className="cm-sql-editor"
    />
  );
}
