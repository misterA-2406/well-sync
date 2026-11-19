/**
 * WellSync Pilot Sync Service
 *
 * Privacy-first optional pilot study telemetry sync:
 * - Local-first default: app runs with 100% functionality when disconnected.
 * - Zero PII: sends strictly pseudonymous ID and numerical sensor telemetry.
 * - Offline retry queue: failures stay in the queue without interrupting UX.
 */

export interface PilotSyncState {
  enabled: boolean;
  pseudonymousId: string;
  serverUrl: string;
  lastSyncedAt?: string;
  queue: Array<{
    date: string;
    steps: number;
    minutesAsleep?: number;
    contextFlags?: Record<string, any>;
  }>;
}

export const DEFAULT_PILOT_SYNC_STATE: PilotSyncState = {
  enabled: false,
  pseudonymousId: `ws_pilot_${Math.random().toString(36).substring(2, 10)}`,
  serverUrl: 'http://localhost:3001',
  queue: [],
};

const SYNC_STORAGE_KEY = 'wellsync_pilot_sync_v1';

export function loadPilotSyncState(): PilotSyncState {
  try {
    const raw = localStorage.getItem(SYNC_STORAGE_KEY);
    if (!raw) return DEFAULT_PILOT_SYNC_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PILOT_SYNC_STATE,
      ...parsed,
    };
  } catch {
    return DEFAULT_PILOT_SYNC_STATE;
  }
}

export function savePilotSyncState(state: PilotSyncState): void {
  try {
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[PilotSync] Failed to persist sync state:', err);
  }
}

export async function flushPilotSyncQueue(state: PilotSyncState): Promise<{
  synced: number;
  remaining: number;
  success: boolean;
  error?: string;
}> {
  if (!state.enabled || state.queue.length === 0) {
    return { synced: 0, remaining: state.queue.length, success: true };
  }

  try {
    // 1. Ensure participant exists on server
    const initRes = await fetch(`${state.serverUrl}/v1/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pseudonymousId: state.pseudonymousId,
        consentVersion: 'v2026.1_pilot',
      }),
    });

    if (!initRes.ok) {
      throw new Error(`Participant registration error: ${initRes.status}`);
    }

    const { participantId } = await initRes.json();

    // 2. Batch import pending records
    const importRes = await fetch(`${state.serverUrl}/v1/import/fitbit-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantId,
        records: state.queue,
      }),
    });

    if (!importRes.ok) {
      throw new Error(`Batch telemetry sync failed: ${importRes.status}`);
    }

    const syncedCount = state.queue.length;
    const updatedState: PilotSyncState = {
      ...state,
      queue: [],
      lastSyncedAt: new Date().toISOString(),
    };
    savePilotSyncState(updatedState);

    return { synced: syncedCount, remaining: 0, success: true };
  } catch (err: any) {
    console.warn('[PilotSync] Sync offline or unreachable, telemetry remains queued locally:', err?.message);
    return {
      synced: 0,
      remaining: state.queue.length,
      success: false,
      error: err?.message || 'Server offline',
    };
  }
}

export function queueCheckinForPilotSync(checkin: {
  date: string;
  steps: number;
  minutesAsleep?: number;
  contextFlags?: Record<string, any>;
}): void {
  const current = loadPilotSyncState();
  if (!current.enabled) return;

  // Deduplicate by date
  const filtered = current.queue.filter((q) => q.date !== checkin.date);
  filtered.push(checkin);

  const updated: PilotSyncState = {
    ...current,
    queue: filtered,
  };
  savePilotSyncState(updated);
}
