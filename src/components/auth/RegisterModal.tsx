import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Dodan import za i18n
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, Loader2, Check } from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { useAuth } from '../../context/AuthContext';
import { WorkOraLogo } from '../ui/WorkOraLogo';
import { TermsAndConditionsModal } from '../legal/TermsAndConditionsModal';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  const { signUp, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Inicijalizacija hook-a za prevod

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modali za uslove i privatnost
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Klijentska validacija
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage(t('registerModal.errors.fillAllFields'));
      return;
    }

    if (password.length < 6) {
      setErrorMessage(t('registerModal.errors.passwordMinLength'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t('registerModal.errors.passwordsDoNotMatch'));
      return;
    }

    if (!agreeTerms) {
      setErrorMessage(t('registerModal.errors.acceptTerms'));
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, fullName);
    setLoading(false);

    if (result.success) {
      onClose();
      navigate('/dashboard');
    } else {
      setErrorMessage(result.error || t('registerModal.errors.registrationError'));
    }
  };

  const handleSwitchToLogin = () => {
    onClose();
    onOpenLogin();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={t('registerModal.title')}
      subtitle={t('registerModal.subtitle')}
      icon={<UserPlus className="w-5 h-5 text-indigo-500" />}
    >
      <div className="flex justify-center pb-1">
        <WorkOraLogo iconSize="w-9 h-9" textClassName="text-lg font-black" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Prikaz greške */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Ime i Prezime */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('registerModal.fields.fullName')} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('registerModal.fields.fullNamePlaceholder')}
              required
              className="input-field pl-10"
              autoComplete="name"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('registerModal.fields.email')} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('registerModal.fields.emailPlaceholder')}
              required
              className="input-field pl-10"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Lozinka */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('registerModal.fields.password')} <span className="text-rose-500">*</span>
          </label>
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
              minLength={6}
              className="input-field pl-10 pr-11"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={showPassword ? t('registerModal.fields.hidePassword') : t('registerModal.fields.showPassword')}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Potvrda lozinke */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('registerModal.fields.confirmPassword')} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="input-field pl-10 pr-11"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={showConfirmPassword ? t('registerModal.fields.hidePassword') : t('registerModal.fields.showPassword')}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Checkbox: Prihvatam uslove korištenja */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
            />
            <span>
              {t('registerModal.terms.accept')}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsTermsOpen(true);
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold underline hover:text-indigo-700"
              >
                {t('registerModal.terms.termsLink')}
              </button>
              {t('registerModal.terms.and')}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPrivacyOpen(true);
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold underline hover:text-indigo-700"
              >
                {t('registerModal.terms.privacyLink')}
              </button>
              {t('registerModal.terms.appSuffix')}
            </span>
          </label>
        </div>

        {/* Dugme za registraciju */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary mt-2 py-3 text-sm font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('registerModal.buttons.creatingAccount')}</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>{t('registerModal.buttons.register')}</span>
            </>
          )}
        </button>

        {/* Switch to Login */}
        <div className="text-center pt-2 text-xs text-slate-600 dark:text-slate-400">
          {t('registerModal.footer.alreadyHaveAccount')}{' '}
          <button
            type="button"
            onClick={handleSwitchToLogin}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
          >
            {t('registerModal.footer.login')}
          </button>
        </div>
      </form>

      {/* Pravni modali unutar registracije */}
      <TermsAndConditionsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </ModalWrapper>
  );
};