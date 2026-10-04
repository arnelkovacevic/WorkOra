import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react';
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
      setErrorMessage('Molimo popunite sva obavezna polja.');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      onClose();
      navigate('/dashboard');
    } else {
      setErrorMessage(result.error || 'Neuspješna prijava. Provjerite podatke.');
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
      title="Prijava na WorkOra račun"
      subtitle="Unesite svoje pristupne podatke za praćenje sati i zarade"
      icon={<LogIn className="w-5 h-5 text-indigo-500" />}
    >
      <div className="flex justify-center pb-2">
        <WorkOraLogo iconSize="w-10 h-10" textClassName="text-xl font-black" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info za Demo mod ukoliko Supabase URL nije unesen */}
        {isDemoMode && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
            <strong>Napomena:</strong> Aplikacija je u demo režimu. Možete unijeti bilo koji email i lozinku za prijavu.
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
            Email adresa <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ime@primjer.ba"
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
              Lozinka <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleSwitchToReset}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Zaboravili ste lozinku?
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
              aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
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
              <span>Prijavljivanje...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Prijava</span>
            </>
          )}
        </button>

        {/* Switch to Register */}
        <div className="text-center pt-2 text-xs text-slate-600 dark:text-slate-400">
          Nemate korisnički račun?{' '}
          <button
            type="button"
            onClick={handleSwitchToRegister}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
          >
            Registrujte se
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
