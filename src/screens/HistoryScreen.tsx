import React, { useState } from 'react';
import {
  Calendar,
  Footprints,
  Moon,
  Filter,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  HelpCircle,
  Coffee,
} from 'lucide-react';
import { BehaviorMetric, EngineDayResult, UserEngineProfile } from '../engine/types';
import { Language, t } from '../i18n/translations';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';

interface HistoryScreenProps {
  profile: UserEngineProfile;
  historyResults: EngineDayResult[];
  metric: BehaviorMetric;
  language: Language;
  onChangeMetric: (metric: BehaviorMetric) => void;
  onNavigateToToday: () => void;
  onNavigateToSettings: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  profile,
  historyResults,
  metric,
  language,
  onChangeMetric,
  onNavigateToToday,
  onNavigateToSettings,
}) => {
  const [filterState, setFilterState] = useState<string>('all');

  const filtered = historyResults.filter((item) => {
    if (filterState === 'all') return true;
    return item.state === filterState;
  });

  const totalDays = historyResults.length;
  const activeDays =
    historyResults.length > 0 ? historyResults[historyResults.length - 1].activeDays : 0;
  const returnCount =
    historyResults.length > 0 ? historyResults[historyResults.length - 1].returnCount : 0;
  const latestBaseline =
    historyResults.length > 0
      ? historyResults[historyResults.length - 1].baseline
      : metric === 'steps'
      ? profile.userGoalSteps
      : profile.userGoalSleepMinutes;

  const formatUnit = (val: number) => {
    if (metric === 'steps') return `${val.toLocaleString()} ${t('today.steps_unit', language)}`;
    const hrs = Math.floor(val / 60);
    const mins = val % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. HEADER & METRIC TOGGLE */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-forest-50 text-forest-800 border border-forest-200">
              <Calendar className="w-3.5 h-3.5 text-forest-700" />
              <span>{language === 'ar' ? 'سجل السلوك التاريخي' : 'Behavioral History Log'}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
            {t('history.title', language)}
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 max-w-xl">
            {t('history.subtitle', language)}
          </p>
        </div>

        {/* Behavior Switcher */}
        <div
          className="inline-flex bg-ivory-100 p-1 rounded-2xl border border-ink-200 self-start sm:self-auto"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={metric === 'steps'}
            onClick={() => onChangeMetric('steps')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
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
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              metric === 'sleep'
                ? 'bg-white shadow-card text-forest-900 font-extrabold'
                : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            <Moon className="w-4 h-4 text-forest-700" />
            <span>{t('today.sleep', language)}</span>
          </button>
        </div>
      </section>

      {/* 2. AGGREGATE SUMMARY HUD */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" aria-label="History Aggregates">
        <MetricCard
          label={t('history.total_records', language)}
          value={totalDays}
          subtext={language === 'ar' ? 'أيام مسجلة كلياً في الذاكرة المحلية.' : 'Total calendar records in browser storage.'}
          icon={<Calendar className="w-4 h-4 text-forest-700" />}
          iconBgColor="bg-forest-100 text-forest-800"
        />

        <MetricCard
          label={t('today.active_days', language)}
          value={activeDays}
          subtext={language === 'ar' ? 'أيام أنجزت الهدف. لا تعاد للصفر أبداً.' : 'Days active target met. Never resets upon disruption.'}
          icon={<CheckCircle2 className="w-4 h-4 text-forest-700" />}
          iconBgColor="bg-sage-100 text-forest-800"
          valueColorClass="text-forest-900"
          highlight={true}
        />

        <MetricCard
          label={t('today.return_count', language)}
          value={returnCount}
          subtext={language === 'ar' ? 'مرات استعادة العادة بعد تراجع.' : 'Completed habit returns. Resilience metric.'}
          icon={<RotateCcw className="w-4 h-4 text-forest-700" />}
          iconBgColor="bg-[#D9F0F2] text-[#1B5E6B]"
          valueColorClass="text-[#144751]"
        />

        <MetricCard
          label={t('today.current_baseline', language)}
          value={latestBaseline.toLocaleString()}
          unit={metric === 'steps' ? t('today.steps_unit', language) : t('today.sleep_unit', language)}
          subtext={language === 'ar' ? 'وسيط آخر 28 يوماً الفعلي.' : '28-day rolling median baseline.'}
          icon={<TrendingUp className="w-4 h-4 text-forest-700" />}
          iconBgColor="bg-sand-100 text-sand-800"
        />
      </section>

      {/* 3. LOG FILTER & TABLE / TIMELINE */}
      <section className="bg-white rounded-3xl border border-ink-200 shadow-card overflow-hidden">
        {/* State Filter Header */}
        <div className="p-4 sm:p-5 border-b border-ink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-ivory-50/70">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-forest-700" />
            <span className="text-xs font-bold text-ink-800 uppercase tracking-wider">
              {language === 'ar' ? 'تصفية الحالة السلوكية:' : 'Filter State:'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: t('history.filter_all', language) },
              { id: 'ON_TRACK', label: t('status.on_track', language) },
              { id: 'SLIPPING', label: t('status.slipping', language) },
              { id: 'LAPSED', label: t('status.lapsed', language) },
              { id: 'RECOVERING', label: t('status.recovering', language) },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFilterState(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterState === st.id
                    ? 'bg-forest-700 text-white shadow-card'
                    : 'bg-white border border-ink-200 text-ink-600 hover:bg-ivory-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {totalDays === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-forest-50 border border-forest-200 text-forest-700 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-ink-900">
                {language === 'ar' ? 'لا يوجد سجل مسجل بعد' : 'No History Recorded Yet'}
              </h3>
              <p className="text-xs sm:text-sm text-ink-500 max-w-md mx-auto leading-relaxed">
                {t('history.no_records', language)}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onNavigateToToday}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-forest-700 hover:bg-forest-800 transition-colors shadow-card"
              >
                {language === 'ar' ? 'تسجيل إدخال اليوم' : "Log Today's Entry"}
              </button>
              <button
                onClick={onNavigateToSettings}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-forest-900 bg-sage-100 hover:bg-sage-200 border border-forest-200 transition-colors"
              >
                {t('settings.load_demo_tariq', language)}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View (lg screens and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-start border-collapse text-xs">
                <thead>
                  <tr className="border-b border-ink-200 bg-ivory-50 text-ink-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4 text-start">{t('history.col_date', language)}</th>
                    <th className="py-3.5 px-4 text-start">{t('history.col_value', language)}</th>
                    <th className="py-3.5 px-4 text-start">{language === 'ar' ? 'المستوى النشط' : 'Active Rung'}</th>
                    <th className="py-3.5 px-4 text-start">{t('history.col_target', language)}</th>
                    <th className="py-3.5 px-4 text-start">{t('history.col_state', language)}</th>
                    <th className="py-3.5 px-4 text-start">{language === 'ar' ? 'خط الأساس' : 'Baseline'}</th>
                    <th className="py-3.5 px-4 text-start">{t('today.active_days', language)}</th>
                    <th className="py-3.5 px-4 text-start">{language === 'ar' ? 'ملاحظات وتوجيه' : 'Guidance Notes'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 font-medium">
                  {filtered.map((item, idx) => {
                    const isMissing = item.evaluation.isMissing;
                    const isRest = item.isSuccessDay && item.evaluation.actualValue === 0;

                    return (
                      <tr key={idx} className="hover:bg-ivory-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-ink-900 whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-ink-900">
                          {isMissing ? (
                            <span className="text-ink-400 italic font-normal flex items-center gap-1">
                              <HelpCircle className="w-3 h-3 text-ink-400" />
                              <span>{language === 'ar' ? 'غير مسجل' : 'Missing'}</span>
                            </span>
                          ) : isRest ? (
                            <span className="text-forest-700 flex items-center gap-1 font-semibold">
                              <Coffee className="w-3 h-3 text-forest-600" />
                              <span>{language === 'ar' ? 'راحة معلنة' : 'Planned Rest'}</span>
                            </span>
                          ) : (
                            formatUnit(item.evaluation.actualValue)
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-ink-700">
                          <span className="px-2 py-0.5 rounded-md bg-ivory-100 text-ink-700 border border-ink-200 text-[11px]">
                            {item.ladderLevel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-ink-600">
                          {formatUnit(item.currentLadderTarget)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge
                            state={item.state}
                            isLearningBaseline={item.isLearningBaseline}
                            recoveryDayIndex={item.consecutiveSuccessDays}
                            language={language}
                            size="sm"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-ink-500 font-mono">
                          {formatUnit(item.baseline)}
                        </td>
                        <td className="py-3.5 px-4 font-black text-forest-800">
                          {item.activeDays}
                        </td>
                        <td className="py-3.5 px-4 text-ink-500 max-w-xs truncate" title={item.techniqueCard.suggestion}>
                          {item.techniqueCard.suggestion}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Timeline View (screens < md) */}
            <div className="md:hidden divide-y divide-ink-100 p-2">
              {filtered.map((item, idx) => (
                <div key={idx} className="p-3.5 space-y-2 hover:bg-ivory-50 rounded-2xl transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-ink-900">{item.date}</span>
                    <StatusBadge
                      state={item.state}
                      isLearningBaseline={item.isLearningBaseline}
                      recoveryDayIndex={item.consecutiveSuccessDays}
                      language={language}
                      size="sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-ink-400 block">{t('history.col_value', language)}</span>
                      <span className="font-bold text-ink-900">
                        {item.evaluation.isMissing
                          ? (language === 'ar' ? 'غير مسجل' : 'Missing')
                          : formatUnit(item.evaluation.actualValue)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-ink-400 block">{t('history.col_target', language)}</span>
                      <span className="font-medium text-ink-700">
                        {formatUnit(item.currentLadderTarget)} ({item.ladderLevel})
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-ink-500 italic pt-1 border-t border-ink-100/60 line-clamp-1">
                    "{item.techniqueCard.suggestion}"
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
