/**
 * WellSync UAE Context Engine
 *
 * Deterministic, offline, rule-based contextual adaptation system designed specifically
 * for the cultural, operational, and environmental realities of Abu Dhabi and the UAE:
 *
 * 1. Ramadan Mode: Offline Hijri calculation, 70% target scaling, post-Iftar & pre-Suhoor windows.
 * 2. Summer Heat Mode: Jun-Sep seasonal default, indoor mall-walking / stair options, zero outdoor-only guidance.
 * 3. Shift-Work Mode: Rotating pattern support; post-night-shift days treated as planned adjustments, not lapses.
 * 4. Planned Pause: Declared travel, illness, or family care window with non-punitive re-engagement.
 *
 * MATHEMATICAL INTEGRITY GUARANTEE:
 * Context modes adjust target ladders (e.g. Ramadan target = 70% of baseline), NOT the underlying
 * deterministic lapse state machine. The k=3 consecutive failure rule still applies strictly relative
 * to the adjusted target rung. User data never leaves the client.
 */

export type ContextModeType = 'standard' | 'ramadan' | 'summer_heat' | 'shift_work' | 'planned_pause';

export interface ShiftPatternConfig {
  enabled: boolean;
  /** Days on day-shift, days on night-shift, days off (e.g. 2-2-4 rotation) */
  patternType: 'rotating_12h' | 'night_heavy' | 'custom';
  dayShiftDays: number;
  nightShiftDays: number;
  offDays: number;
  cycleStartDate: string; // YYYY-MM-DD
}

export interface PlannedPauseConfig {
  enabled: boolean;
  reason: 'travel' | 'illness' | 'family_care' | 'other';
  startDate: string;
  endDate?: string;
  note?: string;
}

export interface UserContextConfig {
  activeMode: ContextModeType;
  /** Force summer heat mode on or off outside default months */
  summerHeatManualOverride?: boolean;
  /** Ramadan target scale multiplier (default 0.70 = 70%) */
  ramadanTargetRatio: number;
  shiftPattern: ShiftPatternConfig;
  plannedPause: PlannedPauseConfig;
}

export const DEFAULT_CONTEXT_CONFIG: UserContextConfig = {
  activeMode: 'standard',
  ramadanTargetRatio: 0.70,
  shiftPattern: {
    enabled: false,
    patternType: 'rotating_12h',
    dayShiftDays: 2,
    nightShiftDays: 2,
    offDays: 4,
    cycleStartDate: '2026-01-01',
  },
  plannedPause: {
    enabled: false,
    reason: 'illness',
    startDate: '',
  },
};

/**
 * Offline Hijri calendar calculation (Umm al-Qura approximation).
 * Computes estimated Hijri month (9 = Ramadan) deterministically without external network calls.
 */
export function getEstimatedHijriDate(date: Date | string): {
  hy: number;
  hm: number;
  hd: number;
  isRamadan: boolean;
} {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00Z') : date;
  const m = d.getUTCMonth() + 1;
  const y = d.getUTCFullYear();
  const day = d.getUTCDate();

  // Astronomical Julian Date
  const a = Math.floor((14 - m) / 12);
  const y_adj = y + 4800 - a;
  const m_adj = m + 12 * a - 3;
  const jd =
    day +
    Math.floor((153 * m_adj + 2) / 5) +
    365 * y_adj +
    Math.floor(y_adj / 4) -
    Math.floor(y_adj / 100) +
    Math.floor(y_adj / 400) -
    32045;

  // Gregorian to Hijri conversion formula
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l_adj = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l_adj) / 5316) * Math.floor((50 * l_adj) / 17719) +
    Math.floor(l_adj / 5670) * Math.floor((43 * l_adj) / 15238);
  const l_final =
    l_adj -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const hm = Math.floor((24 * l_final) / 709);
  const hd = l_final - Math.floor((709 * hm) / 24);
  const hy = 30 * n + j - 30;

  // Month 9 in Islamic calendar is Ramadan
  return {
    hy,
    hm,
    hd,
    isRamadan: hm === 9,
  };
}

/**
 * Checks whether the current date falls within Abu Dhabi extreme summer heat season (June 1 - Sept 30).
 */
export function isAbuDhabiSummerSeason(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00Z') : date;
  const month = d.getUTCMonth() + 1; // 1-12
  return month >= 6 && month <= 9;
}

export interface ContextualAdaptationResult {
  mode: ContextModeType;
  titleEn: string;
  titleAr: string;
  explanationEn: string;
  explanationAr: string;
  targetMultiplier: number;
  isRestExempt: boolean;
  recommendedWindowsEn: string[];
  recommendedWindowsAr: string[];
  indoorRecommended: boolean;
}

/**
 * Evaluates active context rules for a given date and returns behavioral parameters.
 */
export function evaluateContextAdaptation(
  date: string,
  userConfig: UserContextConfig = DEFAULT_CONTEXT_CONFIG
): ContextualAdaptationResult {
  const d = new Date(date + 'T00:00:00Z');

  // 1. PLANNED PAUSE (Takes precedence over all other modes)
  if (userConfig.plannedPause.enabled && userConfig.plannedPause.startDate) {
    const pauseStart = new Date(userConfig.plannedPause.startDate + 'T00:00:00Z');
    const isAfterStart = d >= pauseStart;
    const isBeforeEnd = !userConfig.plannedPause.endDate || d <= new Date(userConfig.plannedPause.endDate + 'T00:00:00Z');

    if (isAfterStart && isBeforeEnd) {
      return {
        mode: 'planned_pause',
        titleEn: 'Planned Pause (Exempt from Lapses)',
        titleAr: 'توقف مخطط (معفى من احتساب الانقطاع)',
        explanationEn: `You have declared a temporary pause for ${userConfig.plannedPause.reason}. Inactivity during this window never counts as a lapse, preserving your accumulated active days.`,
        explanationAr: `لقد حددت فترة توقف مؤقت بسبب (${userConfig.plannedPause.reason}). عدم تسجيل النشاط خلال هذه الفترة لا يعتبر انقطاعاً ويحافظ على أيامك النشطة.`,
        targetMultiplier: 0.50,
        isRestExempt: true,
        recommendedWindowsEn: ['Rest & recover', 'Gentle movement only when ready'],
        recommendedWindowsAr: ['راحة واستشفاء', 'حركة خفيفة فقط عند الاستعداد'],
        indoorRecommended: false,
      };
    }
  }

  // 2. EXPLICIT SHIFT-WORK MODE
  if (userConfig.activeMode === 'shift_work' && userConfig.shiftPattern.enabled) {
    const cycleStart = new Date(userConfig.shiftPattern.cycleStartDate + 'T00:00:00Z');
    const diffDays = Math.floor((d.getTime() - cycleStart.getTime()) / (24 * 60 * 60 * 1000));
    const totalCycle =
      userConfig.shiftPattern.dayShiftDays +
      userConfig.shiftPattern.nightShiftDays +
      userConfig.shiftPattern.offDays;

    if (totalCycle > 0 && diffDays >= 0) {
      const cycleDay = diffDays % totalCycle;
      const isNightShift =
        cycleDay >= userConfig.shiftPattern.dayShiftDays &&
        cycleDay < userConfig.shiftPattern.dayShiftDays + userConfig.shiftPattern.nightShiftDays;
      const isOffDay = cycleDay >= userConfig.shiftPattern.dayShiftDays + userConfig.shiftPattern.nightShiftDays;

      if (cycleDay < userConfig.shiftPattern.dayShiftDays) {
        return {
          mode: 'shift_work',
          titleEn: 'Shift Work: Day Duty Rotation',
          titleAr: 'ورديات العمل: مناوبة نهارية',
          explanationEn: 'Operating on scheduled day rotation at standard baseline target.',
          explanationAr: 'أنت في مناوبة نهارية مجدولة وفق أهدافك الأساسية.',
          targetMultiplier: 1.0,
          isRestExempt: false,
          recommendedWindowsEn: ['Pre-shift morning walk', 'Post-shift evening relaxation'],
          recommendedWindowsAr: ['مشي صباحي قبل بدء المناوبة', 'استرخاء ونشاط خفيف مساءً'],
          indoorRecommended: false,
        };
      }

      if (isNightShift) {
        return {
          mode: 'shift_work',
          titleEn: 'Shift Work: Night Duty Adjustment',
          titleAr: 'ورديات العمل: تعديل الوردية الليلية',
          explanationEn: 'Currently on night rotation. Step goals stepped down to 60% of baseline to protect circadian recovery and sleep debt.',
          explanationAr: 'أنت حالياً في مناوبة ليلية. تم تقليص الهدف إلى 60% لدعم التعافي البيولوجي وتجنب تراكم إجهاد النوم.',
          targetMultiplier: 0.60,
          isRestExempt: false,
          recommendedWindowsEn: ['Pre-shift preparation (18:00 - 19:30)', 'Mid-shift mobility break'],
          recommendedWindowsAr: ['قبل بدء المناوبة (6:00 - 7:30 مساءً)', 'استراحة حركة خفيفة أثناء المناوبة'],
          indoorRecommended: true,
        };
      }

      if (isOffDay) {
        return {
          mode: 'shift_work',
          titleEn: 'Shift Work: Recovery Off-Day',
          titleAr: 'ورديات العمل: يوم استشفاء وإجازة',
          explanationEn: 'Post-shift recovery day. Inactivity is treated as a planned physiological adaptation and will not trigger a lapse.',
          explanationAr: 'يوم استشفاء بعد انتهاء المناوبات. انخفاض النشاط يعتبر تكيفاً فسيولوجياً مخططاً ولا يؤدي إلى انقطاع.',
          targetMultiplier: 0.50,
          isRestExempt: true,
          recommendedWindowsEn: ['Gentle leisurely walk', 'Restorative sleep focus'],
          recommendedWindowsAr: ['مشي ترفيهي خفيف', 'التركيز على النوم التصحيحي'],
          indoorRecommended: false,
        };
      }
    }
  }

  // 3. EXPLICIT OR AUTO RAMADAN MODE
  const hijri = getEstimatedHijriDate(d);
  if (userConfig.activeMode === 'ramadan' || (userConfig.activeMode === 'standard' && hijri.isRamadan)) {
    const multiplier = userConfig.ramadanTargetRatio || 0.70;
    return {
      mode: 'ramadan',
      titleEn: 'Ramadan Rhythm Mode',
      titleAr: 'نمط شهر رمضان المبارك',
      explanationEn: `Targets are gently adjusted to ${Math.round(multiplier * 100)}% of your normal baseline to accommodate daylight fasting and biphasic sleep schedules. Focus is on routine preservation, not intense exertion.`,
      explanationAr: `تم تعديل الهدف اليومي تلقائياً إلى ${Math.round(multiplier * 100)}% من مستواك الأساسي لملاءمة الصيام وتغير نمط النوم. التركيز على الحفاظ على استمرارية العادة دون إجهاد.`,
      targetMultiplier: multiplier,
      isRestExempt: false,
      recommendedWindowsEn: [
        'Post-Iftar window (20:00 - 23:00)',
        'Pre-Suhoor gentle walk (04:00 - 05:00)',
      ],
      recommendedWindowsAr: [
        'فترة ما بعد الإفطار (8:00 - 11:00 مساءً)',
        'فترة ما قبل السحور (4:00 - 5:00 صباحاً)',
      ],
      indoorRecommended: true,
    };
  }

  // 4. SUMMER HEAT MODE (Default Jun-Sep or manual override)
  const isSummer = userConfig.summerHeatManualOverride ?? isAbuDhabiSummerSeason(d);
  if (userConfig.activeMode === 'summer_heat' || (userConfig.activeMode === 'standard' && isSummer)) {
    return {
      mode: 'summer_heat',
      titleEn: 'Abu Dhabi Summer Heat Protection',
      titleAr: 'حماية موسم حرارة الصيف (أبوظبي)',
      explanationEn: 'Summer ambient temperatures exceed safe outdoor thresholds. Activity guidance prioritizes air-conditioned indoor facilities, mall walking, and early morning/late evening hours.',
      explanationAr: 'درجات الحرارة المرتفعة صيفاً تستدعي حماية الجسم. التوصيات تركز على المشي في المراكز التجارية المغلقة (المولات)، والأنشطة الداخلية، وساعات الصباح الباكر أو المساء.',
      targetMultiplier: 0.85,
      isRestExempt: false,
      recommendedWindowsEn: [
        'Early morning outdoor before 06:30',
        'Air-conditioned mall walking (Abu Dhabi Mall / Yas Mall / Galleria)',
        'Indoor stair or home mobility (any time)',
        'Late evening after 20:30',
      ],
      recommendedWindowsAr: [
        'الصباح الباكر قبل الساعة 6:30 صباحاً',
        'المشي في المراكز التجارية المكيفة (ياس مول / أبوظبي مول / الغاليريا)',
        'صعود الدرج أو الحركة المنزلية في أي وقت',
        'المساء بعد الساعة 8:30 ليلاً',
      ],
      indoorRecommended: true,
    };
  }

  // STANDARD MODE
  return {
    mode: 'standard',
    titleEn: 'Standard Habit Rhythm',
    titleAr: 'الوتيرة اليومية القياسية',
    explanationEn: 'Operating at your standard personalized baseline targets.',
    explanationAr: 'العمل وفق أهدافك الأساسية الشخصية القياسية.',
    targetMultiplier: 1.0,
    isRestExempt: false,
    recommendedWindowsEn: ['Morning walk', 'Lunchtime movement', 'Evening relaxation'],
    recommendedWindowsAr: ['مشي الصباح', 'حركة منتصف اليوم', 'نشاط المساء الخفيف'],
    indoorRecommended: false,
  };
}
