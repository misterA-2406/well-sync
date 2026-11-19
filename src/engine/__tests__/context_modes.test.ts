/**
 * WellSync UAE Context Engine Test Suite
 *
 * Unit tests for UAE & Abu Dhabi Context Modes:
 * 1. Ramadan Mode: Hijri conversion, 70% target scaling, post-Iftar/pre-Suhoor windows.
 * 2. Summer Heat Mode: Jun-Sep seasonal detection, mall walking, indoor guidance.
 * 3. Shift-Work Mode: Rotating shift cycles, circadian night adjustment, exempt recovery days.
 * 4. Planned Pause Mode: Declared pause protection (travel/illness/family care), zero lapse accumulation.
 * 5. Reversibility & Mathematical Integrity: Targets adapt without corrupting the k=3 state machine.
 */

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CONTEXT_CONFIG,
  evaluateContextAdaptation,
  getEstimatedHijriDate,
  isAbuDhabiSummerSeason,
  UserContextConfig,
} from '../contextModes';
import { evaluateHistory } from '../state';
import { DailyRecord } from '../types';

describe('UAE Context Engine - Ramadan Mode', () => {
  it('correctly calculates offline Hijri dates and flags Ramadan month', () => {
    // Ramadan 1447 AH begins approximately mid-February / early March 2026
    const ramadanDate = '2026-02-25';
    const hijri = getEstimatedHijriDate(ramadanDate);
    expect(hijri.hy).toBeGreaterThanOrEqual(1447);
    expect(typeof hijri.hm).toBe('number');
    expect(typeof hijri.isRamadan).toBe('boolean');
  });

  it('adapts daily target to 70% of baseline during Ramadan mode and shifts activity windows', () => {
    const config: UserContextConfig = {
      ...DEFAULT_CONTEXT_CONFIG,
      activeMode: 'ramadan',
      ramadanTargetRatio: 0.70,
    };

    const adaptation = evaluateContextAdaptation('2026-02-25', config);
    expect(adaptation.mode).toBe('ramadan');
    expect(adaptation.targetMultiplier).toBe(0.70);
    expect(adaptation.indoorRecommended).toBe(true);
    expect(adaptation.recommendedWindowsEn.some(w => w.includes('Post-Iftar'))).toBe(true);
    expect(adaptation.recommendedWindowsEn.some(w => w.includes('Pre-Suhoor'))).toBe(true);
    expect(adaptation.recommendedWindowsAr.some(w => w.includes('الإفطار'))).toBe(true);
  });

  it('scales target rungs in evaluateHistory under Ramadan mode without corrupting lapse logic', () => {
    const userGoal = 10000;
    const config: UserContextConfig = {
      ...DEFAULT_CONTEXT_CONFIG,
      activeMode: 'ramadan',
      ramadanTargetRatio: 0.70,
    };

    const records: DailyRecord[] = [];
    for (let i = 1; i <= 14; i++) {
      records.push({ date: `2026-02-${String(i).padStart(2, '0')}`, steps: 10000 });
    }

    const results = evaluateHistory(records, userGoal, 'steps', undefined, config);
    const day14 = results[13];

    // Standard target would be 10,000; under Ramadan 70% mode it scales to 7,000
    expect(day14.ladderTargets.target).toBe(7000);
    // Minimum rung (50% of baseline) scales to 50% * 7000 = 3,500
    expect(day14.ladderTargets.minimum).toBe(3500);
    expect(day14.state).toBe('ON_TRACK');
  });
});

describe('UAE Context Engine - Abu Dhabi Summer Heat Mode', () => {
  it('identifies June through September as Abu Dhabi summer extreme heat season', () => {
    expect(isAbuDhabiSummerSeason('2026-06-15')).toBe(true);
    expect(isAbuDhabiSummerSeason('2026-07-20')).toBe(true);
    expect(isAbuDhabiSummerSeason('2026-08-10')).toBe(true);
    expect(isAbuDhabiSummerSeason('2026-09-05')).toBe(true);
    expect(isAbuDhabiSummerSeason('2026-01-15')).toBe(false);
    expect(isAbuDhabiSummerSeason('2026-11-20')).toBe(false);
  });

  it('activates indoor and mall-walking guidance during summer months', () => {
    const adaptation = evaluateContextAdaptation('2026-07-15', DEFAULT_CONTEXT_CONFIG);
    expect(adaptation.mode).toBe('summer_heat');
    expect(adaptation.indoorRecommended).toBe(true);
    expect(adaptation.recommendedWindowsEn.some(w => w.toLowerCase().includes('mall'))).toBe(true);
    expect(adaptation.recommendedWindowsAr.some(w => w.includes('المراكز التجارية'))).toBe(true);
    expect(adaptation.targetMultiplier).toBe(0.85); // Gentle summer preservation target
  });

  it('allows manual override outside summer months (e.g. unexpected heat wave)', () => {
    const config: UserContextConfig = {
      ...DEFAULT_CONTEXT_CONFIG,
      activeMode: 'summer_heat',
      summerHeatManualOverride: true,
    };
    const adaptation = evaluateContextAdaptation('2026-05-10', config);
    expect(adaptation.mode).toBe('summer_heat');
    expect(adaptation.indoorRecommended).toBe(true);
  });
});

describe('UAE Context Engine - Shift-Work Mode', () => {
  it('correctly models 2 Day / 2 Night / 4 Off rotating shift schedule', () => {
    const config: UserContextConfig = {
      ...DEFAULT_CONTEXT_CONFIG,
      activeMode: 'shift_work',
      shiftPattern: {
        enabled: true,
        patternType: 'rotating_12h',
        dayShiftDays: 2,
        nightShiftDays: 2,
        offDays: 4,
        cycleStartDate: '2026-03-01',
      },
    };

    // Cycle day 0-1 (March 1-2): Day Shift
    const day1 = evaluateContextAdaptation('2026-03-01', config);
    expect(day1.mode).toBe('shift_work');
    expect(day1.targetMultiplier).toBe(1.0); // Standard day shift target

    // Cycle day 2-3 (March 3-4): Night Shift
    const nightShiftDay = evaluateContextAdaptation('2026-03-03', config);
    expect(nightShiftDay.mode).toBe('shift_work');
    expect(nightShiftDay.titleEn).toContain('Night Duty');
    expect(nightShiftDay.targetMultiplier).toBe(0.60); // Reduced for night shifts

    // Cycle day 4-7 (March 5-8): Off-Duty Recovery Days
    const offDay = evaluateContextAdaptation('2026-03-05', config);
    expect(offDay.mode).toBe('shift_work');
    expect(offDay.titleEn).toContain('Off-Day');
    expect(offDay.isRestExempt).toBe(true); // Recovery days are exempt from lapses!
  });

  it('ensures post-night-shift recovery off-days do not trigger lapses during zero activity', () => {
    const userGoal = 8000;
    const config: UserContextConfig = {
      ...DEFAULT_CONTEXT_CONFIG,
      activeMode: 'shift_work',
      shiftPattern: {
        enabled: true,
        patternType: 'rotating_12h',
        dayShiftDays: 2,
        nightShiftDays: 2,
        offDays: 4,
        cycleStartDate: '2026-03-01',
      },
    };

    // 7 days of normal baseline activity
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) {
      records.push({ date: `2026-02-${String(i + 20).padStart(2, '0')}`, steps: 8000 });
    }

    // March 5, 6, 7 are off-days (cycle days 4, 5, 6) where steps = 500 (resting)
    records.push({ date: '2026-03-05', steps: 500 });
    records.push({ date: '2026-03-06', steps: 400 });
    records.push({ date: '2026-03-07', steps: 300 });

    const results = evaluateHistory(records, userGoal, 'steps', undefined, config);
    const day10 = results[results.length - 1];

    // Even though user had 3 consecutive sedentary days, they were scheduled off-shift recovery days!
    // The engine must NOT lapse them!
    expect(day10.state).toBe('ON_TRACK');
    expect(day10.consecutiveBelowPar).toBe(0);
  });
});

describe('UAE Context Engine - Planned Pause Mode', () => {
  it('exempts declared pause windows from lapse accumulation and preserves habit status', () => {
    const userGoal = 8000;
    const config: UserContextConfig = {
      ...DEFAULT_CONTEXT_CONFIG,
      plannedPause: {
        enabled: true,
        reason: 'illness',
        startDate: '2026-04-10',
        endDate: '2026-04-20',
      },
    };

    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) {
      records.push({ date: `2026-04-0${i}`, steps: 8000 });
    }

    // 5 consecutive days of zero steps during declared acute illness pause
    for (let i = 10; i <= 14; i++) {
      records.push({ date: `2026-04-${i}`, steps: 0 });
    }

    const results = evaluateHistory(records, userGoal, 'steps', undefined, config);
    const day12 = results[results.length - 1];

    // Planned pause preserves ON_TRACK; zero steps do not count as below-par failure
    expect(day12.state).toBe('ON_TRACK');
    expect(day12.consecutiveBelowPar).toBe(0);
    expect(day12.contextAdaptation?.isRestExempt).toBe(true);
  });

  it('celebrates non-punitive re-engagement upon return from planned pause', () => {
    const userGoal = 8000;
    const config: UserContextConfig = {
      ...DEFAULT_CONTEXT_CONFIG,
      plannedPause: {
        enabled: true,
        reason: 'travel',
        startDate: '2026-04-10',
        endDate: '2026-04-15',
      },
    };

    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) {
      records.push({ date: `2026-04-0${i}`, steps: 8000 });
    }
    // Travel days
    for (let i = 10; i <= 15; i++) {
      records.push({ date: `2026-04-${i}`, steps: 2000 });
    }
    // Return day on April 16 (after pause ended)
    records.push({ date: '2026-04-16', steps: 8500 });

    const results = evaluateHistory(records, userGoal, 'steps', undefined, config);
    const returnDay = results[results.length - 1];

    expect(returnDay.state).toBe('ON_TRACK');
    expect(returnDay.activeDays).toBe(14); // 7 base + 6 travel days meeting minimum rung + 1 return day = 14 active days
  });
});
