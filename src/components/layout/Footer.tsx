import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, Smartphone, ExternalLink, Scale, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useOnlineStatus } from '../../hooks/usePWAInstall';
import { WorkOraLogo } from '../ui/WorkOraLogo';
import { TermsAndConditionsModal } from '../legal/TermsAndConditionsModal';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal';

interface FooterProps {
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLogin, onOpenRegister }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const isOnline = useOnlineStatus();

  // Stanja za pravne modale
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <>
      {/* Offline Toast Notifikacija kad se prekine veza */}
      {!isOnline && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600 text-white text-xs font-semibold shadow-xl border border-amber-400 animate-pulse">
          <span>{t('footer.offlineMode')}</span>
        </div>
      )}

      {/* Donja mobilna traka samo za neregistrovane posjetioce na Landing stranici */}
      {!user && location.pathname !== '/dashboard' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-2 h-14 max-w-md mx-auto">
            <Link
              to="/"
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                location.pathname === '/'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">{t('footer.home')}</span>
            </Link>

            <button
              onClick={onOpenLogin}
              type="button"
              className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <Shield className="w-5 h-5" />
              <span className="text-[10px]">{t('footer.login')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Glavni standardni Footer za desktop i tablet */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-10 pb-28 sm:pb-12 transition-colors text-slate-600 dark:text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Kolona 1: Brend i opis */}
            <div className="md:col-span-2 space-y-3">
              <WorkOraLogo 
                iconSize="w-8 h-8" 
                textClassName="text-lg font-black"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                {t('footer.brandDescription')}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">
                  <Smartphone className="w-3 h-3" /> {t('footer.pwaReady')}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  {isOnline ? t('footer.networkActive') : t('footer.cachedMode')}
                </span>
              </div>
            </div>

            {/* Kolona 2: Navigacija */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t('footer.navigation')}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {t('footer.homePage')}
                  </Link>
                </li>
                {user ? (
                  <li>
                    <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-indigo-600 dark:text-indigo-400">
                      {t('footer.dashboard')}
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <button onClick={onOpenLogin} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {t('footer.loginAccount')}
                      </button>
                    </li>
                    <li>
                      <button onClick={onOpenRegister} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {t('footer.newRegistration')}
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Kolona 3: Pravni dokumenti */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t('footer.legalInfo')}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setIsTermsOpen(true)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-left"
                  >
                    <Scale className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{t('footer.termsOfService')}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsPrivacyOpen(true)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-left"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('footer.privacyPolicy')}</span>
                  </button>
                </li>
                <li className="pt-1">
                  <a
                    href="https://orizon-aix.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    <span>{t('footer.orizonSupport')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Donja linija sa autorskim pravima i brendingom Orizon-AIX */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p className="font-medium">
              {t('footer.copyright')}
            </p>
            <p className="flex items-center gap-1 text-xs">
              <span>{t('footer.developedBy')}</span>
              <a 
                href="https://orizon-aix.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <span>Orizon-AIX</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Pravni Modali */}
      <TermsAndConditionsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </>
  );
};