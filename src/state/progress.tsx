import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  BADGE_BY_ID,
  conceptsUsed,
  detectKeywords,
  levelForXp,
  usesCreateTable,
  XP,
  type ConceptKey,
  type EngineMode,
  type LevelInfo,
} from '../game/rules';
import { TOTAL_CHALLENGES } from '../game/challenges';
import { upsertEntry } from './leaderboard';

export interface Progress {
  name: string;
  xp: number;
  awardedConcepts: ConceptKey[];
  badges: string[];
  completedChallenges: string[];
  sqliteChallenges: number;
  postgresChallenges: number;
  firstQueryDone: boolean;
  sampleLoaded: boolean;
  lastRunErrored: boolean;
  lastActive: string;
}

export type ToastKind = 'xp' | 'badge' | 'level' | 'success' | 'error' | 'info';
export interface ToastSpec {
  kind: ToastKind;
  text: string;
}
export interface Toast extends ToastSpec {
  id: number;
}

type ProgressEvent =
  | { type: 'set-name'; name: string }
  | { type: 'successful-query'; sql: string; mode: EngineMode }
  | { type: 'query-error' }
  | { type: 'challenge-complete'; challengeId: string; mode: EngineMode }
  | { type: 'csv-upload' }
  | { type: 'sample-load' }
  | { type: 'hint-penalty' };

const STORAGE_KEY = 'sqlkickoff.progress.v1';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultProgress(): Progress {
  return {
    name: '',
    xp: 0,
    awardedConcepts: [],
    badges: [],
    completedChallenges: [],
    sqliteChallenges: 0,
    postgresChallenges: 0,
    firstQueryDone: false,
    sampleLoaded: false,
    lastRunErrored: false,
    lastActive: today(),
  };
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    return defaultProgress();
  }
}

/**
 * Pure reducer: given the previous progress and an event, return the next
 * progress plus any toasts to show. Keeping this pure means React StrictMode's
 * double-invocation never double-awards XP.
 */
export function applyEvent(prev: Progress, event: ProgressEvent): { progress: Progress; toasts: ToastSpec[] } {
  const p: Progress = {
    ...prev,
    awardedConcepts: [...prev.awardedConcepts],
    badges: [...prev.badges],
    completedChallenges: [...prev.completedChallenges],
  };
  const toasts: ToastSpec[] = [];
  const startXp = prev.xp;
  p.lastActive = today();

  const unlock = (id: string) => {
    if (!p.badges.includes(id)) {
      p.badges.push(id);
      const b = BADGE_BY_ID.get(id);
      toasts.push({ kind: 'badge', text: `Badge unlocked: ${b?.emoji ?? ''} ${b?.name ?? id}` });
    }
  };
  const addXp = (amount: number, label: string) => {
    p.xp += amount;
    toasts.push({ kind: 'xp', text: `+${amount} XP — ${label}` });
  };

  switch (event.type) {
    case 'set-name':
      p.name = event.name.trim();
      break;

    case 'query-error':
      p.lastRunErrored = true;
      return { progress: p, toasts };

    case 'successful-query': {
      const keywords = detectKeywords(event.sql);
      if (!p.firstQueryDone) {
        p.firstQueryDone = true;
        addXp(XP.firstQuery, 'first successful query');
        unlock('first-query');
      }
      if (prev.lastRunErrored) {
        addXp(XP.fixQuery, 'fixed a failed query');
        unlock('debugger');
      }
      p.lastRunErrored = false;
      for (const concept of conceptsUsed(keywords)) {
        if (!p.awardedConcepts.includes(concept.key)) {
          p.awardedConcepts.push(concept.key);
          addXp(concept.xp, concept.label);
          if (concept.key === 'where') unlock('where-warrior');
          if (concept.key === 'filter') unlock('filter-master');
        }
      }
      if (usesCreateTable(event.sql)) unlock('schema-builder');
      unlock(event.mode === 'postgres' ? 'postgres-explorer' : 'sqlite-sprinter');
      break;
    }

    case 'challenge-complete': {
      if (!p.completedChallenges.includes(event.challengeId)) {
        p.completedChallenges.push(event.challengeId);
        addXp(XP.challenge, 'challenge complete');
        if (event.mode === 'postgres') p.postgresChallenges += 1;
        else p.sqliteChallenges += 1;
        if (p.completedChallenges.length >= 5) unlock('data-detective');
        if (p.completedChallenges.length >= TOTAL_CHALLENGES) unlock('challenge-champion');
      }
      break;
    }

    case 'csv-upload':
      addXp(XP.csvUpload, 'CSV uploaded');
      unlock('csv-uploader');
      break;

    case 'sample-load':
      if (!p.sampleLoaded) {
        p.sampleLoaded = true;
        addXp(XP.sampleLoad, 'sample dataset loaded');
      }
      break;

    case 'hint-penalty':
      p.xp = Math.max(0, p.xp - XP.hintPenalty);
      toasts.push({ kind: 'info', text: `-${XP.hintPenalty} XP — hint used` });
      break;
  }

  if (levelForXp(p.xp).level > levelForXp(startXp).level) {
    const info = levelForXp(p.xp);
    toasts.push({ kind: 'level', text: `Level up! You reached Level ${info.level}: ${info.title}` });
  }

  return { progress: p, toasts };
}

interface ProgressContextValue {
  progress: Progress;
  level: LevelInfo;
  toasts: Toast[];
  setName: (name: string) => void;
  recordSuccessfulQuery: (sql: string, mode: EngineMode) => void;
  recordQueryError: () => void;
  recordChallengeComplete: (challengeId: string, mode: EngineMode) => void;
  recordCsvUpload: () => void;
  recordSampleLoad: () => void;
  useHint: () => void;
  pushToast: (spec: ToastSpec) => void;
  dismissToast: (id: number) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const progressRef = useRef(progress);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((spec: ToastSpec) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, ...spec }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dispatch = useCallback(
    (event: ProgressEvent) => {
      const { progress: next, toasts: specs } = applyEvent(progressRef.current, event);
      progressRef.current = next;
      setProgress(next);
      specs.forEach(pushToast);
    },
    [pushToast],
  );

  // Persist progress.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore storage failures (private mode / quota)
    }
  }, [progress]);

  // Mirror the current student into the leaderboard.
  useEffect(() => {
    if (!progress.name) return;
    const info = levelForXp(progress.xp);
    upsertEntry({
      name: progress.name,
      xp: progress.xp,
      level: info.level,
      levelTitle: info.title,
      badges: progress.badges.length,
      challengesCompleted: progress.completedChallenges.length,
      sqliteChallenges: progress.sqliteChallenges,
      postgresChallenges: progress.postgresChallenges,
      lastActive: progress.lastActive,
    });
  }, [progress]);

  const level = useMemo(() => levelForXp(progress.xp), [progress.xp]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      level,
      toasts,
      setName: (name) => dispatch({ type: 'set-name', name }),
      recordSuccessfulQuery: (sql, mode) => dispatch({ type: 'successful-query', sql, mode }),
      recordQueryError: () => dispatch({ type: 'query-error' }),
      recordChallengeComplete: (challengeId, mode) =>
        dispatch({ type: 'challenge-complete', challengeId, mode }),
      recordCsvUpload: () => dispatch({ type: 'csv-upload' }),
      recordSampleLoad: () => dispatch({ type: 'sample-load' }),
      useHint: () => dispatch({ type: 'hint-penalty' }),
      pushToast,
      dismissToast,
    }),
    [progress, level, toasts, dispatch, pushToast, dismissToast],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider');
  return ctx;
}
