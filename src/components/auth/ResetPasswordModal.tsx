import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Mail, KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { useAuth } from '../../context/AuthContext';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  const { resetPassword } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage(t('resetPassword.errors.enterEmail'));
      return;
    }

    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setErrorMessage(result.error || t('resetPassword.errors.sendFailed'));
    }
  };

  const handleReturnToLogin = () => {
    setIsSuccess(false);
    setEmail('');
    setErrorMessage('');
    onClose();
    onOpenLogin();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={t('resetPassword.title')}
      subtitle={t('resetPassword.subtitle')}
      icon={<KeyRound className="w-5 h-5" />}
    >
      {isSuccess ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {t('resetPassword.success.title')}
            </h4>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              <Trans
                i18nKey="resetPassword.success.description"
                values={{ email }}
                components={[<span key="0" />, <strong key="1" />]}
              />
            </p>
          </div>
          <button
            type="button"
            onClick={handleReturnToLogin}
            className="w-full btn-primary text-sm py-2.5"
          >
            {t('resetPassword.success.backToLogin')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prikaz greške */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('resetPassword.fields.email')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('resetPassword.fields.emailPlaceholder')}
                required
                className="input-field pl-10"
                autoComplete="email"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('resetPassword.buttons.sending')}</span>
              </>
            ) : (
              <span>{t('resetPassword.buttons.submit')}</span>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleReturnToLogin}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('resetPassword.buttons.backToLogin')}</span>
            </button>
          </div>
        </form>
      )}
    </ModalWrapper>
  );
};