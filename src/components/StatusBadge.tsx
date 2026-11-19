import React from 'react';
import { CheckCircle2, AlertCircle, RotateCcw, Sparkles } from 'lucide-react';
import { UserState } from '../engine/types';
import { Language, t } from '../i18n/translations';

interface StatusBadgeProps {
  state: UserState | 'LEARNING';
  isLearningBaseline?: boolean;
  learningDayIndex?: number;
  recoveryDayIndex?: number;
  language: Language;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  state,
  isLearningBaseline = false,
  learningDayIndex = 1,
  recoveryDayIndex = 0,
  language,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-3 py-1 gap-1.5',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  if (isLearningBaseline || state === 'LEARNING') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-forest-50 text-forest-700 border border-forest-200 ${sizeClasses}`}
        role="status"
        aria-label={`${t('status.learning', language)} (${learningDayIndex} / 7)`}
      >
        <Sparkles className={`${iconSizes} text-forest-600 shrink-0`} aria-hidden="true" />
        <span>{t('status.learning', language)}</span>
        <span className="font-semibold text-forest-800">({learningDayIndex} / 7)</span>
      </span>
    );
  }

  switch (state) {
    case 'ON_TRACK':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-sage-100 text-forest-800 border border-forest-200 ${sizeClasses}`}
          role="status"
          aria-label={t('status.on_track', language)}
        >
          <CheckCircle2 className={`${iconSizes} text-forest-600 shrink-0`} aria-hidden="true" />
          <span className="font-semibold">{t('status.on_track', language)}</span>
        </span>
      );

    case 'SLIPPING':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-[#FBF2E3] text-[#8C581E] border border-[#E9D5B7] ${sizeClasses}`}
          role="status"
          aria-label={t('status.slipping', language)}
        >
          <AlertCircle className={`${iconSizes} text-[#8C581E] shrink-0`} aria-hidden="true" />
          <span className="font-semibold">{t('status.slipping', language)}</span>
        </span>
      );

    case 'LAPSED':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-[#FCECE8] text-[#943828] border border-[#F2C8BF] ${sizeClasses}`}
          role="status"
          aria-label={t('status.lapsed', language)}
        >
          <AlertCircle className={`${iconSizes} text-[#943828] shrink-0`} aria-hidden="true" />
          <span className="font-semibold">{t('status.lapsed', language)}</span>
        </span>
      );

    case 'RECOVERING':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-[#E5F5F7] text-[#1B5E6B] border border-[#BDE3E8] ${sizeClasses}`}
          role="status"
          aria-label={`${t('status.recovering', language)} (${recoveryDayIndex} / 3)`}
        >
          <RotateCcw className={`${iconSizes} text-[#1B5E6B] shrink-0`} aria-hidden="true" />
          <span className="font-semibold">{t('status.recovering', language)}</span>
          <span className="font-bold text-[#144751]">({recoveryDayIndex} / 3)</span>
        </span>
      );

    default:
      return null;
  }
};
