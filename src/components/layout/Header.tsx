import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, Home, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { PWAInstallButton } from './PWAInstallButton';
import { WorkOraLogo } from '../ui/WorkOraLogo';

interface HeaderProps {
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogin, onOpenRegister }) => {
  const { user, signOut, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const userDisplayName = (user as any)?.user_metadata?.full_name || 
                          (user as any)?.fullName || 
                          user?.email?.split('@')[0] || 
                          'Korisnik';

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand & Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <WorkOraLogo 
            iconSize="w-8 h-8 sm:w-9 sm:h-9" 
            textClassName="text-lg sm:text-xl font-black"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Početna
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDashboard
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              Nadzorna ploča
            </Link>
          )}
        </nav>

        {/* Right Actions: PWA Install, Theme Toggle, User Profile / Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Trigger */}
          <PWAInstallButton />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User state */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-colors"
                title={`Prijavljeni ste kao ${userDisplayName}`}
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-xs">
                  {userDisplayName.charAt(0)}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                    {userDisplayName}
                  </span>
                  {isDemoMode && (
                    <span className="text-[9px] text-amber-500 font-medium">Demo mod</span>
                  )}
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                type="button"
                className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Odjavi se"
                aria-label="Odjava"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                type="button"
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg transition-colors"
              >
                Prijava
              </button>
              <button
                onClick={onOpenRegister}
                type="button"
                className="btn-primary text-xs sm:text-sm py-1.5 px-3 sm:px-4 shadow-sm"
              >
                Registracija
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
