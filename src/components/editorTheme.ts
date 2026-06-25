// Dark editor theme + deliberate, high-contrast syntax colors so each token
// category (keywords, strings, numbers, functions, operators, comments) is
// visually separated.

import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { EditorView } from '@codemirror/view';
import { Prec } from '@codemirror/state';

export const editorTheme = EditorView.theme(
  {
    '&': { backgroundColor: '#0f1f17', color: '#e7f6ec', borderRadius: '10px' },
    '.cm-content': { caretColor: '#ff9d5c', padding: '8px 4px' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#ff9d5c' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: '#26482f',
    },
    '.cm-gutters': { backgroundColor: '#0f1f17', color: '#5b6b63', border: 'none' },
    '.cm-activeLine': { backgroundColor: 'transparent' },
    '.cm-tooltip': {
      backgroundColor: '#14291d',
      border: '1px solid #2a4c36',
      borderRadius: '8px',
      color: '#e7f6ec',
    },
    '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
      backgroundColor: '#2a4c36',
      color: '#fff',
    },
    '.cm-completionLabel': { color: '#e7f6ec' },
    '.cm-completionMatchedText': { color: '#ff9d5c', textDecoration: 'none', fontWeight: '700' },
  },
  { dark: true },
);

const highlightStyle = HighlightStyle.define([
  // Keywords: SELECT, FROM, WHERE, GROUP BY, JOIN, AND, OR …
  { tag: [t.keyword, t.operatorKeyword, t.modifier], color: '#ff9d5c', fontWeight: '700' },
  // Built-in type names: INTEGER, TEXT, DATE …
  { tag: [t.typeName, t.standard(t.name)], color: '#5cc6ff' },
  // Function names: COUNT, SUM, AVG, ROUND …
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#c792ea' },
  // String literals: 'Miami'
  { tag: [t.string, t.special(t.string)], color: '#9ce87a' },
  // Numbers, booleans, NULL
  { tag: [t.number, t.bool, t.null, t.atom], color: '#f7894c' },
  // Operators: = > < <> + …
  { tag: t.operator, color: '#7fd6ff' },
  // Comments
  { tag: [t.lineComment, t.blockComment], color: '#6f8a78', fontStyle: 'italic' },
  // Punctuation / separators / parentheses
  { tag: [t.punctuation, t.separator, t.paren, t.bracket], color: '#a7c0b3' },
  // Identifiers (table/column names) — default readable foreground
  { tag: [t.name, t.propertyName, t.variableName], color: '#e7f6ec' },
]);

export const editorHighlight = Prec.highest(syntaxHighlighting(highlightStyle));
