import React, { useState } from 'react';
import { 
  Settings, 
  Sun, 
  Moon, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  User, 
  Mail, 
  Smartphone,
  Trash2,
  Globe
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { updateUserPassword } from '../lib/supabaseService';
import { DeleteAccountModal } from '../components/settings/DeleteAccountModal';
import { LanguageToggle } from '../components/layout/LanguageToggle';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  // Lozinka stanja
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Modal za brisanje naloga
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Obrada promjene lozinke
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError(t('settings.passwordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.passwordMismatch'));
      return;
    }

    setPasswordLoading(true);
    const res = await updateUserPassword(newPassword);
    setPasswordLoading(false);

    if (res.success) {
      setPasswordSuccess(t('settings.passwordSuccess'));
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } else {
      setPasswordError(res.error || t('settings.passwordError'));
    }
  };

  const userDisplayName = (user as any)?.user_metadata?.full_name || 
                          (user as any)?.fullName || 
                          user?.email?.split('@')[0] || 
                          'Korisnik';

  return (
    <div className="space-y-6 pb-28 sm:pb-24 max-w-4xl mx-auto">
      {/* Naslov sekcije */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('settings.title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t('settings.subtitle')}
              </p>
            </div>
          </div>
          <LanguageToggle variant="button" />
        </div>
      </div>

      {/* Profilna Kartica */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-500/20">
            {userDisplayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {userDisplayName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
              {t('settings.account')}
            </span>
          </div>
        </div>
      </div>

      {/* A. IZGLED I TEMA (Theme Settings) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {isDark ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>{t('settings.appearance')}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('settings.appearanceDesc')}
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isDark ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            aria-label="Prebaci temu"
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                isDark ? 'translate-x-6' : 'translate-x-0'
              }`}
            >
              {isDark ? (
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
            </span>
          </button>
        </div>

        {/* Brze opcije u karticama */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              !isDark
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-bold shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">{t('settings.lightTheme')}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('settings.lightThemeDesc')}</p>
              </div>
            </div>
            {!isDark && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              isDark
                ? 'border-indigo-500 bg-indigo-950/40 text-white font-bold shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">{t('settings.darkTheme')}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('settings.darkThemeDesc')}</p>
              </div>
            </div>
            {isDark && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* B. SIGURNOST — PROMJENA LOZINKE */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="space-y-0.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-500" />
            <span>{t('settings.security')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('settings.securityDesc')}
          </p>
        </div>

        {/* Notifikacije o ishodu */}
        {passwordSuccess && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3.5 max-w-md">
          {/* Nova lozinka */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nova lozinka <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimalno 6 znakova"
                minLength={6}
                required
                className="input-field pl-10 pr-11"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showNewPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Potvrdi novu lozinku */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Potvrdi novu lozinku <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ponovite novu lozinku"
                minLength={6}
                required
                className="input-field pl-10 pr-11"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showConfirmPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading || !newPassword}
            className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5"
          >
            {passwordLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ažuriranje lozinke...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Sačuvaj novu lozinku</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* C. OPASNA ZONA — BRISANJE NALOGA */}
      <div className="p-5 sm:p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-rose-900 dark:text-rose-300">
              {t('settings.dangerZone')}
            </h3>
            <p className="text-xs text-rose-700/80 dark:text-rose-300/80 leading-relaxed max-w-xl">
              {t('settings.dangerZoneDesc')}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('settings.deleteMyAccount')}</span>
          </button>
        </div>
      </div>

      {/* 2-Step Modal za brisanje */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
