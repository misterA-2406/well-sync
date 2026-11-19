/**
 * WellSync Engine - Anti-Erosion Baseline Computation
 *
 * Implements 28-day rolling median baseline with behavioral anti-erosion protections:
 * 1. Freeze-on-Lapse: Freezes baseline during LAPSED and RECOVERING states to avoid normalizing inactivity.
 * 2. Long-term Anchor: 56-day trimmed median prevents short-term lulls from collapsing the standard.
 * 3. Decay Cap: Limits maximum allowable baseline drop to X% per week (default 5%/week).
 * 4. Absolute Safety Floor: Enforces an absolute floor (default 3,000 steps; 360 min sleep).
 * 5. Cold-Start Protection: Safe fallback to user goal when valid data is insufficient (< 14 days).
 */

import { DEFAULT_ENGINE_CONFIG, EngineConfig } from './config';
import { BehaviorMetric, DailyRecord, UserState } from './types';

/**
 * Computes standard mathematical median of an array of numbers.
 * Empty array returns 0.
 */
export function calculateMedian(values: number[]): number {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * Computes trimmed median of an array of numbers to remove extreme outlier distortions.
 * Trims `trimPercent` from both the upper and lower tails when n >= 10.
 */
export function calculateTrimmedMedian(values: number[], trimPercent: number = 0.10): number {
  if (!values || values.length === 0) return 0;
  if (values.length < 10) return calculateMedian(values);

  const sorted = [...values].sort((a, b) => a - b);
  const trimCount = Math.floor(sorted.length * trimPercent);
  const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
  return calculateMedian(trimmed);
}

/**
 * Normalizes date to YYYY-MM-DD string format to prevent time zone mismatch.
 */
export function normalizeDateString(date: string | Date): string {
  if (typeof date === 'string') {
    const match = date.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface BaselineCalculationResult {
  baseline: number;
  isColdStart: boolean;
  isFrozen: boolean;
  validDaysCount: number;
  windowValues: number[];
  anchorBaseline?: number;
}

/**
 * Computes the behavioral baseline for a given date with strict anti-erosion safeguards.
 *
 * RATIONALE FOR ANTI-EROSION CONTROLS:
 * Traditional rolling averages collapse when users experience prolonged sickness, travel, or disruptions.
 * As the user logs 2,000 steps for 3 weeks, a naive rolling average steadily drops to 2,000,
 * effectively rewarding inactivity by redefining low movement as "normal" or "at par".
 * WellSync protects habit integrity by:
 * - Freezing baseline during LAPSED and RECOVERING states.
 * - Excluding LAPSED and RECOVERING days from rolling windows.
 * - Anchoring against a 56-day trimmed median.
 * - Capping weekly decay to a maximum of `config.maxDecayPerWeek` (default 5%/week).
 * - Enforcing an absolute physiological safety floor.
 */
export function calculateBaseline(
  history: DailyRecord[],
  currentDate: string,
  metric: BehaviorMetric,
  userGoal: number,
  config: EngineConfig = DEFAULT_ENGINE_CONFIG,
  previousState?: UserState | null,
  previousBaseline?: number | null,
  previousDate?: string | null
): BaselineCalculationResult {
  const normCurrent = normalizeDateString(currentDate);
  const currentTimestamp = new Date(normCurrent + 'T00:00:00Z').getTime();
  const msPerDay = 24 * 60 * 60 * 1000;

  // 1. FREEZE-ON-LAPSE / FREEZE-ON-RECOVERY:
  // If user was LAPSED or actively RECOVERING yesterday, do not lower or mutate the baseline.
  // The user's habit standard must remain stable while they work through the 3-day recovery ladder.
  if (
    (previousState === 'LAPSED' || previousState === 'RECOVERING') &&
    typeof previousBaseline === 'number' &&
    previousBaseline > 0
  ) {
    const validCount = history.filter(
      r => !r.isMissing && !r.isRestDeclared && r.assignedState !== 'LAPSED' && r.assignedState !== 'RECOVERING'
    ).length;
    return {
      baseline: previousBaseline,
      isColdStart: false,
      isFrozen: true,
      validDaysCount: validCount,
      windowValues: [],
      anchorBaseline: previousBaseline,
    };
  }

  // 2. Short-term Rolling Window (default 28 days) & Long-term Anchor Window (default 56 days)
  const shortWindowStartTimestamp = currentTimestamp - config.baselineWindowDays * msPerDay;
  const anchorWindowStartTimestamp = currentTimestamp - config.anchorWindowDays * msPerDay;

  const shortWindowValues: number[] = [];
  const anchorValues: number[] = [];

  for (const record of history) {
    const recordNorm = normalizeDateString(record.date);
    const recordTimestamp = new Date(recordNorm + 'T00:00:00Z').getTime();

    // Must be strictly prior to current date
    if (recordTimestamp < currentTimestamp) {
      // Exclude days classified as LAPSED or RECOVERING to avoid contamination
      if (record.assignedState === 'LAPSED' || record.assignedState === 'RECOVERING') {
        continue;
      }
      // Exclude missing or declared rest days
      if (record.isMissing || record.isRestDeclared) {
        continue;
      }

      const val = metric === 'steps' ? record.steps : record.sleepMinutes;
      if (typeof val === 'number' && !isNaN(val) && val >= 0) {
        if (recordTimestamp >= shortWindowStartTimestamp) {
          shortWindowValues.push(val);
        }
        if (recordTimestamp >= anchorWindowStartTimestamp) {
          anchorValues.push(val);
        }
      }
    }
  }

  // 3. Absolute Safety Floor setup
  const rawFloor =
    metric === 'steps' ? config.stepBaselineSafetyFloor : config.sleepBaselineSafetyFloor;
  const effectiveSafetyFloor = Math.min(rawFloor, userGoal);

  // 4. Cold-Start Check: fewer than minValidDaysForBaseline in the short-term window
  if (shortWindowValues.length < config.minValidDaysForBaseline) {
    let coldBaseline = Math.max(userGoal, effectiveSafetyFloor);
    return {
      baseline: coldBaseline,
      isColdStart: true,
      isFrozen: false,
      validDaysCount: shortWindowValues.length,
      windowValues: shortWindowValues,
    };
  }

  // 5. Compute Short-term Median
  let computedBaseline = calculateMedian(shortWindowValues);

  // 6. Long-Term Anchor Protection (56-day trimmed median)
  let anchorBaseline: number | undefined;
  if (anchorValues.length >= config.minValidDaysForBaseline) {
    anchorBaseline = calculateTrimmedMedian(anchorValues, config.anchorTrimPercent);
    // Baseline cannot drop below 85% of long-term established anchor capacity
    const anchorFloor = Math.round(anchorBaseline * 0.85);
    computedBaseline = Math.max(computedBaseline, anchorFloor);
  }

  // 7. Decay Cap (Max X% decay per 7 days, proportional to elapsed days)
  if (typeof previousBaseline === 'number' && previousBaseline > 0) {
    let elapsedDays = 1;
    if (previousDate) {
      const prevTimestamp = new Date(normalizeDateString(previousDate) + 'T00:00:00Z').getTime();
      const diff = Math.round((currentTimestamp - prevTimestamp) / msPerDay);
      if (diff > 0) elapsedDays = diff;
    }

    const maxAllowedFractionalDrop = (config.maxDecayPerWeek * elapsedDays) / 7;
    const minAllowedByDecayCap = Math.round(previousBaseline * (1 - maxAllowedFractionalDrop));
    computedBaseline = Math.max(computedBaseline, minAllowedByDecayCap);
  }

  // 8. Absolute Safety Floor Enforced
  computedBaseline = Math.max(computedBaseline, effectiveSafetyFloor);

  return {
    baseline: computedBaseline,
    isColdStart: false,
    isFrozen: false,
    validDaysCount: shortWindowValues.length,
    windowValues: shortWindowValues,
    anchorBaseline,
  };
}
