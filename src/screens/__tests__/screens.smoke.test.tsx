/**
 * Screens & Demo Journeys Smoke Tests
 *
 * Verifies:
 * 1. Every screen renders without error in both English ('en') and Arabic ('ar')
 * 2. Empty states and populated states render cleanly
 * 3. Synthetic demo journeys (Tariq & Sarah) evaluate cleanly through the behavioral engine
 *    confirming baseline establishment, lapse detection, ladder step-down, and recovery completion.
 */

import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TodayScreen } from '../TodayScreen';
import { RecoveryScreen } from '../RecoveryScreen';
import { HistoryScreen } from '../HistoryScreen';
import { EvidenceScreen } from '../EvidenceScreen';
import { SettingsScreen } from '../SettingsScreen';
import { AboutScreen } from '../AboutScreen';
import { OnboardingModal } from '../OnboardingModal';
import { SYNTHETIC_PERSONAS } from '../../data/syntheticPersonas';
import { evaluateHistory } from '../../engine/state';
import { EngineDayResult, UserEngineProfile } from '../../engine/types';

const mockProfile: UserEngineProfile = {
  userGoalSteps: 8000,
  userGoalSleepMinutes: 480,
};

const mockResult: EngineDayResult = {
  date: '2026-11-01',
  state: 'ON_TRACK',
  previousState: 'ON_TRACK',
  ladderLevel: 'TARGET',
  ladderTargets: {
    minimum: 4000,
    target: 8000,
    stretch: 8800,
  },
  currentLadderTarget: 8000,
  isSuccessDay: true,
  isTargetAttained: true,
  baseline: 8000,
  isColdStart: false,
  isLearningBaseline: false,
  evaluation: {
    date: '2026-11-01',
    metric: 'steps',
    actualValue: 8500,
    baseline: 8000,
    thresholdValue: 4800,
    ratio: 1.06,
    isBelowPar: false,
    isMissing: false,
  },
  consecutiveBelowPar: 0,
  consecutiveSuccessDays: 3,
  consecutiveLadderSuccesses: 3,
  activeDays: 14,
  returnCount: 1,
  barrierHypotheses: [
    {
      id: 'short_dip',
      title: 'Short Dip',
      description: 'Temporary activity reduction',
      detected: false,
    },
  ],
  techniqueCard: {
    bctId: 'BCT 1.1',
    bctName: 'Goal setting (behaviour)',
    taxonomyRef: 'Michie et al. (2013) BCTTv1 #1.1',
    suggestion: 'Keep your active target in focus',
    reason: 'Daily behavioral goal keeps motivation steady',
    limits: 'Requires ongoing engagement',
  },
};

const mockLapsedResult: EngineDayResult = {
  ...mockResult,
  date: '2026-11-02',
  state: 'LAPSED',
  previousState: 'ON_TRACK',
  ladderLevel: 'MINIMUM',
  currentLadderTarget: 4000,
  isSuccessDay: false,
  isTargetAttained: false,
  evaluation: {
    date: '2026-11-02',
    metric: 'steps',
    actualValue: 2800,
    baseline: 8000,
    thresholdValue: 4800,
    ratio: 0.35,
    isBelowPar: true,
    isMissing: false,
  },
  consecutiveBelowPar: 3,
  consecutiveSuccessDays: 0,
  consecutiveLadderSuccesses: 0,
  barrierHypotheses: [
    {
      id: 'short_dip',
      title: 'Short Dip',
      description: 'A sharp, temporary decrease in daily movement below baseline',
      detected: true,
    },
  ],
  techniqueCard: {
    bctId: 'BCT 1.5',
    bctName: 'Review behaviour goal(s)',
    taxonomyRef: 'Michie et al. (2013) BCTTv1 #1.5',
    suggestion: 'Step down to minimum feasible rung',
    reason: 'Prevent abandonment by temporarily adjusting goal',
    limits: 'Must be restored once routine stabilizes',
  },
};

describe('Screens Smoke Tests', () => {
  describe('TodayScreen', () => {
    it('renders cleanly in English with empty/null latestResult', () => {
      const html = renderToStaticMarkup(
        <TodayScreen
          profile={mockProfile}
          latestResult={null}
          metric="steps"
          language="en"
          onChangeMetric={vi.fn()}
          onSaveRecord={vi.fn()}
          onNavigateToRecovery={vi.fn()}
        />
      );
      expect(html).toContain('Today');
      expect(html).toContain('8,000');
    });

    it('renders cleanly in Arabic with populated latestResult', () => {
      const html = renderToStaticMarkup(
        <TodayScreen
          profile={mockProfile}
          latestResult={mockResult}
          metric="steps"
          language="ar"
          onChangeMetric={vi.fn()}
          onSaveRecord={vi.fn()}
          onNavigateToRecovery={vi.fn()}
        />
      );
      expect(html).toContain('اليوم');
      expect(html).toContain('الهدف النشط لليوم');
    });

    it('renders sleep metric mode cleanly', () => {
      const html = renderToStaticMarkup(
        <TodayScreen
          profile={mockProfile}
          latestResult={{
            ...mockResult,
            evaluation: { ...mockResult.evaluation, metric: 'sleep', actualValue: 480 },
          }}
          metric="sleep"
          language="en"
          onChangeMetric={vi.fn()}
          onSaveRecord={vi.fn()}
          onNavigateToRecovery={vi.fn()}
        />
      );
      expect(html).toContain('Today');
      expect(html).toContain('Log Daily Activity');
    });
  });

  describe('RecoveryScreen', () => {
    it('renders cleanly when no lapse is active', () => {
      const html = renderToStaticMarkup(
        <RecoveryScreen
          profile={mockProfile}
          latestResult={mockResult}
          metric="steps"
          language="en"
          onCommitMicroAction={vi.fn()}
          onNavigateToToday={vi.fn()}
        />
      );
      expect(html).toContain('Gentle Recovery Protocol');
      expect(html).toContain('Life Happens');
    });

    it('renders recovery guidance and barrier veto when LAPSED in English', () => {
      const html = renderToStaticMarkup(
        <RecoveryScreen
          profile={mockProfile}
          latestResult={mockLapsedResult}
          metric="steps"
          language="en"
          onCommitMicroAction={vi.fn()}
          onNavigateToToday={vi.fn()}
        />
      );
      expect(html).toContain('Gentle Recovery Protocol');
      expect(html).toContain('BCT 8.7 Graded Tasks');
    });

    it('renders recovery screen in Arabic', () => {
      const html = renderToStaticMarkup(
        <RecoveryScreen
          profile={mockProfile}
          latestResult={mockLapsedResult}
          metric="steps"
          language="ar"
          onCommitMicroAction={vi.fn()}
          onNavigateToToday={vi.fn()}
        />
      );
      expect(html).toContain('بروتوكول التعافي التكيفي');
    });
  });

  describe('HistoryScreen', () => {
    it('renders empty history prompt when no records exist', () => {
      const html = renderToStaticMarkup(
        <HistoryScreen
          profile={mockProfile}
          historyResults={[]}
          metric="steps"
          language="en"
          onChangeMetric={vi.fn()}
          onNavigateToToday={vi.fn()}
          onNavigateToSettings={vi.fn()}
        />
      );
      expect(html).toContain('Behavioral History Log');
    });

    it('renders populated history with ladder rungs and return counts', () => {
      const html = renderToStaticMarkup(
        <HistoryScreen
          profile={mockProfile}
          historyResults={[mockResult, mockLapsedResult]}
          metric="steps"
          language="en"
          onChangeMetric={vi.fn()}
          onNavigateToToday={vi.fn()}
          onNavigateToSettings={vi.fn()}
        />
      );
      expect(html).toContain('Behavioral History Log');
      expect(html).toContain('2026-11-01');
      expect(html).toContain('2026-11-02');
    });

    it('renders history in Arabic', () => {
      const html = renderToStaticMarkup(
        <HistoryScreen
          profile={mockProfile}
          historyResults={[mockResult]}
          metric="steps"
          language="ar"
          onChangeMetric={vi.fn()}
          onNavigateToToday={vi.fn()}
          onNavigateToSettings={vi.fn()}
        />
      );
      expect(html).toContain('سجل السلوك التاريخي');
    });
  });

  describe('EvidenceScreen', () => {
    it('renders evidence screen in English with replay results and methodology disclosures', () => {
      const html = renderToStaticMarkup(<EvidenceScreen language="en" />);
      expect(html).toContain('Streak Fragility Replay');
      expect(html).toContain('TRUE BY DESIGN');
      expect(html).toContain('Methodology');
    });

    it('renders evidence screen in Arabic with unreviewed translation notice', () => {
      const html = renderToStaticMarkup(<EvidenceScreen language="ar" />);
      expect(html).toContain('هشاشة التتابع');
      expect(html).toContain('بحكم التصميم');
    });
  });

  describe('SettingsScreen', () => {
    it('renders settings options, synthetic journey loader, and data controls in English', () => {
      const html = renderToStaticMarkup(
        <SettingsScreen
          profile={mockProfile}
          quietHours={{ enabled: true, start: '22:00', end: '07:00' }}
          textSize="standard"
          language="en"
          onUpdateProfile={vi.fn()}
          onUpdateQuietHours={vi.fn()}
          onChangeTextSize={vi.fn()}
          onLoadSyntheticPersona={vi.fn()}
          onExportData={vi.fn()}
          onDeleteAllData={vi.fn()}
        />
      );
      expect(html).toContain('Settings &amp; Privacy Controls');
      expect(html).toContain('Tariq (Healthcare Shift Worker)');
      expect(html).toContain('Sarah (Working Parent)');
      expect(html).toContain('Export Browser Data (.json)');
      expect(html).toContain('Wipe All Data Permanently');
    });

    it('renders settings screen in Arabic', () => {
      const html = renderToStaticMarkup(
        <SettingsScreen
          profile={mockProfile}
          quietHours={{ enabled: true, start: '22:00', end: '07:00' }}
          textSize="standard"
          language="ar"
          onUpdateProfile={vi.fn()}
          onUpdateQuietHours={vi.fn()}
          onChangeTextSize={vi.fn()}
          onLoadSyntheticPersona={vi.fn()}
          onExportData={vi.fn()}
          onDeleteAllData={vi.fn()}
        />
      );
      expect(html).toContain('الإعدادات وضوابط الخصوصية');
      expect(html).toContain('تصدير بيانات المتصفح (.json)');
    });
  });

  describe('AboutScreen', () => {
    it('renders project context, non-clinical notice, and student authorship in English', () => {
      const html = renderToStaticMarkup(<AboutScreen language="en" />);
      expect(html).toContain('About WellSync');
      expect(html).toContain('Challenge 09: Sustaining Healthy Behaviors');
      expect(html).toContain('Ayesha Sutana');
      expect(html).toContain('B. Alence');
      expect(html).toContain('not affiliated with any commercial product named WellSync');
    });

    it('renders about screen in Arabic', () => {
      const html = renderToStaticMarkup(<AboutScreen language="ar" />);
      expect(html).toContain('عن WellSync والمصادر والاعتمادات');
    });
  });

  describe('OnboardingModal', () => {
    it('renders onboarding dialog in English', () => {
      const html = renderToStaticMarkup(
        <OnboardingModal
          initialProfile={mockProfile}
          language="en"
          onComplete={vi.fn()}
        />
      );
      expect(html).toContain('Welcome to WellSync');
      expect(html).toContain('Daily Step Target');
    });

    it('renders onboarding dialog in Arabic', () => {
      const html = renderToStaticMarkup(
        <OnboardingModal
          initialProfile={mockProfile}
          language="ar"
          onComplete={vi.fn()}
        />
      );
      expect(html).toContain('مرحباً بك في WellSync');
    });
  });
});

describe('Synthetic Demo Journeys Engine Smoke Tests', () => {
  it('correctly simulates Tariq (Healthcare Shift Worker) through baseline, shift lapse, and recovery', () => {
    const tariq = SYNTHETIC_PERSONAS.find((p) => p.id === 'tariq_shift_worker')!;
    expect(tariq).toBeDefined();

    const results = evaluateHistory(tariq.history, tariq.profile.userGoalSteps, 'steps');
    expect(results).toHaveLength(tariq.history.length);

    // Verify baseline days established (Days 1 - 14)
    const day14 = results[13];
    expect(day14.state).toBe('ON_TRACK');

    // Day 17 is the 3rd consecutive low night-shift day -> triggers LAPSED and ladder steps down to MINIMUM
    const day17 = results[16];
    expect(day17.consecutiveBelowPar).toBe(3);
    expect(day17.state).toBe('LAPSED');
    expect(day17.ladderLevel).toBe('MINIMUM');

    // Day 18 (first recovery walk on Minimum rung): target is 50% of baseline (~4,225 steps)
    const day18 = results[17];
    expect(day18.currentLadderTarget).toBe(Math.round(day18.baseline * 0.5));
    expect(day18.state).toBe('RECOVERING');
    expect(day18.consecutiveSuccessDays).toBe(1);

    // Day 19: Second success on Minimum
    const day19 = results[18];
    expect(day19.state).toBe('RECOVERING');
    expect(day19.consecutiveSuccessDays).toBe(2);

    // Day 20: 3rd success on Minimum completes recovery -> ON_TRACK, ladder steps up to TARGET, returnCount increments
    const day20 = results[19];
    expect(day20.state).toBe('ON_TRACK');
    expect(day20.returnCount).toBe(1);
    expect(day20.ladderLevel).toBe('TARGET');

    // Day 25: Resumption continues with returnCount preserved
    const finalDay = results[results.length - 1];
    expect(finalDay.returnCount).toBe(1);
  });

  it('correctly simulates Sarah (Working Parent) through travel disruption, minimum rung resumption, and slipping mean check', () => {
    const sarah = SYNTHETIC_PERSONAS.find((p) => p.id === 'sarah_parent')!;
    expect(sarah).toBeDefined();

    const results = evaluateHistory(sarah.history, sarah.profile.userGoalSteps, 'steps');
    expect(results).toHaveLength(sarah.history.length);

    // Day 11 is the 3rd low travel day -> LAPSED and steps down to MINIMUM
    const lapseDay = results[10];
    expect(lapseDay.state).toBe('LAPSED');
    expect(lapseDay.ladderLevel).toBe('MINIMUM');

    // Days 12, 13, 14: 3 recovery walks meeting Minimum rung (50% of baseline)
    const recDay3 = results[13];
    expect(recDay3.returnCount).toBe(1);
    expect(recDay3.ladderLevel).toBe('TARGET');

    // Final day: returnCount remains permanently recorded (never wiped or reset)
    const finalDay = results[results.length - 1];
    expect(finalDay.returnCount).toBe(1);
    // 7-day rolling mean correctly reflects recent low days (<80%)
    expect(finalDay.state).toBe('SLIPPING');
  });
});
