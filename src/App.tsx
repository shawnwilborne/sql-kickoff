import { useState } from 'react';
import { DatabaseProvider, useDatabase } from './db/DatabaseContext';
import { AuthProvider, useAuth } from './state/auth';
import { ProgressProvider, useProgress } from './state/progress';
import { LoginScreen } from './components/LoginScreen';
import { DatabaseSelector } from './components/DatabaseSelector';
import { ProgressPanel } from './components/ProgressPanel';
import { BadgesBar } from './components/BadgesBar';
import { QueryConsole } from './components/QueryConsole';
import { ChallengesTab } from './components/ChallengesTab';
import { KickoffMode } from './components/KickoffMode';
import { LeaderboardTab } from './components/LeaderboardTab';
import { HistoryTab } from './components/HistoryTab';
import { CheatsheetModal } from './components/CheatsheetModal';
import { ToastStack } from './components/ToastStack';

type Tab = 'practice' | 'challenges' | 'kickoff' | 'leaderboard' | 'history';

const TABS: { id: Tab; label: string }[] = [
  { id: 'practice', label: '🧪 Practice' },
  { id: 'challenges', label: '🎯 Challenges' },
  { id: 'kickoff', label: '⚽ SQL Kickoff' },
  { id: 'leaderboard', label: '🏆 Leaderboard' },
  { id: 'history', label: '🕓 History' },
];

function Shell() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { progress } = useProgress();
  const { status, error } = useDatabase();
  const [tab, setTab] = useState<Tab>('practice');
  const [helpOpen, setHelpOpen] = useState(false);

  if (authLoading) {
    return <div className="auth-splash">⚽ Loading SQL Kickoff…</div>;
  }

  if (!user) {
    return (
      <>
        <LoginScreen />
        <ToastStack />
      </>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-actions">
          <button type="button" className="signout-btn" onClick={() => void signOut()} title="Sign out">
            Sign out
          </button>
          <button
            type="button"
            className="help-btn"
            onClick={() => setHelpOpen(true)}
            aria-label="Open SQL cheatsheet and help"
            title="SQL cheatsheet & help"
          >
            ?
          </button>
        </div>
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
        {tab === 'history' && <HistoryTab />}
      </main>

      <footer className="app-footer">
        <span>
          SQL practice runs privately in your browser. Your XP, badges, and the leaderboard sync to
          Supabase. Signed in as {progress.name || user.email}.
        </span>
        <nav className="legal-links">
          <a href="https://www.lidvizion.ai/legal/terms" target="_blank" rel="noopener noreferrer">
            Terms
          </a>
          <span className="legal-sep" aria-hidden="true">·</span>
          <a href="https://www.lidvizion.ai/legal/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
        </nav>
      </footer>

      {helpOpen && <CheatsheetModal onClose={() => setHelpOpen(false)} />}

      <ToastStack />
    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <AuthProvider>
        <ProgressProvider>
          <Shell />
        </ProgressProvider>
      </AuthProvider>
    </DatabaseProvider>
  );
}
