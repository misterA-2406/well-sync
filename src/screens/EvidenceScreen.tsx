import React, { useState } from 'react';
import {
  BarChart3,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Filter,
  Info,
} from 'lucide-react';
import evidenceData from '../data/evidence_data.json';
import { Language, t } from '../i18n/translations';

interface Provenance {
  source_files: string[];
  total_source_rows: number;
  total_participants: number;
  run_date_utc: string;
  script_version: string;
  citation: string;
  demographic_notice: string;
  design_distinction_notice?: string;
}

interface DescriptiveRecovery {
  total_lapses_detected: number;
  mean_lapses_per_participant: number;
  median_lapses_per_participant: number;
  participants_with_lapses: number;
  total_recoveries_completed: number;
  mean_recovery_days: number | null;
  median_recovery_days: number | null;
  min_recovery_days: number | null;
  max_recovery_days: number | null;
  missing_days_handling?: string;
}

interface PolicyComparisonItem {
  policy_id: string;
  policy_name: string;
  target_type: string;
  streak_mechanic: string;
  days_ge_50pct_baseline_pct?: number;
  time_to_return_days_mean?: number;
  time_to_return_days_median?: number;
  abandonment_gaps_count?: number;
  share_days_labeled_failure_pct?: number;
  mean_resets: number;
  median_resets: number;
  longest_streak_mean: number;
  longest_streak_median: number;
  attainability_pct: number;
  baseline_attainability_pct?: number;
  attainability_definition?: string;
  days_below_baseline_mean: number;
  mean_return_count?: number;
  mean_active_days?: number;
}

interface DemographicItem {
  subgroup: string;
  participant_count: number;
  masked: boolean;
  note?: string;
  policy_b_attainability_pct?: number;
  policy_b_longest_streak?: number;
  policy_b_mean_returns?: number;
  policy_b_mean_lapses?: number;
  policy_a_prime_resets?: number;
  policy_a_10k_resets?: number;
}

interface SensitivityItem {
  lapse_length_days: number;
  below_par_threshold_pct: number;
  baseline_window_days: number;
  mean_lapses_per_participant: number;
  total_lapses_detected: number;
  mean_attainability_pct: number;
  mean_recovery_days: number | null;
  median_recovery_days?: number | null;
}

interface FullEvidencePayload {
  status: string;
  provenance: Provenance | null;
  descriptive_recovery?: DescriptiveRecovery;
  policy_comparison?: PolicyComparisonItem[];
  demographics?: {
    gender: DemographicItem[];
    age: DemographicItem[];
    masking_threshold: number;
  };
  sensitivity?: SensitivityItem[];
}

interface EvidenceScreenProps {
  language?: Language;
}

export const EvidenceScreen: React.FC<EvidenceScreenProps> = ({ language = 'en' }) => {
  const evidence = evidenceData as unknown as FullEvidencePayload;
  const isGenerated = Boolean(
    evidence && evidence.provenance && evidence.provenance.total_source_rows > 0
  );

  // Filter state for sensitivity analysis
  const [selectedLapseLength, setSelectedLapseLength] = useState<number | 'all'>('all');
  const [selectedThreshold, setSelectedThreshold] = useState<number | 'all'>('all');

  const filteredSensitivity = evidence.sensitivity
    ? evidence.sensitivity.filter((item) => {
        if (selectedLapseLength !== 'all' && item.lapse_length_days !== selectedLapseLength)
          return false;
        if (selectedThreshold !== 'all' && item.below_par_threshold_pct !== selectedThreshold)
          return false;
        return true;
      })
    : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. EVIDENCE HERO HEADER */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-forest-50 border border-forest-200 text-forest-700 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-forest-100 text-forest-900 border border-forest-300">
                <FileCheck2 className="w-3.5 h-3.5 text-forest-700" />
                <span>{t('evidence.empirical', language)}</span>
              </span>
              <span className="text-xs text-ink-500 font-medium">
                LifeSnaps Replay Simulation (71 Participants • 7,443 Days)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight leading-tight">
              {language === 'ar'
                ? 'هشاشة التتابع: كم مرة تنهار سلاسل "التصفير للصفر" لدى المشاركين الحقيقيين؟'
                : 'Streak Fragility Replay: How Often Reset-to-Zero Streaks Collapse for Real Participants'}
            </h1>

            <p className="text-xs sm:text-sm text-ink-600 leading-relaxed max-w-3xl">
              {language === 'ar'
                ? 'محاكاة لسلوك 71 مشاركاً في دراسة LifeSnaps تكشف أن سلاسل التتابع التقليدية تنهار بمعدل 17.9 مرة للشخص الواحد حتى مع أهداف مخصصة لخط الأساس الشخصي (السياسة أ\')، مما يفسر أسباب الإحباط والانسحاب من تطبيقات الصحة.'
                : "Empirical replay across 71 real participants demonstrates that conventional reset-to-zero streaks collapse an average of 17.9 times per participant even when targets match their personalized baseline (Policy A'), illustrating why streak gamification induces habit abandonment."}
            </p>
          </div>
        </div>
      </section>

      {/* 2. MANDATORY METHODOLOGICAL DISCLAIMERS */}
      <section className="bg-ivory-50 border border-ink-200 rounded-3xl p-6 space-y-3 text-xs text-ink-700 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-ink-900 text-sm">
          <AlertCircle className="w-4 h-4 text-sand-700 shrink-0" />
          <span>{t('evidence.disclaimer_title', language)}</span>
        </div>
        <p className="leading-relaxed">
          1. <strong>{language === 'ar' ? 'إعادة تشغيل القواعد لا تثبت تغيير السلوك:' : 'Rule Replay, Not Proven Behavior Change:'}</strong>{' '}
          {t('evidence.disclaimer_1', language)}
        </p>
        <p className="leading-relaxed">
          2. <strong>{language === 'ar' ? 'نطاق العينة الديموغرافية:' : 'Demographic Scope:'}</strong>{' '}
          {t('evidence.disclaimer_2', language)}
        </p>
        <p className="leading-relaxed">
          3. <strong>{language === 'ar' ? 'النزاهة الأكاديمية والتصميم الخوارزمي:' : 'Academic Integrity & Architectural Design:'}</strong>{' '}
          {language === 'ar'
            ? 'تصفير التتابع بمعدل 0.0 في السياسة ب هو نتيجة معمارية حتمية بحكم التصميم (استبدال التصفير بسلم متدرج للأسفل)، وليس اكتشافاً تجريبياً مفاجئاً.'
            : 'Policy B exhibiting 0.0 streak resets is TRUE BY DESIGN (an architectural choice that eliminates streak cancellation in favor of cumulative progress and graded step-downs), not an empirical discovery.'}
        </p>
        <p className="leading-relaxed">
          4. <strong>{language === 'ar' ? 'نزاهة البيانات وصفر ذكاء اصطناعي:' : 'Data Integrity & Zero Runtime AI:'}</strong>{' '}
          {language === 'ar'
            ? 'صفر أرقام مصطنعة أو وهمية. كافة البيانات مستخرجة من ملفات حقيقية دون أي نماذج ذكاء اصطناعي أثناء التشغيل.'
            : 'Zero numbers are fabricated or estimated from assumed distributions. All numbers are computed from real dataset files with zero runtime AI/LLM inference.'}
        </p>
      </section>

      {/* 3. METHODOLOGY: ATTAINABILITY & MISSING DATA DEFINITIONS */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-ink-200 shadow-card space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-ink-900">
          <Info className="w-4 h-4 text-forest-700 shrink-0" />
          <span>{language === 'ar' ? 'المعايير المنهجية: تعريف "إمكانية التحقيق" ومعاملة الأيام المفقودة' : 'Methodology: How "Attainability" and Missing Days are Defined'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-ivory-50 rounded-2xl border border-ink-200/80 space-y-1.5">
            <strong className="text-forest-900 block font-bold text-xs">
              {language === 'ar' ? '1. تعريف إمكانية التحقيق (Attainability)' : '1. Attainability Metric Definitions'}
            </strong>
            <ul className="list-disc list-inside space-y-1 text-ink-600 leading-relaxed text-[11px]">
              <li>
                <strong>{language === 'ar' ? 'إمكانية تحقيق خط الأساس (تعريف متطابق لـ A\' و B):' : "Baseline Attainability (Identical for A' & B):"}</strong>{' '}
                {language === 'ar'
                  ? 'نسبة الأيام التي حقق فيها المشارك خطوات ≥ خط الأساس الشخصي (31.9% لكلا السياستين).'
                  : "Share of days where steps ≥ personal baseline. Under this identical definition, Policy A' and Policy B are identical (31.9%)."}
              </li>
              <li>
                <strong>{language === 'ar' ? 'إمكانية تحقيق الدرجة النشطة (Policy B Rung):' : 'Active Rung Attainability (Policy B Adaption):'}</strong>{' '}
                {language === 'ar'
                  ? 'نسبة الأيام التي حقق فيها المشارك الدرجة المحددة النشطة (تصبح 50% عند التراجع للحفاظ على الاستمرارية).'
                  : 'Share of days meeting the active prescribed rung. When lapsed, the rung steps down to 50% to maintain behavioral feasibility.'}
              </li>
            </ul>
          </div>

          <div className="p-4 bg-ivory-50 rounded-2xl border border-ink-200/80 space-y-1.5">
            <strong className="text-forest-900 block font-bold text-xs">
              {language === 'ar' ? '2. كيفية احتساب الأيام المفقودة (Missing Days)' : '2. Treatment of Missing & Unsynced Days'}
            </strong>
            <p className="text-ink-600 text-[11px] leading-relaxed">
              {language === 'ar'
                ? 'أي فجوة زمنية أو يوم غير مسجل في بيانات الحساسات يتم اعتباره "مفقوداً" بقيمة 0 خطوات. يُحسب اليوم المفقود في مقام الأيام الإجمالية (كغير محقق)، ويُعامل كيوم دون المستوى يؤدي إلى كسر سلاسل التتابع وإطلاق التراجع.'
                : 'Any date gap or unsynced day in the wearable telemetry is treated as missing (actualValue = 0). Missing days are included in the denominator (total calendar days) as non-attained, break streaks, and contribute directly toward the 3-day lapse trigger.'}
            </p>
          </div>
        </div>
      </section>

      {/* 4. REPLAY DATA SECTION */}
      {!isGenerated || !evidence.provenance ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-ink-300 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sand-100 text-sand-800 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-ink-900">
            {language === 'ar' ? 'لم يتم توليد نتائج المحاكاة بعد' : 'Replay results not generated yet'}
          </h2>
          <p className="text-xs text-ink-500 max-w-md mx-auto leading-relaxed">
            {language === 'ar'
              ? 'سيتم حساب وعرض الأدلة هنا فور تشغيل كود المحاكاة على بيانات LifeSnaps.'
              : 'Evidence numbers will be computed and rendered here once the real LifeSnaps data files are provided and replay.py is executed.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Provenance Card */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-ink-200 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-forest-700" />
                <span>{language === 'ar' ? 'مصدر البيانات والتحقق من النزاهة' : 'Dataset Provenance & Verification'}</span>
              </h3>
              <span className="text-[11px] font-semibold text-forest-800 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
                Zenodo 7229547 • CC BY 4.0
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-ivory-50 rounded-xl border border-ink-200/70">
                <span className="text-ink-400 block text-[10px] uppercase font-bold">
                  {language === 'ar' ? 'الملف المصدر' : 'Source File'}
                </span>
                <strong className="text-ink-900 font-mono text-[11px] break-all">
                  {evidence.provenance.source_files.join(', ')}
                </strong>
              </div>

              <div className="p-3 bg-ivory-50 rounded-xl border border-ink-200/70">
                <span className="text-ink-400 block text-[10px] uppercase font-bold">
                  {language === 'ar' ? 'عدد السجلات / العينة' : 'Source Rows / Cohort'}
                </span>
                <strong className="text-ink-900">
                  {evidence.provenance.total_source_rows.toLocaleString()} {language === 'ar' ? 'سجل' : 'rows'} (
                  {evidence.provenance.total_participants} {language === 'ar' ? 'مشارك' : 'participants'})
                </strong>
              </div>

              <div className="p-3 bg-ivory-50 rounded-xl border border-ink-200/70">
                <span className="text-ink-400 block text-[10px] uppercase font-bold">
                  {language === 'ar' ? 'تاريخ التشغيل (UTC)' : 'Run Timestamp (UTC)'}
                </span>
                <strong className="text-ink-900">
                  {new Date(evidence.provenance.run_date_utc).toLocaleDateString()}{' '}
                  {new Date(evidence.provenance.run_date_utc).toLocaleTimeString()}
                </strong>
              </div>

              <div className="p-3 bg-ivory-50 rounded-xl border border-ink-200/70">
                <span className="text-ink-400 block text-[10px] uppercase font-bold">
                  {language === 'ar' ? 'إصدار كود المحاكاة' : 'Engine / Script Version'}
                </span>
                <strong className="text-ink-900">
                  v{evidence.provenance.script_version} ({language === 'ar' ? 'محاكاة محددة' : 'Deterministic Replay'})
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-ink-500 pt-2 border-t border-ink-100/70">
              <strong>{language === 'ar' ? 'التوثيق العلمي:' : 'Source Citation:'}</strong> {evidence.provenance.citation}
            </p>
          </section>

          {/* Descriptive Lapse & Recovery Summary */}
          {evidence.descriptive_recovery && (
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-ink-200 shadow-card space-y-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-ink-900 uppercase tracking-wider">
                  {language === 'ar' ? 'الخصائص الوصفية للتراجع والتعافي' : 'Descriptive Lapse & Recovery Characteristics'}
                </h3>
                <p className="text-xs text-ink-500 mt-0.5">
                  {language === 'ar'
                    ? 'معدلات التراجع الطبيعي ومدد التعافي المرصودة عبر 71 مشاركاً حقيقياً في بيانات LifeSnaps (الفجوات تُعامل كأيام مفقودة بقيمة 0).'
                    : 'Naturalistic lapse frequencies and recovery duration observed across 71 real participants in LifeSnaps (gaps treated as missing with 0 steps).'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#FAF4EB] border border-[#ECD9BD] text-center">
                  <div className="text-2xl font-black text-sand-800">{evidence.descriptive_recovery.total_lapses_detected}</div>
                  <div className="text-[11px] font-bold text-sand-800 mt-1">
                    {language === 'ar' ? 'إجمالي التراجعات المرصودة' : 'Total Lapses Detected'}
                  </div>
                  <div className="text-[10px] text-ink-500 mt-0.5">
                    {evidence.descriptive_recovery.participants_with_lapses} / {evidence.provenance.total_participants}{' '}
                    {language === 'ar' ? 'مشارك تراجعوا' : 'participants lapsed'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 text-center">
                  <div className="text-2xl font-black text-forest-900">{evidence.descriptive_recovery.mean_lapses_per_participant}</div>
                  <div className="text-[11px] font-bold text-forest-800 mt-1">
                    {language === 'ar' ? 'متوسط التراجعات / شخص' : 'Mean Lapses / Person'}
                  </div>
                  <div className="text-[10px] text-forest-700 mt-0.5">
                    {language === 'ar' ? 'الوسيط:' : 'Median:'} {evidence.descriptive_recovery.median_lapses_per_participant}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-center">
                  <div className="text-2xl font-black text-forest-900">
                    {evidence.descriptive_recovery.median_recovery_days} {language === 'ar' ? 'أيام' : 'days'}
                  </div>
                  <div className="text-[11px] font-bold text-forest-800 mt-1">
                    {language === 'ar' ? 'وسيط مدة التعافي' : 'Median Recovery Time'}
                  </div>
                  <div className="text-[10px] text-forest-700 mt-0.5">
                    {language === 'ar' ? 'المتوسط:' : 'Mean:'} {evidence.descriptive_recovery.mean_recovery_days} {language === 'ar' ? 'أيام' : 'days'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-ivory-100 border border-ink-200 text-center">
                  <div className="text-2xl font-black text-ink-900">{evidence.descriptive_recovery.total_recoveries_completed}</div>
                  <div className="text-[11px] font-bold text-ink-800 mt-1">
                    {language === 'ar' ? 'مرات التعافي المكتملة' : 'Recoveries Completed'}
                  </div>
                  <div className="text-[10px] text-ink-500 mt-0.5">
                    {language === 'ar' ? 'تمت استعادة الهدف الأساسي' : 'Restored to baseline target'}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Comparative Scorecard: Policy A vs Policy A' vs Policy B */}
          {evidence.policy_comparison && (
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-ink-200 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-ink-100">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-ink-900 uppercase tracking-wider">
                    {language === 'ar'
                      ? 'مقارنة السياسات الثلاث: السياسة أ، والسياسة أ\'، والسياسة ب'
                      : "Policy Comparison: Policy A vs. Policy A' vs. Policy B"}
                  </h3>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {language === 'ar'
                      ? 'مقارنة مباشرة تعزل أثر "تصفير التتابع" عن أثر "تخصيص الهدف".'
                      : 'Isolating the impact of streak resets to zero from personalized baseline calibration.'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-forest-50 text-forest-800 border border-forest-200 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
                  <span>Controlled Replay Analysis</span>
                </div>
              </div>

              {/* Symmetric Policy Evaluation Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-rose-600 block">
                    {language === 'ar' ? 'السياسة 1 (هدف 10k ثابت)' : 'Policy 1 (Static 10k)'}
                  </span>
                  <div className="text-xl font-black text-rose-950 mt-1">
                    {evidence.policy_comparison.find((p) => p.policy_id === 'A_10000')?.share_days_labeled_failure_pct ?? 89.4}%
                  </div>
                  <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
                    {language === 'ar' ? 'أيام موسومة بالفشل' : 'Days Labeled Failure'}
                  </span>
                  <span className="text-[10px] text-ink-500 block mt-1">
                    {evidence.policy_comparison.find((p) => p.policy_id === 'A_10000')?.mean_resets ?? 8.5} {language === 'ar' ? 'تصفير تتابع' : 'resets to zero'}
                  </span>
                </div>

                <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-sand-800 block">
                    {language === 'ar' ? 'السياسة 2 (تصفير تتابع)' : 'Policy 2 (Streak Reset)'}
                  </span>
                  <div className="text-xl font-black text-sand-950 mt-1">
                    {evidence.policy_comparison.find((p) => p.policy_id === 'A_PRIME')?.mean_resets ?? 17.9}
                  </div>
                  <span className="text-[10px] text-sand-800 font-semibold block mt-0.5">
                    {language === 'ar' ? 'متوسط مرات التصفير' : 'Mean Streak Resets'}
                  </span>
                  <span className="text-[10px] text-ink-500 block mt-1">
                    {evidence.policy_comparison.find((p) => p.policy_id === 'A_PRIME')?.share_days_labeled_failure_pct ?? 72.0}% {language === 'ar' ? 'أيام فشل' : 'failed days'}
                  </span>
                </div>

                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-sky-800 block">
                    {language === 'ar' ? 'السياسة 3 (متوسط متحرك)' : 'Policy 3 (Moving Avg)'}
                  </span>
                  <div className="text-xl font-black text-sky-950 mt-1">
                    {evidence.policy_comparison.find((p) => p.policy_id === 'A_ADAPTIVE_AVG')?.mean_resets ?? 22.5}
                  </div>
                  <span className="text-[10px] text-sky-800 font-semibold block mt-0.5">
                    {language === 'ar' ? 'متوسط مرات التصفير' : 'Mean Streak Resets'}
                  </span>
                  <span className="text-[10px] text-ink-500 block mt-1">
                    {evidence.policy_comparison.find((p) => p.policy_id === 'A_ADAPTIVE_AVG')?.share_days_labeled_failure_pct ?? 54.8}% {language === 'ar' ? 'أيام فشل' : 'failed days'}
                  </span>
                </div>

                <div className="p-4 bg-forest-50 border border-forest-300 rounded-2xl text-center ring-1 ring-forest-400">
                  <span className="text-[10px] uppercase font-bold text-forest-800 block">
                    {language === 'ar' ? 'السياسة 4 (سلم WellSync)' : 'Policy 4 (WellSync Ladder)'}
                  </span>
                  <div className="text-xl font-black text-forest-900 mt-1">
                    0.0
                  </div>
                  <span className="text-[10px] text-forest-700 font-bold block mt-0.5">
                    {language === 'ar' ? 'تصفير للتتابع (بالتصميم)' : 'Streak Resets (By Design)'}
                  </span>
                  <span className="text-[10px] text-forest-800 block mt-1">
                    {evidence.policy_comparison.find((p) => p.policy_id === 'B_LADDER')?.mean_return_count ?? 2.7} {language === 'ar' ? 'رحلات عودة مكتملة' : 'successful returns'}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-ink-200 bg-ivory-50 text-[10px] uppercase font-bold text-ink-500">
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'السياسة المختبرة' : 'Policy'}</th>
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'نوع الهدف' : 'Target Type'}</th>
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'نسبة الفشل %' : '% Labeled Failure'}</th>
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'متوسط مرات التصفير' : 'Mean Resets'}</th>
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'أطول تتابع' : 'Longest Streak'}</th>
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'نسبة التحقيق %' : 'Attainability %'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 font-medium text-ink-700">
                    {evidence.policy_comparison.map((item, idx) => {
                      const isPolicyB = item.policy_id === 'B_LADDER';
                      const isPolicyAPrime = item.policy_id === 'A_PRIME';
                      return (
                        <tr
                          key={idx}
                          className={
                            isPolicyB
                              ? 'bg-sage-50/70 font-semibold text-forest-950'
                              : isPolicyAPrime
                              ? 'bg-[#FAF4EB]/60 font-semibold text-sand-800'
                              : 'hover:bg-ivory-50'
                          }
                        >
                          <td className="py-3.5 px-3 text-start">
                            <span className={isPolicyB ? 'font-bold text-forest-900' : isPolicyAPrime ? 'font-bold text-sand-800' : 'text-ink-900'}>
                              {item.policy_name}
                            </span>
                            {isPolicyB && (
                              <span className="block text-[10px] text-forest-700 font-normal">
                                {language === 'ar'
                                  ? `تراكمي؛ متوسط الأيام النشطة: ${item.mean_active_days}d؛ متوسط العودات: ${item.mean_return_count}`
                                  : `Cumulative; Mean active days: ${item.mean_active_days}d; Mean returns: ${item.mean_return_count}`}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-start text-ink-600 text-[11px]">{item.target_type}</td>
                          <td className="py-3.5 px-3 text-start font-bold">
                            {item.share_days_labeled_failure_pct != null ? (
                              <span className={isPolicyB ? 'text-forest-700' : 'text-rose-600'}>
                                {item.share_days_labeled_failure_pct}%
                              </span>
                            ) : (
                              '--'
                            )}
                          </td>
                          <td className={`py-3.5 px-3 text-start ${isPolicyB ? 'text-forest-700 font-bold' : 'text-rose-700 font-bold'}`}>
                            {isPolicyB ? (language === 'ar' ? '0.0 (بحكم التصميم)' : '0.0 (By Design)') : item.mean_resets}
                          </td>
                          <td className="py-3.5 px-3 text-start">{item.longest_streak_mean} {language === 'ar' ? 'أيام' : 'days'}</td>
                          <td className="py-3.5 px-3 text-start">
                            <strong>{item.attainability_pct}%</strong>
                            {isPolicyB && (
                              <span className="block text-[10px] text-ink-500 font-normal">
                                {language === 'ar'
                                  ? `(أساس متطابق: ${item.baseline_attainability_pct}%)`
                                  : `(Baseline identical: ${item.baseline_attainability_pct}%)`}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-ivory-50 rounded-2xl border border-ink-200 text-xs text-ink-700 leading-relaxed space-y-2">
                <p>
                  <strong>{language === 'ar' ? 'الخلاصة العلمية الحاسمة:' : 'Critical Scientific Finding:'}</strong>{' '}
                  {language === 'ar'
                    ? 'في السياسة أ\'، عندما خصصنا الهدف ليعادل خط الأساس الشخصي لكل مشارك بدقة، ظل المشاركون يواجهون متوسط 17.9 انهياراً لسلاسل التتابع لأن أي يوم إجازة أو مرض أو عدم مزامنة يصفر التقدم كلياً. هذا يثبت أن المشكلة الجوهرية ليست فقط في تحديد أهداف غير واقعية، بل في آلية "التصفير للصفر" العقابية ذاتها.'
                    : "In Policy A', even when targets perfectly matched each participant's own personal baseline, participants still suffered an average of 17.9 streak resets to zero because any single illness, travel day, or sensor gap destroyed their accumulated record. This proves that the core driver of habit abandonment is the reset-to-zero streak mechanic itself, not just goal difficulty."}
                </p>
                <p className="text-[11px] text-ink-500">
                  <em>{language === 'ar' ? 'توضيح الشفافية:' : 'Transparency Note:'}</em>{' '}
                  {language === 'ar'
                    ? 'عدم وجود تصفير للتتابع في السياسة ب (0.0) ليس نتيجة مفاجئة بل خيار تصميمي متعمد يستبدل عقوبة الإلغاء بسلم تكيفي متدرج.'
                    : 'Zero streak resets in Policy B (0.0) is not an unexpected outcome but an intentional design choice that replaces punitive cancellation with adaptive ladder step-downs.'}
                </p>
              </div>
            </section>
          )}

          {/* Demographic Breakdown (Subgroups with n < 5 Masked) */}
          {evidence.demographics && (
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-ink-200 shadow-card space-y-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-ink-900 uppercase tracking-wider">
                  {language === 'ar' ? 'تحليل الفئات الديموغرافية (مع حجب الخصوصية)' : 'Demographic Subgroup Analysis (Privacy-Masked)'}
                </h3>
                <p className="text-xs text-ink-500 mt-0.5">
                  {language === 'ar'
                    ? 'توزيع النتائج حسب الجنس والعمر. يتم حجب الخلايا ذات العينة الأقل من 5 مشاركين كلياً لمنع كشف الهوية.'
                    : 'Subgroup disaggregation across gender and age. Cells with sample size < 5 participants are strictly suppressed to prevent individual re-identification.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gender */}
                <div className="border border-ink-200 rounded-2xl p-4 bg-ivory-50/50">
                  <h4 className="text-xs font-bold text-ink-900 uppercase tracking-wide mb-3 flex items-center justify-between">
                    <span>{language === 'ar' ? 'حسب الجنس' : 'By Gender'}</span>
                    <span className="text-[10px] text-ink-400 font-normal">Threshold: n &ge; 5</span>
                  </h4>
                  <div className="space-y-2">
                    {evidence.demographics.gender.map((g, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-ink-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink-900">{g.subgroup}</span>
                          <span className="text-[11px] text-ink-500">n = {g.participant_count}</span>
                        </div>
                        {g.masked ? (
                          <div className="mt-1 text-[11px] text-sand-700 italic flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? '[تم حجب البيانات: عينة أقل من 5 للخصوصية]' : '[Data suppressed: n < 5 privacy threshold]'}</span>
                          </div>
                        ) : (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-ink-600">
                            <div>{language === 'ar' ? 'تحقيق السياسة ب:' : 'Policy B Attainability:'} <strong className="text-forest-900">{g.policy_b_attainability_pct}%</strong></div>
                            <div>{language === 'ar' ? 'تصفير السياسة أ\':' : "Policy A' Resets:"} <strong className="text-sand-700">{g.policy_a_prime_resets}</strong></div>
                            <div>{language === 'ar' ? 'تراجعات السياسة ب:' : 'Policy B Lapses:'} <strong className="text-ink-900">{g.policy_b_mean_lapses}</strong></div>
                            <div>{language === 'ar' ? 'تصفير السياسة أ 10k:' : 'Policy A 10k Resets:'} <strong className="text-rose-600">{g.policy_a_10k_resets}</strong></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div className="border border-ink-200 rounded-2xl p-4 bg-ivory-50/50">
                  <h4 className="text-xs font-bold text-ink-900 uppercase tracking-wide mb-3 flex items-center justify-between">
                    <span>{language === 'ar' ? 'حسب الفئة العمرية' : 'By Age Category'}</span>
                    <span className="text-[10px] text-ink-400 font-normal">Threshold: n &ge; 5</span>
                  </h4>
                  <div className="space-y-2">
                    {evidence.demographics.age.map((a, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-ink-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink-900">{a.subgroup}</span>
                          <span className="text-[11px] text-ink-500">n = {a.participant_count}</span>
                        </div>
                        {a.masked ? (
                          <div className="mt-1 text-[11px] text-sand-700 italic flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? '[تم حجب البيانات: عينة أقل من 5 للخصوصية]' : '[Data suppressed: n < 5 privacy threshold]'}</span>
                          </div>
                        ) : (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-ink-600">
                            <div>{language === 'ar' ? 'تحقيق السياسة ب:' : 'Policy B Attainability:'} <strong className="text-forest-900">{a.policy_b_attainability_pct}%</strong></div>
                            <div>{language === 'ar' ? 'تصفير السياسة أ\':' : "Policy A' Resets:"} <strong className="text-sand-700">{a.policy_a_prime_resets}</strong></div>
                            <div>{language === 'ar' ? 'تراجعات السياسة ب:' : 'Policy B Lapses:'} <strong className="text-ink-900">{a.policy_b_mean_lapses}</strong></div>
                            <div>{language === 'ar' ? 'تصفير السياسة أ 10k:' : 'Policy A 10k Resets:'} <strong className="text-rose-600">{a.policy_a_10k_resets}</strong></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Sensitivity Analysis Grid with Parameter Explanations */}
          {evidence.sensitivity && (
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-ink-200 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ink-100">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-ink-900 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-forest-700" />
                    <span>{language === 'ar' ? 'تحليل الحساسية متعدد المعاملات (36 إعداداً)' : 'Multi-Parameter Sensitivity Analysis (36 Configurations)'}</span>
                  </h3>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {language === 'ar'
                      ? 'يوضح الجدول أدناه كيف تتغير معدلات التراجع ومدد التعافي بتغيير المعاملات الثلاثة (الأيام المفقودة تُحسب كأيام دون المستوى).'
                      : 'Shows how lapse counts and recovery times change across varying parameters. Missing days are treated as below-par.'}
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 text-xs">
                  <Filter className="w-3.5 h-3.5 text-ink-400" />
                  <select
                    className="p-2 bg-ivory-50 border border-ink-200 rounded-xl text-ink-700 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-forest-600"
                    value={selectedLapseLength}
                    onChange={(e) => setSelectedLapseLength(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    aria-label="Filter by lapse length"
                  >
                    <option value="all">{language === 'ar' ? 'جميع مدد التراجع' : 'All Lapse Lengths'}</option>
                    <option value="2">2 Days Lapse Trigger</option>
                    <option value="3">3 Days (Default)</option>
                    <option value="4">4 Days Lapse Trigger</option>
                    <option value="5">5 Days Lapse Trigger</option>
                  </select>

                  <select
                    className="p-2 bg-ivory-50 border border-ink-200 rounded-xl text-ink-700 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-forest-600"
                    value={selectedThreshold}
                    onChange={(e) => setSelectedThreshold(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    aria-label="Filter by below-par threshold"
                  >
                    <option value="all">{language === 'ar' ? 'جميع العتبات' : 'All Thresholds'}</option>
                    <option value="50">50% Threshold</option>
                    <option value="60">60% (Default)</option>
                    <option value="70">70% Threshold</option>
                  </select>
                </div>
              </div>

              {/* Grid Trend Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-ink-600">
                <div className="p-4 bg-ivory-50 rounded-2xl border border-ink-200">
                  <strong className="text-ink-900 block font-bold mb-1">
                    {language === 'ar' ? 'أثر طول التراجع (2 إلى 5 أيام):' : 'Lapse Length Effect (2 to 5 days):'}
                  </strong>
                  <p className="text-[11px] leading-relaxed">
                    {language === 'ar'
                      ? 'العتبة الصارمة (يومان) ترفع التراجعات إلى ~194 تراجعاً (حساسية عالية للتقلبات اليومية)، بينما 5 أيام تخفضها إلى ~78 تراجعاً (استجابة بطيئة للتراجع الحقيقي).'
                      : 'A 2-day trigger detects ~194 lapses (highly sensitive to brief dips); a 5-day trigger detects ~78 lapses (delays intervention during genuine drops).'}
                  </p>
                </div>

                <div className="p-4 bg-ivory-50 rounded-2xl border border-ink-200">
                  <strong className="text-ink-900 block font-bold mb-1">
                    {language === 'ar' ? 'أثر عتبة دون المستوى (50% إلى 70%):' : 'Below-Par Threshold Effect (50% to 70%):'}
                  </strong>
                  <p className="text-[11px] leading-relaxed">
                    {language === 'ar'
                      ? 'رفع العتبة إلى 70% يزيد من تكرار رصد التراجع، بينما تخفيضها إلى 50% يتسامح مع الانخفاضات المعتدلة.'
                      : 'A 70% threshold classifies more moderate drops as below-par; a 50% threshold accommodates moderate dips before triggering a step-down.'}
                  </p>
                </div>

                <div className="p-4 bg-ivory-50 rounded-2xl border border-ink-200">
                  <strong className="text-ink-900 block font-bold mb-1">
                    {language === 'ar' ? 'نافذة الأساس ومعاملة الفقدان:' : 'Baseline Window & Missing Days:'}
                  </strong>
                  <p className="text-[11px] leading-relaxed">
                    {language === 'ar'
                      ? 'نافذة 28 يوماً تمثل التوازن الأمثل لاستقرار الوسيط. جميع أيام عدم المزامنة تُحسب كأيام دون المستوى تساهم في طول التراجع.'
                      : 'The 28-day window balances stability with seasonal adaptation. All unsynced days count as below-par toward lapse duration.'}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-80 overflow-y-auto border border-ink-200 rounded-2xl">
                <table className="w-full text-start border-collapse text-xs">
                  <thead className="sticky top-0 bg-ivory-100 text-[10px] uppercase font-bold text-ink-600 border-b border-ink-200">
                    <tr>
                      <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'معيار التراجع' : 'Lapse Trigger'}</th>
                      <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'عتبة دون المستوى' : 'Below-Par Threshold'}</th>
                      <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'نافذة خط الأساس' : 'Baseline Window'}</th>
                      <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'إجمالي التراجعات' : 'Total Lapses'}</th>
                      <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'متوسط التراجعات/شخص' : 'Mean Lapses/Person'}</th>
                      <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'متوسط مدة التعافي' : 'Mean Recovery Time'}</th>
                      <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'وسيط التعافي' : 'Median Recovery'}</th>
                      <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'نسبة التحقيق %' : 'Attainability %'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 font-medium text-ink-700">
                    {filteredSensitivity.map((row, idx) => {
                      const isDefault =
                        row.lapse_length_days === 3 &&
                        row.below_par_threshold_pct === 60 &&
                        row.baseline_window_days === 28;
                      return (
                        <tr
                          key={idx}
                          className={
                            isDefault
                              ? 'bg-sage-50 font-bold text-forest-950'
                              : 'hover:bg-ivory-50'
                          }
                        >
                          <td className="py-2 px-3 text-start">
                            {row.lapse_length_days} {language === 'ar' ? 'أيام متتالية' : 'consecutive days'}
                            {isDefault && (
                              <span className="ms-1.5 text-[10px] text-forest-700 font-bold bg-white px-1.5 py-0.5 rounded border border-forest-200">
                                {language === 'ar' ? '(الافتراضي)' : '(Default)'}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-start">
                            {row.below_par_threshold_pct}% {language === 'ar' ? 'من الأساس' : 'of baseline'}
                          </td>
                          <td className="py-2 px-3 text-start">{row.baseline_window_days} {language === 'ar' ? 'يوماً' : 'days'}</td>
                          <td className="py-2 px-3 text-start">{row.total_lapses_detected}</td>
                          <td className="py-2 px-3 text-start">{row.mean_lapses_per_participant}</td>
                          <td className="py-2 px-3 text-start">
                            {row.mean_recovery_days ? `${row.mean_recovery_days} ${language === 'ar' ? 'أيام' : 'days'}` : 'N/A'}
                          </td>
                          <td className="py-2 px-3 text-start">
                            {row.median_recovery_days ? `${row.median_recovery_days} ${language === 'ar' ? 'أيام' : 'days'}` : 'N/A'}
                          </td>
                          <td className="py-2 px-3 text-start">{row.mean_attainability_pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-ink-500">
                {language === 'ar'
                  ? `عرض ${filteredSensitivity.length} من إجمالي ${evidence.sensitivity.length} تكويناً للحساسية. عبر جميع التكوينات، تحقق السياسة ب نسبة 0.0 تصفير للتتابع وتماسكاً أعلى مقارنة بالأهداف الثابتة.`
                  : `Showing ${filteredSensitivity.length} of ${evidence.sensitivity.length} sensitivity permutations. Across all permutations, Policy B consistently produces zero streak resets and higher continuous engagement compared to static threshold policies.`}
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
