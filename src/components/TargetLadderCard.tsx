import React from 'react';
import { LadderLevel, BehaviorMetric, EngineDayResult } from '../engine/types';
import { Language, t } from '../i18n/translations';
import { Shield, Sparkles, Target, ArrowUp, ArrowDown } from 'lucide-react';

interface TargetLadderCardProps {
  latestResult: EngineDayResult | null;
  defaultGoal: number;
  metric: BehaviorMetric;
  language: Language;
}

export const TargetLadderCard: React.FC<TargetLadderCardProps> = ({
  latestResult,
  defaultGoal,
  metric,
  language,
}) => {
  const activeLevel: LadderLevel = latestResult?.ladderLevel ?? 'TARGET';
  const baseline = latestResult?.baseline ?? defaultGoal;

  const minVal = latestResult?.ladderTargets.minimum ?? Math.round(baseline * 0.5);
  const targetVal = latestResult?.ladderTargets.target ?? defaultGoal;
  const stretchVal = latestResult?.ladderTargets.stretch ?? Math.round(targetVal * 1.1);

  const formatUnit = (val: number) => {
    if (metric === 'steps') return `${val.toLocaleString()} ${t('today.steps_unit', language)}`;
    const hrs = Math.floor(val / 60);
    const mins = val % 60;
    return `${hrs}h ${mins}m`;
  };

  const rungs = [
    {
      id: 'MINIMUM' as LadderLevel,
      name: t('ladder.minimum', language),
      percentage: '50%',
      value: minVal,
      icon: <Shield className="w-4 h-4 text-forest-700" />,
      tag: language === 'ar' ? 'درجة الأمان' : 'Safety Rung',
      description:
        language === 'ar'
          ? 'هدف ميسر مصمم للحفاظ على هويتك السلوكية دون إحباط عند مواجهة المرض، السفر، أو تقلبات المناوبات.'
          : 'Low-friction target designed to preserve habit identity without guilt during fatigue, travel, or disruptions.',
      progressionRule:
        language === 'ar'
          ? '3 أيام إنجاز متتالية تعيدك تلقائياً إلى المستوى المستهدف.'
          : '3 consecutive successful days automatically restores your Target rung.',
    },
    {
      id: 'TARGET' as LadderLevel,
      name: t('ladder.target', language),
      percentage: '100%',
      value: targetVal,
      icon: <Target className="w-4 h-4 text-forest-700" />,
      tag: language === 'ar' ? 'الوتيرة الأساسية' : 'Primary Rhythm',
      description:
        language === 'ar'
          ? 'هدفك الأساسي المتوازن المصمم لبناء استمرارية صحية طويلة الأمد بجهد متوازن.'
          : 'Your balanced primary goal calibrated to build sustainable, long-term health consistency.',
      progressionRule:
        language === 'ar'
          ? '3 أيام إنجاز متتالية تفتح لك خيار المستوى الموسع (+10%).'
          : '3 consecutive Target successes unlocks the optional Stretch rung (+10%).',
    },
    {
      id: 'STRETCH' as LadderLevel,
      name: t('ladder.stretch', language),
      percentage: '110%',
      value: stretchVal,
      icon: <Sparkles className="w-4 h-4 text-forest-700" />,
      tag: language === 'ar' ? 'تحدٍ اختياري' : 'Optional Challenge',
      description:
        language === 'ar'
          ? 'تحدٍ إضافي متاح عندما تشعر بطاقة وفائض نشاط. عدم إنجازه لا يعتبر تراجعاً مطلقاً.'
          : 'Gentle positive challenge when you have surplus energy. Missing it never counts as a setback.',
      progressionRule:
        language === 'ar'
          ? 'يعود بهدوء إلى الهدف الأساسي دون أي عقوبة في أي يوم أقل نشاطاً.'
          : 'Smoothly reverts to your Target without penalty whenever energy dips.',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-ink-200 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-ink-900 tracking-tight flex items-center gap-2">
            <span>{language === 'ar' ? 'سلم الأهداف التكيفي (3 مستويات)' : 'Adaptive 3-Rung Target Ladder'}</span>
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            {language === 'ar'
              ? 'أهداف مرنة تتكيف مع واقعك بدلاً من المطالبة بالكمال المستحيل. مستمدة مباشرة من معادلات المحرك.'
              : 'Flexible rungs that adapt to real life instead of demanding perfection. Driven directly by engine logic.'}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-forest-50 text-forest-800 border border-forest-200 self-start sm:self-auto">
          <span>{language === 'ar' ? 'الدرجة النشطة حالياً:' : 'Active Rung:'}</span>
          <span className="font-bold text-forest-900 underline decoration-forest-400">
            {activeLevel === 'MINIMUM'
              ? t('ladder.minimum', language)
              : activeLevel === 'STRETCH'
              ? t('ladder.stretch', language)
              : t('ladder.target', language)}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {rungs.map((rung) => {
          const isActive = rung.id === activeLevel;

          return (
            <div
              key={rung.id}
              className={`rounded-xl p-4 transition-all duration-200 relative flex flex-col justify-between ${
                isActive
                  ? 'bg-sage-50/70 border-2 border-forest-600 shadow-card-hover ring-1 ring-forest-500/20'
                  : 'bg-ivory-50 border border-ink-200 opacity-80 hover:opacity-100 hover:border-ink-300'
              }`}
            >
              {isActive && (
                <span className="absolute -top-2.5 start-3 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-forest-700 text-white shadow-xs">
                  {language === 'ar' ? 'نشط الآن' : 'Active Today'}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-white border border-ink-200 flex items-center justify-center">
                      {rung.icon}
                    </div>
                    <span className="text-xs font-bold text-ink-900">{rung.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-forest-700 bg-white px-1.5 py-0.5 rounded border border-ink-200">
                    {rung.percentage}
                  </span>
                </div>

                <div className="text-xl sm:text-2xl font-bold text-ink-900 mt-1 mb-2">
                  {formatUnit(rung.value)}
                </div>

                <p className="text-[11px] text-ink-600 leading-relaxed mb-3">
                  {rung.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-ink-200/60 text-[10px] text-ink-500 flex items-start gap-1">
                {rung.id === 'MINIMUM' ? (
                  <ArrowUp className="w-3 h-3 text-forest-600 shrink-0 mt-0.5" />
                ) : rung.id === 'TARGET' ? (
                  <ArrowUp className="w-3 h-3 text-forest-600 shrink-0 mt-0.5" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-ink-400 shrink-0 mt-0.5" />
                )}
                <span>{rung.progressionRule}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
