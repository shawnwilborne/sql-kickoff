// SQL cheatsheet content. Shared by the in-app modal and the PDF export.
//
// Every example runs against the app's sample dataset (members, workouts), so a
// student can paste any example straight into the Practice tab.

export interface CourseClass {
  n: number;
  title: string;
  keyConcepts: string;
  buildSkills: string;
  career: string;
}

export interface Pillar {
  name: string;
  emoji: string;
  blurb: string;
}

export interface Tip {
  n: number;
  title: string;
  /** Short keyword tag, e.g. "WHERE" or "GROUP BY". */
  concept?: string;
  /** Plain-English explanation (the "how it works"). */
  explain: string;
  /** Everyday analogy to make it stick. */
  analogy?: string;
  /** Runnable example against members / workouts. */
  example?: string;
  /** Why a business or team cares (the "why it matters"). */
  business?: string;
}

export interface Section {
  id: string;
  title: string;
  blurb?: string;
  tips: Tip[];
}

export const INTRO =
  'A friendly, plain-English reference for everything in SQL Kickoff. Every example ' +
  'uses the sample dataset (the members and workouts tables). The database starts empty, ' +
  'so load the sample data once (Practice or Challenges tab), then paste any example into ' +
  'the Practice editor and press Run.';

export const PILLARS: Pillar[] = [
  {
    name: 'Business',
    emoji: '💼',
    blurb: 'Why it matters — the real question a stakeholder is actually asking.',
  },
  {
    name: 'Architecture',
    emoji: '🏗️',
    blurb: 'How it works — what the database is doing behind the scenes.',
  },
  {
    name: 'Build',
    emoji: '🛠️',
    blurb: 'Hands-on — the exact query you write and run yourself.',
  },
];

export const COURSE_MAP: CourseClass[] = [
  {
    n: 1,
    title: 'Introduction to SQL & Modern Data Teams',
    keyConcepts: 'Databases vs spreadsheets; data stack overview',
    buildSkills: 'SQLite Online setup; first SQL query',
    career: 'Data Analyst, TPM, Product Manager, Business Analyst',
  },
  {
    n: 2,
    title: 'Understanding Tables & Database Structure',
    keyConcepts: 'Tables, rows, columns, data types, primary keys',
    buildSkills: 'SELECT; reading & exploring datasets',
    career: 'TPMs define requirements; analysts validate data; engineers build schemas',
  },
  {
    n: 3,
    title: 'Filtering Data to Answer Business Questions',
    keyConcepts: 'Query logic; data filtering',
    buildSkills: 'WHERE, AND, OR, comparison operators',
    career: 'Translating stakeholder questions into data requirements',
  },
  {
    n: 4,
    title: 'Sorting & Prioritizing Information',
    keyConcepts: 'Result ordering; dataset prioritization',
    buildSkills: 'ORDER BY, LIMIT',
    career: 'Executive reporting; KPI prioritization',
  },
  {
    n: 5,
    title: 'Metrics & KPIs',
    keyConcepts: 'Aggregations; revenue, growth, engagement',
    buildSkills: 'COUNT, SUM, AVG, MIN, MAX',
    career: 'Building business scorecards; reporting to leadership',
  },
  {
    n: 6,
    title: 'Summarizing Data for Decision Makers',
    keyConcepts: 'Data grouping; rollups',
    buildSkills: 'GROUP BY, HAVING',
    career: 'Dashboard requirements; executive reporting',
  },
  {
    n: 7,
    title: 'Connecting Data Across Systems',
    keyConcepts: 'Relational databases; foreign keys; relationships',
    buildSkills: 'JOINs; multi-table analysis',
    career: 'System integration planning; data architecture reviews',
  },
  {
    n: 8,
    title: 'From APIs to Databases',
    keyConcepts: 'API → Database → Dashboard workflow',
    buildSkills: 'Postman examples; JSON structures; schema design',
    career: 'Technical requirements gathering; integration projects',
  },
  {
    n: 9,
    title: 'AI-Assisted SQL',
    keyConcepts: 'Human + AI workflows; accelerating analytics',
    buildSkills: 'Claude, Claude Code, ChatGPT for SQL generation & debugging',
    career: 'AI Product Management; AI Operations; Analytics Engineering',
  },
  {
    n: 10,
    title: 'Cloud Databases & Modern Data Platforms',
    keyConcepts: 'PostgreSQL; Supabase; cloud infrastructure',
    buildSkills: 'Supabase setup; loading data; connecting AI tools',
    career: 'Technical Program Management; Data Platform Teams',
  },
  {
    n: 11,
    title: 'Portfolio Project Build',
    keyConcepts: 'Data flow; schema design; reporting requirements',
    buildSkills: 'SQL queries; AI-assisted workflows; project development',
    career: 'Project ownership; stakeholder communication; technical solution design',
  },
  {
    n: 12,
    title: 'Portfolio Presentations & Career Readiness',
    keyConcepts: 'Communicating data through the system',
    buildSkills: 'Database + SQL + Dashboard + AI workflow demo',
    career: 'Data Analyst, TPM, Product & Operations interviews',
  },
];

export const SECTIONS: Section[] = [
  {
    id: 'foundations',
    title: 'SQL & Data Foundations',
    blurb: 'Classes 1–2 — what a database is and how data is organized.',
    tips: [
      {
        n: 1,
        title: 'What SQL actually is',
        concept: 'SQL',
        explain:
          'SQL (Structured Query Language) is how you ask a database questions and get answers back as a table of rows.',
        analogy:
          'It is like ordering at a restaurant: you say what you want, the kitchen (database) prepares it, and you get a plate (your results).',
        example: 'SELECT * FROM members;',
        business: 'Every analyst, PM, and TPM uses SQL to turn raw data into answers leaders can act on.',
      },
      {
        n: 2,
        title: 'Database vs spreadsheet',
        explain:
          'A database is a spreadsheet with superpowers: it enforces rules, links tables together, and stays fast with millions of rows.',
        analogy:
          'A spreadsheet is one notepad. A database is a filing cabinet of labeled drawers that reference each other.',
        business: 'Spreadsheets break at scale; databases are the system of record behind real products.',
      },
      {
        n: 3,
        title: 'Tables, rows, and columns',
        explain:
          'A table is a single sheet. A row is one record (one member). A column is one attribute (like city).',
        analogy: 'A contacts app: each contact is a row; each field (name, phone) is a column.',
        example: 'SELECT name, city FROM members;',
      },
      {
        n: 4,
        title: 'Data types',
        explain:
          'Each column holds one kind of value — text, numbers, or dates. The type controls what you can do (math on numbers, ranges on dates).',
        analogy: 'Labeled containers in a kitchen — you do not pour soup into the cutlery drawer.',
      },
      {
        n: 5,
        title: 'Primary keys',
        concept: 'PRIMARY KEY',
        explain:
          'A primary key (like id) uniquely identifies each row. No two rows share the same key.',
        analogy: 'A student ID number — two students can share a name, but never an ID.',
        example: 'SELECT * FROM members WHERE id = 7;',
      },
      {
        n: 6,
        title: 'Statements end with a semicolon',
        explain: 'The semicolon ; means "I am done — run it." It also lets you run several statements in a row.',
        analogy: 'A period ending a sentence.',
      },
      {
        n: 7,
        title: 'Keywords vs values: what is case-sensitive',
        explain:
          "Keywords are case-insensitive (select equals SELECT). Text values are case-sensitive: 'Miami' is not 'miami'.",
        example: "SELECT * FROM members WHERE city = 'Miami';",
        business: 'A surprising number of "no results" bugs are just a lowercase value.',
      },
    ],
  },
  {
    id: 'select',
    title: 'Reading Data with SELECT',
    blurb: 'Class 2 — pulling exactly the columns you need.',
    tips: [
      {
        n: 8,
        title: 'Pick specific columns',
        concept: 'SELECT',
        explain: 'List the columns you want after SELECT to keep results focused.',
        analogy: 'Ordering à la carte instead of taking the whole buffet (SELECT *).',
        example: 'SELECT name, city, score FROM members;',
      },
      {
        n: 9,
        title: 'SELECT * to explore',
        explain: 'The star * returns every column. Great for exploring a new table, noisy for a final report.',
        example: 'SELECT * FROM workouts;',
      },
      {
        n: 10,
        title: 'Unique values with DISTINCT',
        concept: 'DISTINCT',
        explain: 'DISTINCT removes duplicate rows so you see each unique value once.',
        analogy: 'A guest list with no repeated names.',
        example: 'SELECT DISTINCT city FROM members;',
        business: '"How many different cities do we serve?" starts here.',
      },
      {
        n: 11,
        title: 'Rename output with AS (aliases)',
        concept: 'AS',
        explain: 'AS gives a column a friendlier name in your results.',
        analogy: 'A name tag for the column on your report.',
        example: 'SELECT name AS member_name, score AS fitness_score FROM members;',
      },
      {
        n: 12,
        title: 'Calculate new columns',
        explain: 'You can do math right inside SELECT to create new values on the fly.',
        example: 'SELECT name, score, score * 1.1 AS boosted_score FROM members;',
        business: 'Quick "what-if" math (projected revenue, adjusted scores) without changing the data.',
      },
      {
        n: 13,
        title: 'Combine text with ||',
        explain: 'The || operator glues text together (works in both SQLite and PostgreSQL).',
        analogy: 'Snapping LEGO bricks of text into one label.',
        example: "SELECT name || ' from ' || city AS who_where FROM members;",
      },
      {
        n: 14,
        title: 'Leave comments',
        explain: 'Use -- for a single-line note and /* ... */ for a block. The database ignores them.',
        analogy: 'Sticky notes to your future self.',
        example: '-- Top members\nSELECT name, score FROM members; /* easy! */',
      },
    ],
  },
  {
    id: 'filtering',
    title: 'Filtering with WHERE',
    blurb: 'Class 3 — turning stakeholder questions into precise filters.',
    tips: [
      {
        n: 15,
        title: 'Keep only matching rows',
        concept: 'WHERE',
        explain: 'WHERE filters rows so you only see the ones that meet a condition.',
        analogy: 'A bouncer checking the guest list at the door.',
        example: "SELECT * FROM members WHERE city = 'Miami';",
        business: 'Most business questions are really a WHERE: "show me the customers who…"',
      },
      {
        n: 16,
        title: 'Comparison operators',
        explain: 'Compare values with = (equals), <> (not equal), >, <, >=, <=.',
        example: 'SELECT name, score FROM members WHERE score >= 80;',
      },
      {
        n: 17,
        title: 'AND — all conditions true',
        concept: 'AND',
        explain: 'AND requires every condition to be true at once.',
        analogy: 'A job that needs a degree AND experience — both, or no offer.',
        example: "SELECT * FROM members WHERE tier = 'Premium' AND city = 'Miami';",
      },
      {
        n: 18,
        title: 'OR — any condition true',
        concept: 'OR',
        explain: 'OR matches a row if at least one condition is true.',
        analogy: '"Coffee or tea?" — either one works.',
        example: "SELECT * FROM members WHERE city = 'Miami' OR city = 'Orlando';",
      },
      {
        n: 19,
        title: 'Group logic with parentheses',
        explain: 'When mixing AND and OR, wrap the OR part in parentheses so it is evaluated as one unit.',
        analogy: 'Math class: parentheses force the order of operations.',
        example: "SELECT * FROM members WHERE tier = 'Premium' AND (city = 'Miami' OR city = 'Orlando');",
        business: 'A misplaced parenthesis is a classic cause of "the report looks wrong."',
      },
      {
        n: 20,
        title: 'IN — match a list',
        concept: 'IN',
        explain: 'IN checks whether a value is in a list — cleaner than stringing many ORs together.',
        analogy: 'A VIP list of approved cities.',
        example: "SELECT * FROM members WHERE city IN ('Miami', 'Orlando', 'Tampa');",
      },
      {
        n: 21,
        title: 'NOT IN — exclude a list',
        explain: 'NOT IN keeps everything except the values you list.',
        example: "SELECT * FROM members WHERE city NOT IN ('Miami', 'Orlando');",
      },
      {
        n: 22,
        title: 'BETWEEN — a range',
        concept: 'BETWEEN',
        explain: 'BETWEEN matches values in a range, and it includes both ends.',
        analogy: '"Ages 13 to 19" — 13 and 19 both count.',
        example: 'SELECT name, score FROM members WHERE score BETWEEN 70 AND 90;',
      },
      {
        n: 23,
        title: 'LIKE — pattern matching',
        concept: 'LIKE',
        explain: 'LIKE matches text patterns. % means "any characters"; _ means "exactly one character."',
        analogy: 'A wildcard card that can stand in for others.',
        example: "SELECT * FROM members WHERE email LIKE '%@gmail.com';",
        business: 'Find all Gmail users, all SKUs starting with "AB-", all .edu emails, etc.',
      },
      {
        n: 24,
        title: 'NULL means "unknown"',
        concept: 'IS NULL',
        explain: 'NULL is a missing value — not zero, not blank text. Test it with IS NULL or IS NOT NULL (never = NULL).',
        analogy: 'A blank on a form: you do not know the answer, which is different from answering "0".',
        example: 'SELECT * FROM members WHERE email IS NOT NULL;',
      },
      {
        n: 25,
        title: 'NOT — flip a condition',
        concept: 'NOT',
        explain: 'NOT negates a condition, matching the rows that do not meet it.',
        example: "SELECT * FROM members WHERE NOT tier = 'Premium';",
      },
    ],
  },
  {
    id: 'sorting',
    title: 'Sorting & Prioritizing',
    blurb: 'Class 4 — ordering results so the important rows come first.',
    tips: [
      {
        n: 26,
        title: 'Sort with ORDER BY',
        concept: 'ORDER BY',
        explain: 'ORDER BY arranges your results by one or more columns.',
        analogy: 'Sorting a playlist by most-played.',
        example: 'SELECT name, score FROM members ORDER BY score;',
      },
      {
        n: 27,
        title: 'ASC vs DESC',
        explain: 'Ascending (ASC) is the default (low to high). DESC sorts high to low.',
        example: 'SELECT name, score FROM members ORDER BY score DESC;',
        business: '"Highest spenders first" is just ORDER BY total DESC.',
      },
      {
        n: 28,
        title: 'Tie-breakers: sort by multiple columns',
        explain: 'List several columns to break ties — the second column orders rows that match on the first.',
        example: 'SELECT name, city, score FROM members ORDER BY city, score DESC;',
      },
      {
        n: 29,
        title: 'Top N with LIMIT',
        concept: 'LIMIT',
        explain: 'LIMIT returns only the first N rows — perfect after an ORDER BY for a "Top 5".',
        analogy: 'A leaderboard that only shows the top 10.',
        example: 'SELECT name, score FROM members ORDER BY score DESC LIMIT 5;',
        business: 'Executives want the top movers, not all 10,000 rows.',
      },
      {
        n: 30,
        title: 'Paging with OFFSET',
        explain: 'OFFSET skips rows before LIMIT starts — the basis of page 1, page 2, etc.',
        example: 'SELECT name, score FROM members ORDER BY score DESC LIMIT 5 OFFSET 5;',
      },
    ],
  },
  {
    id: 'metrics',
    title: 'Metrics & KPIs (Aggregations)',
    blurb: 'Class 5 — turning rows into the numbers leadership tracks.',
    tips: [
      {
        n: 31,
        title: 'COUNT — how many',
        concept: 'COUNT',
        explain: 'COUNT(*) counts rows. It answers "how many?"',
        analogy: 'Counting heads in a room.',
        example: 'SELECT COUNT(*) AS total_members FROM members;',
        business: 'Total customers, total orders, total signups — all start with COUNT.',
      },
      {
        n: 32,
        title: 'Count unique values',
        explain: 'COUNT(DISTINCT col) counts how many different values exist.',
        example: 'SELECT COUNT(DISTINCT city) AS cities_served FROM members;',
      },
      {
        n: 33,
        title: 'SUM — totals',
        concept: 'SUM',
        explain: 'SUM adds up a numeric column.',
        example: 'SELECT SUM(calories) AS total_calories FROM workouts;',
        business: 'Total revenue, total usage, total minutes — the headline number on a dashboard.',
      },
      {
        n: 34,
        title: 'AVG — averages',
        concept: 'AVG',
        explain: 'AVG returns the mean of a numeric column. It ignores NULLs.',
        example: 'SELECT AVG(score) AS avg_score FROM members;',
      },
      {
        n: 35,
        title: 'MIN and MAX — extremes',
        concept: 'MIN / MAX',
        explain: 'MIN finds the smallest value, MAX the largest.',
        analogy: 'The shortest and tallest person in line.',
        example: 'SELECT MIN(score) AS lowest, MAX(score) AS highest FROM members;',
      },
      {
        n: 36,
        title: 'Round for clean reports',
        explain: 'Wrap an average in ROUND(value, decimals) so numbers read nicely.',
        example: 'SELECT ROUND(AVG(score), 1) AS avg_score FROM members;',
        business: 'Leadership wants "82.4", not "82.36363636".',
      },
    ],
  },
  {
    id: 'grouping',
    title: 'Summarizing with GROUP BY',
    blurb: 'Class 6 — rolling rows up into per-category summaries.',
    tips: [
      {
        n: 37,
        title: 'GROUP BY — one row per group',
        concept: 'GROUP BY',
        explain: 'GROUP BY collapses rows that share a value into a single summary row, usually with an aggregate.',
        analogy: 'Sorting laundry into piles by color, then counting each pile.',
        example: 'SELECT city, COUNT(*) AS members FROM members GROUP BY city;',
        business: 'The engine behind almost every dashboard chart ("sales by region").',
      },
      {
        n: 38,
        title: 'Aggregate per group',
        explain: 'Any aggregate (SUM, AVG, MAX) can be computed per group.',
        example: 'SELECT city, ROUND(AVG(score), 1) AS avg_score FROM members GROUP BY city;',
      },
      {
        n: 39,
        title: 'HAVING — filter the groups',
        concept: 'HAVING',
        explain: 'HAVING filters groups after aggregation — like a WHERE, but for the summarized rows.',
        analogy: 'WHERE filters individual people; HAVING filters the finished piles.',
        example: 'SELECT city, COUNT(*) AS members FROM members GROUP BY city HAVING COUNT(*) > 5;',
      },
      {
        n: 40,
        title: 'WHERE vs HAVING',
        explain: 'WHERE runs first on individual rows; HAVING runs last on grouped results. Use WHERE to trim rows before grouping, HAVING to trim groups after.',
        example: "SELECT city, COUNT(*) FROM members WHERE tier = 'Premium' GROUP BY city HAVING COUNT(*) >= 2;",
        business: 'Knowing the difference prevents slow queries and wrong totals.',
      },
      {
        n: 41,
        title: 'Group by two dimensions',
        explain: 'Group by more than one column to break a metric down by two categories at once.',
        example: 'SELECT city, tier, COUNT(*) AS members FROM members GROUP BY city, tier;',
      },
    ],
  },
  {
    id: 'joins',
    title: 'Connecting Tables with JOINs',
    blurb: 'Class 7 — combining data that lives in separate tables.',
    tips: [
      {
        n: 42,
        title: 'Foreign keys link tables',
        concept: 'FOREIGN KEY',
        explain: 'A foreign key is a column that points to another table’s key. Here workouts.member_id points to members.id.',
        analogy: 'A library checkout slip that references the borrower’s card number.',
        business: 'Relationships are how real systems avoid copying the same data everywhere.',
      },
      {
        n: 43,
        title: 'INNER JOIN — matches in both',
        concept: 'JOIN',
        explain: 'A JOIN (inner) returns rows that have a match in both tables, linked by the ON condition.',
        analogy: 'The overlapping middle of a Venn diagram.',
        example: 'SELECT m.name, w.type, w.calories\nFROM members m\nJOIN workouts w ON w.member_id = m.id;',
      },
      {
        n: 44,
        title: 'Table aliases keep joins short',
        explain: 'Give tables short aliases (members m, workouts w) so column references stay readable.',
        example: 'SELECT m.name, w.type FROM members m JOIN workouts w ON w.member_id = m.id;',
      },
      {
        n: 45,
        title: 'LEFT JOIN — keep everyone',
        concept: 'LEFT JOIN',
        explain: 'A LEFT JOIN keeps every row from the left table, filling in NULLs where the right table has no match.',
        analogy: 'A class roster where some students did not submit homework — you still list them, with a blank.',
        example: 'SELECT m.name, w.type\nFROM members m\nLEFT JOIN workouts w ON w.member_id = m.id;',
        business: '"Which customers have NEVER ordered?" needs a LEFT JOIN.',
      },
      {
        n: 46,
        title: 'JOIN + GROUP BY together',
        explain: 'Join tables, then group, to summarize across relationships — e.g. workouts per member.',
        example:
          'SELECT m.name, COUNT(w.id) AS workouts\nFROM members m\nLEFT JOIN workouts w ON w.member_id = m.id\nGROUP BY m.name\nORDER BY workouts DESC;',
      },
    ],
  },
  {
    id: 'pro',
    title: 'Pro Tips, Patterns & AI',
    blurb: 'Classes 8–10 — the moves that make you look senior, plus working with AI.',
    tips: [
      {
        n: 47,
        title: 'CASE — if/else inside SQL',
        concept: 'CASE',
        explain: 'CASE assigns a result based on conditions, like an if/else ladder, to create labels or buckets.',
        analogy: 'A grading rubric: 90+ is an A, 80+ is a B, otherwise a C.',
        example:
          "SELECT name, score,\n  CASE WHEN score >= 90 THEN 'A'\n       WHEN score >= 80 THEN 'B'\n       ELSE 'C' END AS grade\nFROM members;",
        business: 'Turn raw numbers into the segments leaders think in (High / Medium / Low).',
      },
      {
        n: 48,
        title: 'COALESCE — a fallback value',
        concept: 'COALESCE',
        explain: 'COALESCE returns the first value that is not NULL, so blanks become friendly defaults.',
        analogy: 'A backup plan: use the cell number, or if missing, the home number.',
        example: "SELECT name, COALESCE(email, 'no email on file') AS contact FROM members;",
      },
      {
        n: 49,
        title: 'Subqueries — a query inside a query',
        explain: 'A subquery answers a small question first, then the outer query uses that answer.',
        analogy: 'A question whose answer feeds the next question ("who is above the team average?").',
        example: 'SELECT name, score FROM members\nWHERE score > (SELECT AVG(score) FROM members);',
        business: 'Comparisons against an average, max, or total are everyday subqueries.',
      },
      {
        n: 50,
        title: 'Build incrementally & let AI help',
        explain:
          'Start with SELECT *, then add one clause at a time and re-run. Stuck? Ask Claude or ChatGPT to explain an error or draft a starting query — then read it and verify the result yourself. SQLite and PostgreSQL share almost all of this syntax; Postgres is stricter and closer to cloud platforms like Supabase.',
        analogy: 'Like writing an essay: rough draft first, then refine sentence by sentence.',
        business:
          'AI-assisted SQL is now a core skill for analysts, TPMs, and AI product roles — speed plus judgment beats memorization.',
      },
    ],
  },
];

export const PDF_FILENAME = 'sql-kickoff-cheatsheet.pdf';
