export type Language = 'en' | 'ar';

export const translations: Record<string, { en: string; ar: string }> = {
  // Navigation & Header
  'nav.brand': { en: 'WellSync', ar: 'WellSync' },
  'nav.tagline': { en: 'Sustaining Healthy Behaviors', ar: 'استدامة السلوكيات الصحية' },
  'nav.today': { en: 'Today', ar: 'اليوم' },
  'nav.recovery': { en: 'Recovery Flow', ar: 'مسار التعافي' },
  'nav.history': { en: 'History', ar: 'السجل' },
  'nav.evidence': { en: 'Evidence', ar: 'الأدلة' },
  'nav.about': { en: 'About & Sources', ar: 'عن النظام والمصادر' },
  'nav.settings': { en: 'Settings & Privacy', ar: 'الإعدادات والخصوصية' },
  'nav.guest': { en: 'Guest Mode', ar: 'وضع الضيف' },
  'nav.guest_sub': { en: 'Data stays in your browser', ar: 'بياناتك محفوظة محلياً في متصفحك فقط' },
  'nav.unreviewed_banner': {
    en: 'Notice: Arabic translation is unreviewed — pending review by a native Arabic speaker before clinical/field deployment.',
    ar: 'تنبيه: الترجمة العربية غير مدققة — بانتظار مراجعة متحدث أصلي للغة العربية قبل أي تطبيق ميداني.'
  },
  'nav.switch_lang': { en: 'Switch Language', ar: 'تغيير اللغة' },
  'nav.text_size': { en: 'Text Size', ar: 'حجم الخط' },

  // General Status & Ladder
  'status.on_track': { en: 'On Track', ar: 'على المسار' },
  'status.slipping': { en: 'Slipping', ar: 'تراجع طفيف' },
  'status.lapsed': { en: 'Lapsed', ar: 'تراجع ملحوظ' },
  'status.recovering': { en: 'Recovering', ar: 'في مرحلة التعافي' },
  'status.learning': { en: 'Learning Your Baseline', ar: 'جاري استكشاف خط الأساس' },

  'ladder.minimum': { en: 'Minimum Rung (50%)', ar: 'المستوى الأدنى (50%)' },
  'ladder.target': { en: 'Target Rung (100%)', ar: 'المستوى المستهدف (100%)' },
  'ladder.stretch': { en: 'Stretch Rung (110%)', ar: 'المستوى الموسع (110%)' },

  // Today Screen
  'today.header_desc': {
    en: 'Monitor your personal baseline, track active targets, and log daily entries.',
    ar: 'راقب خط الأساس الشخصي، وتتبع أهدافك النشطة، وسجل نشاطك اليومي.'
  },
  'today.active_behavior': { en: 'Active Behavior', ar: 'السلوك النشط' },
  'today.steps': { en: 'Daily Steps', ar: 'الخطوات اليومية' },
  'today.sleep': { en: 'Sleep Duration', ar: 'مدة النوم' },
  'today.steps_unit': { en: 'steps', ar: 'خطوة' },
  'today.sleep_unit': { en: 'hours', ar: 'ساعة' },
  'today.current_baseline': { en: 'Your 28-day Baseline', ar: 'خط الأساس لـ 28 يوماً' },
  'today.current_rung': { en: 'Today’s Active Target', ar: 'الهدف النشط لليوم' },
  'today.checkin_title': { en: 'Log Daily Activity', ar: 'تسجيل النشاط اليومي' },
  'today.checkin_cta': { en: 'Save Check-In', ar: 'حفظ التسجيل' },
  'today.active_days': { en: 'Cumulative Active Days', ar: 'إجمالي الأيام النشطة' },
  'today.return_count': { en: 'Successful Returns', ar: 'مرات العودة الناجحة' },
  'today.streak_free_note': {
    en: 'WellSync never resets your progress to zero. Active days and recovery returns accumulate permanently.',
    ar: 'نظام WellSync لا يعيد تقدمك للصفر مطلقاً. الأيام النشطة ومرات العودة تتراكم بشكل دائم دون عقاب.'
  },
  'today.bct_title': { en: 'Behavior Change Technique', ar: 'تقنية تغيير السلوك المعتمدة' },
  'today.bct_reason': { en: 'Scientific Rationale', ar: 'المبرر العلمي' },
  'today.bct_limits': { en: 'Known Limitations', ar: 'الحدود والضوابط' },
  'today.recovery_cta': { en: 'Lapse Detected: Open Recovery Plan', ar: 'تم رصد تراجع: فتح خطة التعافي التكيفية' },
  'today.date_label': { en: 'Date', ar: 'التاريخ' },
  'today.step_count_label': { en: 'Step Count', ar: 'عدد الخطوات' },
  'today.sleep_hours_label': { en: 'Hours', ar: 'ساعات' },
  'today.sleep_mins_label': { en: 'Minutes', ar: 'دقائق' },
  'today.rest_day_label': { en: 'Mark as Planned Rest / Sick Day', ar: 'تحديد كيوم راحة مخطط أو يوم مرض' },
  'today.context_note_label': { en: 'Optional Context Note', ar: 'ملاحظة سياقية اختيارية' },
  'today.context_note_placeholder': { en: 'e.g., travel, rainy weather, high workload', ar: 'مثال: سفر، طقس ممطر، ضغط عمل' },
  'today.saved_success': { en: 'Entry recorded successfully!', ar: 'تم تسجيل النشاط بنجاح!' },

  // Recovery Flow
  'recovery.title': { en: 'Adaptive Recovery Flow', ar: 'مسار التعافي التكيفي' },
  'recovery.subtitle': {
    en: 'Stepping down your target to maintain engagement without shame or streak resets.',
    ar: 'خفض الهدف مؤقتاً للحفاظ على الاستمرارية وتجنب الشعور بالإحباط أو تصفير التقدم.'
  },
  'recovery.stepped_down': { en: 'Target Stepped Down to Minimum (50%)', ar: 'تم خفض الهدف إلى المستوى الأدنى (50%)' },
  'recovery.stepped_down_desc': {
    en: 'Meeting this minimum rung counts as a complete success. 3 consecutive successes will step you back up to your target.',
    ar: 'تحقيق هذا الهدف الأدنى يُعد إنجازاً كاملاً. تحقيق 3 أيام متتالية سيعيدك تلقائياً إلى المستوى المستهدف.'
  },
  'recovery.hypotheses_title': { en: 'Non-Clinical Barrier Hypotheses', ar: 'فرضيات العوائق غير السريرية' },
  'recovery.hypotheses_desc': {
    en: 'These are rule-based behavioral patterns, not medical inferences. You can reject any hypothesis that does not match your reality.',
    ar: 'هذه أنماط سلوكية قائمة على القواعد فقط وليست استنتاجات طبية. يحق لك رفض أي فرضية لا تعبر عن واقعك.'
  },
  'recovery.reject_btn': { en: 'Reject Hypothesis', ar: 'رفض الفرضية' },
  'recovery.rejected_badge': { en: 'Rejected by You', ar: 'تم رفضها من قبلك' },
  'recovery.micro_action_title': { en: 'Select a Micro-Action Commitment', ar: 'اختر التزاماً بخطوة مصغرة' },
  'recovery.commit_btn': { en: 'Confirm Commitment & Return to Today', ar: 'تأكيد الالتزام والعودة لليوم' },
  'recovery.consecutive_successes': { en: 'Consecutive Successes on Minimum', ar: 'أيام الإنجاز المتتالية على الهدف الأدنى' },
  'recovery.successes_needed': { en: 'days (3 needed to restore target)', ar: 'أيام (مطلوب 3 أيام لاستعادة الهدف)' },

  // History Screen
  'history.title': { en: 'Behavioral History Log', ar: 'سجل السلوك التاريخي' },
  'history.subtitle': { en: 'Complete chronological record of all logged entries and state transitions.', ar: 'سجل زمني شامل لجميع الإدخالات وانتقالات الحالات السلوكية.' },
  'history.filter_all': { en: 'All Records', ar: 'جميع السجلات' },
  'history.filter_success': { en: 'Success Days', ar: 'أيام الإنجاز' },
  'history.filter_lapsed': { en: 'Lapse Days', ar: 'أيام التراجع' },
  'history.col_date': { en: 'Date', ar: 'التاريخ' },
  'history.col_behavior': { en: 'Behavior', ar: 'السلوك' },
  'history.col_value': { en: 'Recorded Value', ar: 'القيمة المسجلة' },
  'history.col_target': { en: 'Active Target', ar: 'الهدف النشط' },
  'history.col_state': { en: 'State', ar: 'الحالة' },
  'history.col_outcome': { en: 'Outcome', ar: 'النتيجة' },
  'history.no_records': { en: 'No data recorded yet. Use the check-in form on the Today screen or load the synthetic demo journey in Settings.', ar: 'لا توجد بيانات مسجلة بعد. استخدم نموذج التسجيل في شاشة اليوم أو قم بتحميل التجربة المصطنعة في الإعدادات.' },
  'history.total_records': { en: 'Total Records', ar: 'إجمالي السجلات' },
  'history.success_rate': { en: 'Success Rate', ar: 'نسبة الإنجاز' },

  // Evidence Screen
  'evidence.title': { en: 'Replay Evidence & Policy Benchmark', ar: 'أدلة إعادة المحاكاة ومقارنة السياسات' },
  'evidence.empirical': { en: 'Empirical Evaluation', ar: 'تقييم تجريبي' },
  'evidence.disclaimer_title': { en: 'Mandatory Evaluation Disclaimers', ar: 'إخلاء مسؤولية تقييمي إلزامي' },
  'evidence.disclaimer_1': {
    en: 'Rule Replay, Not Behavior Change: This retrospective replay demonstrates how deterministic rules treat recorded wearable behavior. It does not prove behavior change or clinical efficacy in individuals.',
    ar: 'إعادة تشغيل القواعد لا تثبت تغيير السلوك: توضح هذه المحاكاة بأثر رجعي كيفية تعامل القواعد الخوارزمية مع البيانات المسجلة، ولا تثبت حدوث تغيير سلوكي أو فعالية سريرية لدى الأفراد.'
  },
  'evidence.disclaimer_2': {
    en: 'Demographic Scope: Participants in the LifeSnaps study belong to an open research cohort (Zenodo 7229547) and are not an Abu Dhabi sample. Results must not be assumed representative of UAE or GCC populations without localized validation.',
    ar: 'نطاق العينة الديموغرافية: ينتمي المشاركون في دراسة LifeSnaps إلى عينة بحثية مفتوحة، وليست عينة تمثل مجتمع أبوظبي أو دولة الإمارات أو دول الخليج العربي دون التحقق المحلي.'
  },
  'evidence.disclaimer_3': {
    en: 'Data Integrity: Zero numbers are fabricated or estimated from assumed distributions. Numbers appear only when produced directly from real data files by the analysis script.',
    ar: 'نزاهة البيانات: صفر أرقام مصطنعة أو مقدرة من توزيعات افتراضية. تظهر الأرقام حصراً عند إنتاجها مباشرة من ملفات البيانات الحقيقية بواسطة كود التحليل.'
  },
  'evidence.disclaimer_4': {
    en: 'Zero Runtime AI/LLM: The entire replay and runtime engine are deterministic pure functions with zero AI/LLM calls.',
    ar: 'صفر ذكاء اصطناعي أثناء التشغيل: محرك التشغيل والمحاكاة مبنيان على دوال رياضية محددة وقائمة على القواعد بالكامل دون أي استدعاءات لنماذج ذكاء اصطناعي.'
  },

  // Settings & Privacy
  'settings.title': { en: 'Settings & Privacy Controls', ar: 'الإعدادات وضوابط الخصوصية' },
  'settings.subtitle': { en: 'Configure your goals, manage quiet hours, and control your local data sovereignty.', ar: 'ضبط أهدافك، إدارة ساعات الهدوء، والتحكم بسيادة بياناتك المحلية.' },
  'settings.step_goal': { en: 'Daily Step Target', ar: 'هدف الخطوات اليومي' },
  'settings.sleep_goal': { en: 'Sleep Duration Target (Hours)', ar: 'هدف مدة النوم (بالساعات)' },
  'settings.save_goals': { en: 'Save Goals', ar: 'حفظ الأهداف' },
  'settings.quiet_hours': { en: 'Quiet Hours (Suppresses Notifications)', ar: 'ساعات الهدوء (تعطيل الإشعارات والتذكيرات)' },
  'settings.export_title': { en: 'Data Sovereignty: Export & Erase', ar: 'سيادة البيانات: التصدير والحذف' },
  'settings.export_btn': { en: 'Export Browser Data (.json)', ar: 'تصدير بيانات المتصفح (.json)' },
  'settings.wipe_btn': { en: 'Wipe All Data Permanently', ar: 'حذف جميع البيانات نهائياً' },
  'settings.wipe_confirm': { en: 'Are you sure you want to delete all stored data? This action cannot be undone.', ar: 'هل أنت متأكد من رغبتك في حذف جميع البيانات المخزنة؟ لا يمكن التراجع عن هذا الإجراء.' },
  'settings.demo_title': { en: 'Synthetic Demonstration Persona', ar: 'شخصية توضيحية مصطنعة' },
  'settings.demo_desc': { en: 'Load pre-generated synthetic test journeys created by the student team. These contain zero participant data.', ar: 'تحميل رحلات اختبار مصطنعة أنشأها فريق الطلاب لأغراض العرض فقط، ولا تحتوي على أي بيانات لأشخاص حقيقيين.' },
  'settings.load_demo_tariq': { en: 'Load Persona: Tariq (Shift Worker)', ar: 'تحميل شخصية: طارق (عامل مناوبات)' },
  'settings.load_demo_sarah': { en: 'Load Persona: Sarah (Working Parent)', ar: 'تحميل شخصية: سارة (أم عاملة)' },

  // About Screen
  'about.title': { en: 'About WellSync & Attribution', ar: 'عن WellSync والمصادر والاعتمادات' },
  'about.challenge_badge': { en: 'Future Health Digital Innovation Challenge 2026', ar: 'تحدي الابتكار الصحي الرقمي 2026' },
  'about.challenge_title': { en: 'Challenge 09: Sustaining Healthy Behaviors (Abu Dhabi)', ar: 'التحدي 09: استدامة السلوكيات الصحية (أبوظبي)' },
  'about.student_disclaimer': {
    en: 'Student prototype by Ayesha Sutana and B. Alence. Not affiliated with any commercial product named WellSync. Developed with no clinical partner, zero clinical testing, and zero commercial backing. Not a medical device.',
    ar: 'نموذج أولي للطلاب طوره الطالبان عائشة سوتانا (Ayesha Sutana) و ب. ألينس (B. Alence). ليس تابعاً لأي منتج تجاري يحمل اسم WellSync. تم التطوير دون شريك سريري، ودون اختبارات سريرية، ودون أي دعم تجاري. النظام ليس جهازاً طبياً.'
  },
  'about.rules_title': { en: 'Rule-Based Engine Architecture', ar: 'بنية المحرك القائم على القواعد' },
  'about.rules_desc': {
    en: 'WellSync contains NO machine learning, NO LLM inference, and NO black-box algorithms. Every decision executes pure deterministic functions.',
    ar: 'لا يحتوي WellSync على أي تعلم آلي، ولا أي نماذج لغوية، ولا خوارزميات صندوق أسود. كل قرار ينفذ دوال رياضية محددة وشفافة.'
  },
  'about.michie_title': { en: 'Behavior Change Techniques (Michie et al. 2013)', ar: 'تقنيات تغيير السلوك (ميتشي وآخرون 2013)' },
  'about.lifesnaps_title': { en: 'LifeSnaps Dataset Attribution (CC BY 4.0)', ar: 'إسناد بيانات LifeSnaps (ترخيص CC BY 4.0)' },
  'about.excluded_title': { en: 'Explicitly Excluded Features & Risk Analysis', ar: 'الميزات المستبعدة عمداً وتحليل مخاطرها' },
  'about.excluded_desc': {
    en: 'Workplace leaderboards, peer competitions, and employer/insurer reporting are deliberately excluded due to proven risks of surveillance stigma, shame-induced disengagement, and punitive discrimination.',
    ar: 'تم استبعاد لوحات المتصدرين في أماكن العمل والمنافسات بين الأقران وتقارير أرباب العمل أو شركات التأمين عمداً لما تنطوي عليه من مخاطر مثبتة تتعلق بالوصم، والمراقبة، والإحباط، والتمييز.'
  },

  // Onboarding Modal
  'onboarding.welcome': { en: 'Welcome to WellSync', ar: 'مرحباً بك في WellSync' },
  'onboarding.subtitle': { en: 'A scientific, non-punitive approach to sustaining healthy behaviors.', ar: 'نهج علمي وغير عقابي لاستدامة السلوكيات الصحية.' },
  'onboarding.goal_prompt': { en: 'Set your initial daily goals', ar: 'حدد أهدافك اليومية المبدئية' },
  'onboarding.get_started': { en: 'Get Started (Guest Mode)', ar: 'البدء (وضع الضيف)' },
  'onboarding.no_account_note': { en: 'No accounts or passwords needed. Your data stays in this browser.', ar: 'لا حاجة لإنشاء حساب أو كلمة مرور. بياناتك تبقى في هذا المتصفح.' }
};

export function t(key: string, lang: Language): string {
  const item = translations[key];
  if (!item) return key;
  return item[lang] || item.en || key;
}
