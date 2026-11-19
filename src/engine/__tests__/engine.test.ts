/**
 * WellSync Engine Test Suite
 *
 * All test names explicitly mapped to specification items:
 * - Cold start across history (0, 1, 13, 14, 28 days)
 * - Baseline contamination guard (LAPSED days exclusion)
 * - Time zone & date normalization
 * - Missing days handling (null, undefined, isMissing)
 * - Learning baseline suppression (< 7 valid days)
 * - Minimum rung success definition (three 5,500-step days on 5,000 Minimum count as success, finish recovery, step up)
 * - State transitions (ON_TRACK, SLIPPING, LAPSED, RECOVERING)
 * - Cumulative progress (no reset to zero)
 * - Michie et al. (2013) BCTTv1 verification (including BCT 1.5 Review behaviour goal(s))
 * - Sleep metric evaluation
 */

import { describe, expect, it } from 'vitest';
import { calculateBaseline, normalizeDateString } from '../baseline';
import { DEFAULT_ENGINE_CONFIG } from '../config';
import { calculateLadderTargets, getTargetForLevel, stepDownOnLapse, stepUpLadder } from '../ladder';
import { getTechniqueCard } from '../recommendations';
import { evaluateHistory } from '../state';
import { DailyRecord } from '../types';

describe('Spec Item 1: Cold Start Across History Lengths', () => {
  it('spec item 1.1: cold start with 0 days history falls back to user goal and flags isColdStart', () => {
    const userGoal = 8000;
    const history: DailyRecord[] = [];
    const res = calculateBaseline(history, '2026-11-01', 'steps', userGoal);
    expect(res.isColdStart).toBe(true);
    expect(res.baseline).toBe(userGoal);
    expect(res.validDaysCount).toBe(0);
  });

  it('spec item 1.2: cold start with 1 day history falls back to user goal and flags isColdStart', () => {
    const userGoal = 8000;
    const history: DailyRecord[] = [{ date: '2026-10-31', steps: 9500 }];
    const res = calculateBaseline(history, '2026-11-01', 'steps', userGoal);
    expect(res.isColdStart).toBe(true);
    expect(res.baseline).toBe(userGoal);
    expect(res.validDaysCount).toBe(1);
  });

  it('spec item 1.3: cold start with 13 days history falls back to user goal and flags isColdStart', () => {
    const userGoal = 8000;
    const history: DailyRecord[] = [];
    for (let i = 1; i <= 13; i++) {
      history.push({
        date: `2026-10-${String(i).padStart(2, '0')}`,
        steps: 6500,
      });
    }
    const res = calculateBaseline(history, '2026-10-14', 'steps', userGoal);
    expect(res.isColdStart).toBe(true);
    expect(res.baseline).toBe(userGoal);
    expect(res.validDaysCount).toBe(13);
  });

  it('spec item 1.4: cold start ends at exactly 14 days history, computing median baseline', () => {
    const userGoal = 8000;
    const history: DailyRecord[] = [];
    for (let i = 1; i <= 14; i++) {
      history.push({
        date: `2026-10-${String(i).padStart(2, '0')}`,
        steps: 6000 + (i % 2 === 0 ? 1000 : 0), // alternating 6000 and 7000
      });
    }
    const res = calculateBaseline(history, '2026-10-15', 'steps', userGoal);
    expect(res.isColdStart).toBe(false);
    expect(res.validDaysCount).toBe(14);
    expect(res.baseline).toBe(6500); // median of seven 6000s and seven 7000s
  });

  it('spec item 1.5: baseline window strictly bounds to previous 28 days', () => {
    const userGoal = 8000;
    const history: DailyRecord[] = [];
    // Day 1 to 40
    for (let i = 1; i <= 40; i++) {
      const month = i <= 31 ? '10' : '11';
      const day = i <= 31 ? i : i - 31;
      history.push({
        date: `2026-${month}-${String(day).padStart(2, '0')}`,
        // Older days (1-10) have high steps (20000), recent 28 days have 8000
        steps: i <= 10 ? 20000 : 8000,
      });
    }
    // As of Nov 10 (day 40), lookback 28 days covers day 12 to 39
    const res = calculateBaseline(history, '2026-11-10', 'steps', userGoal);
    expect(res.validDaysCount).toBe(28);
    expect(res.baseline).toBe(8000); // 20000 from day 1-10 is out of window
  });
});

describe('Spec Item 2: Baseline Contamination by Lapse Days', () => {
  it('spec item 2.1: baseline contamination guard excludes LAPSED days from median calculation', () => {
    const userGoal = 10000;
    const history: DailyRecord[] = [];

    // 20 days of healthy activity at 10,000 steps
    for (let i = 1; i <= 20; i++) {
      history.push({
        date: `2026-10-${String(i).padStart(2, '0')}`,
        steps: 10000,
        assignedState: 'ON_TRACK',
      });
    }

    // 5 days of severe lapse at 1,000 steps, flagged as LAPSED
    for (let i = 21; i <= 25; i++) {
      history.push({
        date: `2026-10-${String(i).padStart(2, '0')}`,
        steps: 1000,
        assignedState: 'LAPSED',
      });
    }

    // Baseline calculation on Oct 26 must exclude the 5 LAPSED days
    const res = calculateBaseline(history, '2026-10-26', 'steps', userGoal);
    expect(res.validDaysCount).toBe(20);
    expect(res.baseline).toBe(10000);
    expect(res.windowValues.includes(1000)).toBe(false);
  });
});

describe('Spec Item 3: Time Zone Changes and Date Normalization', () => {
  it('spec item 3.1: normalizes ISO dates with time zone offsets to consistent calendar days', () => {
    expect(normalizeDateString('2026-11-17')).toBe('2026-11-17');
    expect(normalizeDateString('2026-11-17T23:45:00+04:00')).toBe('2026-11-17');
    expect(normalizeDateString('2026-11-17T02:00:00Z')).toBe('2026-11-17');
    expect(normalizeDateString(new Date('2026-11-20T00:00:00Z'))).toBe('2026-11-20');
  });
});

describe('Spec Item 4: Missing Days Handling', () => {
  it('spec item 4.1: missing days (null, undefined, isMissing flag) count as below-par and do not throw', () => {
    const userGoal = 8000;
    const history: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) {
      history.push({ date: `2026-10-0${i}`, steps: 8000 });
    }

    const testRecords: DailyRecord[] = [
      ...history,
      { date: '2026-10-08', isMissing: true },
      { date: '2026-10-09', steps: undefined },
      { date: '2026-10-10', steps: null },
    ];

    // With legacy flag missingDataCanCauseLapse: true, missing days count as below-par
    const results = evaluateHistory(testRecords, userGoal, 'steps', { ...DEFAULT_ENGINE_CONFIG, missingDataCanCauseLapse: true });
    expect(results[7].evaluation.isMissing).toBe(true);
    expect(results[7].evaluation.isBelowPar).toBe(true);
    expect(results[8].evaluation.isMissing).toBe(true);
    expect(results[9].evaluation.isMissing).toBe(true);
    // 3 consecutive missing days trigger LAPSED under legacy mode
    expect(results[9].state).toBe('LAPSED');

    // Under modern anti-erosion rules (default), missing wearable data does NOT create a lapse
    const resultsSafe = evaluateHistory(testRecords, userGoal, 'steps');
    expect(resultsSafe[9].state).toBe('ON_TRACK');
  });
});

describe('Spec Item 5: Learning Your Baseline (< 7 Valid Days)', () => {
  it('spec item 5.1: suppresses SLIPPING and LAPSED when history has fewer than 7 valid days and shows learning your baseline', () => {
    const userGoal = 10000;
    // User registers 3 low days during the first 3 days of joining
    const records: DailyRecord[] = [
      { date: '2026-11-01', steps: 1000 },
      { date: '2026-11-02', steps: 1000 },
      { date: '2026-11-03', steps: 1000 },
    ];

    const results = evaluateHistory(records, userGoal, 'steps');
    // Suppressed: even after 3 low days, state remains ON_TRACK while learning baseline
    expect(results[2].isLearningBaseline).toBe(true);
    expect(results[2].learningMessage).toBe('learning your baseline');
    expect(results[2].state).toBe('ON_TRACK');
    expect(results[2].ladderLevel).toBe('TARGET');
  });

  it('spec item 5.2: enables SLIPPING and LAPSED once at least 7 valid days exist', () => {
    const userGoal = 10000;
    const records: DailyRecord[] = [];
    // 7 valid days
    for (let i = 1; i <= 7; i++) {
      records.push({ date: `2026-10-0${i}`, steps: 10000 });
    }
    // Days 8, 9, 10 are below-par
    records.push({ date: '2026-10-08', steps: 2000 });
    records.push({ date: '2026-10-09', steps: 2000 });
    records.push({ date: '2026-10-10', steps: 2000 });

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[6].isLearningBaseline).toBe(false);
    expect(results[9].state).toBe('LAPSED');
  });
});

describe('Spec Item 6: Minimum Rung Success Days & Step-Up Mechanics', () => {
  it('spec item 6.1: three 5,500-step days on the Minimum rung (baseline 10,000) count as success, finish recovery and step up', () => {
    const userGoal = 10000;
    const records: DailyRecord[] = [];

    // 14 days baseline of 10,000 steps
    for (let i = 1; i <= 14; i++) {
      records.push({
        date: `2026-10-${String(i).padStart(2, '0')}`,
        steps: 10000,
      });
    }

    // 3 days of lapse (< 6000 steps)
    records.push({ date: '2026-10-15', steps: 2000 });
    records.push({ date: '2026-10-16', steps: 2000 });
    records.push({ date: '2026-10-17', steps: 2000 }); // Day 17: enters LAPSED, ladder steps down to MINIMUM (5000)

    // Three consecutive 5,500-step days on Minimum rung (Target = 5,000)
    records.push({ date: '2026-10-18', steps: 5500 }); // Day 18: success 1 at MINIMUM -> RECOVERING
    records.push({ date: '2026-10-19', steps: 5500 }); // Day 19: success 2 at MINIMUM -> RECOVERING
    records.push({ date: '2026-10-20', steps: 5500 }); // Day 20: success 3 at MINIMUM -> completes recovery, ON_TRACK & steps up to TARGET!

    const results = evaluateHistory(records, userGoal, 'steps');

    // Verification of Day 17 (LAPSED)
    const day17 = results[16];
    expect(day17.state).toBe('LAPSED');
    expect(day17.ladderLevel).toBe('MINIMUM');
    expect(day17.ladderTargets.minimum).toBe(5000);

    // Verification of Day 18 (Success Day 1 on Minimum rung)
    const day18 = results[17];
    expect(day18.isSuccessDay).toBe(true);
    expect(day18.state).toBe('RECOVERING');
    expect(day18.consecutiveSuccessDays).toBe(1);
    expect(day18.ladderLevel).toBe('MINIMUM');

    // Verification of Day 19 (Success Day 2 on Minimum rung)
    const day19 = results[18];
    expect(day19.isSuccessDay).toBe(true);
    expect(day19.state).toBe('RECOVERING');
    expect(day19.consecutiveSuccessDays).toBe(2);
    expect(day19.ladderLevel).toBe('MINIMUM');

    // Verification of Day 20 (Success Day 3 on Minimum rung)
    const day20 = results[19];
    expect(day20.isSuccessDay).toBe(true);
    // Successfully finishes recovery: returns to ON_TRACK!
    expect(day20.state).toBe('ON_TRACK');
    expect(day20.returnCount).toBe(1);
    // Steps up ladder from MINIMUM to TARGET!
    expect(day20.ladderLevel).toBe('TARGET');
  });

  it('spec item 6.2: ladder steps down immediately to MINIMUM upon entering LAPSED', () => {
    expect(stepDownOnLapse()).toBe('MINIMUM');
  });

  it('spec item 6.3: consecutive successes step up ladder from TARGET to STRETCH', () => {
    expect(stepUpLadder('MINIMUM')).toBe('TARGET');
    expect(stepUpLadder('TARGET')).toBe('STRETCH');
    expect(stepUpLadder('STRETCH')).toBe('STRETCH');

    const targets = calculateLadderTargets(10000, 10000);
    expect(targets.minimum).toBe(5000);
    expect(targets.target).toBe(10000);
    expect(targets.stretch).toBe(11000);
    expect(getTargetForLevel(targets, 'STRETCH')).toBe(11000);
  });
});

describe('Spec Item 7: State Transitions and Recovery', () => {
  it('spec item 7.1: transitions to LAPSED on exactly 3 consecutive below-par days on Target rung', () => {
    const userGoal = 10000;
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) {
      records.push({ date: `2026-10-0${i}`, steps: 10000 });
    }
    records.push({ date: '2026-10-08', steps: 5000 }); // below 60% (6000)
    records.push({ date: '2026-10-09', steps: 5000 });
    records.push({ date: '2026-10-10', steps: 4000 });

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[7].consecutiveBelowPar).toBe(1);
    expect(results[7].state).toBe('ON_TRACK');
    expect(results[8].consecutiveBelowPar).toBe(2);
    expect(results[8].state).toBe('ON_TRACK');
    expect(results[9].consecutiveBelowPar).toBe(3);
    expect(results[9].state).toBe('LAPSED');
  });

  it('spec item 7.2: transitions to RECOVERING on first success day after lapse', () => {
    const userGoal = 10000;
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) {
      records.push({ date: `2026-10-0${i}`, steps: 10000 });
    }
    records.push({ date: '2026-10-08', steps: 2000 });
    records.push({ date: '2026-10-09', steps: 2000 });
    records.push({ date: '2026-10-10', steps: 2000 }); // LAPSED
    records.push({ date: '2026-10-11', steps: 5500 }); // success on Minimum (5000)

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[9].state).toBe('LAPSED');
    expect(results[10].state).toBe('RECOVERING');
  });

  it('spec item 7.3: detects SLIPPING when 7-day rolling mean falls below 80% without reaching 3 consecutive below-par days', () => {
    const userGoal = 10000;
    const records: DailyRecord[] = [
      { date: '2026-10-01', steps: 10000 },
      { date: '2026-10-02', steps: 10000 },
      { date: '2026-10-03', steps: 10000 },
      { date: '2026-10-04', steps: 6000 },
      { date: '2026-10-05', steps: 6000 },
      { date: '2026-10-06', steps: 6000 },
      { date: '2026-10-07', steps: 6000 }, // 7-day mean = 7714 < 8000
    ];

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[6].state).toBe('SLIPPING');
  });

  it('spec item 7.4: re-triggers LAPSED if 3 consecutive below-rung days occur during recovery', () => {
    const userGoal = 10000;
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) {
      records.push({ date: `2026-10-0${i}`, steps: 10000 });
    }
    records.push({ date: '2026-10-08', steps: 2000 });
    records.push({ date: '2026-10-09', steps: 2000 });
    records.push({ date: '2026-10-10', steps: 2000 }); // LAPSED
    records.push({ date: '2026-10-11', steps: 5500 }); // RECOVERING
    records.push({ date: '2026-10-12', steps: 3000 }); // below minimum 1 (< 5000)
    records.push({ date: '2026-10-13', steps: 3000 }); // below minimum 2
    records.push({ date: '2026-10-14', steps: 3000 }); // below minimum 3 -> LAPSED again!

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[10].state).toBe('RECOVERING');
    expect(results[13].state).toBe('LAPSED');
    expect(results[13].ladderLevel).toBe('MINIMUM');
  });
});

describe('Spec Item 8: Cumulative Progress (No Reset to Zero)', () => {
  it('spec item 8.1: active days and return count never reset to zero on lapse', () => {
    const userGoal = 8000;
    const records: DailyRecord[] = [];
    // 7 initial active days
    for (let i = 1; i <= 7; i++) {
      records.push({ date: `2026-10-0${i}`, steps: 8000 });
    }
    // Days 8, 9, 10 are below-par (1000 steps)
    records.push({ date: '2026-10-08', steps: 1000 });
    records.push({ date: '2026-10-09', steps: 1000 });
    records.push({ date: '2026-10-10', steps: 1000 }); // LAPSED

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[6].activeDays).toBe(7);
    // After lapse on day 10, active days is still 7 (never reset to 0!)
    expect(results[9].state).toBe('LAPSED');
    expect(results[9].activeDays).toBe(7);
  });
});

describe('Spec Item 9: Michie et al. (2013) BCTTv1 Taxonomy Verification', () => {
  it('spec item 9.1: verifies BCT taxonomy numbers including BCT 1.5 Review behaviour goal(s) and BCT 8.7 Graded tasks', () => {
    const stretchCard = getTechniqueCard('ON_TRACK', 'STRETCH');
    // Verified: BCT 1.5 is Review behaviour goal(s), NOT 1.3 (which is Goal setting outcome)
    expect(stretchCard.bctId).toBe('BCT 1.5');
    expect(stretchCard.bctName).toBe('Review Behaviour Goal(s)');

    const lapsedCard = getTechniqueCard('LAPSED', 'MINIMUM');
    expect(lapsedCard.bctId).toBe('BCT 8.7');
    expect(lapsedCard.bctName).toBe('Graded Tasks');

    const slippingCard = getTechniqueCard('SLIPPING', 'TARGET');
    expect(slippingCard.bctId).toBe('BCT 1.4');
    expect(slippingCard.bctName).toBe('Action Planning');

    const recoveringCard = getTechniqueCard('RECOVERING', 'MINIMUM');
    expect(recoveringCard.bctId).toBe('BCT 2.2');
    expect(recoveringCard.bctName).toBe('Feedback on Behaviour');

    const onTrackCard = getTechniqueCard('ON_TRACK', 'TARGET');
    expect(onTrackCard.bctId).toBe('BCT 1.1');
    expect(onTrackCard.bctName).toBe('Goal Setting (Behaviour)');
  });
});

describe('Spec Item 10: Sleep Metric Evaluation', () => {
  it('spec item 10.1: evaluates sleep metric seamlessly using sleepMinutes and calculates sleep ladder rungs', () => {
    const userGoalSleep = 480; // 8 hours in minutes
    const records: DailyRecord[] = [];
    for (let i = 1; i <= 7; i++) {
      records.push({ date: `2026-10-0${i}`, sleepMinutes: 480 });
    }
    records.push({ date: '2026-10-08', sleepMinutes: 200 }); // below 60% of 480 (288m)
    records.push({ date: '2026-10-09', sleepMinutes: 220 });
    records.push({ date: '2026-10-10', sleepMinutes: 180 }); // 3rd low sleep day -> LAPSED

    const results = evaluateHistory(records, userGoalSleep, 'sleep');
    expect(results[6].state).toBe('ON_TRACK');
    expect(results[9].state).toBe('LAPSED');
    expect(results[9].ladderTargets.minimum).toBe(240); // 50% of 480m = 4h
  });
});
