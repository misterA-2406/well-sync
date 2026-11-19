import React, { useState } from 'react';
import {
  Footprints,
  Moon,
  Calendar,
  TrendingUp,
  RotateCcw,
  CheckCircle,
  Coffee,
  Check,
} from 'lucide-react';
import { BehaviorMetric, DailyRecord, EngineDayResult, UserEngineProfile } from '../engine/types';
import { Language, t } from '../i18n/translations';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { ActivityChart } from '../components/ActivityChart';
import { TargetLadderCard } from '../components/TargetLadderCard';
import { RecoveryProgressCard } from '../components/RecoveryProgressCard';
import { ContextualGuidanceCard } from '../components/ContextualGuidanceCard';

interface TodayScreenProps {
  profile: UserEngineProfile;
  latestResult: EngineDayResult | null;
  metric: BehaviorMetric;
  language: Language;
  historyResults?: EngineDayResult[];
  onChangeMetric: (metric: BehaviorMetric) => void;
  onSaveRecord: (record: DailyRecord) => void;
  onNavigateToRecovery: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  profile,
  latestResult,
  metric,
  language,
  historyResults = [],
  onChangeMetric,
  onSaveRecord,
  onNavigateToRecovery,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(todayStr);
  const [stepsInput, setStepsInput] = useState<string>('');
  const [sleepHoursInput, setSleepHoursInput] = useState<string>('7');
  const [sleepMinsInput, setSleepMinsInput] = useState<string>('30');
  const [isRestDeclared, setIsRestDeclared] = useState<boolean>(false);
  const [contextNote, setContextNote] = useState<string>('');
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<boolean>(false);

  const baseline =
    latestResult?.baseline ??
    (metric === 'steps' ? profile.userGoalSteps : profile.userGoalSleepMinutes);
  const currentTargetVal = latestResult?.currentLadderTarget ?? baseline;
  const currentRung = latestResult?.ladderLevel ?? 'TARGET';

  // Find if today's entry was already logged in recent records
  const existingTodayRecord = historyResults.find((r) => r.date === date);
  const loggedActualVal = existingTodayRecord?.evaluation.actualValue ?? null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const record: DailyRecord = {
      date,
      steps: metric === 'steps' ? (stepsInput ? Number(stepsInput) : null) : undefined,
      sleepMinutes:
        metric === 'sleep'
          ? Number(sleepHoursInput || 0) * 60 + Number(sleepMinsInput || 0)
          : undefined,
      isRestDeclared,
      contextNote: contextNote.trim() || undefined,
    };

    onSaveRecord(record);
    setSavedSuccessMessage(true);
    setTimeout(() => setSavedSuccessMessage(false), 3000);
  };

  const handleAddPresetSteps = (increment: number) => {
    const current = Number(stepsInput) || 0;
    setStepsInput(String(current + increment));
    setIsRestDeclared(false);
  };

  const formatUnit = (val: number) => {
    if (metric === 'steps') return `${val.toLocaleString()} ${t('today.steps_unit', language)}`;
    const hrs = Math.floor(val / 60);
    const mins = val % 60;
    return `${hrs}h ${mins}m`;
  };

  // State-specific headline and tone
  const getStateBannerContent = () => {
    if (!latestResult || latestResult.isLearningBaseline) {
      return {
        title: language === 'ar' ? 'مرحلة التعرف على وتيرتك اليومية' : 'Learning Your Personal Rhythm',
        desc:
          language === 'ar'
            ? 'سجل نشاطك لـ 7 أيام لمعايرة خط الأساس التكيفي الخاص بك. خط الأساس يحميك من الأهداف التعسفية.'
            : 'Log your activity for 7 days to establish your personalized rolling baseline, protecting you from arbitrary targets.',
      };
    }
    switch (latestResult.state) {
      case 'ON_TRACK':
        return {
          title: language === 'ar' ? 'أنت تبني استمرارية بوتيرة تناسب حياتك' : 'Building Consistency at a Sustainable Pace',
          desc:
            language === 'ar'
              ? 'أداؤك متوازن وثابت. تذكر أن هدفنا الاستمرارية دون إجهاد.'
              : "You're building consistency at a pace that works. Sustainable habits outlast rigid perfection.",
        };
      case 'SLIPPING':
        return {
          title: language === 'ar' ? 'انخفاض طفيف في الوتيرة — تدرج بلطف' : 'Gentle Pace Adjustment Recommended',
          desc:
            language === 'ar'
              ? 'لاحظ المحرك انخفاضاً طفيفاً مؤخراً. يمكنك استكشاف خطوة مصغرة لتيسير يومك.'
              : 'Your recent activity has been lower. It may help to make today’s goal a little easier with a micro-action.',
        };
      case 'LAPSED':
        return {
          title: language === 'ar' ? 'تراجع مؤقت — تدرج للأسفل ولا تستسلم' : "Life Happens. Step Down, Don't Quit",
          desc:
            language === 'ar'
              ? 'تم خفض هدفك تلقائياً إلى 50% كدرجة أمان. لن تخسر أي يوم من إنجازاتك المتراكمة.'
              : 'Your target has stepped down to 50% to maintain continuity without pressure. Zero progress is lost.',
        };
      case 'RECOVERING':
        return {
          title: language === 'ar' ? 'أنت تستعيد وتيرتك بثبات' : 'Finding Your Rhythm Again',
          desc:
            language === 'ar'
              ? 'إنجاز 3 أيام متتالية على الهدف الأدنى يعيدك تلقائياً للهدف الأساسي ويضيف عودة جديدة.'
              : 'Completing 3 consecutive days on your Minimum rung restores your Target and increments your Return Count.',
        };
    }
  };

  const stateBanner = getStateBannerContent();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* SECTION 1: HERO & TODAY'S OVERVIEW */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                state={latestResult?.state ?? 'LEARNING'}
                isLearningBaseline={latestResult?.isLearningBaseline}
                learningDayIndex={(latestResult?.activeDays ?? 0) + 1}
                recoveryDayIndex={latestResult?.consecutiveSuccessDays ?? 0}
                language={language}
                size="md"
              />
              <span className="text-xs font-semibold text-ink-500 bg-ivory-100 border border-ink-200 px-3 py-1 rounded-full">
                {currentRung === 'MINIMUM'
                  ? t('ladder.minimum', language)
                  : currentRung === 'STRETCH'
                  ? t('ladder.stretch', language)
                  : t('ladder.target', language)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight leading-tight">
              {t('nav.today', language)}: {stateBanner.title}
            </h1>

            <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
              {stateBanner.desc}
            </p>
          </div>

          {/* Metric Selector & Active Target Callout */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            {/* Behavior Switcher Pills */}
            <div
              className="inline-flex bg-ivory-100 p-1 rounded-2xl border border-ink-200"
              role="tablist"
              aria-label="Behavior Metric Switcher"
            >
              <button
                type="button"
                role="tab"
                aria-selected={metric === 'steps'}
                onClick={() => onChangeMetric('steps')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                  metric === 'steps'
                    ? 'bg-white shadow-card text-forest-900 font-extrabold'
                    : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                <Footprints className="w-4 h-4 text-forest-700" />
                <span>{t('today.steps', language)}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={metric === 'sleep'}
                onClick={() => onChangeMetric('sleep')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                  metric === 'sleep'
                    ? 'bg-white shadow-card text-forest-900 font-extrabold'
                    : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                <Moon className="w-4 h-4 text-forest-700" />
                <span>{t('today.sleep', language)}</span>
              </button>
            </div>

            {/* Active Target Banner */}
            <div className="bg-forest-50/70 border border-forest-200/90 rounded-2xl p-4 w-full sm:w-auto text-start lg:text-end">
              <span className="text-[11px] font-semibold text-forest-700 uppercase tracking-wider block">
                {language === 'ar' ? 'الهدف النشط لليوم' : "Today's Active Target"}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-forest-900 tracking-tight mt-0.5">
                {formatUnit(currentTargetVal)}
              </div>
              <span className="text-[11px] text-forest-700 block mt-0.5">
                {currentRung === 'MINIMUM' && (language === 'ar' ? 'درجة أمان ميسرة (50%)' : 'Low-friction 50% rung')}
                {currentRung === 'TARGET' && (language === 'ar' ? 'الهدف المتوازن الأساسي' : 'Standard target rung')}
                {currentRung === 'STRETCH' && (language === 'ar' ? 'المستوى الموسع (+10%)' : 'Optional stretch (+10%)')}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar if activity logged for today */}
        {loggedActualVal !== null && (
          <div className="mt-6 pt-5 border-t border-ink-100">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-forest-600" />
                <span>
                  {language === 'ar' ? 'النشاط المسجل لليوم' : "Today's Logged Activity"}:{' '}
                  <strong className="text-ink-900 font-bold">{formatUnit(loggedActualVal)}</strong>
                </span>
              </span>
              <span className="text-forest-700 font-bold">
                {Math.round((loggedActualVal / currentTargetVal) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-ivory-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-forest-600 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, Math.round((loggedActualVal / currentTargetVal) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: RECOVERY BANNER (When Lapsed or Slipping) */}
      {latestResult && (latestResult.state === 'LAPSED' || latestResult.state === 'RECOVERING') && (
        <RecoveryProgressCard
          consecutiveSuccessDays={latestResult.consecutiveSuccessDays}
          minimumTarget={latestResult.ladderTargets.minimum}
          unit={metric === 'steps' ? t('today.steps_unit', language) : t('today.sleep_unit', language)}
          language={language}
          onNavigateToRecovery={onNavigateToRecovery}
        />
      )}

      {/* SECTION 3: STREAK-FREE RESILIENCE METRICS HUD */}
      <section aria-label="Core Resilience Metrics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            label={t('today.active_days', language)}
            value={latestResult?.activeDays ?? 0}
            subtext={language === 'ar' ? 'إجمالي الأيام المنجزة. لا يعاد للصفر مطلقاً.' : 'Total days met. Never resets to zero upon disruption.'}
            icon={<Calendar className="w-4 h-4 text-forest-700" />}
            iconBgColor="bg-forest-100 text-forest-800"
            valueColorClass="text-forest-900"
            highlight={true}
          />

          <MetricCard
            label={t('today.return_count', language)}
            value={latestResult?.returnCount ?? 0}
            subtext={language === 'ar' ? 'مرات استعادة العادة بعد تعثر. مقياس الصمود الحقيقي.' : 'Habit resumptions completed. Our measure of true resilience.'}
            icon={<RotateCcw className="w-4 h-4 text-forest-700" />}
            iconBgColor="bg-[#D9F0F2] text-[#1B5E6B]"
            valueColorClass="text-[#144751]"
          />

          <MetricCard
            label={t('today.current_baseline', language)}
            value={baseline.toLocaleString()}
            unit={metric === 'steps' ? t('today.steps_unit', language) : t('today.sleep_unit', language)}
            subtext={
              latestResult?.isColdStart
                ? (language === 'ar' ? 'هدف المستخدم المبدئي (مرحلة التعلم)' : 'Declared goal (cold start calibration)')
                : (language === 'ar' ? 'وسيط آخر 28 يوماً مع حماية من التلوث' : '28-day rolling median (contamination-free)')
            }
            icon={<TrendingUp className="w-4 h-4 text-forest-700" />}
            iconBgColor="bg-sand-100 text-sand-800"
            valueColorClass="text-ink-900"
          />

          <MetricCard
            label={language === 'ar' ? 'أيام الإنجاز المتتالية' : 'Success Streak'}
            value={latestResult?.consecutiveSuccessDays ?? 0}
            subtext={
              currentRung === 'MINIMUM'
                ? (language === 'ar' ? 'في المستوى الأدنى (3 أيام للترقية)' : 'On Minimum rung (3 days steps up)')
                : (language === 'ar' ? 'على الدرجة النشطة' : 'On active target rung')
            }
            icon={<CheckCircle className="w-4 h-4 text-forest-700" />}
            iconBgColor="bg-sage-100 text-forest-800"
            valueColorClass="text-forest-900"
          />
        </div>
      </section>

      {/* SECTION 4: 7-DAY RECENT ACTIVITY RHYTHM CHART */}
      <section aria-label="Recent Activity Chart">
        <ActivityChart
          historyResults={historyResults}
          metric={metric}
          currentTarget={currentTargetVal}
          language={language}
        />
      </section>

      {/* SECTION 5: DAILY CHECK-IN & CONTEXTUAL GUIDANCE */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Daily Check-In Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-ink-200 shadow-card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-ink-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-forest-600" />
                <span>{t('today.checkin_title', language)}</span>
              </h2>
              <p className="text-xs text-ink-500 mt-0.5">
                {language === 'ar'
                  ? 'سجل نشاطك الحقيقي بسهولة. لن تواجه أي رسائل لوم أو توبيخ.'
                  : 'Log your real activity effortlessly. No shaming, no judgment.'}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-forest-700 bg-forest-50 border border-forest-200 px-2.5 py-1 rounded-full">
              {t('nav.guest_sub', language)}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Date Input */}
            <div>
              <label htmlFor="todayDateInput" className="block text-xs font-bold text-ink-700 mb-1">
                {t('today.date_label', language)}
              </label>
              <input
                id="todayDateInput"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-sm font-medium text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden transition-all"
                required
              />
            </div>

            {/* Metric Input (Steps vs Sleep) */}
            {metric === 'steps' ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="todayStepsInput" className="text-xs font-bold text-ink-700">
                    {t('today.step_count_label', language)}
                  </label>
                  <span className="text-xs font-medium text-ink-500">
                    {t('today.current_rung', language)}: <strong className="text-forest-700">{currentTargetVal.toLocaleString()}</strong>
                  </span>
                </div>

                <input
                  id="todayStepsInput"
                  type="number"
                  min="0"
                  max="100000"
                  placeholder="e.g. 7,500"
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-sm font-medium text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden transition-all disabled:opacity-50"
                  disabled={isRestDeclared}
                />

                {/* Quick Increment Buttons */}
                {!isRestDeclared && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-ink-400 font-medium me-1">
                      {language === 'ar' ? 'إضافة سريعة:' : 'Quick add:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddPresetSteps(1000)}
                      className="px-2 py-1 rounded-lg text-xs font-semibold bg-ivory-100 hover:bg-sage-100 text-forest-800 border border-ink-200 transition-colors"
                    >
                      +1,000
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetSteps(2000)}
                      className="px-2 py-1 rounded-lg text-xs font-semibold bg-ivory-100 hover:bg-sage-100 text-forest-800 border border-ink-200 transition-colors"
                    >
                      +2,000
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetSteps(5000)}
                      className="px-2 py-1 rounded-lg text-xs font-semibold bg-ivory-100 hover:bg-sage-100 text-forest-800 border border-ink-200 transition-colors"
                    >
                      +5,000
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-ink-700">
                    {t('today.sleep', language)}
                  </label>
                  <span className="text-xs font-medium text-ink-500">
                    {t('today.current_rung', language)}: <strong className="text-forest-700">{Math.floor(currentTargetVal / 60)}h {currentTargetVal % 60}m</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="todaySleepHoursInput"
                      type="number"
                      aria-label={t('today.sleep_hours_label', language)}
                      min="0"
                      max="24"
                      value={sleepHoursInput}
                      onChange={(e) => setSleepHoursInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-sm font-medium text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden transition-all disabled:opacity-50"
                      disabled={isRestDeclared}
                    />
                    <label htmlFor="todaySleepHoursInput" className="text-xs font-semibold text-ink-600">
                      {t('today.sleep_hours_label', language)}
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="todaySleepMinsInput"
                      type="number"
                      aria-label={t('today.sleep_mins_label', language)}
                      min="0"
                      max="59"
                      step="5"
                      value={sleepMinsInput}
                      onChange={(e) => setSleepMinsInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-sm font-medium text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden transition-all disabled:opacity-50"
                      disabled={isRestDeclared}
                    />
                    <label htmlFor="todaySleepMinsInput" className="text-xs font-semibold text-ink-600">
                      {t('today.sleep_mins_label', language)}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Planned Rest Checkbox */}
            <div className="p-3 bg-ivory-50 rounded-xl border border-ink-200/70 flex items-center gap-2.5">
              <input
                type="checkbox"
                id="restDeclared"
                checked={isRestDeclared}
                onChange={(e) => setIsRestDeclared(e.target.checked)}
                className="w-4 h-4 rounded text-forest-700 focus:ring-forest-500 border-ink-300"
              />
              <label htmlFor="restDeclared" className="text-xs font-semibold text-ink-700 select-none cursor-pointer flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-forest-700" />
                <span>{t('today.rest_day_label', language)}</span>
              </label>
            </div>

            {/* Context Note Input */}
            <div>
              <label htmlFor="todayContextNoteInput" className="block text-xs font-bold text-ink-700 mb-1">
                {t('today.context_note_label', language)}
              </label>
              <input
                id="todayContextNoteInput"
                type="text"
                maxLength={100}
                placeholder={t('today.context_note_placeholder', language)}
                value={contextNote}
                onChange={(e) => setContextNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-xs sm:text-sm font-medium text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-forest-700 hover:bg-forest-800 active:scale-[0.99] transition-all shadow-card focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600"
            >
              {t('today.checkin_cta', language)}
            </button>

            {/* Animated Feedback */}
            {savedSuccessMessage && (
              <div className="p-2.5 bg-sage-100/80 border border-forest-200 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-forest-800 animate-fade-in">
                <Check className="w-4 h-4 text-forest-600 stroke-[3]" />
                <span>{t('today.saved_success', language)}</span>
              </div>
            )}
          </form>
        </div>

        {/* Contextual Guidance Component (BCT Card Redesigned) */}
        <ContextualGuidanceCard
          latestResult={latestResult}
          language={language}
          onNavigateToRecovery={onNavigateToRecovery}
        />
      </section>

      {/* SECTION 6: ADAPTIVE TARGET LADDER */}
      <section aria-label="Adaptive Target Ladder">
        <TargetLadderCard
          latestResult={latestResult}
          defaultGoal={profile.userGoalSteps}
          metric={metric}
          language={language}
        />
      </section>
    </div>
  );
};
