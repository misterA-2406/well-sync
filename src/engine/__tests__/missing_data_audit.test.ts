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
    const resMissing = evaluateHistory(missingHistory, userGoal, 'steps');
    // Current Rule: missing days count as below-par and trigger LAPSED
    expect(resMissing[16].state).toBe('LAPSED');
    expect(resMissing[16].evaluation.isMissing).toBe(true);
    expect(resMissing[16].ladderLevel).toBe('MINIMUM');

    // Scenario C: Isolated missing day followed by adherence does NOT lapse
    const isolatedMissingHistory: DailyRecord[] = [
      ...baseRecords,
      { date: '2026-10-15', isMissing: true },
      { date: '2026-10-16', steps: 8500 },
      { date: '2026-10-17', isMissing: true },
    ];
    const resIsolated = evaluateHistory(isolatedMissingHistory, userGoal, 'steps');
    expect(resIsolated[15].state).toBe('ON_TRACK');
    expect(resIsolated[16].state).toBe('SLIPPING'); // 7-day mean drops < 80% due to two zero days
    expect(resIsolated[16].consecutiveBelowPar).toBe(1); // but NOT lapsed (needs 3 consecutive)
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
