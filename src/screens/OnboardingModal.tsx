import React, { useState } from 'react';
import { Shield, Activity, Moon, Footprints, CheckCircle2 } from 'lucide-react';
import { UserEngineProfile } from '../engine/types';
import { Language, t } from '../i18n/translations';

interface OnboardingModalProps {
  initialProfile: UserEngineProfile;
  language: Language;
  onComplete: (profile: UserEngineProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  language,
  onComplete,
}) => {
  const [stepGoal, setStepGoal] = useState<number>(initialProfile.userGoalSteps || 8000);
  const [sleepHours, setSleepHours] = useState<number>(
    Math.floor((initialProfile.userGoalSleepMinutes || 480) / 60)
  );
  const [sleepMinutesRemainder, setSleepMinutesRemainder] = useState<number>(
    (initialProfile.userGoalSleepMinutes || 480) % 60
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSleepMinutes = sleepHours * 60 + sleepMinutesRemainder;
    onComplete({
      userGoalSteps: Math.max(1000, stepGoal),
      userGoalSleepMinutes: Math.max(120, totalSleepMinutes),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-modal max-w-xl w-full p-6 sm:p-8 border border-ink-200 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-ink-100">
          <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white flex items-center justify-center shadow-card shrink-0">
            <Activity className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink-900 tracking-tight">
              {t('onboarding.welcome', language)}
            </h2>
            <p className="text-xs sm:text-sm text-ink-500 mt-0.5">
              {t('onboarding.subtitle', language)}
            </p>
          </div>
        </div>

        {/* How It Works Explainer Card */}
        <div className="bg-ivory-50 border border-ink-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
          <h3 className="text-xs font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-forest-700" />
            <span>{language === 'ar' ? 'كيف يعمل نظام WellSync' : 'How WellSync Works'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-ink-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-ink-900">{language === 'ar' ? 'خط الأساس الشخصي:' : 'Personal Baseline:'}</strong>{' '}
                {language === 'ar'
                  ? 'يتم احتسابه من وسيط آخر 28 يوماً، ويبدأ من هدفك أثناء التعلم.'
                  : 'Calibrates to your rolling 28-day median. Starts from your goal while learning.'}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-ink-900">{language === 'ar' ? 'السلم التكيفي:' : 'Step-Down Ladder:'}</strong>{' '}
                {language === 'ar'
                  ? 'عند التراجع، يخفض الهدف إلى 50% بدلاً من تصفير أيام تقدمك.'
                  : 'Missing days steps your target down to 50% instead of resetting streaks to zero.'}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-ink-900">{language === 'ar' ? 'مرات العودة:' : 'Return Count:'}</strong>{' '}
                {language === 'ar'
                  ? 'نحتفي بكل عودة ناجحة بعد تعثر. أيامك النشطة تتراكم دائماً.'
                  : 'We count every successful return. You never lose your accumulated active days.'}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-ink-900">{language === 'ar' ? 'خصوصية مطلقة:' : 'Total Privacy:'}</strong>{' '}
                {language === 'ar'
                  ? 'يعمل 100% داخل متصفحك. بدون حسابات وبدون أي اتصالات خارجية.'
                  : 'Runs 100% in your browser. No account, no login, zero network calls.'}
              </span>
            </div>
          </div>
        </div>

        {/* Goal Setting Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Daily Step Target */}
          <div>
            <label
              htmlFor="onboardingStepGoalInput"
              className="block text-xs sm:text-sm font-bold text-ink-900 mb-1.5 flex items-center gap-1.5"
            >
              <Footprints className="w-4 h-4 text-forest-700" />
              <span>{t('settings.step_goal', language)}</span>
              <span className="text-xs font-normal text-ink-500">({t('today.steps_unit', language)})</span>
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
            <p className="text-[11px] text-ink-500 mt-1">
              {language === 'ar'
                ? 'أهداف شائعة: 6,000 خطوة للمبتدئين، 8,000 خطوة للنشاط المعتدل، 10,000 خطوة لنشاط عالٍ.'
                : 'Common goals: 6,000 for beginner maintenance, 8,000 for regular activity, 10,000 for high movement.'}
            </p>
          </div>

          {/* Daily Sleep Target */}
          <div>
            <span className="block text-xs sm:text-sm font-bold text-ink-900 mb-1.5 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-forest-700" />
              <span>{t('settings.sleep_goal', language)}</span>
            </span>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-sm font-semibold text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden transition-all"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-sm font-semibold text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden transition-all"
                  required
                />
                <label htmlFor="onboardingSleepMinsInput" className="text-xs font-semibold text-ink-600">
                  {t('today.sleep_mins_label', language)}
                </label>
              </div>
            </div>
            <p className="text-[11px] text-ink-500 mt-1">
              {language === 'ar'
                ? 'الهدف الموصى به للبالغين: من 7 إلى 9 ساعات يومياً.'
                : 'Recommended adult target: 7 to 9 hours (420 - 540 minutes).'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-forest-700 hover:bg-forest-800 active:scale-[0.99] transition-all shadow-card focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600"
            >
              {language === 'ar' ? 'المتابعة كضيف (جميع الميزات مفعلة)' : 'Continue as Guest (All Features Unlocked)'}
            </button>
          </div>

          <p className="text-center text-[11px] text-ink-500 flex items-center justify-center gap-1.5 pt-1">
            <Shield className="w-3.5 h-3.5 text-forest-600" />
            <span>{t('onboarding.no_account_note', language)}</span>
          </p>
        </form>
      </div>
    </div>
  );
};
