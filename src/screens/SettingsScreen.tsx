import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Shield,
  Footprints,
  Bell,
  AlertTriangle,
  Check,
  UserCheck,
} from 'lucide-react';
import { SYNTHETIC_PERSONAS, SyntheticPersona } from '../data/syntheticPersonas';
import { UserEngineProfile } from '../engine/types';
import { Language, t } from '../i18n/translations';

interface SettingsScreenProps {
  profile: UserEngineProfile;
  quietHours: { enabled: boolean; start: string; end: string };
  textSize: 'standard' | 'large' | 'xl';
  language: Language;
  onUpdateProfile: (profile: UserEngineProfile) => void;
  onUpdateQuietHours: (quiet: { enabled: boolean; start: string; end: string }) => void;
  onChangeTextSize: (size: 'standard' | 'large' | 'xl') => void;
  onLoadSyntheticPersona: (persona: SyntheticPersona) => void;
  onExportData: () => void;
  onImportData?: (jsonStr: string) => { success: boolean; error?: string };
  onDeleteAllData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  quietHours,
  textSize,
  language,
  onUpdateProfile,
  onUpdateQuietHours,
  onChangeTextSize,
  onLoadSyntheticPersona,
  onExportData,
  onImportData,
  onDeleteAllData,
}) => {
  const [stepGoal, setStepGoal] = useState<number>(profile.userGoalSteps);
  const [sleepHours, setSleepHours] = useState<number>(
    Math.floor(profile.userGoalSleepMinutes / 60)
  );
  const [sleepMinutesRemainder, setSleepMinutesRemainder] = useState<number>(
    profile.userGoalSleepMinutes % 60
  );

  const [qhEnabled, setQhEnabled] = useState<boolean>(quietHours.enabled);
  const [qhStart, setQhStart] = useState<string>(quietHours.start);
  const [qhEnd, setQhEnd] = useState<string>(quietHours.end);

  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(SYNTHETIC_PERSONAS[0].id);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [importMessage, setImportMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportData) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = onImportData(content);
      if (res.success) {
        setImportMessage({
          text:
            language === 'ar'
              ? '✓ تم استيراد البيانات واستعادتها بنجاح!'
              : '✓ Data imported and restored successfully!',
        });
      } else {
        setImportMessage({
          text: language === 'ar' ? `خطأ في الاستيراد: ${res.error}` : `Import error: ${res.error}`,
          isError: true,
        });
      }
      setTimeout(() => setImportMessage(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSleepMinutes = sleepHours * 60 + sleepMinutesRemainder;
    onUpdateProfile({
      userGoalSteps: Math.max(1000, stepGoal),
      userGoalSleepMinutes: Math.max(120, totalSleepMinutes),
    });
    onUpdateQuietHours({
      enabled: qhEnabled,
      start: qhStart,
      end: qhEnd,
    });
    setSaveMessage(language === 'ar' ? '✓ تم حفظ الأهداف والتفضيلات!' : '✓ Goals and preferences updated!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleLoadPersona = () => {
    const persona =
      SYNTHETIC_PERSONAS.find((p) => p.id === selectedPersonaId) || SYNTHETIC_PERSONAS[0];
    onLoadSyntheticPersona(persona);
    setSaveMessage(
      language === 'ar'
        ? `✓ تم تحميل التجربة المصطنعة: ${persona.name}`
        : `✓ Loaded synthetic demo journey: ${persona.name}`
    );
    setTimeout(() => setSaveMessage(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. HEADER */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-forest-50 text-forest-800 border border-forest-200">
              <Settings className="w-3.5 h-3.5 text-forest-700" />
              <span>{language === 'ar' ? 'الإعدادات وضوابط الخصوصية' : 'Settings & Privacy Controls'}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
            {t('settings.title', language)}
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 max-w-xl">
            {t('settings.subtitle', language)}
          </p>
        </div>

        <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-forest-50 text-forest-700 items-center justify-center border border-forest-200 shrink-0">
          <Settings className="w-6 h-6 stroke-[2.2]" />
        </div>
      </section>

      {/* 2. GOAL & PREFERENCE CONFIGURATION */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card space-y-6">
        <div className="pb-3 border-b border-ink-100">
          <h2 className="text-base sm:text-lg font-bold text-ink-900 flex items-center gap-2">
            <Footprints className="w-5 h-5 text-forest-700" />
            <span>{t('settings.step_goal', language)} &amp; {t('settings.sleep_goal', language)}</span>
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            {language === 'ar'
              ? 'تحدد هذه الأهداف خط البداية أثناء التعلم، وسقف المستوى المستهدف الأساسي.'
              : 'These goals define your cold-start baseline while learning, and anchor your primary Target rung.'}
          </p>
        </div>

        <form onSubmit={handleSaveGoals} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Step Target */}
            <div>
              <label htmlFor="settingsStepGoalInput" className="block text-xs font-bold text-ink-700 mb-1.5">
                {t('settings.step_goal', language)}
              </label>
              <input
                id="settingsStepGoalInput"
                type="number"
                min="1000"
                max="50000"
                step="500"
                value={stepGoal}
                onChange={(e) => setStepGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-sm font-semibold text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden transition-all"
                required
              />
              <span className="text-[11px] text-ink-400 mt-1 block">
                {language === 'ar' ? 'الحد الأدنى: 1,000 خطوة يومياً' : 'Minimum: 1,000 steps daily'}
              </span>
            </div>

            {/* Sleep Target */}
            <div>
              <span className="block text-xs font-bold text-ink-700 mb-1.5">
                {t('settings.sleep_goal', language)}
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <input
                    id="settingsSleepHoursInput"
                    type="number"
                    aria-label={t('today.sleep_hours_label', language)}
                    min="3"
                    max="14"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-sm font-semibold text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden transition-all"
                  />
                  <label htmlFor="settingsSleepHoursInput" className="text-xs font-semibold text-ink-600">
                    {t('today.sleep_hours_label', language)}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="settingsSleepMinsInput"
                    type="number"
                    aria-label={t('today.sleep_mins_label', language)}
                    min="0"
                    max="59"
                    step="15"
                    value={sleepMinutesRemainder}
                    onChange={(e) => setSleepMinutesRemainder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-ivory-50/50 text-sm font-semibold text-ink-900 focus:bg-white focus:ring-2 focus:ring-forest-600 focus:outline-hidden transition-all"
                  />
                  <label htmlFor="settingsSleepMinsInput" className="text-xs font-semibold text-ink-600">
                    {t('today.sleep_mins_label', language)}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Typography Scale Settings */}
          <div className="pt-4 border-t border-ink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-ink-900 block">
                {t('nav.text_size', language)}
              </label>
              <span className="text-[11px] text-ink-500">
                {language === 'ar' ? 'تعديل حجم خط التطبيق لراحة القراءة وسهولة الوصول.' : 'Adjust app typography size for comfort and accessibility.'}
              </span>
            </div>
            <div className="flex items-center bg-ivory-100 p-1 rounded-xl border border-ink-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => onChangeTextSize('standard')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  textSize === 'standard' ? 'bg-white shadow-card text-forest-900 font-extrabold' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                {language === 'ar' ? 'قياسي' : 'Standard'}
              </button>
              <button
                type="button"
                onClick={() => onChangeTextSize('large')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  textSize === 'large' ? 'bg-white shadow-card text-forest-900 font-black' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                {language === 'ar' ? 'كبير' : 'Large'}
              </button>
              <button
                type="button"
                onClick={() => onChangeTextSize('xl')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  textSize === 'xl' ? 'bg-white shadow-card text-forest-900 font-black' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                {language === 'ar' ? 'كبير جداً' : 'Extra Large'}
              </button>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="pt-4 border-t border-ink-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="settingsQuietHoursToggle" className="text-xs font-bold text-ink-900 block flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-forest-700" />
                  <span>{t('settings.quiet_hours', language)}</span>
                </label>
                <span className="text-[11px] text-ink-500">
                  {language === 'ar' ? 'كتم الاقتراحات والتذكيرات السلوكية أثناء فترات الراحة.' : 'Mutes all proactive advice and technique suggestions during rest hours.'}
                </span>
              </div>
              <input
                id="settingsQuietHoursToggle"
                type="checkbox"
                aria-label={t('settings.quiet_hours', language)}
                checked={qhEnabled}
                onChange={(e) => setQhEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-forest-700 focus:ring-forest-600 border-ink-300"
              />
            </div>

            {qhEnabled && (
              <div className="grid grid-cols-2 gap-4 max-w-sm pt-1">
                <div>
                  <label htmlFor="settingsQhStart" className="block text-[11px] font-semibold text-ink-600 mb-1">
                    {language === 'ar' ? 'وقت البدء' : 'Start Time'}
                  </label>
                  <input
                    id="settingsQhStart"
                    type="time"
                    value={qhStart}
                    onChange={(e) => setQhStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ink-200 bg-ivory-50 text-xs font-medium"
                  />
                </div>
                <div>
                  <label htmlFor="settingsQhEnd" className="block text-[11px] font-semibold text-ink-600 mb-1">
                    {language === 'ar' ? 'وقت الانتهاء' : 'End Time'}
                  </label>
                  <input
                    id="settingsQhEnd"
                    type="time"
                    value={qhEnd}
                    onChange={(e) => setQhEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ink-200 bg-ivory-50 text-xs font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              className="py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-forest-700 hover:bg-forest-800 transition-colors shadow-card focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600"
            >
              {t('settings.save_goals', language)}
            </button>
            {saveMessage && (
              <span className="text-xs font-bold text-forest-800 animate-fade-in flex items-center gap-1.5">
                <Check className="w-4 h-4 text-forest-600 stroke-[3]" />
                <span>{saveMessage}</span>
              </span>
            )}
          </div>
        </form>
      </section>

      {/* 3. SYNTHETIC DEMONSTRATION PERSONAS */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card space-y-4">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-ink-100">
            <h2 className="text-base sm:text-lg font-bold text-ink-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forest-700" />
              <span>{t('settings.demo_title', language)}</span>
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
              {language === 'ar' ? 'شخصيات مصطنعة للعرض' : 'Synthetic Demo Personas'}
            </span>
          </div>
          <p className="text-xs text-ink-600 mt-2">
            {t('settings.demo_desc', language)}
          </p>
        </div>

        <div className="bg-[#FAF4EB] border border-[#ECD9BD] rounded-2xl p-4 text-xs text-sand-800 leading-relaxed">
          <strong>{language === 'ar' ? 'إقرار النزاهة غير القابل للتفاوض:' : 'Non-Negotiable Integrity Declaration:'}</strong>{' '}
          {language === 'ar'
            ? 'هذه الرحلات هي سيناريوهات مصطنعة 100% أنشأها فريق الطلاب لاختبار المحرك التكيفي. وهي لا تحتوي على أي بيانات لأشخاص حقيقيين.'
            : 'These journeys are 100% synthetic scenarios generated by the student team for interactive testing. They contain zero real participant data.'}
        </div>

        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-ink-800">
            {language === 'ar' ? 'اختر الشخصية المصطنعة:' : 'Select Synthetic Persona:'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {SYNTHETIC_PERSONAS.map((persona) => (
              <label
                key={persona.id}
                className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all block ${
                  selectedPersonaId === persona.id
                    ? 'border-forest-600 bg-sage-50/70 font-semibold text-forest-950 shadow-xs ring-1 ring-forest-500/20'
                    : 'border-ink-200 hover:bg-ivory-50 text-ink-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="syntheticPersona"
                    checked={selectedPersonaId === persona.id}
                    onChange={() => setSelectedPersonaId(persona.id)}
                    className="w-4 h-4 text-forest-700 focus:ring-forest-600 border-ink-300"
                  />
                  <span className="font-bold text-sm text-ink-900">{persona.name}</span>
                </div>
                <p className="text-[11px] text-ink-500 font-normal mt-2 ms-6 leading-relaxed">
                  {persona.description}
                </p>
              </label>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleLoadPersona}
              className="py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-forest-700 hover:bg-forest-800 transition-colors shadow-card focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600 inline-flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{language === 'ar' ? 'تحميل الرحلة المصطنعة المحددة' : 'Load Selected Synthetic Journey'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. DATA SOVEREIGNTY: EXPORT, IMPORT & WIPE */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card space-y-4">
        <div className="pb-3 border-b border-ink-100">
          <h2 className="text-base sm:text-lg font-bold text-ink-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-forest-700" />
            <span>{t('settings.export_title', language)}</span>
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            {t('nav.guest_sub', language)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onExportData}
            className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-ink-800 bg-ivory-100 hover:bg-ivory-200 transition-colors border border-ink-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600"
          >
            <Download className="w-4 h-4 text-forest-700" />
            <span>{t('settings.export_btn', language)}</span>
          </button>

          {onImportData && (
            <label className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-forest-900 bg-sage-100 hover:bg-sage-200 transition-colors border border-forest-200 cursor-pointer focus-within:ring-2 focus-within:ring-forest-600">
              <Upload className="w-4 h-4 text-forest-700" />
              <span>{language === 'ar' ? 'استيراد نسخة احتياطية (JSON)' : 'Import JSON Backup'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-600"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>{t('settings.wipe_btn', language)}</span>
          </button>
        </div>

        {importMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold animate-fade-in ${
              importMessage.isError
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-sage-100 text-forest-800 border border-forest-200'
            }`}
          >
            {importMessage.text}
          </div>
        )}
      </section>

      {/* 5. CONFIRMATION MODAL FOR DATA WIPE */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-modal max-w-md w-full p-6 sm:p-7 border border-ink-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-ink-900">
                  {language === 'ar' ? 'حذف جميع البيانات نهائياً؟' : 'Permanently Delete All Data?'}
                </h3>
                <span className="text-xs text-ink-500">
                  {language === 'ar' ? 'لا يمكن التراجع عن هذا الإجراء.' : 'This action cannot be undone.'}
                </span>
              </div>
            </div>

            <p className="text-xs text-ink-600 leading-relaxed">
              {language === 'ar'
                ? 'سيؤدي هذا إلى مسح جميع الخطوات المسجلة، ومدد النوم، وخطوط الأساس، والإعدادات المخصصة من ذاكرة هذا المتصفح بشكل دائم. لن تتبقى أي نسخ في أي مكان.'
                : "This will erase all recorded daily steps, sleep entries, baselines, and custom settings from this browser's local storage. Zero copies remain anywhere."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-ink-700 bg-ivory-100 hover:bg-ivory-200 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAllData();
                  setShowDeleteModal(false);
                }}
                className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition-colors shadow-card"
              >
                {language === 'ar' ? 'نعم، احذف كل شيء' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
