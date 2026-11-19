import React, { useState } from 'react';
import { EngineDayResult } from '../engine/types';
import { Language, t } from '../i18n/translations';
import { Compass, ChevronDown, ChevronUp, ArrowRight, ShieldCheck } from 'lucide-react';

interface ContextualGuidanceCardProps {
  latestResult: EngineDayResult | null;
  language: Language;
  onNavigateToRecovery: () => void;
}

export const ContextualGuidanceCard: React.FC<ContextualGuidanceCardProps> = ({
  latestResult,
  language,
  onNavigateToRecovery,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const bctId = latestResult?.techniqueCard.bctId ?? 'BCT 1.1';
  const bctName = latestResult?.techniqueCard.bctName ?? 'Goal Setting';
  const suggestion = latestResult?.techniqueCard.suggestion ??
    'Maintain your steady daily target. Regular self-monitoring builds automatic habit strength.';
  const reason = latestResult?.techniqueCard.reason ??
    'Consistent daily self-monitoring reinforces habit identity and establishes a stable personal baseline.';
  const limits = latestResult?.techniqueCard.limits ??
    'The engine is rule-based and cannot assess subjective fatigue, work stress, weather, or illness.';

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-ink-200 shadow-card flex flex-col justify-between">
      <div>
        {/* Header pill */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-forest-50 text-forest-700 border border-forest-200">
            <Compass className="w-3.5 h-3.5 text-forest-600" />
            <span>{bctId}: {bctName}</span>
          </span>
          <span className="text-[11px] text-ink-400 font-medium">Michie et al. (2013)</span>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-ink-900 mb-2">
          {t('today.bct_title', language)}
        </h3>

        {/* Supportive Action-Oriented Message */}
        <div className="p-3.5 bg-ivory-50 border border-ink-200/80 rounded-xl mb-4">
          <p className="text-xs sm:text-sm font-medium text-ink-800 leading-relaxed italic">
            "{suggestion}"
          </p>
        </div>

        {/* Collapsible Scientific & Behavioral Grounding */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs font-semibold text-ink-600 hover:text-ink-900 py-1 transition-colors focus:outline-hidden"
            aria-expanded={showDetails}
          >
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
              <span>{language === 'ar' ? 'الأساس العلمي وحدود المحرك' : 'Behavioral Rationale & System Limits'}</span>
            </span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetails && (
            <div className="bg-sage-50/50 border border-sage-200/80 rounded-xl p-3.5 text-xs text-ink-700 space-y-2.5 animate-fade-in">
              <div>
                <strong className="block text-ink-900 mb-0.5">{t('today.bct_reason', language)}:</strong>
                <p className="text-ink-600 leading-relaxed">{reason}</p>
              </div>
              <div className="pt-2 border-t border-sage-200/60">
                <strong className="block text-ink-900 mb-0.5">{t('today.bct_limits', language)}:</strong>
                <p className="text-ink-500 leading-relaxed">{limits}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer navigation */}
      <div className="mt-5 pt-3.5 border-t border-ink-100 flex items-center justify-between text-xs text-ink-500">
        <span className="text-[11px]">{language === 'ar' ? 'قائم على القواعد 100%' : '100% Rule-Based Grounding'}</span>
        <button
          onClick={onNavigateToRecovery}
          className="text-forest-700 hover:text-forest-900 font-semibold inline-flex items-center gap-1 transition-colors"
        >
          <span>{language === 'ar' ? 'استكشاف تقنيات التعافي' : 'Explore recovery techniques'}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
