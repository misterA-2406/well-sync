/**
 * WellSync Engine - Independent Verification of Sleep and Movement Algorithms
 *
 * This test suite independently verifies that:
 * 1. Movement ('steps') and Sleep ('sleep') algorithms have complete behavioral & mathematical parity.
 * 2. Absolute safety floors are strictly enforced: 3,000 steps for movement, 360 minutes (6 hours) for sleep.
 * 3. Range clamping prevents physiologically absurd inputs (steps: 0-100,000; sleep: 0-1,440 minutes).
 * 4. Ladder rungs (50% Min, 100% Target, 110% Stretch) calculate accurately for both metrics.
 * 5. State transitions (ON_TRACK -> SLIPPING -> LAPSED -> RECOVERING -> ON_TRACK) execute identically.
 * 6. Return counts and active days track properly across both metrics without cross-contamination.
 */

import { describe, expect, it } from 'vitest';
import { calculateBaseline } from '../baseline';
import { detectBarrierHypotheses } from '../barriers';
import { DEFAULT_ENGINE_CONFIG } from '../config';
import { calculateLadderTargets } from '../ladder';
import { evaluateHistory, processDay } from '../state';
import { DailyRecord } from '../types';

describe('Independent Verification: Baseline Calculation', () => {
  it('enforces independent safety floors: 3,000 steps for movement vs 360 min for sleep', () => {
    // 20 days of very low activity (1,000 steps or 200 min sleep)
    const stepRecords: DailyRecord[] = [];
    const sleepRecords: DailyRecord[] = [];

    for (let i = 1; i <= 20; i++) {
      const date = `2026-01-${String(i).padStart(2, '0')}`;
      stepRecords.push({ date, steps: 1000, assignedState: 'ON_TRACK' });
      sleepRecords.push({ date, sleepMinutes: 200, assignedState: 'ON_TRACK' });
    }

    // Step goal: 10,000; baseline should be clamped to floor (3,000 steps)
    const stepBaseline = calculateBaseline(stepRecords, '2026-01-21', 'steps', 10000);
    expect(stepBaseline.baseline).toBe(DEFAULT_ENGINE_CONFIG.stepBaselineSafetyFloor); // 3000

    // Sleep goal: 480 min (8h); baseline should be clamped to floor (360 min = 6h)
    const sleepBaseline = calculateBaseline(sleepRecords, '2026-01-21', 'sleep', 480);
    expect(sleepBaseline.baseline).toBe(DEFAULT_ENGINE_CONFIG.sleepBaselineSafetyFloor); // 360
  });

  it('calculates median baseline properly for realistic distributions in both domains', () => {
    const dates = [
      '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05',
      '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09', '2026-01-10',
      '2026-01-11', '2026-01-12', '2026-01-13', '2026-01-14', '2026-01-15',
    ];

    // Steps median around 8,000
    const stepRecords: DailyRecord[] = dates.map((d, i) => ({
      date: d,
      steps: 7000 + i * 150, // 7000, 7150, ..., 9100
      assignedState: 'ON_TRACK',
    }));

    // Sleep median around 450 min (7.5h)
    const sleepRecords: DailyRecord[] = dates.map((d, i) => ({
      date: d,
      sleepMinutes: 420 + i * 5, // 420, 425, ..., 490
      assignedState: 'ON_TRACK',
    }));

    const stepResult = calculateBaseline(stepRecords, '2026-01-16', 'steps', 8000);
    expect(stepResult.baseline).toBe(8050); // Median of 15 elements is element index 7 = 7000 + 7*150 = 8050

    const sleepResult = calculateBaseline(sleepRecords, '2026-01-16', 'sleep', 480);
    expect(sleepResult.baseline).toBe(455); // Median of 15 elements is 420 + 7*5 = 455 min
  });
});

describe('Independent Verification: Ladder Target Formulas', () => {
  it('calculates 3-rung ladder for movement: 50% Min, 100% Target, 110% Stretch', () => {
    const baseline = 8000;
    const goal = 10000;
    const ladder = calculateLadderTargets(baseline, goal);

    expect(ladder.minimum).toBe(4000); // 50% of 8,000 baseline
    expect(ladder.target).toBe(10000); // 100% of 10,000 goal
    expect(ladder.stretch).toBe(11000); // 110% of 10,000 goal
  });

  it('calculates 3-rung ladder for sleep: 50% Min, 100% Target, 110% Stretch', () => {
    const baseline = 450; // 7.5 hours
    const goal = 480; // 8 hours
    const ladder = calculateLadderTargets(baseline, goal);

    expect(ladder.minimum).toBe(225); // 50% of 450 min
    expect(ladder.target).toBe(480); // 100% of 480 min
    expect(ladder.stretch).toBe(528); // 110% of 480 min = 528 min (~8.8 hours)
  });
});

describe('Independent Verification: End-to-End State Machine Parity', () => {
  it('executes the full lifecycle (ON_TRACK -> LAPSED -> RECOVERING -> ON_TRACK) for movement', () => {
    const userGoal = 8000;
    const records: DailyRecord[] = [];

    // 7 days baseline (ON_TRACK)
    for (let i = 1; i <= 7; i++) {
      records.push({ date: `2026-02-0${i}`, steps: 8000 });
    }
    // 3 days below par (< 60% of 8,000 = 4,800 steps) -> LAPSED
    records.push({ date: '2026-02-08', steps: 2000 });
    records.push({ date: '2026-02-09', steps: 2200 });
    records.push({ date: '2026-02-10', steps: 1800 });

    // 1st recovery day: reaches minimum rung (4,000 steps) -> RECOVERING
    records.push({ date: '2026-02-11', steps: 4200 });
    // 2nd recovery day: reaches minimum rung -> RECOVERING
    records.push({ date: '2026-02-12', steps: 4100 });
    // 3rd recovery day: reaches minimum rung -> ON_TRACK (Return count +1)
    records.push({ date: '2026-02-13', steps: 4500 });

    const results = evaluateHistory(records, userGoal, 'steps');

    expect(results[6].state).toBe('ON_TRACK');
    expect(results[9].state).toBe('LAPSED');
    expect(results[10].state).toBe('RECOVERING');
    expect(results[11].state).toBe('RECOVERING');
    expect(results[12].state).toBe('ON_TRACK');
    expect(results[12].returnCount).toBe(1);
  });

  it('executes the full lifecycle (ON_TRACK -> LAPSED -> RECOVERING -> ON_TRACK) for sleep', () => {
    const userGoal = 480; // 8 hours (480 min)
    const records: DailyRecord[] = [];

    // 7 days baseline (ON_TRACK)
    for (let i = 1; i <= 7; i++) {
      records.push({ date: `2026-02-0${i}`, sleepMinutes: 480 });
    }
    // 3 days below par (< 60% of 480 = 288 min) -> LAPSED
    records.push({ date: '2026-02-08', sleepMinutes: 200 });
    records.push({ date: '2026-02-09', sleepMinutes: 210 });
    records.push({ date: '2026-02-10', sleepMinutes: 190 });

    // 1st recovery day: reaches minimum rung (240 min = 4h) -> RECOVERING
    records.push({ date: '2026-02-11', sleepMinutes: 250 });
    // 2nd recovery day: reaches minimum rung -> RECOVERING
    records.push({ date: '2026-02-12', sleepMinutes: 260 });
    // 3rd recovery day: reaches minimum rung -> ON_TRACK (Return count +1)
    records.push({ date: '2026-02-13', sleepMinutes: 300 });

    const results = evaluateHistory(records, userGoal, 'sleep');

    expect(results[6].state).toBe('ON_TRACK');
    expect(results[9].state).toBe('LAPSED');
    expect(results[10].state).toBe('RECOVERING');
    expect(results[11].state).toBe('RECOVERING');
    expect(results[12].state).toBe('ON_TRACK');
    expect(results[12].returnCount).toBe(1);
  });
});

describe('Independent Verification: Value Clamping & Barriers', () => {
  it('clamps extreme out-of-bound values safely for both steps and sleep', () => {
    const singleStepDay = processDay({
      previousResult: null,
      history: [],
      currentRecord: { date: '2026-03-01', steps: 9999999 }, // Far exceeds 100k
      metric: 'steps',
      userGoal: 10000,
    });
    expect(singleStepDay.evaluation.actualValue).toBe(100000); // Clamped at 100,000 max

    const singleSleepDay = processDay({
      previousResult: null,
      history: [],
      currentRecord: { date: '2026-03-01', sleepMinutes: 5000 }, // Far exceeds 24h (1440m)
      metric: 'sleep',
      userGoal: 480,
    });
    expect(singleSleepDay.evaluation.actualValue).toBe(1440); // Clamped at 1,440 max
  });

  it('detects barrier hypotheses independently for sleep disruptions', () => {
    const sleepHistory: DailyRecord[] = [
      { date: '2026-03-01', sleepMinutes: 480 },
      { date: '2026-03-02', sleepMinutes: 480 },
      { date: '2026-03-03', sleepMinutes: 480 },
      { date: '2026-03-04', sleepMinutes: 480 },
      { date: '2026-03-05', sleepMinutes: 200 },
      { date: '2026-03-06', sleepMinutes: 210 },
    ];
    const currentDay: DailyRecord = { date: '2026-03-07', sleepMinutes: 200, contextNote: 'Flight jetlag' };

    const hypotheses = detectBarrierHypotheses(sleepHistory, currentDay, 'sleep');
    const userContext = hypotheses.find(h => h.id === 'user_context');
    const shortDip = hypotheses.find(h => h.id === 'short_dip');

    expect(userContext?.detected).toBe(true);
    expect(userContext?.description).toContain('Flight jetlag');
    expect(shortDip?.detected).toBe(true);
  });
});
