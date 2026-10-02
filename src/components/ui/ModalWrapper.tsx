import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: string;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  icon,
  maxWidth = 'max-w-md',
}) => {
  // Upravljanje body klasama i Escape tipkom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Zatamnjena pozadina (Backdrop) */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card - Mobile Bottom Sheet sa skrolovanjem i sigurnom visinom */}
      <div 
        className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain`}
      >
        {/* Mobile drag pill indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-4" />

        {/* Dugme za zatvaranje (X) */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors z-20 cursor-pointer"
          aria-label="Zatvori modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Modala */}
        <div className="mb-5 flex items-start gap-3.5 pr-8">
          {icon && (
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 shadow-xs border border-indigo-100 dark:border-indigo-900/50">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Sadržaj modala sa dodatnim pb-12 paddingom tako da dugmad nikad ne budu prekrivena */}
        <div className="pb-12 sm:pb-4">{children}</div>
      </div>
    </div>
  );
};
