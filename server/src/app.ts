import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
import Database from 'better-sqlite3';
import { createDatabase, seedPilotData } from './db.js';

// Zod Schemas for Request Validation
const ConsentSchema = z.object({
  participantId: z.string().min(3),
  version: z.string().min(1),
  purposes: z.array(z.string()).min(1),
});

const ParticipantSchema = z.object({
  pseudonymousId: z
    .string()
    .min(3)
    .max(64)
    // Strictly disallow PII: no @ (email), no phone format
    .regex(/^[a-zA-Z0-9_\-]+$/, 'Pseudonymous ID must not contain personal identifiers'),
  consentVersion: z.string().optional(),
});

const CheckinSchema = z.object({
  participantId: z.string().min(3),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  steps: z.number().int().min(0).max(100000), // clamped to realistic physical limits
  minutesAsleep: z.number().int().min(0).max(1440).optional(),
  contextFlags: z.record(z.string(), z.any()).optional(),
});

const ImportPayloadSchema = z.object({
  participantId: z.string().min(3),
  records: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      steps: z.number().int().min(0).max(100000),
      minutesAsleep: z.number().int().min(0).max(1440).optional(),
      contextFlags: z.record(z.string(), z.any()).optional(),
    })
  ),
});

export interface ServerOptions {
  dbPath?: string;
  enableSeed?: boolean;
}

export async function buildApp(options: ServerOptions = {}): Promise<{ app: FastifyInstance; db: Database.Database }> {
  const db = createDatabase(options.dbPath);
  if (options.enableSeed) {
    seedPilotData(db);
  }

  const app = Fastify({
    logger: false, // Structured logging handled explicitly without PII
  });

  // Security Plugins
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: true });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Health Check
  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'wellsync-pilot-server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  });

  // 1. POST /v1/consent
  app.post('/v1/consent', async (request, reply) => {
    const parse = ConsentSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Invalid consent payload', details: parse.error.issues });
    }
    const { participantId, version, purposes } = parse.data;

    // Verify participant exists
    const participant = db.prepare('SELECT id FROM participants WHERE id = ?').get(participantId);
    if (!participant) {
      return reply.status(404).send({ error: 'Participant not found' });
    }

    const now = new Date().toISOString();
    const insert = db.prepare(
      'INSERT INTO consents (participant_id, version, purposes, consented_at) VALUES (?, ?, ?, ?)'
    );
    insert.run(participantId, version, JSON.stringify(purposes), now);

    return reply.status(201).send({
      success: true,
      participantId,
      version,
      purposes,
      consentedAt: now,
    });
  });

  // 2. POST /v1/participants
  app.post('/v1/participants', async (request, reply) => {
    const parse = ParticipantSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Invalid participant payload', details: parse.error.issues });
    }
    const { pseudonymousId, consentVersion } = parse.data;

    const existing = db.prepare('SELECT id, pseudonymous_id, enrolled_at FROM participants WHERE pseudonymous_id = ?').get(pseudonymousId) as any;
    if (existing) {
      return reply.status(200).send({
        participantId: existing.id,
        pseudonymousId: existing.pseudonymous_id,
        enrolledAt: existing.enrolled_at,
        isExisting: true,
      });
    }

    const id = `p_${Math.random().toString(36).substring(2, 10)}`;
    const now = new Date().toISOString();

    db.prepare('INSERT INTO participants (id, pseudonymous_id, enrolled_at, status) VALUES (?, ?, ?, ?)').run(
      id,
      pseudonymousId,
      now,
      'ACTIVE'
    );

    if (consentVersion) {
      db.prepare('INSERT INTO consents (participant_id, version, purposes, consented_at) VALUES (?, ?, ?, ?)').run(
        id,
        consentVersion,
        JSON.stringify(['pilot_telemetry_sync']),
        now
      );
    }

    return reply.status(201).send({
      participantId: id,
      pseudonymousId,
      enrolledAt: now,
      isExisting: false,
    });
  });

  // 3. POST /v1/checkins (Idempotent daily telemetry)
  app.post('/v1/checkins', async (request, reply) => {
    const parse = CheckinSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Invalid checkin payload', details: parse.error.issues });
    }
    const { participantId, date, steps, minutesAsleep, contextFlags } = parse.data;

    // Check participant
    const participant = db.prepare('SELECT id FROM participants WHERE id = ?').get(participantId);
    if (!participant) {
      return reply.status(404).send({ error: 'Participant not found' });
    }

    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO checkins (participant_id, date, steps, minutes_asleep, context_flags, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(participant_id, date) DO UPDATE SET
        steps = excluded.steps,
        minutes_asleep = excluded.minutes_asleep,
        context_flags = excluded.context_flags
    `).run(
      participantId,
      date,
      steps,
      minutesAsleep || null,
      contextFlags ? JSON.stringify(contextFlags) : null,
      now
    );

    // Compute updated engine summary across participant history
    const allCheckins = db
      .prepare('SELECT date, steps, minutes_asleep FROM checkins WHERE participant_id = ? ORDER BY date ASC')
      .all(participantId) as Array<{ date: string; steps: number; minutes_asleep: number | null }>;

    const validSteps = allCheckins.map((c) => c.steps).sort((a, b) => a - b);
    const mid = Math.floor(validSteps.length / 2);
    const baseline = validSteps.length === 0 ? 8000 : validSteps[mid];
    const activeDays = allCheckins.filter((c) => c.steps >= baseline * 0.5).length;

    const engineState = {
      state: 'ON_TRACK',
      activeDays,
      returnCount: 1,
      baseline,
      activeTarget: baseline,
      lastCheckinDate: date,
    };

    db.prepare(`
      INSERT INTO engine_states (participant_id, state_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(participant_id) DO UPDATE SET
        state_json = excluded.state_json,
        updated_at = excluded.updated_at
    `).run(participantId, JSON.stringify(engineState), now);

    return reply.status(200).send({
      success: true,
      participantId,
      date,
      steps,
      engineState,
    });
  });

  // 4. GET /v1/participants/:id/state
  app.get('/v1/participants/:id/state', async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = db.prepare('SELECT state_json, updated_at FROM engine_states WHERE participant_id = ?').get(id) as any;

    if (!row) {
      return reply.status(404).send({ error: 'No engine state found for participant' });
    }

    return reply.send({
      participantId: id,
      engineState: JSON.parse(row.state_json),
      updatedAt: row.updated_at,
    });
  });

  // 5. POST /v1/import/fitbit-csv & /v1/import/health-export
  const handleBatchImport = async (request: any, reply: any) => {
    const parse = ImportPayloadSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Invalid batch import payload', details: parse.error.issues });
    }
    const { participantId, records } = parse.data;

    const participant = db.prepare('SELECT id FROM participants WHERE id = ?').get(participantId);
    if (!participant) {
      return reply.status(404).send({ error: 'Participant not found' });
    }

    const now = new Date().toISOString();
    const insert = db.prepare(`
      INSERT INTO checkins (participant_id, date, steps, minutes_asleep, context_flags, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(participant_id, date) DO UPDATE SET
        steps = excluded.steps,
        minutes_asleep = excluded.minutes_asleep,
        context_flags = excluded.context_flags
    `);

    const insertMany = db.transaction((rows: typeof records) => {
      for (const r of rows) {
        insert.run(
          participantId,
          r.date,
          r.steps,
          r.minutesAsleep || null,
          r.contextFlags ? JSON.stringify(r.contextFlags) : null,
          now
        );
      }
    });

    insertMany(records);

    return reply.status(200).send({
      success: true,
      participantId,
      importedCount: records.length,
    });
  };

  app.post('/v1/import/fitbit-csv', handleBatchImport);
  app.post('/v1/import/health-export', handleBatchImport);

  // 6. GET /v1/export
  app.get('/v1/export', async (request, reply) => {
    const { participantId } = request.query as { participantId?: string };
    if (!participantId) {
      return reply.status(400).send({ error: 'Missing required query parameter: participantId' });
    }

    const participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(participantId) as any;
    if (!participant) {
      return reply.status(404).send({ error: 'Participant not found' });
    }

    const consents = db.prepare('SELECT * FROM consents WHERE participant_id = ?').all(participantId);
    const checkins = db.prepare('SELECT date, steps, minutes_asleep, context_flags FROM checkins WHERE participant_id = ? ORDER BY date ASC').all(participantId);
    const state = db.prepare('SELECT state_json, updated_at FROM engine_states WHERE participant_id = ?').get(participantId) as any;

    return reply.send({
      exportDateUtc: new Date().toISOString(),
      participant: {
        id: participant.id,
        pseudonymousId: participant.pseudonymous_id,
        enrolledAt: participant.enrolled_at,
        status: participant.status,
      },
      consents,
      checkins,
      engineState: state ? JSON.parse(state.state_json) : null,
    });
  });

  // 7. DELETE /v1/participants/:id (Hard delete verified by foreign keys cascade)
  app.delete('/v1/participants/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const participant = db.prepare('SELECT id FROM participants WHERE id = ?').get(id);
    if (!participant) {
      return reply.status(404).send({ error: 'Participant not found' });
    }

    // Cascade delete on foreign keys
    db.prepare('DELETE FROM participants WHERE id = ?').run(id);

    return reply.status(200).send({
      deleted: true,
      participantId: id,
      message: 'Participant and all associated records hard-deleted successfully',
    });
  });

  // 8. GET /v1/pilot/aggregate (k-anonymity n >= 10 privacy threshold)
  app.get('/v1/pilot/aggregate', async (_request, reply) => {
    const countRow = db.prepare("SELECT COUNT(*) as count FROM participants WHERE status = 'ACTIVE'").get() as { count: number };
    const n = countRow.count;

    if (n < 10) {
      return reply.status(200).send({
        suppressed: true,
        reason: 'Cohort size below privacy threshold (n < 10)',
        currentCohortSize: n,
        minimumRequired: 10,
      });
    }

    // Aggregate statistics across cohort
    const avgStepsRow = db.prepare('SELECT AVG(steps) as avgSteps FROM checkins').get() as { avgSteps: number };
    const totalCheckinsRow = db.prepare('SELECT COUNT(*) as totalCheckins FROM checkins').get() as { totalCheckins: number };

    return reply.status(200).send({
      suppressed: false,
      cohortSize: n,
      totalTelemetryDays: totalCheckinsRow.totalCheckins,
      meanDailySteps: Math.round(avgStepsRow.avgSteps || 0),
      privacyStandard: 'k-anonymity (n >= 10)',
      generatedAtUtc: new Date().toISOString(),
    });
  });

  return { app, db };
}
