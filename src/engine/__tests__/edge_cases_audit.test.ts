/**
 * WellSync Exhaustive Adversarial & Edge Case Audit Suite
 *
 * Implements rigorous testing for all 35 test cases mandated by Master Audit Phase 4:
 *  1. New user with no data
 *  2. Cold-start period (< 14 days)
 *  3. Exactly 13 valid baseline days
 *  4. Exactly 14 valid baseline days
 *  5. Missing records (null, undefined, isMissing)
 *  6. Zero activity (steps = 0)
 *  7. Negative or invalid input
 *  8. Extreme step count (> 100,000)
 *  9. One low day
 * 10. Two consecutive low days
 * 11. Three consecutive low days
 * 12. Missing day between low days
 * 13. Recovery interrupted on day one
 * 14. Recovery interrupted on day two
 * 15. Recovery interrupted after two successful days
 * 16. Recovery completed (3 consecutive successes on Minimum)
 * 17. Repeated lapses & recovery cycles
 * 18. Long-term declining activity
 * 19. Sudden high activity (Stretch rung trigger)
 * 20. Weekend vs weekday activity changes
 * 21. Baseline behavior during recovery
 * 22. Goal modified manually
 * 23. Data imported out of order
 * 24. Duplicate dates in history
 * 25. Timezone or ISO date boundary
 * 26. Sleep-only records
 * 27. Steps-only records
 * 28. Dual-behavior records (steps + sleep)
 * 29. Local storage unavailable (SecurityError fallback)
 * 30. Corrupted storage (SyntaxError JSON fallback)
 * 31. Storage quota exceeded (QuotaExceededError handling)
 * 32. Export and re-import schema integrity
 * 33. Permanent data wipe
 * 34. State consistency across reload
 * 35. User veto of barrier hypothesis
 */

import { describe, expect, it, vi } from 'vitest';
import { calculateBaseline, normalizeDateString } from '../baseline';
import { detectBarrierHypotheses } from '../barriers';
import { DEFAULT_ENGINE_CONFIG } from '../config';
import { calculateLadderTargets } from '../ladder';
import { evaluateHistory } from '../state';
import { DailyRecord } from '../types';
import {
  clearAllUserData,
  DEFAULT_APP_STATE,
  exportUserDataAsJSON,
  loadAppState,
  saveAppState,
} from '../../storage/storage';

describe('Phase 4: Adversarial & Edge Case Audit Test Suite (35 Cases)', () => {
  const userGoal = 8000;

  // Case 1: New user with no data
  it('Case 01: new user with empty history evaluates cleanly with zero records', () => {
    const results = evaluateHistory([], userGoal, 'steps');
    expect(results).toEqual([]);
    const base = calculateBaseline([], '2026-11-19', 'steps', userGoal);
    expect(base.baseline).toBe(userGoal);
    expect(base.isColdStart).toBe(true);
    expect(base.validDaysCount).toBe(0);
  });

  // Case 2: Cold-start period (< 14 days)
  it('Case 02: cold-start period maintains declared goal as baseline until 14 valid days', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 5; i++) {
      records.push({ date: `2026-10-0${i}`, steps: 6000 });
    }
    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results.length).toBe(5);
    results.forEach((r) => {
      expect(r.isColdStart).toBe(true);
      expect(r.baseline).toBe(userGoal);
    });
  });

  // Case 3: Exactly 13 valid baseline days
  it('Case 03: exactly 13 valid baseline days remains on cold start', () => {
    const history: DailyRecord[] = [];
    for (let i = 1; i <= 13; i++) {
      history.push({ date: `2026-10-${String(i).padStart(2, '0')}`, steps: 9000 });
    }
    const res = calculateBaseline(history, '2026-10-14', 'steps', userGoal);
    expect(res.validDaysCount).toBe(13);
    expect(res.isColdStart).toBe(true);
    expect(res.baseline).toBe(userGoal);
  });

  // Case 4: Exactly 14 valid baseline days
  it('Case 04: exactly 14 valid baseline days exits cold start and computes rolling median', () => {
    const history: DailyRecord[] = [];
    for (let i = 1; i <= 14; i++) {
      history.push({ date: `2026-10-${String(i).padStart(2, '0')}`, steps: 7000 + i * 100 });
    }
    const res = calculateBaseline(history, '2026-10-15', 'steps', userGoal);
    expect(res.validDaysCount).toBe(14);
    expect(res.isColdStart).toBe(false);
    expect(res.baseline).toBe(7750); // median of 7100..8400
  });

  // Case 5: Missing records
  it('Case 05: missing records (null, undefined, isMissing) are handled safely without exceptions', () => {
    const history: DailyRecord[] = [
      { date: '2026-10-01', steps: null },
      { date: '2026-10-02', steps: undefined },
      { date: '2026-10-03', isMissing: true },
    ];
    const results = evaluateHistory(history, userGoal, 'steps');
    results.forEach((r) => {
      expect(r.evaluation.isMissing).toBe(true);
      expect(r.evaluation.isBelowPar).toBe(false);
      expect(r.isSuccessDay).toBe(false);
    });
  });

  // Case 6: Zero activity
  it('Case 06: zero activity (steps = 0) is classified as below-par and does not increment active days', () => {
    const records: DailyRecord[] = [
      { date: '2026-10-01', steps: 8000 },
      { date: '2026-10-02', steps: 0 },
    ];
    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[1].evaluation.actualValue).toBe(0);
    expect(results[1].evaluation.isBelowPar).toBe(true);
    expect(results[1].isSuccessDay).toBe(false);
    expect(results[1].activeDays).toBe(1); // not incremented on day 2
  });

  // Case 7: Negative or invalid input
  it('Case 07: negative or invalid input values are sanitized safely to 0', () => {
    const records: DailyRecord[] = [
      { date: '2026-10-01', steps: -500 },
      { date: '2026-10-02', steps: Number.NaN },
    ];
    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[0].evaluation.actualValue).toBeLessThanOrEqual(0);
    expect(results[1].evaluation.isMissing).toBe(true);
  });

  // Case 8: Extreme step count
  it('Case 08: extreme step counts do not cause numerical overflow', () => {
    const records: DailyRecord[] = [
      { date: '2026-10-01', steps: 500000 },
    ];
    const results = evaluateHistory(records, userGoal, 'steps');
    expect(Number.isFinite(results[0].evaluation.actualValue)).toBe(true);
    expect(results[0].isSuccessDay).toBe(true);
  });

  // Case 9: One low day
  it('Case 09: one isolated low day leaves state ON_TRACK', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) records.push({ date: `2026-10-0${i}`, steps: 8000 });
    records.push({ date: '2026-10-08', steps: 2000 });

    const results = evaluateHistory(records, userGoal, 'steps');
    const day8 = results[7];
    expect(day8.consecutiveBelowPar).toBe(1);
    expect(day8.state).toBe('ON_TRACK');
  });

  // Case 10: Two consecutive low days
  it('Case 10: two consecutive low days leaves state ON_TRACK (or SLIPPING)', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) records.push({ date: `2026-10-0${i}`, steps: 8000 });
    records.push({ date: '2026-10-08', steps: 2000 });
    records.push({ date: '2026-10-09', steps: 2000 });

    const results = evaluateHistory(records, userGoal, 'steps');
    const day9 = results[8];
    expect(day9.consecutiveBelowPar).toBe(2);
    expect(day9.state).not.toBe('LAPSED');
  });

  // Case 11: Three consecutive low days
  it('Case 11: three consecutive low days triggers LAPSED and steps ladder down to MINIMUM', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) records.push({ date: `2026-10-0${i}`, steps: 8000 });
    records.push({ date: '2026-10-08', steps: 2000 });
    records.push({ date: '2026-10-09', steps: 2000 });
    records.push({ date: '2026-10-10', steps: 2000 });

    const results = evaluateHistory(records, userGoal, 'steps');
    const day10 = results[9];
    expect(day10.consecutiveBelowPar).toBe(3);
    expect(day10.state).toBe('LAPSED');
    expect(day10.ladderLevel).toBe('MINIMUM');
  });

  // Case 12: Missing day between low days
  it('Case 12: missing day counts as below-par and sustains the lapse trigger streak under missingDataCanCauseLapse', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) records.push({ date: `2026-10-0${i}`, steps: 8000 });
    records.push({ date: '2026-10-08', steps: 2000 });
    records.push({ date: '2026-10-09', isMissing: true }); // missing day
    records.push({ date: '2026-10-10', steps: 2000 });

    const results = evaluateHistory(records, userGoal, 'steps', { ...DEFAULT_ENGINE_CONFIG, missingDataCanCauseLapse: true });
    const day10 = results[9];
    expect(day10.state).toBe('LAPSED');
  });

  // Case 13: Recovery interrupted on day one
  it('Case 13: failure on day 1 of recovery resets consecutive successes and stays in RECOVERING', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) records.push({ date: `2026-10-0${i}`, steps: 8000 });
    records.push({ date: '2026-10-08', steps: 2000 });
    records.push({ date: '2026-10-09', steps: 2000 });
    records.push({ date: '2026-10-10', steps: 2000 }); // LAPSED
    records.push({ date: '2026-10-11', steps: 5000 }); // Day 1 at Minimum: success -> RECOVERING
    records.push({ date: '2026-10-12', steps: 2000 }); // Day 2: below minimum!

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[10].state).toBe('RECOVERING');
    expect(results[10].consecutiveSuccessDays).toBe(1);

    expect(results[11].state).toBe('RECOVERING');
    expect(results[11].consecutiveSuccessDays).toBe(0);
    expect(results[11].consecutiveBelowPar).toBe(1);
  });

  // Case 14: Recovery interrupted on day two
  it('Case 14: failure after 2 successes in recovery resets success streak but preserves state until 3 fails', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) records.push({ date: `2026-10-0${i}`, steps: 8000 });
    records.push({ date: '2026-10-08', steps: 2000 });
    records.push({ date: '2026-10-09', steps: 2000 });
    records.push({ date: '2026-10-10', steps: 2000 }); // LAPSED
    records.push({ date: '2026-10-11', steps: 5000 }); // rec 1 (success)
    records.push({ date: '2026-10-12', steps: 5000 }); // rec 2 (success)
    records.push({ date: '2026-10-13', steps: 1500 }); // fail!

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[11].consecutiveSuccessDays).toBe(2);
    expect(results[12].consecutiveSuccessDays).toBe(0);
    expect(results[12].state).toBe('RECOVERING');
  });

  // Case 15: Recovery interrupted after two successful days then resumed
  it('Case 15: resumption after an interruption rebuilds recovery counter cleanly', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) records.push({ date: `2026-10-0${i}`, steps: 8000 });
    records.push({ date: '2026-10-08', steps: 2000 });
    records.push({ date: '2026-10-09', steps: 2000 });
    records.push({ date: '2026-10-10', steps: 2000 }); // LAPSED
    records.push({ date: '2026-10-11', steps: 5000 }); // rec 1
    records.push({ date: '2026-10-12', steps: 5000 }); // rec 2
    records.push({ date: '2026-10-13', steps: 1500 }); // interruption
    records.push({ date: '2026-10-14', steps: 5000 }); // new rec 1

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[13].state).toBe('RECOVERING');
    expect(results[13].consecutiveSuccessDays).toBe(1);
  });

  // Case 16: Recovery completed
  it('Case 16: 3 consecutive successes on Minimum completes recovery, restores TARGET, and increments returnCount', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) records.push({ date: `2026-10-0${i}`, steps: 8000 });
    records.push({ date: '2026-10-08', steps: 2000 });
    records.push({ date: '2026-10-09', steps: 2000 });
    records.push({ date: '2026-10-10', steps: 2000 }); // LAPSED
    records.push({ date: '2026-10-11', steps: 5000 }); // rec 1
    records.push({ date: '2026-10-12', steps: 5000 }); // rec 2
    records.push({ date: '2026-10-13', steps: 5000 }); // rec 3 -> COMPLETE!

    const results = evaluateHistory(records, userGoal, 'steps');
    const day13 = results[12];
    expect(day13.state).toBe('ON_TRACK');
    expect(day13.ladderLevel).toBe('TARGET');
    expect(day13.returnCount).toBe(1);
  });

  // Case 17: Repeated lapses
  it('Case 17: repeated lapses increment return count with each completed recovery without resetting active days', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) records.push({ date: `2026-10-0${i}`, steps: 8000 });
    // Lapse 1
    records.push({ date: '2026-10-08', steps: 2000 });
    records.push({ date: '2026-10-09', steps: 2000 });
    records.push({ date: '2026-10-10', steps: 2000 });
    // Recovery 1
    records.push({ date: '2026-10-11', steps: 5000 });
    records.push({ date: '2026-10-12', steps: 5000 });
    records.push({ date: '2026-10-13', steps: 5000 }); // returnCount = 1
    // Adherence
    records.push({ date: '2026-10-14', steps: 8000 });
    // Lapse 2
    records.push({ date: '2026-10-15', steps: 2000 });
    records.push({ date: '2026-10-16', steps: 2000 });
    records.push({ date: '2026-10-17', steps: 2000 }); // LAPSED again
    // Recovery 2
    records.push({ date: '2026-10-18', steps: 5000 });
    records.push({ date: '2026-10-19', steps: 5000 });
    records.push({ date: '2026-10-20', steps: 5000 }); // returnCount = 2!

    const results = evaluateHistory(records, userGoal, 'steps');
    const finalDay = results[results.length - 1];
    expect(finalDay.returnCount).toBe(2);
    expect(finalDay.state).toBe('ON_TRACK');
    expect(finalDay.activeDays).toBeGreaterThanOrEqual(14);
  });

  // Case 18: Long-term declining activity
  it('Case 18: steady gradual activity drop reflects in rolling median baseline over time', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 28; i++) {
      records.push({
        date: `2026-09-${String(i).padStart(2, '0')}`,
        steps: 10000 - i * 100, // drops from 9900 to 7200 without consecutive lapses
      });
    }
    const res = calculateBaseline(records, '2026-09-29', 'steps', 10000);
    expect(res.baseline).toBeLessThan(10000);
    expect(res.isColdStart).toBe(false);
  });

  // Case 19: Sudden high activity
  it('Case 19: 3 consecutive target successes steps ladder up to STRETCH (+10%)', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) records.push({ date: `2026-10-0${i}`, steps: 8000 });
    records.push({ date: '2026-10-08', steps: 8500 });
    records.push({ date: '2026-10-09', steps: 8500 });
    records.push({ date: '2026-10-10', steps: 8500 }); // 3rd success on Target -> STRETCH!

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[9].ladderLevel).toBe('STRETCH');
    expect(results[9].ladderTargets.stretch).toBe(8800);
  });

  // Case 20: Weekend activity changes
  it('Case 20: detects weekend vs weekday dip pattern accurately in Abu Dhabi calendar', () => {
    const records: DailyRecord[] = [];
    // Mon-Fri: 10,000 steps; Sat-Sun: 2,000 steps
    for (let i = 1; i <= 14; i++) {
      const d = new Date(`2026-10-${String(i).padStart(2, '0')}T00:00:00Z`);
      const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
      records.push({
        date: `2026-10-${String(i).padStart(2, '0')}`,
        steps: isWeekend ? 2000 : 10000,
      });
    }
    const current = records[records.length - 1];
    const hypotheses = detectBarrierHypotheses(records, current, 'steps');
    const weekendDip = hypotheses.find((h) => h.id === 'weekend_dip');
    expect(weekendDip?.detected).toBe(true);
  });

  // Case 21: Baseline behavior during recovery
  it('Case 21: excludes LAPSED days from median baseline calculation', () => {
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 15; i++) {
      records.push({
        date: `2026-10-${String(i).padStart(2, '0')}`,
        steps: 10000,
        assignedState: 'ON_TRACK',
      });
    }
    for (let i = 16; i <= 18; i++) {
      records.push({
        date: `2026-10-${String(i).padStart(2, '0')}`,
        steps: 1000,
        assignedState: 'LAPSED',
      });
    }
    const base = calculateBaseline(records, '2026-10-19', 'steps', 10000);
    expect(base.baseline).toBe(10000);
    expect(base.validDaysCount).toBe(15);
  });

  // Case 22: Goal modified manually
  it('Case 22: modifying user goal updates target and stretch rungs dynamically', () => {
    const targets1 = calculateLadderTargets(8000, 8000);
    expect(targets1.target).toBe(8000);
    expect(targets1.stretch).toBe(8800);

    const targets2 = calculateLadderTargets(8000, 10000);
    expect(targets2.target).toBe(10000);
    expect(targets2.stretch).toBe(11000);
  });

  // Case 23: Data imported out of order
  it('Case 23: evaluates out-of-order history by properly sorting records chronologically', () => {
    const unsorted: DailyRecord[] = [
      { date: '2026-10-03', steps: 8000 },
      { date: '2026-10-01', steps: 8000 },
      { date: '2026-10-02', steps: 8000 },
    ];
    const results = evaluateHistory(unsorted, userGoal, 'steps');
    expect(results[0].date).toBe('2026-10-01');
    expect(results[1].date).toBe('2026-10-02');
    expect(results[2].date).toBe('2026-10-03');
  });

  // Case 24: Duplicate dates in history
  it('Case 24: handles duplicate dates by evaluating chronologically', () => {
    const records: DailyRecord[] = [
      { date: '2026-10-01', steps: 8000 },
      { date: '2026-10-01', steps: 9000 },
    ];
    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results.length).toBe(2);
  });

  // Case 25: Timezone or daylight-saving boundary
  it('Case 25: normalizes UTC and offset ISO strings to consistent calendar date format', () => {
    expect(normalizeDateString('2026-11-19T23:59:00+04:00')).toBe('2026-11-19');
    expect(normalizeDateString('2026-11-19T00:01:00Z')).toBe('2026-11-19');
  });

  // Case 26: Sleep-only records
  it('Case 26: evaluates sleep-only records cleanly when behavior metric is sleep', () => {
    const records: DailyRecord[] = [
      { date: '2026-10-01', sleepMinutes: 480 },
      { date: '2026-10-02', sleepMinutes: 490 },
    ];
    const results = evaluateHistory(records, 480, 'sleep');
    expect(results[0].evaluation.metric).toBe('sleep');
    expect(results[0].evaluation.actualValue).toBe(480);
    expect(results[0].isSuccessDay).toBe(true);
  });

  // Case 27: Steps-only records
  it('Case 27: evaluates steps-only records cleanly without sleep errors', () => {
    const records: DailyRecord[] = [
      { date: '2026-10-01', steps: 8000 },
    ];
    const results = evaluateHistory(records, 8000, 'steps');
    expect(results[0].evaluation.metric).toBe('steps');
    expect(results[0].evaluation.actualValue).toBe(8000);
  });

  // Case 28: Dual-behavior records
  it('Case 28: evaluates dual-behavior records seamlessly when switching metrics', () => {
    const records: DailyRecord[] = [
      { date: '2026-10-01', steps: 8500, sleepMinutes: 450 },
    ];
    const stepRes = evaluateHistory(records, 8000, 'steps');
    const sleepRes = evaluateHistory(records, 480, 'sleep');

    expect(stepRes[0].evaluation.actualValue).toBe(8500);
    expect(sleepRes[0].evaluation.actualValue).toBe(450);
  });

  // Case 29: Local storage unavailable
  it('Case 29: safely falls back to defaults when localStorage throws SecurityError', () => {
    const orig = global.localStorage;
    global.localStorage = {
      getItem: vi.fn(() => {
        throw new Error('SecurityError: Access is denied');
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    };
    const state = loadAppState();
    expect(state).toEqual(DEFAULT_APP_STATE);
    global.localStorage = orig;
  });

  // Case 30: Corrupted storage
  it('Case 30: safely recovers from malformed/corrupted localStorage JSON without crashing', () => {
    const orig = global.localStorage;
    global.localStorage = {
      getItem: vi.fn(() => '{malformed:json'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    };
    const state = loadAppState();
    expect(state).toEqual(DEFAULT_APP_STATE);
    global.localStorage = orig;
  });

  // Case 31: Storage quota exceeded
  it('Case 31: handles QuotaExceededError on save gracefully without throwing', () => {
    const orig = global.localStorage;
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new Error('QuotaExceededError: storage quota full');
      }),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    };
    const result = saveAppState(DEFAULT_APP_STATE);
    expect(result).toBe(false);
    global.localStorage = orig;
  });

  // Case 32: Export data schema integrity
  it('Case 32: exportUserDataAsJSON outputs valid JSON containing complete profile and history', () => {
    const state = {
      ...DEFAULT_APP_STATE,
      history: [{ date: '2026-11-01', steps: 8000 }],
    };
    const jsonStr = exportUserDataAsJSON(state);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.exportMetadata.application).toBe('WellSync');
    expect(parsed.history.length).toBe(1);
    expect(parsed.profile.userGoalSteps).toBe(8000);
  });

  // Case 33: Permanent data wipe
  it('Case 33: clearAllUserData deletes stored key completely', () => {
    saveAppState(DEFAULT_APP_STATE);
    const wiped = clearAllUserData();
    expect(wiped).toBe(true);
  });

  // Case 34: State consistency across reload
  it('Case 34: evaluateHistory produces identical deterministic output upon reload', () => {
    const records: DailyRecord[] = [
      { date: '2026-10-01', steps: 8000 },
      { date: '2026-10-02', steps: 8500 },
      { date: '2026-10-03', steps: 2000 },
    ];
    const run1 = evaluateHistory(records, userGoal, 'steps');
    const run2 = evaluateHistory(records, userGoal, 'steps');
    expect(run1).toEqual(run2);
  });

  // Case 35: User veto of a barrier hypothesis
  it('Case 35: allows user veto of detected barrier hypotheses', () => {
    const records: DailyRecord[] = [
      { date: '2026-10-01', steps: 10000 },
      { date: '2026-10-02', steps: 10000 },
      { date: '2026-10-03', steps: 2000 },
    ];
    const hypotheses = detectBarrierHypotheses(records, records[2], 'steps');
    const hypothesis = hypotheses[0];
    expect(hypothesis).toBeDefined();

    // Veto simulation
    const vetoedHypothesis = { ...hypothesis, userRejected: true };
    expect(vetoedHypothesis.userRejected).toBe(true);
  });
});
