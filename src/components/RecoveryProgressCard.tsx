import React from 'react';
import { RotateCcw, Check, ArrowRight } from 'lucide-react';
import { Language, t } from '../i18n/translations';

interface RecoveryProgressCardProps {
  consecutiveSuccessDays: number;
  minimumTarget: number;
  unit: string;
  language: Language;
  onNavigateToRecovery: () => void;
}

export const RecoveryProgressCard: React.FC<RecoveryProgressCardProps> = ({
  consecutiveSuccessDays,
  minimumTarget,
  unit,
  language,
  onNavigateToRecovery,
}) => {
  const steps = [1, 2, 3];

  return (
    <div className="bg-[#EBF7F9] rounded-2xl p-5 sm:p-6 border border-[#BDE3E8] shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4EFF3] text-[#1B5E6B] flex items-center justify-center shrink-0 mt-0.5">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#144751] bg-white px-2 py-0.5 rounded border border-[#BDE3E8]">
                {language === 'ar' ? 'مسار التعافي المتدرج' : 'Recovery Milestone Protocol'}
              </span>
              <span className="text-xs text-[#1B5E6B] font-medium">BCT 8.7</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-ink-900 tracking-tight">
              {language === 'ar' ? 'استعادة وتيرتك خطوة بخطوة' : 'Finding Your Rhythm Again'}
            </h3>
            <p className="text-xs sm:text-sm text-ink-600 mt-0.5 leading-relaxed">
              {language === 'ar'
                ? `أنت في مسار التعافي على هدفك الميسر (${minimumTarget.toLocaleString()} ${unit}). إنجاز 3 أيام متتالية يعيدك تلقائياً للهدف الأساسي ويضيف إنجاز عودة جديداً.`
                : `You are progressing on your low-friction Minimum target (${minimumTarget.toLocaleString()} ${unit}). Completing 3 consecutive days restores your Target rung and increments your Return Count.`}
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToRecovery}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#1B5E6B] hover:bg-[#144751] transition-colors shrink-0 shadow-card focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1B5E6B]"
        >
          <span>{t('today.recovery_cta', language)}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>

      {/* 3-Step Milestone Tracker */}
      <div className="bg-white rounded-xl p-4 border border-[#BDE3E8]/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-ink-800">
            {language === 'ar' ? 'التقدم نحو محطة التعافي' : 'Progress toward recovery milestone'}:
          </span>
          <span className="text-xs font-black text-[#1B5E6B]">
            {consecutiveSuccessDays} / 3 {language === 'ar' ? 'أيام مكتملة' : 'days completed'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {steps.map((step) => {
            const isCompleted = consecutiveSuccessDays >= step;
            const isCurrent = consecutiveSuccessDays === step - 1;

            return (
              <div
                key={step}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isCompleted
                    ? 'bg-[#E5F5F7] border-[#9DD8DF] text-[#144751]'
                    : isCurrent
                    ? 'bg-white border-2 border-[#1B5E6B] text-ink-900 shadow-xs'
                    : 'bg-ivory-50 border-ink-200 text-ink-400 opacity-70'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  {isCompleted ? (
                    <div className="w-4 h-4 rounded-full bg-[#1B5E6B] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-xs font-bold">{step}</span>
                  )}
                  <span className="text-[11px] font-semibold">
                    {language === 'ar' ? `اليوم ${step}` : `Day ${step}`}
                  </span>
                </div>
                <span className="text-[10px] block text-ink-500">
                  {isCompleted
                    ? (language === 'ar' ? 'مكتمل بنجاح' : 'Achieved')
                    : isCurrent
                    ? (language === 'ar' ? 'اليوم المستهدف' : 'Target today')
                    : (language === 'ar' ? 'الخطوة التالية' : 'Next step')}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-ink-400 mt-2.5 text-center italic">
          {language === 'ar'
            ? 'ملاحظة سلوكية: إنجاز محطة التعافي يعكس استئناف الروتين اليومي بأثر ميسر، ولا يُعد تشخيصاً طبياً.'
            : 'Behavioral note: Reaching a recovery milestone indicates behavioral routine resumption on a low-friction target, not medical cure.'}
        </p>
      </div>
    </div>
  );
};
