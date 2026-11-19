import React, { useState } from 'react';
import { BehaviorMetric, EngineDayResult } from '../engine/types';
import { Language, t } from '../i18n/translations';
import { Footprints, Moon, Check, Coffee, HelpCircle } from 'lucide-react';

interface ActivityChartProps {
  historyResults: EngineDayResult[];
  metric: BehaviorMetric;
  currentTarget: number;
  language: Language;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({
  historyResults,
  metric,
  currentTarget,
  language,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Take the most recent 7 recorded days (or all if fewer than 7)
  const recentDays = historyResults.slice(-7);

  if (recentDays.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-ink-200 shadow-card text-center">
        <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mx-auto mb-3">
          {metric === 'steps' ? <Footprints className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </div>
        <h3 className="text-sm font-semibold text-ink-900 mb-1">
          {language === 'ar' ? 'لا توجد بيانات مسجلة للأيام الأخيرة بعد' : 'No recent activity recorded yet'}
        </h3>
        <p className="text-xs text-ink-500 max-w-sm mx-auto">
          {language === 'ar'
            ? 'سجل نشاطك لليوم في النموذج أعلاه لبدء بناء رسمك البياني التكيفي.'
            : 'Log your daily activity above to start tracking your recent rhythm against your adaptive ladder.'}
        </p>
      </div>
    );
  }

  // Determine max value for vertical scaling
  const maxRecorded = Math.max(...recentDays.map((d) => d.evaluation.actualValue), currentTarget);
  const chartMax = Math.max(maxRecorded * 1.15, metric === 'steps' ? 10000 : 600);

  // Reference target line height percentage
  const targetPct = Math.min(100, Math.max(10, Math.round((currentTarget / chartMax) * 100)));

  const formatValue = (val: number) => {
    if (metric === 'steps') return `${val.toLocaleString()} ${t('today.steps_unit', language)}`;
    const hrs = Math.floor(val / 60);
    const mins = val % 60;
    return `${hrs}h ${mins}m`;
  };

  const getDayLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T12:00:00Z');
      return d.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US', { weekday: 'short' });
    } catch {
      return dateStr.slice(-5);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-ink-200 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-ink-900 tracking-tight flex items-center gap-2">
            <span>{language === 'ar' ? 'سجل الأيام الـ 7 الأخيرة' : 'Recent 7-Day Activity Rhythm'}</span>
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            {language === 'ar'
              ? 'مقارنة إنجازك اليومي بالهدف النشط. الأيام المفقودة أو أيام الراحة لا تعاقبك.'
              : 'Daily recorded activity relative to your active target. Rest and missing days are non-punitive.'}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-forest-600"></span>
            <span>{language === 'ar' ? 'إنجاز الهدف' : 'Target Met'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sand-200 border border-sand-700/40"></span>
            <span>{language === 'ar' ? 'دون الهدف' : 'Below Target'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-forest-100 border border-forest-300"></span>
            <span>{language === 'ar' ? 'راحة معلنة' : 'Planned Rest'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-forest-500 border-t border-dashed border-forest-600"></span>
            <span>{language === 'ar' ? 'الهدف النشط' : 'Active Target'}</span>
          </div>
        </div>
      </div>

      {/* Screen-reader accessible alternative summary */}
      <div className="sr-only">
        <h4>{language === 'ar' ? 'جدول ملخص الأيام الـ 7 الأخيرة' : '7-Day Activity Summary Table'}</h4>
        <table>
          <thead>
            <tr>
              <th>{t('history.col_date', language)}</th>
              <th>{t('history.col_value', language)}</th>
              <th>{t('history.col_target', language)}</th>
              <th>{t('history.col_outcome', language)}</th>
            </tr>
          </thead>
          <tbody>
            {recentDays.map((day) => (
              <tr key={day.date}>
                <td>{day.date}</td>
                <td>{formatValue(day.evaluation.actualValue)}</td>
                <td>{formatValue(day.currentLadderTarget)}</td>
                <td>{day.isSuccessDay ? 'Success' : 'Below Par'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual Chart Container */}
      <div className="relative pt-6 pb-2">
        {/* Target Reference Line */}
        <div
          className="absolute left-0 right-0 z-10 pointer-events-none flex items-center"
          style={{ bottom: `calc(${targetPct}% + 36px)` }}
          aria-hidden="true"
        >
          <div className="w-full border-t border-dashed border-forest-500/80"></div>
          <span className="absolute -top-3 end-1 text-[10px] font-semibold text-forest-700 bg-forest-50 px-1.5 py-0.5 rounded border border-forest-200">
            {language === 'ar' ? 'الهدف' : 'Target'}: {currentTarget.toLocaleString()}
          </span>
        </div>

        {/* Bar Columns Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 sm:h-52 px-1">
          {recentDays.map((day, idx) => {
            const val = day.evaluation.actualValue;
            const isMissing = day.evaluation.isMissing;
            const isRest = day.isSuccessDay && val === 0; // Or declared rest
            const isSuccess = day.isSuccessDay;
            const isSelected = selectedIdx === idx;

            const heightPct = Math.min(100, Math.max(isMissing ? 4 : 8, Math.round((val / chartMax) * 100)));

            let barBg = 'bg-forest-600 hover:bg-forest-700';
            if (isMissing) {
              barBg = 'bg-ink-100 border border-dashed border-ink-300';
            } else if (isRest) {
              barBg = 'bg-forest-100 border border-forest-300';
            } else if (!isSuccess) {
              barBg = 'bg-[#EDE4D5] hover:bg-[#E5D8C3] border border-[#D5C2A8]';
            }

            return (
              <div
                key={day.date}
                className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onClick={() => setSelectedIdx(isSelected ? null : idx)}
                onMouseEnter={() => setSelectedIdx(idx)}
                onMouseLeave={() => setSelectedIdx(null)}
              >
                {/* Floating Tooltip Detail on Hover/Touch */}
                {isSelected && (
                  <div className="absolute -top-12 z-20 bg-ink-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-modal whitespace-nowrap pointer-events-none animate-fade-in flex flex-col items-center">
                    <span className="font-semibold">{day.date}</span>
                    <span className="text-forest-200">
                      {isMissing
                        ? (language === 'ar' ? 'غير مسجل' : 'Unsynced / Missing')
                        : formatValue(val)}
                    </span>
                    <div className="w-2 h-2 bg-ink-900 rotate-45 -mb-2 mt-0.5"></div>
                  </div>
                )}

                {/* The Bar */}
                <div className="w-full max-w-[42px] flex flex-col justify-end items-center relative">
                  {/* Status Indicator Icon atop the bar */}
                  <div className="mb-1 text-ink-500">
                    {isSuccess ? (
                      <Check className="w-3 h-3 text-forest-600" />
                    ) : isRest ? (
                      <Coffee className="w-3 h-3 text-forest-600" />
                    ) : isMissing ? (
                      <HelpCircle className="w-3 h-3 text-ink-400" />
                    ) : null}
                  </div>

                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${barBg} ${
                      isSelected ? 'ring-2 ring-forest-500 ring-offset-1 scale-[1.03]' : ''
                    }`}
                    style={{ height: `${heightPct}%`, minHeight: '12px' }}
                  />
                </div>

                {/* Day of Week Label */}
                <div className="mt-2 text-center">
                  <span className="block text-[11px] font-semibold text-ink-700">
                    {getDayLabel(day.date)}
                  </span>
                  <span className="block text-[9px] text-ink-400">
                    {day.date.slice(5)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
