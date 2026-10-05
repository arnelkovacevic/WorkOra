import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, CheckCircle2, Smartphone, ShieldCheck, Zap } from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { useAuth } from '../../context/AuthContext';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const { user, isDemoMode } = useAuth();
  const { t } = useTranslation();

  const userDisplayName = (user as any)?.user_metadata?.full_name || 
                          (user as any)?.fullName || 
                          user?.email?.split('@')[0] || 
                          t('welcomeCard.defaultUser');

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={t('welcomeCard.title', { name: userDisplayName })}
      subtitle={t('welcomeCard.subtitle')}
      icon={<Sparkles className="w-5 h-5 text-indigo-500" />}
    >
      <div className="space-y-4">
        {/* User Badge Card */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {userDisplayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {userDisplayName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> {t('welcomeCard.badge.verifiedSession')}
            </span>
          </div>
        </div>

        {/* Feature Highlights for PWA */}
        <div className="space-y-2.5">
          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {t('welcomeCard.nextStepsTitle')}
          </h5>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {t('welcomeCard.features.pwa.title')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                {t('welcomeCard.features.pwa.description')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {t('welcomeCard.features.offline.title')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                {t('welcomeCard.features.offline.description')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {t('welcomeCard.features.security.title')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                {t('welcomeCard.features.security.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          type="button"
          className="w-full btn-primary py-3 text-sm font-semibold mt-2"
        >
          {t('welcomeCard.buttons.goToDashboard')}
        </button>
      </div>
    </ModalWrapper>
  );
};