import { useProgress } from '../state/progress';
import type { ToastKind } from '../state/progress';

const ICON: Record<ToastKind, string> = {
  xp: '✨',
  badge: '🏅',
  level: '⬆️',
  success: '⚽',
  error: '🧤',
  info: '💡',
};

export function ToastStack() {
  const { toasts, dismissToast } = useProgress();

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.kind}`}
          onClick={() => dismissToast(t.id)}
          role="status"
        >
          <span className="toast-icon">{ICON[t.kind]}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
