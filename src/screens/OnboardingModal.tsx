import React, { useState } from 'react';
import {
  Shield,
  Activity,
  Footprints,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { UserEngineProfile } from '../engine/types';
import { ContextModeType } from '../engine/contextModes';
import { Language, t } from '../i18n/translations';

interface OnboardingModalProps {
  initialProfile: UserEngineProfile;
  language: Language;
  onComplete: (
    profile: UserEngineProfile,
    initialContextMode?: ContextModeType,
    syncOptIn?: boolean
  ) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  language,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Goal Baseline
  const [stepGoal, setStepGoal] = useState<number>(initialProfile.userGoalSteps || 8000);
  const [sleepHours, setSleepHours] = useState<number>(
    Math.floor((initialProfile.userGoalSleepMinutes || 480) / 60)
  );
  const [sleepMinutesRemainder, setSleepMinutesRemainder] = useState<number>(
    (initialProfile.userGoalSleepMinutes || 480) % 60
  );

  // Step 2: Context Mode
  const [selectedContext, setSelectedContext] = useState<ContextModeType>('standard');

  // Step 3: Privacy & Pilot
  const [optInPilotSync, setOptInPilotSync] = useState<boolean>(false);

  const handleFinish = () => {
    const totalSleepMinutes = sleepHours * 60 + sleepMinutesRemainder;
    onComplete(
      {
        userGoalSteps: Math.max(1000, stepGoal),
        userGoalSleepMinutes: Math.max(120, totalSleepMinutes),
      },
      selectedContext,
      optInPilotSync
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-modal max-w-xl w-full p-6 sm:p-8 border border-ink-200 space-y-6">
        {/* Header & Step Indicator */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-ink-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest-700 text-white flex items-center justify-center shadow-card shrink-0">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-ink-900 tracking-tight">
                  {t('onboarding.welcome', language)}
                </h2>
                <span className="text-[11px] text-ink-500">
                  {language === 'ar' ? 'إعداد سريع في أقل من 60 ثانية' : 'Fast 60-Second Setup'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-forest-800 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
              <span>{language === 'ar' ? `الخطوة ${currentStep} من 3` : `Step ${currentStep} of 3`}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-ink-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-forest-600 h-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: GOAL BASELINE */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink-900 flex items-center gap-2">
                <Footprints className="w-4 h-4 text-forest-700" />
                <span>{language === 'ar' ? '1. حدد خط الأساس المبدئي' : '1. Set Your Initial Baseline Goal'}</span>
              </h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                {language === 'ar'
                  ? 'يبدأ النظام بهدفك المبدئي أثناء فترة التعلم (28 يوماً)، ثم يتكيف تلقائياً مع وتيرتك الفعلية.'
                  : 'WellSync uses this baseline while calibrating your rolling 28-day median, then adapts to your genuine rhythm.'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="onboardingStepGoalInput"
                  className="block text-xs font-bold text-ink-800 mb-1"
                >
                  {t('settings.step_goal', language)} ({t('today.steps_unit', language)})
                </label>
                <input
                  id="onboardingStepGoalInput"
                  type="number"
                  min="1000"
                  max="50000"
                  step="500"
                  value={stepGoal}
                  onChange={(e) => setStepGoal(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-sm font-semibold text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-800 mb-1">
                  {t('settings.sleep_goal', language)}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="onboardingSleepHoursInput"
                      type="number"
                      aria-label={t('today.sleep_hours_label', language)}
                      min="3"
                      max="14"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-sm font-semibold text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden"
                      required
                    />
                    <label htmlFor="onboardingSleepHoursInput" className="text-xs font-semibold text-ink-600">
                      {t('today.sleep_hours_label', language)}
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="onboardingSleepMinsInput"
                      type="number"
                      aria-label={t('today.sleep_mins_label', language)}
                      min="0"
                      max="59"
                      step="15"
                      value={sleepMinutesRemainder}
                      onChange={(e) => setSleepMinutesRemainder(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-sm font-semibold text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden"
                      required
                    />
                    <label htmlFor="onboardingSleepMinsInput" className="text-xs font-semibold text-ink-600">
                      {t('today.sleep_mins_label', language)}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-3 px-6 rounded-xl font-bold text-sm text-white bg-forest-700 hover:bg-forest-800 transition-all inline-flex items-center gap-2 shadow-card"
              >
                <span>{language === 'ar' ? 'التالي: سياق الحياة' : 'Next: Lifestyle Context'}</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: UAE CONTEXT ENGINE */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-forest-700" />
                <span>{language === 'ar' ? '2. سياق نمط الحياة والبيئة المحلية' : '2. Environmental & Work Context'}</span>
              </h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                {language === 'ar'
                  ? 'يتكيف WellSync مع المناوبات والحرارة والصيام حتى لا تتحول الظروف الطبيعية إلى تراجعات عقابية.'
                  : 'WellSync scales targets for shifts, summer heat, and fasting so normal circumstances do not trigger false lapses.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'standard',
                  title: language === 'ar' ? 'نمط قياسي (عادي)' : 'Standard Routine',
                  desc: language === 'ar' ? 'جدول يومي منتظم دون مناوبات ليلية' : 'Regular daily daytime routine',
                },
                {
                  id: 'shift_work',
                  title: language === 'ar' ? 'عمل بالمناوبات (طبي/حراسة)' : 'Shift-Work (Healthcare/Duty)',
                  desc: language === 'ar' ? 'تخفيض 40% بالمناوبة الليلية وإعفاء أيام التعافي' : '60% night shift target + recovery exemption',
                },
                {
                  id: 'ramadan',
                  title: language === 'ar' ? 'صيام شهر رمضان' : 'Ramadan Fasting',
                  desc: language === 'ar' ? 'تخفيض 30% وأوقات نشاط بعد الإفطار وقبل السحور' : '70% scaling + post-Iftar activity slots',
                },
                {
                  id: 'summer_heat',
                  title: language === 'ar' ? 'حرارة الصيف (يونيو - سبتمبر)' : 'Summer Heat Mode',
                  desc: language === 'ar' ? 'توجيه للمشي الداخلي بالمراكز المكيفة' : 'Mall walking & climate-controlled routes',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedContext(opt.id as ContextModeType)}
                  className={`p-3.5 rounded-2xl border text-start transition-all ${
                    selectedContext === opt.id
                      ? 'border-forest-600 bg-sage-50/70 font-semibold text-forest-950 ring-1 ring-forest-500/20'
                      : 'border-ink-200 hover:bg-ivory-50 text-ink-700'
                  }`}
                >
                  <div className="text-xs font-bold text-ink-900">{opt.title}</div>
                  <div className="text-[11px] text-ink-500 font-normal mt-1 leading-relaxed">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-ink-700 bg-ivory-100 hover:bg-ivory-200 transition-colors inline-flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{language === 'ar' ? 'السابق' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="py-3 px-6 rounded-xl font-bold text-sm text-white bg-forest-700 hover:bg-forest-800 transition-all inline-flex items-center gap-2 shadow-card"
              >
                <span>{language === 'ar' ? 'التالي: الخصوصية' : 'Next: Privacy Choice'}</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PRIVACY & PILOT OPT-IN */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-forest-700" />
                <span>{language === 'ar' ? '3. الخصوصية وسيادة بياناتك' : '3. Privacy & Pilot Choice'}</span>
              </h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                {language === 'ar'
                  ? 'بياناتك ملكك بالكامل ومحفوظة في متصفحك محلياً بشكل افتراضي بصفر نماذج ذكاء اصطناعي.'
                  : 'Your data is 100% local by default. All adaptation calculations run on your device with zero runtime AI.'}
              </p>
            </div>

            <div className="p-4 bg-ivory-50 rounded-2xl border border-ink-200 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{language === 'ar' ? 'محلي أولاً:' : 'Local-First Default:'}</strong>{' '}
                  {language === 'ar'
                    ? 'التطبيق يعمل بكامل كفاءته دون أي اتصال أو خوادم.'
                    : 'Works with 100% full feature parity offline.'}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{language === 'ar' ? 'صفر معرّفات شخصية:' : 'Zero PII:'}</strong>{' '}
                  {language === 'ar'
                    ? 'لا نطلب ولا نخزن بريدك أو هاتفك أو اسمك.'
                    : 'No email, phone number, or names are ever collected or stored.'}
                </span>
              </div>
            </div>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-ink-200 bg-white hover:bg-ivory-50 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={optInPilotSync}
                onChange={(e) => setOptInPilotSync(e.target.checked)}
                className="w-4 h-4 text-forest-700 rounded border-ink-300 focus:ring-forest-600 mt-0.5 shrink-0"
              />
              <span className="text-ink-700 leading-relaxed">
                <strong>{language === 'ar' ? 'المشاركة في دراسة البايلوت (اختياري):' : 'Opt-in to Pilot Research Study (Optional):'}</strong>{' '}
                {language === 'ar'
                  ? 'مزامنة مجهولة الهوية مشفرة لمعرف رمزي للمساعدة في تحسين خوارزميات الاستدامة الصحية.'
                  : 'Sync pseudonymous telemetry to help researchers evaluate habit resilience. Can be turned off anytime.'}
              </span>
            </label>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-ink-700 bg-ivory-100 hover:bg-ivory-200 transition-colors inline-flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{language === 'ar' ? 'السابق' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="py-3 px-6 rounded-xl font-bold text-sm text-white bg-forest-700 hover:bg-forest-800 transition-all inline-flex items-center gap-2 shadow-card"
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === 'ar' ? 'ابدأ مع WellSync' : 'Launch WellSync'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
