/**
 * WellSync Engine Core Types
 */

export type BehaviorMetric = 'steps' | 'sleep';

export type UserState = 'ON_TRACK' | 'SLIPPING' | 'LAPSED' | 'RECOVERING';

export type LadderLevel = 'MINIMUM' | 'TARGET' | 'STRETCH';

export interface DailyRecord {
  /** ISO Date string in format YYYY-MM-DD */
  date: string;
  /** Recorded steps count (if recorded) */
  steps?: number | null;
  /** Recorded sleep duration in minutes (if recorded) */
  sleepMinutes?: number | null;
  /** Whether the day had missing data / device not worn */
  isMissing?: boolean;
  /** Whether the user explicitly declared planned rest / illness */
  isRestDeclared?: boolean;
  /** Context notes provided by user (e.g. shift work, travel, holiday) */
  contextNote?: string;
  /** Optional state assigned after engine processing */
  assignedState?: UserState;
}

export interface DayEvaluation {
  date: string;
  metric: BehaviorMetric;
  actualValue: number;
  baseline: number;
  thresholdValue: number;
  ratio: number;
  isBelowPar: boolean;
  isMissing: boolean;
}

export interface LadderTargets {
  minimum: number;
  target: number;
  stretch: number;
}

export interface BarrierHypothesis {
  id: 'weekend_dip' | 'weekday_dip' | 'activity_shift' | 'short_dip' | 'user_context';
  title: string;
  description: string;
  detected: boolean;
  userRejected?: boolean;
}

export interface TechniqueCard {
  bctId: string;
  bctName: string;
  taxonomyRef: string;
  suggestion: string;
  reason: string;
  limits: string;
}

export interface EngineDayResult {
  date: string;
  state: UserState;
  previousState: UserState;
  ladderLevel: LadderLevel;
  ladderTargets: LadderTargets;
  currentLadderTarget: number;
  isSuccessDay: boolean;
  isTargetAttained: boolean;
  baseline: number;
  isBaselineFrozen?: boolean;
  isColdStart: boolean;
  isLearningBaseline: boolean;
  learningMessage?: string;
  evaluation: DayEvaluation;
  consecutiveBelowPar: number;
  consecutiveSuccessDays: number;
  consecutiveLadderSuccesses: number;
  activeDays: number;
  returnCount: number;
  barrierHypotheses: BarrierHypothesis[];
  techniqueCard: TechniqueCard;
  contextAdaptation?: any;
}

export interface UserEngineProfile {
  userGoalSteps: number;
  userGoalSleepMinutes: number;
}
