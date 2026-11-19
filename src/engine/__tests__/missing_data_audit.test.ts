/**
 * Missing Data Treatment & Sensitivity Audit
 *
 * Evaluates the impact of missing-data classifications:
 * 1. Missing/Unsynced Data (device unrecorded)
 * 2. Recorded Zero Activity (device worn, 0 steps)
 * 3. Recorded Low Activity (device worn, 1 - 59% baseline)
 * 4. Declared Rest / Sick Days (user explicitly flagged planned rest)
 */

import { describe, expect, it } from 'vitest';
import { calculateBaseline } from '../baseline';
import { DEFAULT_ENGINE_CONFIG } from '../config';
import { evaluateHistory } from '../state';
import { DailyRecord } from '../types';

describe('Missing Data Treatment & Comparative Analysis', () => {
  const userGoal = 8000;

  it('quantifies the effect of consecutive missing days on lapse triggers under current engine rules', () => {
    // 14 baseline days at 8000
    const baseRecords: DailyRecord[] = [];
    for (let i = 1; i <= 14; i++) {
      baseRecords.push({ date: `2026-10-${String(i).padStart(2, '0')}`, steps: 8000 });
    }

    // Scenario A: 3 days of recorded low steps (2,000 steps)
    const lowStepsHistory: DailyRecord[] = [
      ...baseRecords,
      { date: '2026-10-15', steps: 2000 },
      { date: '2026-10-16', steps: 2000 },
      { date: '2026-10-17', steps: 2000 },
    ];
    const resLow = evaluateHistory(lowStepsHistory, userGoal, 'steps');
    expect(resLow[16].state).toBe('LAPSED');
    expect(resLow[16].consecutiveBelowPar).toBe(3);

    // Scenario B: 3 days of missing wearable data (null steps / isMissing)
    const missingHistory: DailyRecord[] = [
      ...baseRecords,
      { date: '2026-10-15', isMissing: true },
      { date: '2026-10-16', isMissing: true },
      { date: '2026-10-17', isMissing: true },
    ];
    // Default Anti-Erosion Rule: missing days do NOT create false lapses!
    const resSafe = evaluateHistory(missingHistory, userGoal, 'steps');
    expect(resSafe[16].state).toBe('ON_TRACK');
    expect(resSafe[16].evaluation.isMissing).toBe(true);

    // Legacy Comparison: with missingDataCanCauseLapse = true, missing days counted as below-par
    const resLegacy = evaluateHistory(missingHistory, userGoal, 'steps', { ...DEFAULT_ENGINE_CONFIG, missingDataCanCauseLapse: true });
    expect(resLegacy[16].state).toBe('LAPSED');
    expect(resLegacy[16].evaluation.isMissing).toBe(true);
    expect(resLegacy[16].ladderLevel).toBe('MINIMUM');

    // Scenario C: Isolated missing day followed by adherence does NOT lapse
    const isolatedMissingHistory: DailyRecord[] = [
      ...baseRecords,
      { date: '2026-10-15', isMissing: true },
      { date: '2026-10-16', steps: 8500 },
      { date: '2026-10-17', isMissing: true },
    ];
    const resIsolated = evaluateHistory(isolatedMissingHistory, userGoal, 'steps');
    expect(resIsolated[15].state).toBe('ON_TRACK');
    expect(resIsolated[16].state).toBe('ON_TRACK'); // Isolated missing days do not degrade state
  });

  it('verifies baseline contamination protection: missing days are excluded from rolling median baseline', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 20; i++) {
      records.push({ date: `2026-10-${String(i).padStart(2, '0')}`, steps: 8000 });
    }
    // 5 missing days
    for (let i = 21; i <= 25; i++) {
      records.push({ date: `2026-10-${String(i).padStart(2, '0')}`, isMissing: true });
    }

    const baselineRes = calculateBaseline(records, '2026-10-26', 'steps', userGoal);
    expect(baselineRes.validDaysCount).toBe(20);
    expect(baselineRes.baseline).toBe(8000);
    // Missing days never pull down baseline median!
    expect(baselineRes.windowValues.includes(0)).toBe(false);
  });

  it('distinguishes between recorded zero activity (non-wear vs sedentary) and missing data flags', () => {
    const records: DailyRecord[] = [
      { date: '2026-10-01', steps: 8000 },
      { date: '2026-10-02', steps: 0, isMissing: false }, // explicit 0 recorded
      { date: '2026-10-03', steps: null, isMissing: true }, // missing/unsynced
    ];
    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[1].evaluation.isMissing).toBe(false);
    expect(results[1].evaluation.actualValue).toBe(0);
    expect(results[2].evaluation.isMissing).toBe(true);
  });
});
