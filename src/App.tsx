import { useState } from 'react';
import { DatabaseProvider, useDatabase } from './db/DatabaseContext';
import { ProgressProvider, useProgress } from './state/progress';
import { NamePrompt } from './components/NamePrompt';
import { DatabaseSelector } from './components/DatabaseSelector';
import { ProgressPanel } from './components/ProgressPanel';
import { BadgesBar } from './components/BadgesBar';
import { QueryConsole } from './components/QueryConsole';
import { ChallengesTab } from './components/ChallengesTab';
import { KickoffMode } from './components/KickoffMode';
import { LeaderboardTab } from './components/LeaderboardTab';
import { ToastStack } from './components/ToastStack';

type Tab = 'practice' | 'challenges' | 'kickoff' | 'leaderboard';

const TABS: { id: Tab; label: string }[] = [
  { id: 'practice', label: '🧪 Practice' },
  { id: 'challenges', label: '🎯 Challenges' },
  { id: 'kickoff', label: '⚽ SQL Kickoff' },
  { id: 'leaderboard', label: '🏆 Leaderboard' },
];

function Shell() {
  const { progress } = useProgress();
  const { status, error } = useDatabase();
  const [tab, setTab] = useState<Tab>('practice');

  if (!progress.name) {
    return (
      <>
        <NamePrompt />
        <ToastStack />
      </>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="logo">⚽</span>
          <div>
            <h1>SQL Kickoff</h1>
            <p className="tagline">Learn SQL. Score goals.</p>
          </div>
        </div>
        <DatabaseSelector />
        <ProgressPanel />
      </header>

      <BadgesBar />

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {status === 'error' && (
        <div className="banner-error">⚠️ The database failed to load: {error}</div>
      )}
      {status === 'loading' && (
        <div className="banner-info">⏳ Warming up the database engine…</div>
      )}

      <main className="tab-body">
        {tab === 'practice' && <QueryConsole />}
        {tab === 'challenges' && <ChallengesTab />}
        {tab === 'kickoff' && <KickoffMode />}
        {tab === 'leaderboard' && <LeaderboardTab />}
      </main>

      <footer className="app-footer">
        <span>
          SQL Kickoff runs entirely in your browser — no backend, no login. Progress is stored
          locally in this browser only.
        </span>
      </footer>

      <ToastStack />
    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <ProgressProvider>
        <Shell />
      </ProgressProvider>
    </DatabaseProvider>
  );
}
