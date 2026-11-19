import React, { useState } from 'react';
import {
  RotateCcw,
  HelpCircle,
  ArrowRight,
  XCircle,
  HeartHandshake,
  Shield,
  Sparkles,
  Check,
  Undo2,
} from 'lucide-react';
import { BehaviorMetric, EngineDayResult, UserEngineProfile } from '../engine/types';
import { Language, t } from '../i18n/translations';

interface RecoveryScreenProps {
  profile: UserEngineProfile;
  latestResult: EngineDayResult | null;
  metric: BehaviorMetric;
  language: Language;
  rejectedHypotheses?: Record<string, boolean>;
  completedRecoveryStrategies?: string[];
  activeRecoveryCommitment?: { text: string; selectedDate: string } | string | null;
  successfulStrategies?: string[];
  onToggleRejectHypothesis?: (id: string) => void;
  onCommitMicroAction: (commitmentText: string) => void;
  onNavigateToToday: () => void;
}

export const RecoveryScreen: React.FC<RecoveryScreenProps> = ({
  profile,
  latestResult,
  metric,
  language,
  rejectedHypotheses = {},
  completedRecoveryStrategies = [],
  activeRecoveryCommitment = null,
  successfulStrategies = [],
  onToggleRejectHypothesis,
  onCommitMicroAction,
  onNavigateToToday,
}) => {
  const [selectedCommitment, setSelectedCommitment] = useState<string>('');
  const [customCommitment, setCustomCommitment] = useState<string>('');
  const [localRejected, setLocalRejected] = useState<Record<string, boolean>>({});
  const [committedSuccess, setCommittedSuccess] = useState<boolean>(false);

  // Merge parent persistent rejections with local
  const effectiveRejections = { ...rejectedHypotheses, ...localRejected };

  // Use completedRecoveryStrategies if available, falling back to legacy successfulStrategies
  const pastStrategies =
    completedRecoveryStrategies.length > 0
      ? completedRecoveryStrategies
      : successfulStrategies;

  const activeCommitmentText =
    typeof activeRecoveryCommitment === 'string'
      ? activeRecoveryCommitment
      : activeRecoveryCommitment?.text ?? null;

  const baseline =
    latestResult?.baseline ??
    (metric === 'steps' ? profile.userGoalSteps : profile.userGoalSleepMinutes);
  const minimumTarget =
    latestResult?.ladderTargets.minimum ?? Math.round(baseline * 0.5);
  const targetVal =
    latestResult?.ladderTargets.target ??
    (metric === 'steps' ? profile.userGoalSteps : profile.userGoalSleepMinutes);
  const stretchVal =
    latestResult?.ladderTargets.stretch ?? Math.round(targetVal * 1.1);

  const consecutiveSuccesses = latestResult?.consecutiveSuccessDays ?? 0;

  const defaultStepActions =
    language === 'ar'
      ? [
          'المشي الخفيف لمدة 10 دقائق بعد الوجبة الرئيسية مباشرة',
          'المشي دورة واحدة حول الحي قبل بدء فترة الراحة المسائية',
          'ركن السيارة على بعد 500 متر أو صعود الدرج مرتين اليوم',
          'المشي في المكان داخل المنزل لمدة 5 دقائق أثناء المكالمات الهاتفية',
        ]
      : [
          'Take a 10-minute walk right after my main meal',
          'Walk around the block once before starting evening relaxation',
          'Park 500 meters further away or take the stairs twice today',
          'Do a 5-minute indoor movement pacing session during phone calls',
        ];

  const defaultSleepActions =
    language === 'ar'
      ? [
          'ترك الشاشات والهواتف قبل 30 دقيقة من موعد النوم المحدد',
          'بدء روتين استرخاء هادئ في إضاءة خافتة لمدة 15 دقيقة',
          'تعتيم إضاءة الغرفة وتفعيل وضع "عدم الإزعاج" على الهاتف في الـ 10 مساءً',
          'الحفاظ على غرفة النوم باردة ومظلمة لتحقيق نوم مستقر',
        ]
      : [
          'Put screens away 30 minutes before intended bedtime',
          'Establish a calm 15-minute dim-light wind-down routine',
          'Dim overhead room lights and set phone to Do Not Disturb at 10 PM',
          'Keep bedroom cool and dark for sleep consistency',
        ];

  const commitmentChoices =
    metric === 'steps' ? defaultStepActions : defaultSleepActions;

  const handleRejectHypothesis = (id: string) => {
    if (onToggleRejectHypothesis) {
      onToggleRejectHypothesis(id);
    } else {
      setLocalRejected((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    }
  };

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault();
    const action = customCommitment.trim() || selectedCommitment;
    if (action) {
      onCommitMicroAction(action);
      setCommittedSuccess(true);
      setTimeout(() => {
        setCommittedSuccess(false);
        onNavigateToToday();
      }, 1500);
    }
  };

  const formatUnit = (val: number) => {
    if (metric === 'steps') return `${val.toLocaleString()} ${t('today.steps_unit', language)}`;
    const hrs = Math.floor(val / 60);
    const mins = val % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. HERO CARD: EMPATHETIC, GENTLE PROTOCOL */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-forest-50 border border-forest-200 text-forest-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-forest-100 text-forest-900 border border-forest-300">
                <Shield className="w-3.5 h-3.5 text-forest-700" />
                <span>{language === 'ar' ? 'بروتوكول التعافي التكيفي' : 'Gentle Recovery Protocol'}</span>
              </span>
              <span className="text-xs text-ink-500 font-medium">
                BCT 8.7 Graded Tasks &amp; BCT 1.4 Action Planning
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
              {language === 'ar' ? 'ظروف الحياة تتغير. تدرج للأسفل ولا تستسلم.' : "Life Happens. Step Down, Don't Quit."}
            </h1>

            <p className="text-xs sm:text-sm text-ink-600 leading-relaxed max-w-3xl">
              {language === 'ar'
                ? 'التحديات، المرض، تغير المناوبات، والسفر هي أجزاء طبيعية من حياة الإنسان. نظام WellSync لا يعيد أيامك المنجزة للصفر مطلقاً. بدلاً من ذلك، يتدرج الهدف تلقائياً إلى المستوى الأدنى (50% من خط الأساس) لتستمر دون احتراق أو إحباط.'
                : 'Disruptions, illness, shifts, and travel are normal parts of human life. WellSync never resets your progress to zero. Instead, your target steps down to a low-friction Minimum Rung (50% of your baseline) so you maintain habit continuity without burnout.'}
            </p>
          </div>
        </div>

        {/* 3-Step Recovery Milestone Progress Segment */}
        <div className="mt-8 pt-6 border-t border-ink-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-ink-800">
              {language === 'ar' ? 'محطة التعافي التكيفية (3 أيام متتالية):' : 'Adaptive Recovery Milestone (3 consecutive days):'}
            </span>
            <span className="text-xs font-extrabold text-forest-700">
              {consecutiveSuccesses} / 3 {language === 'ar' ? 'أيام منجزة' : 'days achieved'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[1, 2, 3].map((step) => {
              const isDone = consecutiveSuccesses >= step;
              const isNow = consecutiveSuccesses === step - 1;

              return (
                <div
                  key={step}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isDone
                      ? 'bg-sage-100/90 border-forest-300 text-forest-900'
                      : isNow
                      ? 'bg-white border-2 border-forest-700 text-ink-900 shadow-card'
                      : 'bg-ivory-50 border-ink-200 text-ink-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    {isDone ? (
                      <div className="w-4 h-4 rounded-full bg-forest-700 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : (
                      <span className="text-xs font-bold">{step}</span>
                    )}
                    <span className="text-xs font-bold">
                      {language === 'ar' ? `اليوم ${step}` : `Day ${step}`}
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-500 block">
                    {isDone
                      ? (language === 'ar' ? 'تم الإنجاز' : 'Completed')
                      : isNow
                      ? (language === 'ar' ? 'الهدف النشط' : 'Active today')
                      : (language === 'ar' ? 'قادم' : 'Upcoming')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step-Down Ladder Spotlight */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl border-2 border-forest-600 bg-sage-50/70 relative shadow-card">
            <span className="absolute -top-2.5 start-3 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-forest-700 text-white tracking-wider shadow-xs">
              {language === 'ar' ? 'التركيز النشط للتعافي' : 'Active Recovery Focus'}
            </span>
            <div className="text-xs font-bold text-forest-900">{t('ladder.minimum', language)} (50%)</div>
            <div className="text-2xl font-black text-forest-950 mt-1">
              {formatUnit(minimumTarget)}
            </div>
            <p className="text-[11px] text-forest-800 mt-1 leading-snug">
              {language === 'ar' ? 'هدف ميسر مصمم للحفاظ على هويتك السلوكية اليوم دون إرهاق.' : 'Low-friction target designed to preserve your habit identity today.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-ink-200 bg-ivory-50 opacity-75">
            <div className="text-xs font-bold text-ink-700">{t('ladder.target', language)} (100%)</div>
            <div className="text-xl font-bold text-ink-900 mt-1">
              {formatUnit(targetVal)}
            </div>
            <p className="text-[11px] text-ink-500 mt-1 leading-snug">
              {language === 'ar' ? 'يعود الهدف تلقائياً إلى هذا المستوى بعد 3 أيام إنجاز متتالية.' : 'Steps back up here automatically after 3 consecutive successful days.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-ink-200 bg-ivory-50 opacity-75">
            <div className="text-xs font-bold text-ink-700">{t('ladder.stretch', language)} (110%)</div>
            <div className="text-xl font-bold text-ink-900 mt-1">
              {formatUnit(stretchVal)}
            </div>
            <p className="text-[11px] text-ink-500 mt-1 leading-snug">
              {language === 'ar' ? 'تحدٍ اختياري للأيام التي تشعر فيها بنشاط وفائض طاقة.' : 'Optional challenge for days when you have surplus energy.'}
            </p>
          </div>
        </div>
      </section>

      {/* 2. BARRIER HYPOTHESES (Mechanical, Rule-Based, User Veto Rights) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-ink-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-forest-700" />
              <span>{t('recovery.hypotheses_title', language)}</span>
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              {t('recovery.hypotheses_desc', language)}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-ink-500 bg-ivory-100 border border-ink-200 px-2.5 py-1 rounded-full self-start sm:self-auto">
            {language === 'ar' ? 'غير سريرية • قابلة للرفض بالكامل' : 'Non-medical • Fully Rejectable'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {latestResult?.barrierHypotheses.map((hypothesis) => {
            const isRejected = Boolean(effectiveRejections[hypothesis.id]);

            return (
              <div
                key={hypothesis.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isRejected
                    ? 'border-ink-200 bg-ivory-100 opacity-60'
                    : hypothesis.detected
                    ? 'border-forest-300 bg-sage-50/60 shadow-xs'
                    : 'border-ink-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {hypothesis.detected && !isRejected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-forest-600 animate-pulse shrink-0" />
                    )}
                    <h3 className={`text-xs font-bold ${isRejected ? 'text-ink-400 line-through' : 'text-ink-900'}`}>
                      {hypothesis.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRejectHypothesis(hypothesis.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-500 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-ivory-100 border border-transparent hover:border-ink-200 transition-colors"
                  >
                    {isRejected ? (
                      <>
                        <Undo2 className="w-3 h-3" />
                        <span>{language === 'ar' ? 'إلغاء الرفض' : 'Undo Rejection'}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-rose-500" />
                        <span>{language === 'ar' ? 'رفض الفرضية' : 'Reject'}</span>
                      </>
                    )}
                  </button>
                </div>

                <p className={`text-xs ${isRejected ? 'text-ink-400' : 'text-ink-600'} leading-relaxed`}>
                  {hypothesis.description}
                </p>

                {isRejected && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-ink-500 font-medium">
                    <XCircle className="w-3 h-3 text-ink-400" />
                    {language === 'ar' ? 'تم الرفض من قبلك — تم استبعادها من المحرك' : 'Rejected by you — disregarded by engine'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. ACTION PLANNING (BCT 1.4 Action Planning & Habit Memory) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card space-y-5">
        <div className="pb-3 border-b border-ink-100">
          <h2 className="text-base sm:text-lg font-bold text-ink-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-forest-700" />
            <span>{t('recovery.micro_action_title', language)}</span>
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            {language === 'ar'
              ? 'حدد إجراءً صغيراً ومحدداً لإنجاز هدفك الأدنى اليوم. التخطيط المسبق للإجراءات يمنع التسويف دون ضغوط.'
              : 'Select one tiny, specific action to accomplish your Minimum target today. Action planning prevents procrastination without pressure.'}
          </p>
        </div>

        {/* Active Commitment In-Progress Pill */}
        {activeCommitmentText && (
          <div className="p-4 bg-[#EBF7F9] border border-[#BDE3E8] rounded-2xl flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-[#D4EFF3] text-[#1B5E6B] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#144751] block mb-0.5">
                {language === 'ar' ? 'الالتزام الحالي قيد التنفيذ:' : 'Active Micro-Action Commitment:'}
              </span>
              <p className="text-xs sm:text-sm text-ink-900 font-bold">"{activeCommitmentText}"</p>
              <p className="text-[11px] text-[#1B5E6B] mt-1">
                {language === 'ar'
                  ? 'سيتم توثيق هذا الإجراء تلقائياً في سجل استراتيجياتك الناجحة عند إتمام دورة التعافي (3 أيام متتالية).'
                  : 'This action will be archived as a completed recovery strategy once your 3-day recovery ladder completes.'}
              </p>
            </div>
          </div>
        )}

        {/* Past Successful Observational Strategies */}
        {pastStrategies && pastStrategies.length > 0 && (
          <div className="p-4 bg-sage-50/70 border border-forest-200 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>★</span>
              <span>
                {language === 'ar'
                  ? 'استراتيجيات ارتبطت بعودتك للنشاط سابقاً (ملاحظة تاريخية غير سريرية):'
                  : 'Strategies Used During Completed Past Recoveries (Observational History):'}
              </span>
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {pastStrategies.map((strat, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => {
                    setSelectedCommitment(strat);
                    setCustomCommitment('');
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                    selectedCommitment === strat && !customCommitment
                      ? 'bg-forest-700 text-white border-forest-700 shadow-card'
                      : 'bg-white text-forest-800 border-forest-300 hover:bg-forest-50'
                  }`}
                >
                  {strat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Radio Selection Choices */}
        <form onSubmit={handleCommit} className="space-y-4">
          <div className="space-y-2">
            {commitmentChoices.map((choice, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                  selectedCommitment === choice && !customCommitment
                    ? 'border-forest-600 bg-sage-50/70 text-forest-950 font-bold shadow-xs'
                    : 'border-ink-200 hover:bg-ivory-50 text-ink-700'
                }`}
              >
                <input
                  type="radio"
                  name="microAction"
                  checked={selectedCommitment === choice && !customCommitment}
                  onChange={() => {
                    setSelectedCommitment(choice);
                    setCustomCommitment('');
                  }}
                  className="w-4 h-4 text-forest-700 focus:ring-forest-600 border-ink-300 mt-0.5"
                />
                <span className="leading-relaxed">{choice}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1">
              {language === 'ar' ? 'أو اكتب خطوتك المصغرة الخاصة:' : 'Or write your own custom micro-action:'}
            </label>
            <input
              type="text"
              placeholder={language === 'ar' ? 'مثال: المشي إلى البقالة بدلاً من قيادة السيارة' : 'e.g., Walk to the grocery store instead of driving'}
              value={customCommitment}
              onChange={(e) => {
                setCustomCommitment(e.target.value);
                setSelectedCommitment('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-xs sm:text-sm font-medium text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden transition-all"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="submit"
              disabled={!selectedCommitment && !customCommitment}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs sm:text-sm text-white bg-forest-700 hover:bg-forest-800 active:scale-[0.99] transition-all shadow-card disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600"
            >
              <span>{t('recovery.commit_btn', language)}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>

            {committedSuccess && (
              <span className="text-xs font-bold text-forest-800 animate-fade-in flex items-center gap-1.5">
                <Check className="w-4 h-4 text-forest-600 stroke-[3]" />
                <span>{language === 'ar' ? 'تم حفظ الالتزام في خطة اليوم!' : 'Commitment saved to today\'s plan!'}</span>
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
};
