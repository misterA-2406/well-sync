/**
 * WellSync Engine: Property-Based Tests (fast-check) & Anti-Erosion Regression Suite
 *
 * Formal Verification of Core Behavioral Invariants:
 * 1. Cumulative Active Days Monotonicity: activeDays never decreases.
 * 2. Return Count Safety: returnCount only increments on RECOVERING -> ON_TRACK.
 * 3. Missing Data Safety: Unsynced/missing wearable data never creates a lapse.
 * 4. Decay Cap Invariant: Baseline never falls faster than the configured decay cap.
 * 5. Anti-Erosion Regression Tests: Proves baseline freeze on lapse/recovery and safety floor.
 */

import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { DEFAULT_ENGINE_CONFIG, EngineConfig } from '../config';
import { evaluateHistory } from '../state';
import { DailyRecord } from '../types';

describe('Property-Based Behavioral Invariants (fast-check)', () => {
  const userGoal = 8000;

  // Arbitrary generator for daily records
  const recordArbitrary = fc.record({
    date: fc.integer({ min: 1, max: 28 }).map(d => `2026-05-${String(d).padStart(2, '0')}`),
    steps: fc.option(fc.integer({ min: 0, max: 30000 }), { nil: null }),
    isMissing: fc.boolean(),
    isRestDeclared: fc.boolean(),
  });

  const recordListArbitrary = fc
    .array(recordArbitrary, { minLength: 1, maxLength: 40 })
    .map(records => {
      // Ensure unique sorted dates
      return records.map((r, idx) => ({
        ...r,
        date: `2026-01-${String(Math.floor(idx / 28) + 1).padStart(2, '0')}-${String((idx % 28) + 1).padStart(2, '0')}`,
      }));
    });

  // Property 1: Cumulative Active Days is strictly non-decreasing
  it('Property 1: cumulative active days never decreases regardless of disruptions or missing days', () => {
    fc.assert(
      fc.property(recordListArbitrary, records => {
        const results = evaluateHistory(records, userGoal, 'steps');
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i + 1].activeDays).toBeGreaterThanOrEqual(results[i].activeDays);
        }
      }),
      { numRuns: 100 }
    );
  });

  // Property 2: Return Count only increments on RECOVERING -> ON_TRACK
  it('Property 2: return count increments strictly on RECOVERING -> ON_TRACK transitions and is monotonic', () => {
    fc.assert(
      fc.property(recordListArbitrary, records => {
        const results = evaluateHistory(records, userGoal, 'steps');
        for (let i = 1; i < results.length; i++) {
          const prev = results[i - 1];
          const curr = results[i];

          // Monotonicity
          expect(curr.returnCount).toBeGreaterThanOrEqual(prev.returnCount);

          // Condition of increment
          if (curr.returnCount > prev.returnCount) {
            expect(prev.state).toBe('RECOVERING');
            expect(curr.state).toBe('ON_TRACK');
            expect(curr.returnCount).toBe(prev.returnCount + 1);
          } else if (prev.state !== 'RECOVERING' || curr.state !== 'ON_TRACK') {
            expect(curr.returnCount).toBe(prev.returnCount);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  // Property 3: Missing data never creates a lapse
  it('Property 3: missing wearable data never creates a lapse', () => {
    // Generate valid initial history that establishes ON_TRACK
    const validPreambleArbitrary = fc.integer({ min: 7, max: 20 }).map(count => {
      const list: DailyRecord[] = [];
      for (let i = 1; i <= count; i++) {
        list.push({
          date: `2026-02-${String(i).padStart(2, '0')}`,
          steps: 8000,
        });
      }
      return list;
    });

    // Generate consecutive missing days
    const missingSequenceArbitrary = fc.integer({ min: 1, max: 25 }).map(missingCount => {
      const list: DailyRecord[] = [];
      for (let i = 1; i <= missingCount; i++) {
        list.push({
          date: `2026-03-${String(i).padStart(2, '0')}`,
          steps: null,
          isMissing: true,
        });
      }
      return list;
    });

    fc.assert(
      fc.property(validPreambleArbitrary, missingSequenceArbitrary, (preamble, missingDays) => {
        const combined = [...preamble, ...missingDays];
        const results = evaluateHistory(combined, userGoal, 'steps');

        // Check that during the missing period, state is NEVER LAPSED
        for (let i = preamble.length; i < results.length; i++) {
          expect(results[i].state).not.toBe('LAPSED');
        }
      }),
      { numRuns: 50 }
    );
  });

  // Property 4: Baseline never falls faster than the decay cap
  it('Property 4: baseline decay is capped at config.maxDecayPerWeek', () => {
    const config: EngineConfig = {
      ...DEFAULT_ENGINE_CONFIG,
      maxDecayPerWeek: 0.05, // 5% max per week
    };

    fc.assert(
      fc.property(recordListArbitrary, records => {
        const results = evaluateHistory(records, userGoal, 'steps', config);
        for (let i = 1; i < results.length; i++) {
          const prev = results[i - 1];
          const curr = results[i];

          if (!prev.isColdStart && !curr.isColdStart && prev.baseline > 0) {
            // Maximum allowable drop per day is (0.05 / 7)
            const allowedFractionalDrop = (config.maxDecayPerWeek * 1) / 7;
            const minimumAllowed = Math.round(prev.baseline * (1 - allowedFractionalDrop)) - 2; // allowance for rounding
            expect(curr.baseline).toBeGreaterThanOrEqual(minimumAllowed);
          }
        }
      }),
      { numRuns: 50 }
    );
  });
});

describe('Baseline Anti-Erosion Regression Test Suite', () => {
  const userGoal = 8000;

  it('Regression 1: Freezes baseline during LAPSED and RECOVERING states to prevent normalizing low activity', () => {
    const records: DailyRecord[] = [];
    // 14 days of baseline at 8,000 steps
    for (let i = 1; i <= 14; i++) {
      records.push({ date: `2026-04-${String(i).padStart(2, '0')}`, steps: 8000 });
    }

    // 3 days of low activity (1,500 steps) -> triggers LAPSED
    records.push({ date: '2026-04-15', steps: 1500 });
    records.push({ date: '2026-04-16', steps: 1500 });
    records.push({ date: '2026-04-17', steps: 1500 }); // Day 17: LAPSED

    const resultsLapse = evaluateHistory(records, userGoal, 'steps');
    const lapsedDay = resultsLapse[16];
    expect(lapsedDay.state).toBe('LAPSED');
    expect(lapsedDay.baseline).toBe(8000);

    // 10 more days of low activity while LAPSED (1,000 steps)
    for (let i = 18; i <= 27; i++) {
      records.push({ date: `2026-04-${String(i).padStart(2, '0')}`, steps: 1000 });
    }

    const resultsLongLapse = evaluateHistory(records, userGoal, 'steps');
    const day18 = resultsLongLapse[17];
    expect(day18.state).toBe('LAPSED');
    expect(day18.baseline).toBe(8000);
    expect(day18.isBaselineFrozen).toBe(true);

    const day27 = resultsLongLapse[26];
    expect(day27.state).toBe('LAPSED');
    // Baseline MUST NOT erode down to 1000! It remains locked at 8000.
    expect(day27.baseline).toBe(8000);
    expect(day27.isBaselineFrozen).toBe(true);

    // Now user begins recovery by meeting the 50% Minimum rung (4,000 steps)
    records.push({ date: '2026-04-28', steps: 4000 }); // Day 1 RECOVERING
    records.push({ date: '2026-04-29', steps: 4000 }); // Day 2 RECOVERING
    records.push({ date: '2026-04-30', steps: 4000 }); // Day 3 RECOVERING -> returns to ON_TRACK

    const resultsRecovery = evaluateHistory(records, userGoal, 'steps');
    const recoveryDay1 = resultsRecovery[27];
    expect(recoveryDay1.state).toBe('RECOVERING');
    expect(recoveryDay1.baseline).toBe(8000); // Still frozen!
    expect(recoveryDay1.isBaselineFrozen).toBe(true);

    const onTrackDay = resultsRecovery[29];
    expect(onTrackDay.state).toBe('ON_TRACK');
    expect(onTrackDay.returnCount).toBe(1);
    // Baseline did not collapse to 1000 or 4000!
    expect(onTrackDay.baseline).toBeGreaterThanOrEqual(7000);
  });

  it('Regression 2: Long-term anchor (56-day) preserves habit standard after prolonged disruption', () => {
    const records: DailyRecord[] = [];
    // 56 days of high active habit (9,000 steps)
    for (let i = 1; i <= 56; i++) {
      const month = i <= 28 ? '01' : '02';
      const day = i <= 28 ? i : i - 28;
      records.push({
        date: `2026-${month}-${String(day).padStart(2, '0')}`,
        steps: 9000,
      });
    }

    // Now 14 days of quieter but not lapsed activity (6,000 steps)
    for (let i = 1; i <= 14; i++) {
      records.push({
        date: `2026-03-${String(i).padStart(2, '0')}`,
        steps: 6000,
      });
    }

    const results = evaluateHistory(records, userGoal, 'steps');
    const finalDay = results[results.length - 1];

    // The short-term median of 6,000 steps is bounded from collapsing by the 56-day anchor:
    // Anchor ~ 9000 * 0.85 = 7650
    expect(finalDay.baseline).toBeGreaterThanOrEqual(7500);
  });

  it('Regression 3: Absolute safety floor prevents baseline from falling below 3,000 steps', () => {
    const config: EngineConfig = {
      ...DEFAULT_ENGINE_CONFIG,
      stepBaselineSafetyFloor: 3000,
      maxDecayPerWeek: 0.50, // allow rapid decay for test
    };

    const records: DailyRecord[] = [];
    // 20 days of low activity (1,500 steps) with cold start ended
    for (let i = 1; i <= 20; i++) {
      records.push({
        date: `2026-06-${String(i).padStart(2, '0')}`,
        steps: 1500,
      });
    }

    const results = evaluateHistory(records, userGoal, 'steps', config);
    for (const r of results) {
      if (!r.isColdStart) {
        expect(r.baseline).toBeGreaterThanOrEqual(3000);
      }
    }
  });
});
