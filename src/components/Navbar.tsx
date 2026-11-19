import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  Settings,
  Info,
  Calendar,
  RotateCcw,
  History,
  FileCheck2,
  Menu,
  X,
  Languages,
} from 'lucide-react';
import { UserState } from '../engine/types';
import { Language, t } from '../i18n/translations';

export type ScreenTab = 'today' | 'recovery' | 'history' | 'evidence' | 'settings' | 'about';

interface NavbarProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  currentState: UserState;
  textSize: 'standard' | 'large' | 'xl';
  onChangeTextSize: (size: 'standard' | 'large' | 'xl') => void;
  language: Language;
  onToggleLanguage: () => void;
  onTriggerJudgeDemo?: () => void;
  isJudgeDemoMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentState,
  textSize,
  onChangeTextSize,
  language,
  onToggleLanguage,
  onTriggerJudgeDemo,
  isJudgeDemoMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const isLapsedOrSlipping = currentState === 'LAPSED' || currentState === 'SLIPPING';

  const handleTabClick = (tab: ScreenTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-ink-200 sticky top-0 z-40 transition-colors">
        {/* Arabic Translation Disclaimer Banner */}
        {language === 'ar' && (
          <div className="bg-[#FAF4EB] border-b border-[#ECD9BD] px-4 py-1.5 text-center text-xs font-medium text-[#8C581E]">
            {t('nav.unreviewed_banner', language)}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Brand Logo & Tagline */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleTabClick('today')}
                className="flex items-center gap-2.5 rounded-xl p-1.5 text-start transition-transform active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600"
                aria-label={t('nav.brand', language)}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-card">
                  <Activity className="w-5 h-5 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="font-bold text-lg sm:text-xl tracking-tight text-forest-900 block leading-none">
                    WellSync
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-ink-500 font-medium block mt-0.5 leading-none">
                    {t('nav.tagline', language)}
                  </span>
                </div>
              </button>

              {/* Guest Mode Indicator Badge */}
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-ivory-50 text-forest-800 border border-ink-200">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
                <span>{t('nav.guest', language)}</span>
                <span className="text-ink-400">•</span>
                <span className="text-ink-500">{t('nav.guest_sub', language)}</span>
              </span>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
              <button
                onClick={() => handleTabClick('today')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600 ${
                  currentTab === 'today'
                    ? 'bg-sage-100 text-forest-800 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ivory-50'
                }`}
              >
                {t('nav.today', language)}
              </button>

              <button
                onClick={() => handleTabClick('recovery')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 relative focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600 ${
                  currentTab === 'recovery'
                    ? 'bg-sage-100 text-forest-800 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ivory-50'
                }`}
              >
                <span>{t('nav.recovery', language)}</span>
                {isLapsedOrSlipping && (
                  <span
                    className="absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full bg-sand-700 ring-2 ring-white animate-pulse"
                    aria-label="Action recommended"
                  />
                )}
              </button>

              <button
                onClick={() => handleTabClick('history')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600 ${
                  currentTab === 'history'
                    ? 'bg-sage-100 text-forest-800 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ivory-50'
                }`}
              >
                {t('nav.history', language)}
              </button>

              <button
                onClick={() => handleTabClick('evidence')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600 ${
                  currentTab === 'evidence'
                    ? 'bg-sage-100 text-forest-800 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ivory-50'
                }`}
              >
                {t('nav.evidence', language)}
              </button>

              <button
                onClick={() => handleTabClick('settings')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600 inline-flex items-center gap-1.5 ${
                  currentTab === 'settings'
                    ? 'bg-sage-100 text-forest-800 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ivory-50'
                }`}
                aria-label={t('nav.settings', language)}
              >
                <Settings className="w-4 h-4" />
                <span>{t('nav.settings', language)}</span>
              </button>

              <button
                onClick={() => handleTabClick('about')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600 inline-flex items-center gap-1.5 ${
                  currentTab === 'about'
                    ? 'bg-sage-100 text-forest-800 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ivory-50'
                }`}
                aria-label={t('nav.about', language)}
              >
                <Info className="w-4 h-4" />
                <span>{t('nav.about', language)}</span>
              </button>
            </nav>

            {/* Accessibility & Language Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Text Size Controls (A, A+, A++) */}
              <div
                className="flex items-center bg-ivory-100 p-1 rounded-xl border border-ink-200"
                role="group"
                aria-label={t('nav.text_size', language)}
              >
                <button
                  type="button"
                  onClick={() => onChangeTextSize('standard')}
                  className={`w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-lg transition-all ${
                    textSize === 'standard'
                      ? 'bg-white shadow-card text-forest-900 font-bold'
                      : 'text-ink-500 hover:text-ink-900'
                  }`}
                  title="Standard text scale"
                  aria-pressed={textSize === 'standard'}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => onChangeTextSize('large')}
                  className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${
                    textSize === 'large'
                      ? 'bg-white shadow-card text-forest-900 font-black'
                      : 'text-ink-500 hover:text-ink-900'
                  }`}
                  title="Large text scale"
                  aria-pressed={textSize === 'large'}
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => onChangeTextSize('xl')}
                  className={`w-7 h-7 flex items-center justify-center text-sm font-black rounded-lg transition-all ${
                    textSize === 'xl'
                      ? 'bg-white shadow-card text-forest-900 font-black'
                      : 'text-ink-500 hover:text-ink-900'
                  }`}
                  title="Extra large text scale"
                  aria-pressed={textSize === 'xl'}
                >
                  A++
                </button>
              </div>

              {/* Judge Demo 90s Button */}
              {onTriggerJudgeDemo && !isJudgeDemoMode && (
                <button
                  type="button"
                  onClick={onTriggerJudgeDemo}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-sand-300 bg-sand-50 hover:bg-sand-100 text-sand-800 shadow-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sand-500"
                  title="Load 90-second Tariq journey demonstration"
                >
                  <span>⚡ {language === 'ar' ? 'عرض تجريبي للتحكيم (90ث)' : 'Judge Demo (90s)'}</span>
                </button>
              )}

              {/* Language Switcher */}
              <button
                type="button"
                onClick={onToggleLanguage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-ink-200 bg-white hover:bg-ivory-50 text-forest-900 shadow-card transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600"
                aria-label={t('nav.switch_lang', language)}
              >
                <Languages className="w-3.5 h-3.5 text-forest-600" />
                <span>{language === 'en' ? 'العربية' : 'English'}</span>
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl border border-ink-200 text-ink-700 hover:bg-ivory-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu for Secondary Destinations */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-ink-200 bg-white px-4 py-4 space-y-2 shadow-modal animate-fade-in">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-ink-100">
              <button
                onClick={() => handleTabClick('today')}
                className={`p-3 rounded-xl text-start text-xs font-bold flex items-center gap-2 ${
                  currentTab === 'today' ? 'bg-sage-100 text-forest-900' : 'bg-ivory-50 text-ink-700'
                }`}
              >
                <Calendar className="w-4 h-4 text-forest-600" />
                <span>{t('nav.today', language)}</span>
              </button>

              <button
                onClick={() => handleTabClick('recovery')}
                className={`p-3 rounded-xl text-start text-xs font-bold flex items-center gap-2 relative ${
                  currentTab === 'recovery' ? 'bg-sage-100 text-forest-900' : 'bg-ivory-50 text-ink-700'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-forest-600" />
                <span>{t('nav.recovery', language)}</span>
                {isLapsedOrSlipping && (
                  <span className="w-2 h-2 rounded-full bg-sand-700 animate-pulse ms-auto" />
                )}
              </button>

              <button
                onClick={() => handleTabClick('history')}
                className={`p-3 rounded-xl text-start text-xs font-bold flex items-center gap-2 ${
                  currentTab === 'history' ? 'bg-sage-100 text-forest-900' : 'bg-ivory-50 text-ink-700'
                }`}
              >
                <History className="w-4 h-4 text-forest-600" />
                <span>{t('nav.history', language)}</span>
              </button>

              <button
                onClick={() => handleTabClick('evidence')}
                className={`p-3 rounded-xl text-start text-xs font-bold flex items-center gap-2 ${
                  currentTab === 'evidence' ? 'bg-sage-100 text-forest-900' : 'bg-ivory-50 text-ink-700'
                }`}
              >
                <FileCheck2 className="w-4 h-4 text-forest-600" />
                <span>{t('nav.evidence', language)}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleTabClick('settings')}
                className={`flex-1 p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${
                  currentTab === 'settings' ? 'bg-sage-100 text-forest-900' : 'bg-ivory-50 text-ink-700'
                }`}
              >
                <Settings className="w-4 h-4 text-forest-600" />
                <span>{t('nav.settings', language)}</span>
              </button>

              <button
                onClick={() => handleTabClick('about')}
                className={`flex-1 p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${
                  currentTab === 'about' ? 'bg-sage-100 text-forest-900' : 'bg-ivory-50 text-ink-700'
                }`}
              >
                <Info className="w-4 h-4 text-forest-600" />
                <span>{t('nav.about', language)}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for thumb reachability, min-height 56px, touch targets >= 48px) */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-ink-200 z-40 px-2 py-1.5 shadow-modal"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => handleTabClick('today')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
              currentTab === 'today' ? 'text-forest-800 font-bold' : 'text-ink-400 hover:text-ink-700'
            }`}
            aria-label={t('nav.today', language)}
          >
            <Calendar className={`w-5 h-5 mb-0.5 ${currentTab === 'today' ? 'stroke-[2.5] text-forest-700' : ''}`} />
            <span className="text-[10px] leading-none">{t('nav.today', language)}</span>
          </button>

          <button
            onClick={() => handleTabClick('recovery')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all relative ${
              currentTab === 'recovery' ? 'text-forest-800 font-bold' : 'text-ink-400 hover:text-ink-700'
            }`}
            aria-label={t('nav.recovery', language)}
          >
            <RotateCcw className={`w-5 h-5 mb-0.5 ${currentTab === 'recovery' ? 'stroke-[2.5] text-forest-700' : ''}`} />
            <span className="text-[10px] leading-none">{t('nav.recovery', language)}</span>
            {isLapsedOrSlipping && (
              <span className="absolute top-1 end-3 w-2 h-2 rounded-full bg-sand-700 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => handleTabClick('history')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
              currentTab === 'history' ? 'text-forest-800 font-bold' : 'text-ink-400 hover:text-ink-700'
            }`}
            aria-label={t('nav.history', language)}
          >
            <History className={`w-5 h-5 mb-0.5 ${currentTab === 'history' ? 'stroke-[2.5] text-forest-700' : ''}`} />
            <span className="text-[10px] leading-none">{t('nav.history', language)}</span>
          </button>

          <button
            onClick={() => handleTabClick('evidence')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
              currentTab === 'evidence' ? 'text-forest-800 font-bold' : 'text-ink-400 hover:text-ink-700'
            }`}
            aria-label={t('nav.evidence', language)}
          >
            <FileCheck2 className={`w-5 h-5 mb-0.5 ${currentTab === 'evidence' ? 'stroke-[2.5] text-forest-700' : ''}`} />
            <span className="text-[10px] leading-none">{t('nav.evidence', language)}</span>
          </button>

          <button
            onClick={() => handleTabClick('settings')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
              currentTab === 'settings' ? 'text-forest-800 font-bold' : 'text-ink-400 hover:text-ink-700'
            }`}
            aria-label={t('nav.settings', language)}
          >
            <Settings className={`w-5 h-5 mb-0.5 ${currentTab === 'settings' ? 'stroke-[2.5] text-forest-700' : ''}`} />
            <span className="text-[10px] leading-none">{t('nav.settings', language)}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
