/**
 * WellSync Engine - Deterministic State Machine
 *
 * Implements states: ON_TRACK, SLIPPING, LAPSED, RECOVERING.
 * Pure functions: processDay, evaluateHistory.
 */

import { calculateBaseline, normalizeDateString } from './baseline';
import { detectBarrierHypotheses } from './barriers';
import { DEFAULT_ENGINE_CONFIG, EngineConfig } from './config';
import { calculateLadderTargets, getTargetForLevel, stepDownOnLapse, stepUpLadder } from './ladder';
import { getTechniqueCard } from './recommendations';
import { BehaviorMetric, DailyRecord, DayEvaluation, EngineDayResult, LadderLevel, UserState } from './types';

export interface ProcessDayContext {
  previousResult: EngineDayResult | null;
  history: DailyRecord[];
  currentRecord: DailyRecord;
  metric: BehaviorMetric;
  userGoal: number;
  config?: EngineConfig;
}

/**
 * Calculates rolling 7-day mean of values ending at currentDate.
 */
export function calculate7DayMean(
  history: DailyRecord[],
  currentRecord: DailyRecord,
  metric: BehaviorMetric
): number {
  const normCurrent = normalizeDateString(currentRecord.date);
  const currentTimestamp = new Date(normCurrent + 'T00:00:00Z').getTime();
  const msPerDay = 24 * 60 * 60 * 1000;
  const windowStart = currentTimestamp - 6 * msPerDay; // 7 days inclusive: today and previous 6 days

  const allRecords = [...history, currentRecord];
  const dayValues: number[] = [];

  for (const r of allRecords) {
    const rTime = new Date(normalizeDateString(r.date) + 'T00:00:00Z').getTime();
    if (rTime >= windowStart && rTime <= currentTimestamp) {
      if (!r.isMissing) {
        const val = metric === 'steps' ? r.steps : r.sleepMinutes;
        if (typeof val === 'number' && !isNaN(val)) {
          dayValues.push(val);
        } else {
          dayValues.push(0);
        }
      } else {
        dayValues.push(0);
      }
    }
  }

  if (dayValues.length === 0) return 0;
  const sum = dayValues.reduce((a, b) => a + b, 0);
  return sum / dayValues.length;
}

/**
 * Processes a single day and produces the complete EngineDayResult.
 * Pure function: has no side-effects, relies strictly on provided context.
 */
export function processDay({
  previousResult,
  history,
  currentRecord,
  metric,
  userGoal,
  config = DEFAULT_ENGINE_CONFIG,
}: ProcessDayContext): EngineDayResult {
  const dateStr = normalizeDateString(currentRecord.date);

  // 1. Calculate Baseline for current day
  const { baseline, isColdStart, validDaysCount } = calculateBaseline(
    history,
    dateStr,
    metric,
    userGoal,
    config
  );

  // 2. Cold-start suppression check:
  // Suppress SLIPPING and LAPSED until at least 7 valid days exist in total
  const rawVal = metric === 'steps' ? currentRecord.steps : currentRecord.sleepMinutes;
  const isMissing = Boolean(
    currentRecord.isMissing || rawVal === null || rawVal === undefined || isNaN(rawVal)
  );
  const maxSafeValue = metric === 'steps' ? 100000 : 1440;
  const actualValue = isMissing ? 0 : Math.max(0, Math.min(maxSafeValue, Number(rawVal)));

  const totalRecordedValidDays = validDaysCount + (!isMissing && actualValue >= 0 ? 1 : 0);
  const isLearningBaseline = totalRecordedValidDays < config.minDaysForLapseDetection;
  const learningMessage = isLearningBaseline ? 'learning your baseline' : undefined;

  // 3. Ladder Targets
  const ladderTargets = calculateLadderTargets(baseline, userGoal, config);

  // 4. Active Ladder Level & Current Target
  const prevState: UserState = previousResult?.state ?? 'ON_TRACK';
  const prevLadderLevel: LadderLevel = previousResult?.ladderLevel ?? 'TARGET';

  // Current ladder target based on active rung
  const currentLadderTarget = getTargetForLevel(ladderTargets, prevLadderLevel);

  // Definition of SUCCESS DAY: value >= current rung target
  const isSuccessDay = !isMissing && actualValue >= currentLadderTarget;

  // 5. Day Evaluation
  // Threshold for entering SLIPPING or LAPSED when on Target/Stretch is 60% of baseline.
  // When on Minimum rung, meeting the Minimum (isSuccessDay) is at-par / success!
  const thresholdValue = Math.round(baseline * config.belowParThresholdRatio);
  const ratio = baseline > 0 ? actualValue / baseline : 0;

  // On Minimum rung: below-par only if failing to meet the Minimum target.
  // On Target/Stretch: below-par if failing to reach 60% of baseline.
  const isBelowPar = isMissing || (
    prevLadderLevel === 'MINIMUM'
      ? actualValue < ladderTargets.minimum
      : actualValue < thresholdValue
  );

  const evaluation: DayEvaluation = {
    date: dateStr,
    metric,
    actualValue,
    baseline,
    thresholdValue,
    ratio: Math.round(ratio * 100) / 100,
    isBelowPar,
    isMissing,
  };

  let consecutiveBelowPar = previousResult?.consecutiveBelowPar ?? 0;
  let consecutiveSuccessDays = previousResult?.consecutiveSuccessDays ?? 0;
  let activeDays = previousResult?.activeDays ?? 0;
  let returnCount = previousResult?.returnCount ?? 0;

  // 6. Update Active Days (activity recorded meeting or exceeding minimum rung, never resets)
  if (!isMissing && actualValue >= ladderTargets.minimum) {
    activeDays += 1;
  }

  // 7. Update independent consecutive counters:
  // consecutiveBelowPar tracks below-par failure streaks for lapse detection
  if (isBelowPar) {
    consecutiveBelowPar += 1;
  } else {
    consecutiveBelowPar = 0;
  }

  // consecutiveSuccessDays tracks meeting current ladder target for step-up and recovery
  if (isSuccessDay) {
    consecutiveSuccessDays += 1;
  } else {
    consecutiveSuccessDays = 0;
  }

  // 8. State Transitions
  let nextState: UserState = prevState;
  let nextLadderLevel: LadderLevel = prevLadderLevel;

  if (isLearningBaseline) {
    // Suppress SLIPPING and LAPSED during first 7 valid days
    nextState = 'ON_TRACK';
  } else if (consecutiveBelowPar >= config.lapseConsecutiveDays) {
    // 3 or more consecutive below-par days = LAPSED
    nextState = 'LAPSED';
    nextLadderLevel = stepDownOnLapse(); // steps down to MINIMUM
    consecutiveSuccessDays = 0;
  } else if (prevState === 'LAPSED' && isSuccessDay) {
    // First success day on Minimum rung after being lapsed = RECOVERING
    nextState = 'RECOVERING';
  } else if (prevState === 'RECOVERING') {
    if (isSuccessDay) {
      if (consecutiveSuccessDays >= config.recoveryConsecutiveSuccessDays) {
        // 3 consecutive success days achieved = recovery complete, return to ON_TRACK
        nextState = 'ON_TRACK';
        returnCount += 1; // Completed recovery event
      } else {
        nextState = 'RECOVERING';
      }
    } else {
      // Below par while recovering
      if (consecutiveBelowPar >= config.lapseConsecutiveDays) {
        nextState = 'LAPSED';
        nextLadderLevel = stepDownOnLapse();
        consecutiveSuccessDays = 0;
      } else {
        nextState = 'RECOVERING';
      }
    }
  } else {
    // Check for SLIPPING: 7-day rolling mean < 80% of baseline and not lapsed
    const sevenDayMean = calculate7DayMean(history, currentRecord, metric);
    const isSlippingMean = baseline > 0 && sevenDayMean < baseline * config.slippingMeanRatio;

    if (isSlippingMean) {
      nextState = 'SLIPPING';
    } else {
      nextState = 'ON_TRACK';
    }
  }

  // 9. Ladder Step-up: Step up one rung after 3 consecutive success days
  if (consecutiveSuccessDays >= config.ladderStepUpSuccesses) {
    const stepped = stepUpLadder(nextLadderLevel);
    if (stepped !== nextLadderLevel) {
      nextLadderLevel = stepped;
      consecutiveSuccessDays = 0;
    }
  }

  // 11. Barrier hypotheses & recommendations
  const barrierHypotheses = detectBarrierHypotheses(history, currentRecord, metric);
  const techniqueCard = getTechniqueCard(nextState, nextLadderLevel);

  return {
    date: dateStr,
    state: nextState,
    previousState: prevState,
    ladderLevel: nextLadderLevel,
    ladderTargets,
    currentLadderTarget,
    isSuccessDay,
    isTargetAttained: isSuccessDay,
    baseline,
    isColdStart,
    isLearningBaseline,
    learningMessage,
    evaluation,
    consecutiveBelowPar,
    consecutiveSuccessDays,
    consecutiveLadderSuccesses: consecutiveSuccessDays,
    activeDays,
    returnCount,
    barrierHypotheses,
    techniqueCard,
  };
}

/**
 * Evaluates an entire array of daily records in chronological order.
 */
export function evaluateHistory(
  records: DailyRecord[],
  userGoal: number,
  metric: BehaviorMetric,
  config: EngineConfig = DEFAULT_ENGINE_CONFIG
): EngineDayResult[] {
  // Sort records chronologically
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const results: EngineDayResult[] = [];
  const processedHistory: DailyRecord[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const currentRecord = sorted[i];
    const previousResult = results.length > 0 ? results[results.length - 1] : null;

    const dayResult = processDay({
      previousResult,
      history: processedHistory,
      currentRecord,
      metric,
      userGoal,
      config,
    });

    results.push(dayResult);

    // Save record with assignedState for baseline contamination checks
    processedHistory.push({
      ...currentRecord,
      assignedState: dayResult.state,
    });
  }

  return results;
}
