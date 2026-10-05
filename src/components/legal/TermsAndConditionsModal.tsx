import React from 'react';
import { Scale, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ModalWrapper } from '../ui/ModalWrapper';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={t('terms.title')}
      subtitle={t('terms.subtitle')}
      icon={<Scale className="w-5 h-5 text-indigo-500" />}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
        {/* Datum ažuriranja */}
        <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
          <span>{t('terms.meta.version')}</span>
          <span className="font-semibold">{t('terms.meta.effectiveDate')}</span>
        </div>

        {/* 1. Prihvatanje uslova */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
            {t('terms.section1.title')}
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            {t('terms.section1.desc')}
          </p>
        </div>

        {/* 2. Opis usluge */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
            {t('terms.section2.title')}
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            {t('terms.section2.desc')}
          </p>
        </div>

        {/* 3. Korisnički račun i sigurnost */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
            {t('terms.section3.title')}
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            {t('terms.section3.desc')}
          </p>
        </div>

        {/* 4. Tačnost podataka i ograničenje odgovornosti */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
            {t('terms.section4.title')}
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            {t('terms.section4.desc')}
          </p>
        </div>

        {/* 5. Intelektualno vlasništvo */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">5</span>
            {t('terms.section5.title')}
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            {t('terms.section5.desc')}
          </p>
        </div>

        {/* 6. Izmjene uslova */}
        <div className="space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">6</span>
            {t('terms.section6.title')}
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            {t('terms.section6.desc')}
          </p>
        </div>

        {/* Zaključno dugme */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t('terms.understandAndAccept')}</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};