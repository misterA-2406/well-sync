import React from 'react';
import { Activity, ShieldCheck, Heart } from 'lucide-react';
import { Language, t } from '../i18n/translations';
import { ScreenTab } from './Navbar';

interface FooterProps {
  language: Language;
  onSelectTab: (tab: ScreenTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onSelectTab }) => {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-white/70 backdrop-blur-xs text-xs text-ink-500 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-forest-700 text-white flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-ink-900 tracking-tight">WellSync</span>
            <span className="text-[11px] text-forest-700 bg-forest-50 border border-forest-200 px-2 py-0.5 rounded-full font-medium">
              Challenge 09 • Abu Dhabi 2026
            </span>
          </div>
          <p className="text-[11px] text-ink-500 leading-relaxed">
            {language === 'ar'
              ? 'نموذج أولي للمنافسة في تحدي الابتكار الصحي الرقمي 2026. مصمم لدعم استدامة النشاط البدني وروتين النوم دون عقاب أو تصفير للتقدم.'
              : 'Competition prototype for Future Health Challenge 09. Engineered to support habit maintenance and recovery through adaptive, non-punitive goal calibration.'}
          </p>
          <p className="text-[10px] text-ink-400">
            {t('about.student_disclaimer', language)}
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-ink-600">
          <button onClick={() => onSelectTab('today')} className="hover:text-forest-700 transition-colors">
            {t('nav.today', language)}
          </button>
          <button onClick={() => onSelectTab('recovery')} className="hover:text-forest-700 transition-colors">
            {t('nav.recovery', language)}
          </button>
          <button onClick={() => onSelectTab('history')} className="hover:text-forest-700 transition-colors">
            {t('nav.history', language)}
          </button>
          <button onClick={() => onSelectTab('evidence')} className="hover:text-forest-700 transition-colors">
            {t('nav.evidence', language)}
          </button>
          <button onClick={() => onSelectTab('settings')} className="hover:text-forest-700 transition-colors">
            {t('nav.settings', language)}
          </button>
          <button onClick={() => onSelectTab('about')} className="hover:text-forest-700 transition-colors">
            {t('nav.about', language)}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-ink-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-ink-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
          <span>100% Client-Side Local Storage • Zero External Network Calls • No Runtime AI</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Made for human resilience, not streaks</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
        </div>
      </div>
    </footer>
  );
};
