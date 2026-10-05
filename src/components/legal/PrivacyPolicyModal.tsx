import React from 'react';
import { ShieldCheck, Lock, ExternalLink, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ili vaš t custom hook
import { ModalWrapper } from '../ui/ModalWrapper';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={t('privacy.title')}
      subtitle={t('privacy.subtitle')}
      icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
        {/* Banner o privatnosti */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>{t('privacy.banner.gdpr')}</span>
          <span className="font-semibold">{t('privacy.banner.updated')}</span>
        </div>

        {/* 1. Prikupljanje podataka */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
            {t('privacy.section1.title')}
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            {t('privacy.section1.desc')}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li><strong>{t('privacy.section1.account')}</strong> {t('privacy.section1.accountDesc')}</li>
            <li><strong>{t('privacy.section1.business')}</strong> {t('privacy.section1.businessDesc')}</li>
          </ul>
        </div>

        {/* 2. Skladištenje i sigurnost podataka */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
            {t('privacy.section2.title')}
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            {t('privacy.section2.desc')}
          </p>
        </div>

        {/* 3. Upotreba podataka */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
            {t('privacy.section3.title')}
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            {t('privacy.section3.desc')}
          </p>
        </div>

        {/* 4. Kolačići i PWA Skladištenje */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
            {t('privacy.section4.title')}
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            {t('privacy.section4.desc')}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>{t('privacy.section4.item1')}</li>
            <li>{t('privacy.section4.item2')}</li>
            <li>{t('privacy.section4.item3')}</li>
          </ul>
        </div>

        {/* 5. Prava korisnika */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">5</span>
            {t('privacy.section5.title')}
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            {t('privacy.section5.desc')}
          </p>
        </div>

        {/* 6. Kontakt */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-indigo-500" />
            {t('privacy.section6.title')}
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            {t('privacy.section6.desc')}
          </p>
          <a
            href="https://orizon-aix.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-0.5"
          >
            <span>{t('privacy.section6.link')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Dugme za zatvaranje */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t('privacy.acceptAndClose')}</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};