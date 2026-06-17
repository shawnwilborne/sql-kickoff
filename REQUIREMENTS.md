# SQL Kickoff — App Requirements

> A beginner-friendly, browser-based SQL learning app for classroom labs. Students
> practice SQL against two in-browser database engines (SQLite and PostgreSQL),
> earn XP, unlock badges, complete challenges, and play an optional soccer-themed
> challenge mode. No backend, no login, no real data — everything runs and persists
> locally in the browser.

- **Status:** Requirements (v1)
- **Last updated:** 2026-06-17
- **Owner:** Shawn Wilborne (Lid Vizion)
- **Related project:** sibling to `dairy-farm-explorer/` (separate app, monorepo-style — shares the drive, not the codebase)

---

## 1. Deployment

- Deploy using **GitHub Pages**.
- Build with **React + Vite + TypeScript**.
- Configure the Vite `base` path so assets resolve correctly under the GitHub Pages
  sub-path (`/<repo-name>/`).
- Add a **GitHub Actions** workflow that builds and deploys automatically on every
  push to the `main` branch.
- The final app must be reachable from a **public GitHub Pages URL**.

**Implementation notes**
- `vite.config.ts` → set `base: '/<repo-name>/'` (or read from an env var so local
  dev still uses `/`).
- Workflow: `actions/checkout` → `setup-node` → `npm ci` → `npm run build` →
  `actions/upload-pages-artifact` → `actions/deploy-pages`, gated to `main`.
- SQLite/PGlite WASM assets must be served correctly — ensure WASM files are bundled
  and the COOP/COEP / MIME requirements (if any) are satisfied on Pages.
- SPA routing on Pages needs a `404.html` fallback (or hash routing) if client-side
  routes are added.

---

## 2. Database Engines

The app supports **two browser-based database engines**. Both run fully client-side.

### 2.1 SQLite Mode
- Use **sql.js** or **wa-sqlite**.
- Beginner-friendly.
- Optimized for quick CSV uploads, `SELECT` queries, filtering, and classroom labs.

### 2.2 PostgreSQL Mode
- Use **PGlite**.
- Runs PostgreSQL-style databases entirely in the browser.
- Helps students prepare for **Supabase / Postgres** without needing a real cloud
  connection.
- **No backend required.**
- **No persistence required** (the session can be ephemeral).

---

## 3. Database Selector

At the top of the app, include a **Database Mode** selector:

- SQLite
- PostgreSQL

**Switch warning** — when the user switches modes, show:

> "Switching database engines will reset your current session. Download or copy
> anything you want to keep."

**Helper note** — display a short note near the selector:

> "SQLite is great for quick practice. PostgreSQL mode is closer to Supabase and
> professional cloud databases."

**Behavior**
- Switching engines resets the active database/session (tables, query results).
- The student's gamification progress (name, XP, levels, badges, leaderboard) is
  **not** reset by an engine switch — only the database session is.

---

## 4. Gamification

A beginner-friendly progress system that encourages students to keep practicing.

### 4.1 Student Name
- On first visit, prompt the student to enter their name.
- Store the name locally in **`localStorage`**.
- **No login required.**

### 4.2 XP System
Award XP for the following actions:

| Action | XP |
| --- | --- |
| Upload a CSV | +50 |
| Load sample dataset | +25 |
| Run first successful query | +100 |
| Use `SELECT` correctly | +50 |
| Use `WHERE` correctly | +75 |
| Use `AND` / `OR` correctly | +100 |
| Use `IN` / `LIKE` / `BETWEEN` correctly | +125 |
| Use `ORDER BY` | +100 |
| Use `GROUP BY` | +150 |
| Use `JOIN` | +200 |
| Fix a failed query and rerun successfully | +150 |
| Complete a challenge | +250 |

> Concept-based XP (`SELECT`, `WHERE`, `JOIN`, …) is awarded **once per concept**
> via the badge system — see §4.9. Challenge and CSV/sample/first-query awards can
> recur per their natural trigger.

### 4.3 Levels
| Level | Title |
| --- | --- |
| 1 | SQL Rookie |
| 2 | Table Explorer |
| 3 | Query Builder |
| 4 | Data Detective |
| 5 | Analytics Pro |
| 6 | SQL Captain |

> **XP thresholds (proposed — tune during build):** L1 0, L2 300, L3 600, L4 1200,
> L5 2000, L6 3000. The Progress Panel example ("XP: 850 / 1200") implies L3→L4 at
> 1200, which this table matches. Final numbers can be adjusted after playtesting.

### 4.4 Badges
Award the following badges:

- First Query
- CSV Uploader
- WHERE Warrior
- Filter Master
- Debugger
- Schema Builder
- Postgres Explorer
- SQLite Sprinter
- Data Detective
- Challenge Champion

### 4.5 Challenge Mode
Add a **"Challenges"** tab with short missions. Each challenge includes:

- Business scenario
- Required SQL concept
- Hint button
- Run query button
- Validation check
- XP reward

**Starter Challenges**
- Show all members
- Select names and cities
- Find Miami members
- Find Premium members
- Find members with score above 80

**Pro Challenges**
- Find Premium members in Miami or Orlando
- Find Gmail users
- Find members with scores between 70 and 90
- Find cities with more than 5 members
- Join members to workouts

### 4.6 Soccer-Themed Challenge Mode — "SQL Kickoff Mode"
An **optional** soccer-themed overlay on Challenge Mode.

**Starter Mode**
- Students "pass," "cross," and "shoot" by answering SQL questions.
- Each correct answer advances the ball toward the goal.
- **3 correct answers = goal.**
- An incorrect answer = a defender blocks the shot.

**Pro Mode**
- Students enter the **"SQL Pro League."**
- They solve real SQL challenges with a **FIFA-style match dashboard**.
- Correct queries increase possession, shots, and goals.
- Hints reduce XP but keep learners moving.

### 4.7 Leaderboard
A **local** leaderboard using `localStorage`. Track per student:

- Student name
- XP
- Level
- Badges earned
- Challenges completed
- SQLite challenges completed
- PostgreSQL challenges completed
- Last active date

**Disclosure message:**

> "This leaderboard is stored locally in this browser for classroom practice. It is
> not submitted or saved to a server."

### 4.8 Progress Panel
A progress widget in the header or sidebar. Example:

```
Shawn
Level 3: Query Builder
XP: 850 / 1200
Badges: 4
Challenges Completed: 6 / 20
```

### 4.9 SQL Concept Detection
When a query runs successfully, detect which concepts were used:

`SELECT`, `FROM`, `WHERE`, `AND`, `OR`, `IN`, `LIKE`, `BETWEEN`, `ORDER BY`,
`GROUP BY`, `HAVING`, `JOIN`

- Award the matching concept XP/badge **only once per concept** (anti-farming).
- Detection should be tolerant of casing/whitespace and ideally based on parsing the
  executed SQL rather than naive substring matching (avoid matching keywords inside
  string literals or column names).

### 4.10 Friendly Feedback
**After a successful challenge**, show messages such as:
- "Nice pass!"
- "Great cross!"
- "Goal! You used WHERE correctly."
- "Pro move! You combined IN and BETWEEN."
- "Clean finish! Your query matched the business request."

**After errors**, show helpful nudges such as:
- "Blocked by the defender. Check your syntax and try again."
- "Almost there. Did you include the table name after FROM?"
- "Try adding quotes around text values like 'Miami'."

### 4.11 Classroom Safety
Display a clear warning near CSV upload:

> "Use classroom or synthetic datasets only. Do not upload private, sensitive,
> regulated, or real client/patient data."

---

## 5. Acceptance Criteria (Gamification)

The gamification is complete when:

- [ ] A student can enter a name.
- [ ] XP increases after successful learning actions.
- [ ] Badges unlock.
- [ ] Challenges validate correct queries.
- [ ] Starter challenges feel approachable.
- [ ] Pro challenges are more SQL-specific.
- [ ] The leaderboard displays local progress.
- [ ] Soccer-themed mode works as an optional challenge experience.

---

## 6. Open Questions / Decisions to Confirm

> **Status (2026-06-17):** the app is built and verified. The items below were
> resolved with the choices noted; they remain here in case they need tuning.
> - **SQLite engine:** sql.js (chosen for classroom simplicity).
> - **Seed schema:** `members(id, name, city, email, tier, score, join_date)` +
>   `workouts(id, member_id, type, duration_min, calories, workout_date)`; 22 members
>   across 5 FL cities, tuned so each challenge has a deterministic answer.
> - **Level thresholds:** 0 / 300 / 600 / 1200 / 2000 / 3000.
> - **Validation:** required-concept check + expected row count (forgiving of which
>   columns the student selects).
> - **Cross-engine:** the sample queries used in challenges behave the same in both
>   engines; dates are TEXT in SQLite and DATE in Postgres.

Original open questions (kept for reference):

1. **Repo name** — determines the Vite `base` path and the final Pages URL
   (`https://<user>.github.io/<repo>/`).
2. **SQLite engine choice** — `sql.js` (simplest, mature) vs `wa-sqlite` (faster,
   more setup). Default recommendation: **sql.js** for a classroom tool.
3. **Sample dataset shape** — challenges reference `members` (name, city, email,
   score, tier) and `workouts` (for the JOIN challenge). Confirm the exact seed
   schema/columns so starter challenges validate consistently across both engines.
4. **Level thresholds** — confirm or tune the proposed XP curve in §4.3.
5. **Validation strategy** — compare result sets to an expected answer vs. check the
   query shape (concepts used). Likely a mix: result match for "correct answer,"
   concept detection for XP/badges.
6. **Cross-engine SQL** — a few challenges (e.g. string matching, `LIKE`) behave
   slightly differently in SQLite vs Postgres; confirm whether challenge solutions
   should be engine-aware.
