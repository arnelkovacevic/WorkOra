import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 border text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow active:scale-95 ${className}`}
      aria-label={isDark ? 'Prebaci na svijetli način' : 'Prebaci na tamni način'}
      title={isDark ? 'Svijetli način' : 'Tamni način'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600 transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>
      {showLabel && (
        <span className="ml-2 text-xs font-medium">
          {isDark ? 'Svijetla tema' : 'Tamna tema'}
        </span>
      )}
    </button>
  );
};
