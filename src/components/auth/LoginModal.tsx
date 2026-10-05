import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Dodan import za prevode
import { ModalWrapper } from '../ui/ModalWrapper';
import { useAuth } from '../../context/AuthContext';
import { WorkOraLogo } from '../ui/WorkOraLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onOpenResetPassword: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
  onOpenResetPassword,
}) => {
  const { t } = useTranslation(); // Inicijalizacija kuke za prevod
  const { signIn, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage(t('login.errors.requiredFields'));
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      onClose();
      navigate('/dashboard');
    } else {
      setErrorMessage(result.error || t('login.errors.loginFailed'));
    }
  };

  const handleSwitchToReset = () => {
    onClose();
    onOpenResetPassword();
  };

  const handleSwitchToRegister = () => {
    onClose();
    onOpenRegister();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      icon={<LogIn className="w-5 h-5 text-indigo-500" />}
    >
      <div className="flex justify-center pb-2">
        <WorkOraLogo iconSize="w-10 h-10" textClassName="text-xl font-black" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info za Demo mod ukoliko Supabase URL nije unesen */}
        {isDemoMode && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
            <strong>{t('login.demo.note')}</strong> {t('login.demo.text')}
          </div>
        )}

        {/* Prikaz greške */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Email polje */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('login.email')} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.emailPlaceholder')}
              required
              className="input-field pl-10"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Lozinka polje sa Eye toggle */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('login.password')} <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleSwitchToReset}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t('login.forgotPassword')}
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-field pl-10 pr-11"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dugme za Prijavu */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary mt-2 py-3 text-sm font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('login.loggingIn')}</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>{t('login.submit')}</span>
            </>
          )}
        </button>

        {/* Switch to Register */}
        <div className="text-center pt-2 text-xs text-slate-600 dark:text-slate-400">
          {t('login.noAccount')}{' '}
          <button
            type="button"
            onClick={handleSwitchToRegister}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
          >
            {t('login.register')}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};