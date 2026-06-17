# SQL Kickoff ⚽

A beginner-friendly, **browser-based SQL trainer** for classroom labs. Students
practice SQL against two in-browser engines, earn XP and badges, complete
challenges, and play an optional soccer-themed practice mode. No backend, no
login — everything runs and persists locally in the browser.

> Full product spec: [`REQUIREMENTS.md`](./REQUIREMENTS.md)

## Features

- **Two engines, one UI** — SQLite (via [sql.js](https://sql.js.org)) and
  PostgreSQL (via [PGlite](https://pglite.dev)), switchable at the top of the app.
- **Gamification** — name capture, XP, 6 learner levels, 10 badges, friendly
  feedback, and a local leaderboard.
- **Challenges** — 5 starter + 5 pro missions, each a real business request with
  a hint and automatic validation.
- **SQL Kickoff Mode** — an optional soccer overlay: *Starter Kickoff* (pass/
  cross/shoot to a goal) and the *SQL Pro League* (FIFA-style match dashboard).
- **CSV upload** — import a classroom/synthetic CSV as a table and query it.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

## Deploy to GitHub Pages

A workflow at [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)
builds and deploys on every push to `main`.

1. Push this folder to a GitHub repo (as its own repository).
2. In **Settings → Pages**, set **Source = GitHub Actions**.
3. Push to `main`. The app deploys to `https://<user>.github.io/<repo>/`.

The Vite `base` path is set automatically in CI from the repository name
(`VITE_BASE=/<repo>/`). Locally it stays `/`. No code changes are needed if the
repo name changes.

### Monorepo note

This project is self-contained and expects to be the repository root (it ships
its own `.github/workflows`). If you instead keep it inside a larger monorepo,
move/adjust the workflow to run with `working-directory: sql-kickoff` and upload
`sql-kickoff/dist`.

## How it works

- **Engines** live behind a small `DbEngine` interface (`src/db/`) so the rest of
  the app is engine-agnostic. Both expose `run(sql) -> { columns, rows }`.
- **Sample data** (`src/data/seed.ts`) is generated into dialect-aware DDL. The
  dataset is tuned so every challenge has a clean, deterministic answer.
- **Scoring** is a pure reducer (`src/state/progress.tsx`), so React StrictMode's
  double-invocation never double-awards XP. Concept XP is granted once per concept
  to prevent farming.
- **No persistence of the database is required** — only gamification progress and
  the leaderboard are saved (to `localStorage`).

## Classroom safety

Use classroom or synthetic datasets only. Do not upload private, sensitive,
regulated, or real client/patient data. The leaderboard is local to the browser
and is never sent to a server.
