import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'button' | 'segmented';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  variant = 'button',
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'bs').startsWith('it') ? 'it' : 'bs';

  const handleToggle = () => {
    const nextLang = currentLang === 'bs' ? 'it' : 'bs';
    i18n.changeLanguage(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', nextLang);
    }
  };

  const handleSelect = (lang: 'bs' | 'it') => {
    i18n.changeLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', lang);
    }
  };

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 ${className}`}>
        <button
          type="button"
          onClick={() => handleSelect('bs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            currentLang === 'bs'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <span className="text-sm">🇧🇦</span>
          <span>Bosanski (BS)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('it')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            currentLang === 'it'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <span className="text-sm">🇮🇹</span>
          <span>Italiano (IT)</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      type="button"
      className={`relative inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 border text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow active:scale-95 text-xs font-bold ${className}`}
      aria-label={currentLang === 'bs' ? 'Prebaci na italijanski jezik' : 'Passa alla lingua bosniaca'}
      title={currentLang === 'bs' ? 'Jezik: Bosanski (Klikni za IT)' : 'Lingua: Italiano (Clicca per BS)'}
    >
      <span className="text-sm leading-none">
        {currentLang === 'bs' ? '🇧🇦' : '🇮🇹'}
      </span>
      <span className="tracking-wide">
        {currentLang === 'bs' ? 'BS' : 'IT'}
      </span>
    </button>
  );
};
