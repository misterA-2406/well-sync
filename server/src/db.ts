import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export function createDatabase(dbPath?: string) {
  const file = dbPath || ':memory:';
  if (file !== ':memory:') {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(file);
  db.pragma('foreign_keys = ON');

  // Schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      pseudonymous_id TEXT UNIQUE NOT NULL,
      enrolled_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE'
    );

    CREATE TABLE IF NOT EXISTS consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id TEXT NOT NULL,
      version TEXT NOT NULL,
      purposes TEXT NOT NULL,
      consented_at TEXT NOT NULL,
      FOREIGN KEY(participant_id) REFERENCES participants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id TEXT NOT NULL,
      date TEXT NOT NULL,
      steps INTEGER NOT NULL,
      minutes_asleep INTEGER,
      context_flags TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(participant_id, date),
      FOREIGN KEY(participant_id) REFERENCES participants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS engine_states (
      participant_id TEXT PRIMARY KEY,
      state_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(participant_id) REFERENCES participants(id) ON DELETE CASCADE
    );
  `);

  return db;
}

/**
 * Seeds sample pilot profiles: Tariq (shift-worker), Sarah (educator), and cohort members to meet n >= 10.
 */
export function seedPilotData(db: Database.Database) {
  const participantCount = db.prepare('SELECT COUNT(*) as count FROM participants').get() as { count: number };
  if (participantCount.count > 0) return; // already seeded

  const insertParticipant = db.prepare(
    'INSERT INTO participants (id, pseudonymous_id, enrolled_at, status) VALUES (?, ?, ?, ?)'
  );
  const insertConsent = db.prepare(
    'INSERT INTO consents (participant_id, version, purposes, consented_at) VALUES (?, ?, ?, ?)'
  );
  const insertCheckin = db.prepare(
    'INSERT OR REPLACE INTO checkins (participant_id, date, steps, minutes_asleep, context_flags, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertState = db.prepare(
    'INSERT OR REPLACE INTO engine_states (participant_id, state_json, updated_at) VALUES (?, ?, ?)'
  );

  const now = new Date().toISOString();

  // 1. Tariq: Abu Dhabi shift-worker
  insertParticipant.run('p_tariq', 'tariq_shift_ad2026', now, 'ACTIVE');
  insertConsent.run('p_tariq', 'v1.0', JSON.stringify(['habit_research', 'shift_health']), now);
  // Seed Tariq checkins across a 10-day cycle
  for (let i = 1; i <= 10; i++) {
    const d = `2026-11-${i.toString().padStart(2, '0')}`;
    const steps = i >= 4 && i <= 6 ? 3200 : 8500; // lapse during night shift then recovery
    const flags = i >= 4 && i <= 5 ? JSON.stringify({ shift: 'night' }) : null;
    insertCheckin.run('p_tariq', d, steps, 420, flags, now);
  }
  insertState.run(
    'p_tariq',
    JSON.stringify({
      state: 'ON_TRACK',
      activeDays: 8,
      returnCount: 1,
      baseline: 8000,
      activeTarget: 8000,
      contextMode: 'shift_work',
    }),
    now
  );

  // 2. Sarah: Dubai educator & parent
  insertParticipant.run('p_sarah', 'sarah_parent_dxb2026', now, 'ACTIVE');
  insertConsent.run('p_sarah', 'v1.0', JSON.stringify(['habit_research', 'lifestyle_wellness']), now);
  for (let i = 1; i <= 10; i++) {
    const d = `2026-11-${i.toString().padStart(2, '0')}`;
    const steps = 7200 + (i % 3) * 600;
    insertCheckin.run('p_sarah', d, steps, 450, null, now);
  }
  insertState.run(
    'p_sarah',
    JSON.stringify({
      state: 'ON_TRACK',
      activeDays: 10,
      returnCount: 0,
      baseline: 7500,
      activeTarget: 7500,
      contextMode: 'default',
    }),
    now
  );

  // 3. Seed 10 additional cohort members so cohort n >= 10
  for (let c = 1; c <= 10; c++) {
    const cid = `p_cohort_${c}`;
    const pseudo = `pseudo_participant_${c.toString().padStart(3, '0')}`;
    insertParticipant.run(cid, pseudo, now, 'ACTIVE');
    insertConsent.run(cid, 'v1.0', JSON.stringify(['habit_research']), now);

    for (let i = 1; i <= 8; i++) {
      const d = `2026-11-${i.toString().padStart(2, '0')}`;
      const steps = 5000 + (c * 300) + (i * 200);
      insertCheckin.run(cid, d, Math.min(15000, steps), 430, null, now);
    }

    insertState.run(
      cid,
      JSON.stringify({
        state: 'ON_TRACK',
        activeDays: 6 + (c % 3),
        returnCount: c % 2,
        baseline: 7000,
        activeTarget: 7000,
        contextMode: 'default',
      }),
      now
    );
  }
}
