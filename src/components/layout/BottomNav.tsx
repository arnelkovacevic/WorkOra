import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Clock, Calendar, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type DashboardTab = 'overview' | 'clients' | 'work_logs' | 'agenda' | 'settings';

interface BottomNavProps {
  activeTab: DashboardTab;
  onChangeTab: (tab: DashboardTab) => void;
  workLogsCount?: number;
  clientsCount?: number;
  isHidden?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  workLogsCount = 0,
  clientsCount = 0,
  isHidden = false,
}) => {
  const { t } = useTranslation();

  // Automatsko osluškivanje body 'modal-open' klase
  const [isBodyModalOpen, setIsBodyModalOpen] = useState(false);

  useEffect(() => {
    const checkModalOpen = () => {
      setIsBodyModalOpen(document.body.classList.contains('modal-open'));
    };

    checkModalOpen();

    const observer = new MutationObserver(checkModalOpen);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const shouldHide = isHidden || isBodyModalOpen;

  const tabs = [
    {
      id: 'overview' as DashboardTab,
      label: t('nav.panel'),
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'clients' as DashboardTab,
      label: t('nav.clients'),
      icon: Users,
      badge: clientsCount > 0 ? clientsCount : null,
    },
    {
      id: 'work_logs' as DashboardTab,
      label: t('nav.workLogs'),
      icon: Clock,
      badge: workLogsCount > 0 ? workLogsCount : null,
    },
    {
      id: 'agenda' as DashboardTab,
      label: t('nav.calendar'),
      icon: Calendar,
      badge: null,
    },
    {
      id: 'settings' as DashboardTab,
      label: t('nav.settings'),
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <nav 
      aria-label="Mobilna i tablet navigacija"
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out pointer-events-none ${
        shouldHide 
          ? 'translate-y-28 opacity-0 pointer-events-none' 
          : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="max-w-xl mx-auto w-full px-2 sm:px-4 pb-safe pointer-events-auto">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl sm:mb-3 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)] transition-all select-none overflow-hidden">
          <div className="grid grid-cols-5 h-16 px-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeTab(tab.id)}
                  type="button"
                  className={`relative flex flex-col items-center justify-center gap-1 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  {/* Indikator na vrhu aktivnog taba */}
                  {isActive && (
                    <span className="absolute top-0 w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-b-full shadow-xs animate-in fade-in zoom-in-75 duration-200" />
                  )}

                  {/* Ikonica sa bedžom */}
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110 stroke-[2.5]' : ''}`} />
                    {tab.badge !== null && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                        {tab.badge}
                      </span>
                    )}
                  </div>

                  {/* Naziv taba */}
                  <span className={`text-[10.5px] sm:text-[11px] tracking-tight leading-none ${isActive ? 'font-bold' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
