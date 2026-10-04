import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Lock, Eye, EyeOff, Trash2, ArrowRight, ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { deleteUserAccount } from '../../lib/supabaseService';
import { useAuth } from '../../context/AuthContext';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState<string>('noLongerNeed');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const resetModalState = () => {
    setStep(1);
    setReason('noLongerNeed');
    setPassword('');
    setShowPassword(false);
    setLoading(false);
    setErrorMessage('');
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const handleProceedToStep2 = () => {
    setErrorMessage('');
    setStep(2);
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!password) {
      setErrorMessage(t('delete.errorEnterPassword'));
      return;
    }

    setLoading(true);
    const res = await deleteUserAccount(password);
    setLoading(false);

    if (res.success) {
      handleClose();
      if (onSuccess) onSuccess();
      await signOut();
      navigate('/');
    } else {
      setErrorMessage(res.error || t('delete.errorFailed'));
    }
  };

  const reasonOptions = [
    'noLongerNeed',
    'switching',
    'usabilityIssues',
    'other',
  ];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? t('delete.titleStep1') : t('delete.titleStep2')}
      subtitle={
        step === 1 
          ? t('delete.subtitleStep1') 
          : t('delete.subtitleStep2')
      }
      icon={<ShieldAlert className="w-5 h-5 text-rose-500" />}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 pb-8 sm:pb-4">
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* KORAK 1: UPOZORENJE I RAZLOG */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>{t('delete.warningTitle')}</span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                {t('delete.warningDescription')}
              </p>
            </div>

            {/* Razlog brisanja */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('delete.reasonLabel')}
              </label>
              <div className="space-y-2">
                {reasonOptions.map((optKey) => (
                  <label
                    key={optKey}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      reason === optKey
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delete_reason"
                      value={optKey}
                      checked={reason === optKey}
                      onChange={() => setReason(optKey)}
                      className="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span>{t(`delete.reasons.${optKey}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Akcije koraka 1 */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t('delete.cancel')}
              </button>
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <span>{t('delete.continue')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* KORAK 2: POTVRDA LOZINKOM */}
        {step === 2 && (
          <form onSubmit={handleConfirmDelete} className="space-y-4 animate-in fade-in">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              {t('delete.securityNotice')}
            </div>

            {/* Input za lozinku */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('delete.passwordLabel')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('delete.passwordPlaceholder')}
                  required
                  autoFocus
                  className="input-field pl-10 pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? t('delete.hidePassword') : t('delete.showPassword')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Akcije koraka 2 */}
            <div className="pt-2 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('delete.back')}</span>
              </button>

              <button
                type="submit"
                disabled={loading || !password}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('delete.deleting')}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{t('delete.confirmDelete')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </ModalWrapper>
  );
};