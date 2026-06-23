import { useState } from 'react';
import { useAuth } from '../state/auth';

function GoogleG() {
  return (
    <svg className="g-icon" viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

export function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
      setBusy(false);
    }
    // On success the browser redirects to Google, so we stay "busy".
  };

  return (
    <div className="modal-backdrop">
      <div className="modal card welcome">
        <div className="modal-emoji">⚽</div>
        <h2>Welcome to SQL Kickoff</h2>
        <p>
          Sign in with Google to save your XP, badges, and progress to the cloud — and join the live
          class leaderboard.
        </p>
        <button type="button" className="google-btn" onClick={signIn} disabled={busy}>
          <GoogleG />
          {busy ? 'Redirecting to Google…' : 'Sign in with Google'}
        </button>
        {error && <p className="warning small">{error}</p>}
        <p className="muted small">
          Your progress syncs across devices. SQL practice still runs privately in your browser.
        </p>
        <p className="muted small login-legal">
          By continuing you agree to our{' '}
          <a href="https://www.lidvizion.ai/legal/terms" target="_blank" rel="noopener noreferrer">
            Terms
          </a>{' '}
          and{' '}
          <a href="https://www.lidvizion.ai/legal/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
