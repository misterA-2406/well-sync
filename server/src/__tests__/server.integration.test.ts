import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../app.js';
import { FastifyInstance } from 'fastify';
import Database from 'better-sqlite3';

describe('WellSync Pilot Backend Integration Tests', () => {
  let app: FastifyInstance;
  let db: Database.Database;

  beforeEach(async () => {
    const res = await buildApp({ dbPath: ':memory:', enableSeed: false });
    app = res.app;
    db = res.db;
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    db.close();
  });

  it('GET /health returns 200 with service information', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('wellsync-pilot-server');
  });

  it('POST /v1/participants creates pseudonymous participant and rejects PII', async () => {
    // 1. Rejects email-like PII
    const badRes = await app.inject({
      method: 'POST',
      url: '/v1/participants',
      payload: { pseudonymousId: 'user@example.com' },
    });
    expect(badRes.statusCode).toBe(400);

    // 2. Rejects phone number format
    const badPhoneRes = await app.inject({
      method: 'POST',
      url: '/v1/participants',
      payload: { pseudonymousId: '+971-50-1234567' },
    });
    expect(badPhoneRes.statusCode).toBe(400);

    // 3. Accepts clean pseudonymous ID
    const goodRes = await app.inject({
      method: 'POST',
      url: '/v1/participants',
      payload: { pseudonymousId: 'pseudo_pilot_001', consentVersion: 'v1.0' },
    });
    expect(goodRes.statusCode).toBe(201);
    const body = JSON.parse(goodRes.payload);
    expect(body.participantId).toBeDefined();
    expect(body.pseudonymousId).toBe('pseudo_pilot_001');

    // 4. Idempotent on second call with same pseudonymousId
    const repeatRes = await app.inject({
      method: 'POST',
      url: '/v1/participants',
      payload: { pseudonymousId: 'pseudo_pilot_001' },
    });
    expect(repeatRes.statusCode).toBe(200);
    const repeatBody = JSON.parse(repeatRes.payload);
    expect(repeatBody.participantId).toBe(body.participantId);
    expect(repeatBody.isExisting).toBe(true);
  });

  it('POST /v1/consent records participant consent', async () => {
    // Create participant first
    const pRes = await app.inject({
      method: 'POST',
      url: '/v1/participants',
      payload: { pseudonymousId: 'pseudo_consent_001' },
    });
    const { participantId } = JSON.parse(pRes.payload);

    const consentRes = await app.inject({
      method: 'POST',
      url: '/v1/consent',
      payload: {
        participantId,
        version: 'v2.1',
        purposes: ['telemetry_sync', 'pilot_research'],
      },
    });

    expect(consentRes.statusCode).toBe(201);
    const consentBody = JSON.parse(consentRes.payload);
    expect(consentBody.success).toBe(true);
    expect(consentBody.version).toBe('v2.1');
  });

  it('POST /v1/checkins records daily activity idempotently and updates engine state', async () => {
    const pRes = await app.inject({
      method: 'POST',
      url: '/v1/participants',
      payload: { pseudonymousId: 'pseudo_checkin_001' },
    });
    const { participantId } = JSON.parse(pRes.payload);

    // Day 1 checkin
    const c1 = await app.inject({
      method: 'POST',
      url: '/v1/checkins',
      payload: {
        participantId,
        date: '2026-11-19',
        steps: 8250,
        minutesAsleep: 450,
        contextFlags: { mode: 'ramadan' },
      },
    });
    expect(c1.statusCode).toBe(200);
    const c1Body = JSON.parse(c1.payload);
    expect(c1Body.engineState).toBeDefined();
    expect(c1Body.engineState.lastCheckinDate).toBe('2026-11-19');

    // Update same day (idempotent upsert)
    const c1Update = await app.inject({
      method: 'POST',
      url: '/v1/checkins',
      payload: {
        participantId,
        date: '2026-11-19',
        steps: 9000,
        minutesAsleep: 480,
      },
    });
    expect(c1Update.statusCode).toBe(200);
    const checkinInDb = db.prepare('SELECT steps FROM checkins WHERE participant_id = ? AND date = ?').get(participantId, '2026-11-19') as any;
    expect(checkinInDb.steps).toBe(9000);
  });

  it('POST /v1/import/fitbit-csv handles batch imports idempotently', async () => {
    const pRes = await app.inject({
      method: 'POST',
      url: '/v1/participants',
      payload: { pseudonymousId: 'pseudo_import_001' },
    });
    const { participantId } = JSON.parse(pRes.payload);

    const batchRes = await app.inject({
      method: 'POST',
      url: '/v1/import/fitbit-csv',
      payload: {
        participantId,
        records: [
          { date: '2026-11-10', steps: 6000, minutesAsleep: 420 },
          { date: '2026-11-11', steps: 7500, minutesAsleep: 460 },
          { date: '2026-11-12', steps: 8100, minutesAsleep: 440 },
        ],
      },
    });

    expect(batchRes.statusCode).toBe(200);
    const body = JSON.parse(batchRes.payload);
    expect(body.importedCount).toBe(3);

    const count = db.prepare('SELECT COUNT(*) as count FROM checkins WHERE participant_id = ?').get(participantId) as any;
    expect(count.count).toBe(3);
  });

  it('GET /v1/export retrieves complete user records in clean JSON', async () => {
    const pRes = await app.inject({
      method: 'POST',
      url: '/v1/participants',
      payload: { pseudonymousId: 'pseudo_export_001', consentVersion: 'v1.0' },
    });
    const { participantId } = JSON.parse(pRes.payload);

    await app.inject({
      method: 'POST',
      url: '/v1/checkins',
      payload: { participantId, date: '2026-11-15', steps: 8400 },
    });

    const exportRes = await app.inject({
      method: 'GET',
      url: `/v1/export?participantId=${participantId}`,
    });

    expect(exportRes.statusCode).toBe(200);
    const exportBody = JSON.parse(exportRes.payload);
    expect(exportBody.participant.pseudonymousId).toBe('pseudo_export_001');
    expect(exportBody.consents.length).toBeGreaterThan(0);
    expect(exportBody.checkins.length).toBe(1);
    expect(exportBody.engineState).toBeDefined();
  });

  it('DELETE /v1/participants/:id hard-deletes participant and cascades all records', async () => {
    const pRes = await app.inject({
      method: 'POST',
      url: '/v1/participants',
      payload: { pseudonymousId: 'pseudo_delete_001', consentVersion: 'v1.0' },
    });
    const { participantId } = JSON.parse(pRes.payload);

    await app.inject({
      method: 'POST',
      url: '/v1/checkins',
      payload: { participantId, date: '2026-11-18', steps: 7200 },
    });

    // Verify records exist before delete
    expect(db.prepare('SELECT COUNT(*) as c FROM checkins WHERE participant_id = ?').get(participantId)).toEqual({ c: 1 });
    expect(db.prepare('SELECT COUNT(*) as c FROM consents WHERE participant_id = ?').get(participantId)).toEqual({ c: 1 });
    expect(db.prepare('SELECT COUNT(*) as c FROM engine_states WHERE participant_id = ?').get(participantId)).toEqual({ c: 1 });

    // Call hard delete
    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/v1/participants/${participantId}`,
    });
    expect(deleteRes.statusCode).toBe(200);

    // Verify cascade hard deletion
    expect(db.prepare('SELECT COUNT(*) as c FROM participants WHERE id = ?').get(participantId)).toEqual({ c: 0 });
    expect(db.prepare('SELECT COUNT(*) as c FROM checkins WHERE participant_id = ?').get(participantId)).toEqual({ c: 0 });
    expect(db.prepare('SELECT COUNT(*) as c FROM consents WHERE participant_id = ?').get(participantId)).toEqual({ c: 0 });
    expect(db.prepare('SELECT COUNT(*) as c FROM engine_states WHERE participant_id = ?').get(participantId)).toEqual({ c: 0 });
  });

  it('GET /v1/pilot/aggregate enforces k-anonymity (suppresses when n < 10)', async () => {
    // Initially db has 0 participants (< 10)
    const supRes = await app.inject({
      method: 'GET',
      url: '/v1/pilot/aggregate',
    });
    expect(supRes.statusCode).toBe(200);
    const supBody = JSON.parse(supRes.payload);
    expect(supBody.suppressed).toBe(true);
    expect(supBody.reason).toContain('below privacy threshold (n < 10)');

    // Now seed pilot data which contains Tariq, Sarah + 10 cohort members (n = 12 >= 10)
    const seeded = await buildApp({ dbPath: ':memory:', enableSeed: true });
    await seeded.app.ready();

    const aggRes = await seeded.app.inject({
      method: 'GET',
      url: '/v1/pilot/aggregate',
    });
    expect(aggRes.statusCode).toBe(200);
    const aggBody = JSON.parse(aggRes.payload);
    expect(aggBody.suppressed).toBe(false);
    expect(aggBody.cohortSize).toBeGreaterThanOrEqual(10);
    expect(aggBody.meanDailySteps).toBeGreaterThan(0);

    await seeded.app.close();
    seeded.db.close();
  });
});
