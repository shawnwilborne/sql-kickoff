// Sample classroom dataset shared by both engines.
//
// The data is tuned so every challenge has a clean, deterministic answer:
//   - Miami has 7 members and Orlando 6, so "cities with more than 5 members"
//     returns exactly those two.
//   - 11 Premium members, 13 Gmail users, 10 scores above 80, etc.
// Challenge expected counts are derived from these arrays at runtime
// (see game/challenges.ts), so tweaking the data keeps validation correct.

export type Tier = 'Premium' | 'Standard';

export interface Member {
  id: number;
  name: string;
  city: string;
  email: string;
  tier: Tier;
  score: number;
  join_date: string; // YYYY-MM-DD
}

export interface Workout {
  id: number;
  member_id: number;
  type: string;
  duration_min: number;
  calories: number;
  workout_date: string; // YYYY-MM-DD
}

export const MEMBERS: Member[] = [
  // Miami (7)
  { id: 1, name: 'Ava Martinez', city: 'Miami', email: 'ava.martinez@gmail.com', tier: 'Premium', score: 88, join_date: '2025-01-12' },
  { id: 2, name: 'Liam Johnson', city: 'Miami', email: 'liam.johnson@yahoo.com', tier: 'Standard', score: 72, join_date: '2025-02-03' },
  { id: 3, name: 'Sophia Brown', city: 'Miami', email: 'sophia.brown@gmail.com', tier: 'Premium', score: 95, join_date: '2025-01-28' },
  { id: 4, name: 'Noah Davis', city: 'Miami', email: 'noah.davis@outlook.com', tier: 'Standard', score: 64, join_date: '2025-03-15' },
  { id: 5, name: 'Mia Wilson', city: 'Miami', email: 'mia.wilson@gmail.com', tier: 'Premium', score: 81, join_date: '2025-02-19' },
  { id: 6, name: 'Lucas Garcia', city: 'Miami', email: 'lucas.garcia@hotmail.com', tier: 'Standard', score: 77, join_date: '2025-04-02' },
  { id: 7, name: 'Emma Rodriguez', city: 'Miami', email: 'emma.rodriguez@gmail.com', tier: 'Premium', score: 90, join_date: '2025-01-09' },

  // Orlando (6)
  { id: 8, name: 'Oliver Smith', city: 'Orlando', email: 'oliver.smith@gmail.com', tier: 'Standard', score: 69, join_date: '2025-02-22' },
  { id: 9, name: 'Isabella Lee', city: 'Orlando', email: 'isabella.lee@yahoo.com', tier: 'Premium', score: 84, join_date: '2025-03-01' },
  { id: 10, name: 'Ethan Walker', city: 'Orlando', email: 'ethan.walker@gmail.com', tier: 'Standard', score: 73, join_date: '2025-03-19' },
  { id: 11, name: 'Charlotte Hall', city: 'Orlando', email: 'charlotte.hall@outlook.com', tier: 'Premium', score: 91, join_date: '2025-01-17' },
  { id: 12, name: 'James Allen', city: 'Orlando', email: 'james.allen@gmail.com', tier: 'Standard', score: 58, join_date: '2025-04-11' },
  { id: 13, name: 'Amelia Young', city: 'Orlando', email: 'amelia.young@gmail.com', tier: 'Premium', score: 86, join_date: '2025-02-14' },

  // Tampa (4)
  { id: 14, name: 'Benjamin King', city: 'Tampa', email: 'benjamin.king@yahoo.com', tier: 'Standard', score: 79, join_date: '2025-03-08' },
  { id: 15, name: 'Harper Wright', city: 'Tampa', email: 'harper.wright@gmail.com', tier: 'Premium', score: 83, join_date: '2025-01-25' },
  { id: 16, name: 'Elijah Scott', city: 'Tampa', email: 'elijah.scott@outlook.com', tier: 'Standard', score: 67, join_date: '2025-04-19' },
  { id: 17, name: 'Evelyn Green', city: 'Tampa', email: 'evelyn.green@gmail.com', tier: 'Premium', score: 88, join_date: '2025-02-27' },

  // Jacksonville (3)
  { id: 18, name: 'Henry Adams', city: 'Jacksonville', email: 'henry.adams@gmail.com', tier: 'Standard', score: 71, join_date: '2025-03-23' },
  { id: 19, name: 'Abigail Baker', city: 'Jacksonville', email: 'abigail.baker@yahoo.com', tier: 'Premium', score: 76, join_date: '2025-01-30' },
  { id: 20, name: 'Alexander Nelson', city: 'Jacksonville', email: 'alexander.nelson@gmail.com', tier: 'Standard', score: 62, join_date: '2025-04-06' },

  // Tallahassee (2)
  { id: 21, name: 'Emily Carter', city: 'Tallahassee', email: 'emily.carter@gmail.com', tier: 'Premium', score: 93, join_date: '2025-02-09' },
  { id: 22, name: 'Daniel Mitchell', city: 'Tallahassee', email: 'daniel.mitchell@outlook.com', tier: 'Standard', score: 70, join_date: '2025-03-30' },
];

export const WORKOUTS: Workout[] = [
  { id: 1, member_id: 1, type: 'Running', duration_min: 35, calories: 360, workout_date: '2025-05-02' },
  { id: 2, member_id: 1, type: 'Strength', duration_min: 45, calories: 280, workout_date: '2025-05-09' },
  { id: 3, member_id: 2, type: 'Cycling', duration_min: 50, calories: 520, workout_date: '2025-05-03' },
  { id: 4, member_id: 3, type: 'Swimming', duration_min: 40, calories: 410, workout_date: '2025-05-05' },
  { id: 5, member_id: 3, type: 'Yoga', duration_min: 60, calories: 200, workout_date: '2025-05-12' },
  { id: 6, member_id: 5, type: 'Running', duration_min: 30, calories: 320, workout_date: '2025-05-04' },
  { id: 7, member_id: 7, type: 'Strength', duration_min: 55, calories: 330, workout_date: '2025-05-06' },
  { id: 8, member_id: 7, type: 'Cycling', duration_min: 65, calories: 600, workout_date: '2025-05-13' },
  { id: 9, member_id: 8, type: 'Yoga', duration_min: 45, calories: 160, workout_date: '2025-05-07' },
  { id: 10, member_id: 9, type: 'Running', duration_min: 42, calories: 430, workout_date: '2025-05-08' },
  { id: 11, member_id: 9, type: 'Swimming', duration_min: 38, calories: 390, workout_date: '2025-05-15' },
  { id: 12, member_id: 10, type: 'Cycling', duration_min: 48, calories: 500, workout_date: '2025-05-09' },
  { id: 13, member_id: 11, type: 'Strength', duration_min: 50, calories: 310, workout_date: '2025-05-10' },
  { id: 14, member_id: 11, type: 'Running', duration_min: 33, calories: 340, workout_date: '2025-05-17' },
  { id: 15, member_id: 13, type: 'Yoga', duration_min: 60, calories: 210, workout_date: '2025-05-11' },
  { id: 16, member_id: 14, type: 'Cycling', duration_min: 55, calories: 560, workout_date: '2025-05-12' },
  { id: 17, member_id: 15, type: 'Running', duration_min: 28, calories: 300, workout_date: '2025-05-13' },
  { id: 18, member_id: 15, type: 'Strength', duration_min: 40, calories: 260, workout_date: '2025-05-20' },
  { id: 19, member_id: 17, type: 'Swimming', duration_min: 45, calories: 450, workout_date: '2025-05-14' },
  { id: 20, member_id: 18, type: 'Cycling', duration_min: 60, calories: 590, workout_date: '2025-05-15' },
  { id: 21, member_id: 19, type: 'Yoga', duration_min: 50, calories: 180, workout_date: '2025-05-16' },
  { id: 22, member_id: 21, type: 'Running', duration_min: 36, calories: 370, workout_date: '2025-05-17' },
  { id: 23, member_id: 21, type: 'Strength', duration_min: 48, calories: 300, workout_date: '2025-05-24' },
  { id: 24, member_id: 22, type: 'Cycling', duration_min: 52, calories: 540, workout_date: '2025-05-18' },
  { id: 25, member_id: 4, type: 'Running', duration_min: 25, calories: 250, workout_date: '2025-05-19' },
  { id: 26, member_id: 6, type: 'Swimming', duration_min: 30, calories: 300, workout_date: '2025-05-20' },
  { id: 27, member_id: 12, type: 'Yoga', duration_min: 55, calories: 190, workout_date: '2025-05-21' },
  { id: 28, member_id: 16, type: 'Strength', duration_min: 42, calories: 270, workout_date: '2025-05-22' },
  { id: 29, member_id: 20, type: 'Cycling', duration_min: 47, calories: 480, workout_date: '2025-05-23' },
  { id: 30, member_id: 2, type: 'Running', duration_min: 31, calories: 330, workout_date: '2025-05-25' },
];

type Dialect = 'sqlite' | 'postgres';

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Build the full DDL + INSERT script that seeds the sample dataset.
 * SQLite has no DATE type, so dates are stored as TEXT there; PostgreSQL uses DATE.
 */
export function buildSeedSql(dialect: Dialect): string {
  const dateType = dialect === 'postgres' ? 'DATE' : 'TEXT';

  const memberRows = MEMBERS.map(
    (m) =>
      `(${m.id}, ${sqlString(m.name)}, ${sqlString(m.city)}, ${sqlString(m.email)}, ${sqlString(
        m.tier,
      )}, ${m.score}, ${sqlString(m.join_date)})`,
  ).join(',\n  ');

  const workoutRows = WORKOUTS.map(
    (w) =>
      `(${w.id}, ${w.member_id}, ${sqlString(w.type)}, ${w.duration_min}, ${w.calories}, ${sqlString(
        w.workout_date,
      )})`,
  ).join(',\n  ');

  return `
CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  email TEXT NOT NULL,
  tier TEXT NOT NULL,
  score INTEGER NOT NULL,
  join_date ${dateType} NOT NULL
);

CREATE TABLE workouts (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  duration_min INTEGER NOT NULL,
  calories INTEGER NOT NULL,
  workout_date ${dateType} NOT NULL
);

INSERT INTO members (id, name, city, email, tier, score, join_date) VALUES
  ${memberRows};

INSERT INTO workouts (id, member_id, type, duration_min, calories, workout_date) VALUES
  ${workoutRows};
`;
}
