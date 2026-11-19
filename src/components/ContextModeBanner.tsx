import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Clock,
  ShieldCheck,
  X,
  CheckCircle2,
  HelpCircle,
  Building2,
} from 'lucide-react';
import { ContextualAdaptationResult, ContextModeType, UserContextConfig } from '../engine/contextModes';
import { Language } from '../i18n/translations';

interface ContextModeBannerProps {
  contextAdaptation?: ContextualAdaptationResult;
  contextConfig: UserContextConfig;
  onUpdateContextConfig: (newConfig: UserContextConfig) => void;
  lang: Language;
}

export const ContextModeBanner: React.FC<ContextModeBannerProps> = ({
  contextAdaptation,
  contextConfig,
  onUpdateContextConfig,
  lang,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!contextAdaptation || contextAdaptation.mode === 'standard') {
    return (
      <div className="bg-white border border-[#E4E8E1] rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DCE9DD] flex items-center justify-center text-[#183C32]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#25332D]">
              {lang === 'ar' ? 'نمط السياق الإقليمي (الإمارات وأبوظبي)' : 'UAE Context Engine'}
            </h4>
            <p className="text-xs text-[#6F7D75]">
              {lang === 'ar'
                ? 'تكيف تلقائي مع رمضان، حرارة الصيف، ونوبات العمل لحماية العادات.'
                : 'Adaptive modes for Ramadan, summer heat, shift work, and planned pauses.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="text-xs font-medium text-[#183C32] hover:bg-[#DCE9DD]/50 border border-[#183C32]/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          {lang === 'ar' ? 'تخصيص النمط' : 'Customize Mode'}
        </button>

        {isDrawerOpen && renderDrawer()}
      </div>
    );
  }

  const getModeIcon = (mode: ContextModeType) => {
    switch (mode) {
      case 'ramadan':
        return <Moon className="w-5 h-5 text-amber-700" />;
      case 'summer_heat':
        return <Sun className="w-5 h-5 text-orange-600" />;
      case 'shift_work':
        return <Clock className="w-5 h-5 text-indigo-600" />;
      case 'planned_pause':
        return <ShieldCheck className="w-5 h-5 text-teal-700" />;
      default:
        return <Building2 className="w-5 h-5 text-[#183C32]" />;
    }
  };

  const getBadgeBg = (mode: ContextModeType) => {
    switch (mode) {
      case 'ramadan':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'summer_heat':
        return 'bg-orange-50 border-orange-200 text-orange-950';
      case 'shift_work':
        return 'bg-indigo-50 border-indigo-200 text-indigo-950';
      case 'planned_pause':
        return 'bg-teal-50 border-teal-200 text-teal-950';
      default:
        return 'bg-[#F5F5EF] border-[#E4E8E1] text-[#25332D]';
    }
  };

  function renderDrawer() {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="context-drawer-title"
      >
        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E4E8E1] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-[#E4E8E1]">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-[#183C32]" />
              <h3 id="context-drawer-title" className="text-lg font-bold text-[#25332D]">
                {lang === 'ar' ? 'محرك السياق الإقليمي (أبوظبي والإمارات)' : 'UAE Regional Context Engine'}
              </h3>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-[#6F7D75] hover:text-[#25332D] hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 space-y-4">
            <p className="text-xs text-[#6F7D75] leading-relaxed">
              {lang === 'ar'
                ? 'أنماط سياقية مصممة خصيصاً لواقع الحياة في دولة الإمارات. تعديل الأهداف يحافظ على سلامة العادة دون كسر عزيمتك أو تصفير تقدمك.'
                : 'Adaptive context modes designed specifically for life in the UAE. Target adjustments preserve habit strength without shame or streak resets.'}
            </p>

            {/* Mode selection buttons */}
            <div className="space-y-2.5">
              {/* Standard */}
              <button
                type="button"
                onClick={() => {
                  onUpdateContextConfig({
                    ...contextConfig,
                    activeMode: 'standard',
                    plannedPause: { ...contextConfig.plannedPause, enabled: false },
                  });
                }}
                className={`w-full text-start p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  contextConfig.activeMode === 'standard' && !contextConfig.plannedPause.enabled
                    ? 'border-[#183C32] bg-[#DCE9DD]/30 ring-1 ring-[#183C32]'
                    : 'border-[#E4E8E1] hover:bg-gray-50'
                }`}
              >
                <div className="mt-0.5 w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                  {contextConfig.activeMode === 'standard' && !contextConfig.plannedPause.enabled && (
                    <div className="w-2 h-2 rounded-full bg-[#183C32]" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#25332D]">
                    {lang === 'ar' ? 'النمط القياسي (100% من الهدف)' : 'Standard Mode (100% Target)'}
                  </div>
                  <div className="text-xs text-[#6F7D75]">
                    {lang === 'ar'
                      ? 'الوتيرة العادية بدون أي تعديلات سياقية إضافية.'
                      : 'Regular baseline targets with standard 3-rung ladder.'}
                  </div>
                </div>
              </button>

              {/* Ramadan */}
              <button
                type="button"
                onClick={() => {
                  onUpdateContextConfig({
                    ...contextConfig,
                    activeMode: 'ramadan',
                    plannedPause: { ...contextConfig.plannedPause, enabled: false },
                  });
                }}
                className={`w-full text-start p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  contextConfig.activeMode === 'ramadan'
                    ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                    : 'border-[#E4E8E1] hover:bg-gray-50'
                }`}
              >
                <div className="mt-0.5 w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                  {contextConfig.activeMode === 'ramadan' && (
                    <div className="w-2 h-2 rounded-full bg-amber-600" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-amber-950 flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-amber-600" />
                    {lang === 'ar' ? 'نمط رمضان المبارك (70% من الهدف)' : 'Ramadan Mode (70% Target)'}
                  </div>
                  <div className="text-xs text-[#6F7D75]">
                    {lang === 'ar'
                      ? 'ملاءمة الصيام وساعات ما بعد الإفطار والسحور دون إجهاد.'
                      : 'Adapts for fasting, post-Iftar and pre-Suhoor windows, and biphasic sleep.'}
                  </div>
                </div>
              </button>

              {/* Summer Heat */}
              <button
                type="button"
                onClick={() => {
                  onUpdateContextConfig({
                    ...contextConfig,
                    activeMode: 'summer_heat',
                    summerHeatManualOverride: true,
                    plannedPause: { ...contextConfig.plannedPause, enabled: false },
                  });
                }}
                className={`w-full text-start p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  contextConfig.activeMode === 'summer_heat'
                    ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                    : 'border-[#E4E8E1] hover:bg-gray-50'
                }`}
              >
                <div className="mt-0.5 w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                  {contextConfig.activeMode === 'summer_heat' && (
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-orange-950 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-orange-500" />
                    {lang === 'ar' ? 'حماية حرارة الصيف (85% مشي داخلي ومولات)' : 'Summer Heat Mode (85% Mall & Indoor)'}
                  </div>
                  <div className="text-xs text-[#6F7D75]">
                    {lang === 'ar'
                      ? 'مراكز تجارية مكيفة (ياس، أبوظبي مول) وحركة داخلية تجنباً لضربات الشمس.'
                      : 'Prioritizes AC mall walking, indoor steps, and early morning/late evening.'}
                  </div>
                </div>
              </button>

              {/* Shift Work */}
              <button
                type="button"
                onClick={() => {
                  onUpdateContextConfig({
                    ...contextConfig,
                    activeMode: 'shift_work',
                    shiftPattern: { ...contextConfig.shiftPattern, enabled: true },
                    plannedPause: { ...contextConfig.plannedPause, enabled: false },
                  });
                }}
                className={`w-full text-start p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  contextConfig.activeMode === 'shift_work'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                    : 'border-[#E4E8E1] hover:bg-gray-50'
                }`}
              >
                <div className="mt-0.5 w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                  {contextConfig.activeMode === 'shift_work' && (
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-indigo-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    {lang === 'ar' ? 'نمط ورديات العمل والمناوبات (2-2-4)' : 'Shift-Work Rotation (2 Day / 2 Night / 4 Off)'}
                  </div>
                  <div className="text-xs text-[#6F7D75]">
                    {lang === 'ar'
                      ? 'أيام ما بعد الوردية الليلية تعامل كاستشفاء فسيولوجي مخطط ولا تحتسب انقطاعاً.'
                      : 'Post-night duty days are treated as planned recovery, not lapses.'}
                  </div>
                </div>
              </button>

              {/* Planned Pause */}
              <button
                type="button"
                onClick={() => {
                  onUpdateContextConfig({
                    ...contextConfig,
                    plannedPause: {
                      enabled: !contextConfig.plannedPause.enabled,
                      reason: 'travel',
                      startDate: new Date().toISOString().slice(0, 10),
                    },
                  });
                }}
                className={`w-full text-start p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  contextConfig.plannedPause.enabled
                    ? 'border-teal-700 bg-teal-50/50 ring-1 ring-teal-700'
                    : 'border-[#E4E8E1] hover:bg-gray-50'
                }`}
              >
                <div className="mt-0.5 w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                  {contextConfig.plannedPause.enabled && (
                    <div className="w-2 h-2 rounded-full bg-teal-700" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-teal-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    {lang === 'ar' ? 'توقف مخطط (سفر، مرض، ظرف عائلي)' : 'Planned Pause (Travel, Illness, Family Care)'}
                  </div>
                  <div className="text-xs text-[#6F7D75]">
                    {lang === 'ar'
                      ? 'إعلان توقف مؤقت معفى 100% من احتساب الانقطاع لحماية استمراريتك.'
                      : 'Declared pause is 100% lapse-exempt. Your active days remain intact.'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E8E1] flex justify-end">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="bg-[#183C32] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#183C32]/90 transition-colors"
            >
              {lang === 'ar' ? 'تم وحفظ الإعدادات' : 'Done & Apply'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition-all ${getBadgeBg(contextAdaptation.mode)}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white shadow-xs shrink-0">
            {getModeIcon(contextAdaptation.mode)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-current/20">
                {lang === 'ar' ? 'سياق الإمارات نشط' : 'UAE Context Active'}
              </span>
              <h3 className="text-sm font-bold">
                {lang === 'ar' ? contextAdaptation.titleAr : contextAdaptation.titleEn}
              </h3>
            </div>
            <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
              {lang === 'ar' ? contextAdaptation.explanationAr : contextAdaptation.explanationEn}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-current/20 hover:bg-white/80 transition-colors flex items-center gap-1 shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'لماذا تغير هدفي؟' : 'Why Target Changed'}
          </button>
        </div>
      </div>

      {/* Suggested activity windows */}
      {contextAdaptation.recommendedWindowsEn && contextAdaptation.recommendedWindowsEn.length > 0 && (
        <div className="mt-3 pt-3 border-t border-current/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold opacity-75">
            {lang === 'ar' ? 'الفترات المقترحة:' : 'Recommended Times:'}
          </span>
          {(lang === 'ar' ? contextAdaptation.recommendedWindowsAr : contextAdaptation.recommendedWindowsEn).map(
            (w, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/80 border border-current/15 text-xs font-medium"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                {w}
              </span>
            )
          )}
        </div>
      )}

      {isDrawerOpen && renderDrawer()}
    </div>
  );
};
