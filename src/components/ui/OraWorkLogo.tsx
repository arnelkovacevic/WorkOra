import React from 'react';

interface OraWorkLogoProps {
  className?: string;
  iconSize?: string;
  showText?: boolean;
  textClassName?: string;
}

export const OraWorkLogo: React.FC<OraWorkLogoProps> = ({
  className = '',
  iconSize = 'w-9 h-9',
  showText = true,
  textClassName = 'text-xl',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Logotip OraWork: Simbol sata (Ora) i geometrijskog slova W (Work) */}
      <div className={`relative flex-shrink-0 ${iconSize} rounded-2xl p-0.5 bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="ow-w-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E0E7FF" />
            </linearGradient>
            <linearGradient id="ow-accent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>

          {/* Vanjski krug sata (Ora) */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="white"
            strokeOpacity="0.25"
            strokeWidth="3.5"
            strokeDasharray="4 3"
          />

          {/* Oznake sati na pozicijama 12, 3, 6, 9 */}
          <circle cx="50" cy="14" r="2.5" fill="white" fillOpacity="0.9" />
          <circle cx="86" cy="50" r="2" fill="white" fillOpacity="0.6" />
          <circle cx="50" cy="86" r="2" fill="white" fillOpacity="0.6" />
          <circle cx="14" cy="50" r="2" fill="white" fillOpacity="0.6" />

          {/* Stilizovano geometrijsko slovo W */}
          <path
            d="M22 36 L36 72 L50 48 L64 72 L78 36"
            stroke="url(#ow-w-grad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Kazaljke sata koje izviru iz centra W na (50, 48) */}
          <path
            d="M50 48 L67 31"
            stroke="#FDE047"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M50 48 L37 35"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Centralna osovina sata */}
          <circle cx="50" cy="48" r="4.5" fill="#FBBF24" />
          <circle cx="50" cy="48" r="2" fill="#1E1B4B" />
        </svg>
      </div>

      {/* Naziv brenda: OraWork */}
      {showText && (
        <span className={`font-black tracking-tight flex items-center leading-none ${textClassName}`}>
          <span className="text-indigo-600 dark:text-indigo-400">Ora</span>
          <span className="text-slate-900 dark:text-white">Work</span>
        </span>
      )}
    </div>
  );
};

// Aliasing for compatibility
export { OraWorkLogo as WorkOraLogo };
