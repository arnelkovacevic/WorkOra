import React, { useState } from 'react';
import { Download, Share, X, CheckCircle, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // Ako je aplikacija već pokrenuta kao PWA u standalone režimu
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 3000);
    }
  };

  if (justInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <CheckCircle className="w-3.5 h-3.5" />
        Instalirano!
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        type="button"
        className={`inline-flex items-center gap-1.5 rounded-xl font-medium transition-all duration-200 active:scale-95 shadow-xs hover:shadow ${
          compact
            ? 'p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 text-xs'
            : 'px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold'
        }`}
        title="Instaliraj kao mobilnu aplikaciju"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>Instaliraj PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
          title="Instaliraj na iOS uređaj"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
          <span>Instaliraj</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Instalacija na iPhone / iPad
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Samo 2 jednostavna koraka u Safariju
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                    1
                  </span>
                  <span>
                    Kliknite na ikonicu <strong>Dijeli (Share <Share className="inline w-3 h-3 text-indigo-500 mx-0.5" />)</strong> u donjoj traci Safarija.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                    2
                  </span>
                  <span>
                    Povucite prema dole i izaberite <strong>"Dodaj na početni ekran" (Add to Home Screen)</strong>.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full btn-primary text-sm py-2.5"
              >
                Razumijem
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
