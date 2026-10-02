import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  ArrowRight,
  Download,
  CheckCircle,
  Wifi
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from '../components/layout/PWAInstallButton';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden py-6 sm:py-12 px-4 sm:px-6">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-400 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-purple-400 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Mobile-First Hero Banner */}
        <div className="text-center space-y-4 sm:space-y-6 pt-4 pb-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
            <span>WorkOra — Pametno praćenje radnih sati i zarade</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Pratite sate, klijente i zaradu uz{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              WorkOra
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Vodite klijente, bilježite početak i kraj rada, planirajte termine u kalendaru i generišite zvanične PDF izvještaje za isplatu u jednom kliku.
          </p>

          {/* CTA Buttons - Mobile Touch Friendly */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md mx-auto">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                type="button"
                className="btn-primary py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>Otvori Nadzornu ploču</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  type="button"
                  className="btn-primary py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Prijava</span>
                </button>
                <button
                  onClick={onOpenRegister}
                  type="button"
                  className="py-3.5 px-6 text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
                >
                  <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Registracija</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Install Strip */}
          <div className="pt-2 flex items-center justify-center">
            <PWAInstallButton />
          </div>
        </div>

        {/* Mobile Device Mockup / Interactive Feature Highlights */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              99% Mobile-First
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Dizajnirana prvenstveno za upravljanje jednom rukom na pametnom telefonu, sa brzim reakcijama na dodir.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              PWA i Rad Offline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Integrisan Service Worker omogućava pouzdan rad i kada nemate pristup internetu ili ste u pokretu.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Supabase Zaštita
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Pouzdana autentifikacija, enkripcija lozinki i upravljanje korisničkim sesijama sa modernim standardima.
            </p>
          </div>
        </div>

        {/* Feature Highlights & Demonstration Section */}
        <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                Spremno za upotrebu
              </span>
              <h2 className="text-xl sm:text-2xl font-bold">
                Instalirajte aplikaciju odmah
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                Kliknite na dugme za instalaciju u zaglavlju ili dodajte na početni ekran Safarija/Chromea.
              </p>
            </div>
            <div className="flex-shrink-0">
              <PWAInstallButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
