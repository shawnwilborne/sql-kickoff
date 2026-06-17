import { useState, type FormEvent } from 'react';
import { useProgress } from '../state/progress';

export function NamePrompt() {
  const { setName } = useProgress();
  const [value, setValue] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) setName(value.trim());
  };

  return (
    <div className="modal-backdrop">
      <div className="modal card welcome">
        <div className="modal-emoji">⚽</div>
        <h2>Welcome to SQL Kickoff</h2>
        <p>Learn SQL by playing. Enter your name to start earning XP, badges, and goals.</p>
        <form onSubmit={submit} className="name-form">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            aria-label="Your name"
          />
          <button type="submit" disabled={!value.trim()}>
            Kick off ⚽
          </button>
        </form>
        <p className="muted small">No login needed. Your name is stored only in this browser.</p>
      </div>
    </div>
  );
}
