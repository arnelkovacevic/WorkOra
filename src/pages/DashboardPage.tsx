import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  DollarSign, 
  Users, 
  Plus, 
  Search, 
  Sparkles, 
  LogOut, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  RefreshCw, 
  Briefcase, 
  FileText, 
  Download, 
  CalendarCheck,
  LayoutDashboard,
  ArrowRight,
  UserPlus,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  Client, 
  WorkLog, 
  AgendaEvent,
  getClients, 
  getWorkLogs, 
  getAgendaEvents,
  deleteWorkLog, 
  deleteClient,
  convertAgendaToWorkLog,
  formatCurrency, 
  formatMinutesToHours, 
  formatWorkDate,
  calculateMinutes 
} from '../lib/supabaseService';
import { WorkLogCard } from '../components/dashboard/WorkLogCard';
import { ClientCard } from '../components/dashboard/ClientCard';
import { NewClientModal } from '../components/dashboard/NewClientModal';
import { NewWorkLogModal } from '../components/dashboard/NewWorkLogModal';
import { ClientHoursModal } from '../components/dashboard/ClientHoursModal';
import { DailyReportsModal } from '../components/dashboard/DailyReportsModal';
import { AgendaCalendar } from '../components/dashboard/AgendaCalendar';
import { NewAgendaModal } from '../components/dashboard/NewAgendaModal';
import { BottomNav, DashboardTab } from '../components/layout/BottomNav';
import { SettingsPage } from './SettingsPage';
import { useTranslation } from 'react-i18next';

interface DashboardPageProps {
  initialTab?: DashboardTab;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ initialTab = 'overview' }) => {
  const { user, signOut, setIsWelcomeModalOpen } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 5 Glavnih tabova: 'overview' (Panel), 'clients' (Klijenti), 'work_logs' (Sati), 'agenda' (Kalendar), 'settings' (Postavke)
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  // Stanja za podatke
  const [clients, setClients] = useState<Client[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stanja za modale
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [isWorkLogModalOpen, setIsWorkLogModalOpen] = useState<boolean>(false);
  const [isClientHoursModalOpen, setIsClientHoursModalOpen] = useState<boolean>(false);
  const [selectedClientForHours, setSelectedClientForHours] = useState<Client | null>(null);
  const [isDailyReportsModalOpen, setIsDailyReportsModalOpen] = useState<boolean>(false);
  const [isNewAgendaDirectModalOpen, setIsNewAgendaDirectModalOpen] = useState<boolean>(false);

  // Da li je bilo koji modal otvoren (za sakrivanje donje navigacije)
  const isAnyModalOpen = isClientModalOpen || 
                         isWorkLogModalOpen || 
                         isClientHoursModalOpen || 
                         isDailyReportsModalOpen || 
                         isNewAgendaDirectModalOpen;

  // Pretraga i filteri
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');

  // Prikaz notifikacije (Toast)
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Učitavanje svih podataka iz baze
  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    const [clientsRes, workLogsRes, agendaRes] = await Promise.all([
      getClients(),
      getWorkLogs(),
      getAgendaEvents(),
    ]);

    if (clientsRes.data) setClients(clientsRes.data);
    if (workLogsRes.data) setWorkLogs(workLogsRes.data);
    if (agendaRes.data) setAgendaEvents(agendaRes.data);

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // -----------------------------------------------------------------
  // IZRAČUN STATISTIKE (Brzi pregled na vrhu)
  // -----------------------------------------------------------------
  const stats = useMemo(() => {
    const totalEarned = workLogs.reduce((acc, log) => acc + (Number(log.earned_amount) || 0), 0);
    const totalMinutes = workLogs.reduce((acc, log) => acc + (Number(log.total_minutes) || 0), 0);
    const totalClientsCount = clients.length;

    return {
      totalEarned,
      totalMinutes,
      totalClientsCount,
    };
  }, [workLogs, clients]);

  // Statistika po klijentu
  const clientStatsMap = useMemo(() => {
    const map = new Map<string, { count: number; earned: number }>();
    workLogs.forEach((log) => {
      const current = map.get(log.client_id) || { count: 0, earned: 0 };
      map.set(log.client_id, {
        count: current.count + 1,
        earned: current.earned + (Number(log.earned_amount) || 0),
      });
    });
    return map;
  }, [workLogs]);

  // Filtrirani radni unosi
  const filteredWorkLogs = useMemo(() => {
    return workLogs.filter((log) => {
      const clientName = log.clients?.name?.toLowerCase() || '';
      const tempClientName = log.temp_client_name?.toLowerCase() || '';
      const typeWorks = log.type_works?.toLowerCase() || '';
      const noteText = log.note?.toLowerCase() || '';
      const matchesSearch =
        clientName.includes(searchQuery.toLowerCase()) ||
        tempClientName.includes(searchQuery.toLowerCase()) ||
        typeWorks.includes(searchQuery.toLowerCase()) ||
        noteText.includes(searchQuery.toLowerCase()) ||
        log.work_date.includes(searchQuery);

      const matchesClient =
        selectedClientFilter === 'all' || log.client_id === selectedClientFilter;

      return matchesSearch && matchesClient;
    });
  }, [workLogs, searchQuery, selectedClientFilter]);

  // Filtrirani klijenti
  const filteredClients = useMemo(() => {
    return clients.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  // Brisanje radnog unosa
  const handleDeleteWorkLog = async (id: string) => {
    const res = await deleteWorkLog(id);
    if (res.success) {
      setWorkLogs((prev) => prev.filter((l) => l.id !== id));
      showToast('Radni unos je uspješno obrisan.');
    } else {
      showToast(res.error || 'Nije uspjelo brisanje unosa!');
    }
  };

  // Brisanje klijenta
  const handleDeleteClient = async (id: string) => {
    const res = await deleteClient(id);
    if (res.success) {
      setClients((prev) => prev.filter((c) => c.id !== id));
      setWorkLogs((prev) => prev.filter((l) => l.client_id !== id));
      showToast('Klijent i povezani unosi su obrisani.');
    } else {
      showToast(res.error || 'Nije uspjelo brisanje klijenta.');
    }
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsClientModalOpen(true);
  };

  const handleOpenNewClientModal = () => {
    setClientToEdit(null);
    setIsClientModalOpen(true);
  };

  // Konverzija termina sa Panela
  const handleQuickConvertAgenda = async (agendaId: string) => {
    const res = await convertAgendaToWorkLog(agendaId);
    if (res.success) {
      showToast('Termin je uspješno završen i prebačen u radne sate!');
      loadData(true);
    } else {
      showToast(res.error || 'Greška pri konverziji termina.');
    }
  };

  const userDisplayName = (user as any)?.user_metadata?.full_name || 
                          (user as any)?.fullName || 
                          user?.email?.split('@')[0] || 
                          'Korisnik';

  // Predstojeći termini za pregled na Panelu
  const upcomingAgenda = useMemo(() => {
    return agendaEvents
      .filter((e) => e.status === 'scheduled')
      .slice(0, 3);
  }, [agendaEvents]);

  // Zadnji radni unosi za Panel
  const recentLogs = useMemo(() => {
    return workLogs.slice(0, 3);
  }, [workLogs]);

  return (
    <div className="py-3 sm:py-7 px-3.5 sm:px-6 max-w-5xl mx-auto space-y-5 pb-32 sm:pb-32">
      {/* Toast Notifikacija */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero / Korisnički Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-4 sm:p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-lg sm:text-xl font-black uppercase shadow-xs">
              {userDisplayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black tracking-tight">
                  {userDisplayName}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold border border-white/30 backdrop-blur-xs">
                  WorkOra
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-indigo-100">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsDailyReportsModalOpen(true)}
              type="button"
              className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
              title="Otvori mjesečni izvještaj rada i preuzmi PDF"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-200" />
              <span>{t('overview.reportPdf')}</span>
            </button>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              type="button"
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all text-xs"
              title={t('overview.refresh')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsWelcomeModalOpen(true)}
              type="button"
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all flex items-center justify-center gap-1"
              title={t('overview.info')}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{t('overview.info')}</span>
            </button>
            <button
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              type="button"
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-xl bg-rose-500/80 hover:bg-rose-600 border border-rose-400/30 text-white transition-all flex items-center justify-center gap-1"
              title={t('nav.logout')}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </div>
        </div>

        {/* Ambient svetlo */}
        <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* DESKTOP & TABLET TAB TRAKA (Sinhronizovana sa donjom navigacijom) */}
      <div className="hidden sm:flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl">
          <button
            onClick={() => setActiveTab('overview')}
            type="button"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t('nav.panel')}</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            type="button"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'clients'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('nav.clients')}</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
              {clients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('work_logs')}
            type="button"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'work_logs'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t('nav.workLogs')}</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
              {workLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('agenda')}
            type="button"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'agenda'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t('nav.calendar')}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            type="button"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t('nav.settings')}</span>
          </button>
        </div>

        {/* Glavna desktop akcija */}
        <div className="flex items-center gap-2">
          {activeTab === 'work_logs' ? (
            <button
              onClick={() => setIsWorkLogModalOpen(true)}
              type="button"
              className="btn-primary py-2 px-3.5 text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('workLogs.addNew')}</span>
            </button>
          ) : activeTab === 'clients' ? (
            <button
              onClick={handleOpenNewClientModal}
              type="button"
              className="btn-primary py-2 px-3.5 text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('clients.addNew')}</span>
            </button>
          ) : activeTab === 'agenda' ? (
            <button
              onClick={() => setIsNewAgendaDirectModalOpen(true)}
              type="button"
              className="btn-primary py-2 px-3.5 text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('agenda.addNew')}</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: PANEL (Samo na ovom tabu stoje 3 statističke kartice, brze akcije i sažetak) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* STATISTIČKE KARTICE - Prikazuju se ISKLJUČIVO na početnoj (Home / Panel) strani */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Ukupno Zarađeno */}
            <div 
              onClick={() => setActiveTab('work_logs')}
              className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t('stats.totalEarned')}
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {formatCurrency(stats.totalEarned)}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {t('stats.basedOnLogs', { count: workLogs.length })}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {/* 2. Ukupno Sati */}
            <div 
              onClick={() => setActiveTab('work_logs')}
              className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t('stats.totalHours')}
                </span>
                <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                  {formatMinutesToHours(stats.totalMinutes)}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {t('stats.recordedMinutes', { count: stats.totalMinutes })}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* 3. Aktivni Klijenti */}
            <div 
              onClick={() => setActiveTab('clients')}
              className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition-all flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t('stats.activeClients')}
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stats.totalClientsCount}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {t('stats.withActiveRates')}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
          {/* Brze akcije na dodir (Quick Actions Grid) */}
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2 px-0.5">
              Brze Akcije
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Akcija 1: Novi radni unos */}
              <button
                onClick={() => setIsWorkLogModalOpen(true)}
                type="button"
                className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-900/60 text-left hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 transition-all group active:scale-95 shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  + Unos Sati
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Evidentiraj posao
                </p>
              </button>

              {/* Akcija 2: Novi klijent */}
              <button
                onClick={handleOpenNewClientModal}
                type="button"
                className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-900/60 text-left hover:bg-purple-100/80 dark:hover:bg-purple-900/60 transition-all group active:scale-95 shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-xs">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  + Klijent
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Dodaj tarifu
                </p>
              </button>

              {/* Akcija 3: Zakaži termin */}
              <button
                onClick={() => setIsNewAgendaDirectModalOpen(true)}
                type="button"
                className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 text-left hover:bg-amber-100/80 dark:hover:bg-amber-900/60 transition-all group active:scale-95 shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-xs">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  + Zakaži Termin
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Planiraj u kalendar
                </p>
              </button>

              {/* Akcija 4: Mjesečni izvještaj i PDF */}
              <button
                onClick={() => setIsDailyReportsModalOpen(true)}
                type="button"
                className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-900/60 text-left hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 transition-all group active:scale-95 shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Izvještaj & PDF
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Štampa i preuzimanje
                </p>
              </button>
            </div>
          </div>

          {/* DVIJE KOLONE ZA ZADNJE AKTIVNOSTI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Zadnji odrađeni poslovi */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('overview.recentLogs')}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('work_logs')}
                  type="button"
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>{t('overview.viewAllLogs')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {recentLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  {t('overview.noRecentLogs')}
                </div>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">
                          {log.clients?.name || 'Klijent'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatWorkDate(log.work_date)} • {formatMinutesToHours(log.total_minutes)}
                        </span>
                      </div>
                      <div className="font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatCurrency(log.earned_amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Predstojeći poslovi iz Agende */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('overview.upcomingAgenda')}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('agenda')}
                  type="button"
                  className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>{t('nav.calendar')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {upcomingAgenda.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  {t('overview.noUpcomingAgenda')}
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingAgenda.map((agenda) => (
                    <div
                      key={agenda.id}
                      className="p-2.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">
                          {agenda.temp_client_name || agenda.clients?.name || 'Klijent'}
                        </span>
                        <span className="text-[10px] text-amber-800 dark:text-amber-300">
                          {formatWorkDate(agenda.scheduled_date)} • {agenda.time_from} - {agenda.time_to}
                        </span>
                      </div>
                      <button
                        onClick={() => handleQuickConvertAgenda(agenda.id)}
                        type="button"
                        className="px-2 py-1 rounded-xl bg-amber-600 text-white font-bold text-[10px] hover:bg-amber-700 transition-colors whitespace-nowrap active:scale-95"
                      >
                        Završi
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: KLIJENTI */}
      {/* ========================================================================= */}
      {activeTab === 'clients' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretraži klijente po nazivu..."
                className="input-field pl-10 text-xs sm:text-sm py-2"
              />
            </div>
            <button
              onClick={handleOpenNewClientModal}
              type="button"
              className="btn-primary py-2 px-3 text-xs font-bold shadow-xs whitespace-nowrap flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novi Klijent</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 space-y-2">
              <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Učitavanje klijenata...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-500 flex items-center justify-center mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {searchQuery ? 'Nema klijenata sa tim nazivom' : 'Nemate kreiranih klijenata'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dodajte svoje klijente sa tarifom po satu ili fiksnom dnevnom cijenom.
                </p>
              </div>
              <button
                onClick={handleOpenNewClientModal}
                type="button"
                className="btn-primary text-xs py-2.5 px-4 font-bold"
              >
                <Plus className="w-4 h-4" />
                <span>+ Dodaj Klijenta</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredClients.map((client) => {
                const clientStat = clientStatsMap.get(client.id) || { count: 0, earned: 0 };
                return (
                  <ClientCard
                    key={client.id}
                    client={client}
                    workLogsCount={clientStat.count}
                    totalEarned={clientStat.earned}
                    onEdit={handleEditClient}
                    onDelete={handleDeleteClient}
                    onViewHours={(c) => {
                      setSelectedClientForHours(c);
                      setIsClientHoursModalOpen(true);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: MOJI SATI */}
      {/* ========================================================================= */}
      {activeTab === 'work_logs' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretraži po klijentu, bilješci ili datumu..."
                className="input-field pl-10 text-xs sm:text-sm py-2"
              />
            </div>

            <div className="flex items-center gap-2">
              {clients.length > 0 && (
                <select
                  value={selectedClientFilter}
                  onChange={(e) => setSelectedClientFilter(e.target.value)}
                  className="input-field text-xs py-2 pr-8 font-medium cursor-pointer"
                >
                  <option value="all">Svi klijenti ({clients.length})</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => setIsWorkLogModalOpen(true)}
                type="button"
                className="btn-primary py-2 px-3 text-xs font-bold shadow-xs whitespace-nowrap flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Novi Unos</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 space-y-2">
              <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Učitavanje unosa iz baze...</p>
            </div>
          ) : filteredWorkLogs.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-500 flex items-center justify-center mx-auto">
                <Briefcase className="w-7 h-7" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {searchQuery || selectedClientFilter !== 'all'
                    ? 'Nema rezultata za odabrani filter'
                    : 'Još nemate evidentiranih radnih sati'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {searchQuery || selectedClientFilter !== 'all'
                    ? 'Pokušajte očistiti pretragu ili odaberite drugog klijenta.'
                    : 'Zabilježite svoj prvi posao, početak i kraj rada uz automatski obračun zarade.'}
                </p>
              </div>
              <button
                onClick={() => setIsWorkLogModalOpen(true)}
                type="button"
                className="btn-primary text-xs py-2.5 px-4 font-bold"
              >
                <Plus className="w-4 h-4" />
                <span>+ Novi Unos Sati</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredWorkLogs.map((log) => (
                <WorkLogCard
                  key={log.id}
                  workLog={log}
                  onDelete={handleDeleteWorkLog}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: KALENDAR / AGENDA */}
      {/* ========================================================================= */}
      {activeTab === 'agenda' && (
        <div className="animate-in fade-in duration-200">
          <AgendaCalendar
            clients={clients}
            onWorkLogCreated={loadData}
            onOpenNewClient={handleOpenNewClientModal}
            showToast={showToast}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: POSTAVKE (Izgled, Lozinka, Brisanje naloga) */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="animate-in fade-in duration-200">
          <SettingsPage />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALI APLIKACIJE */}
      {/* ========================================================================= */}

      {/* MODAL ZA KLIJENTA */}
      <NewClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setClientToEdit(null);
        }}
        clientToEdit={clientToEdit}
        onSuccess={(savedClient) => {
          if (clientToEdit) {
            setClients((prev) =>
              prev.map((c) => (c.id === savedClient.id ? savedClient : c))
            );
            setWorkLogs((prev) =>
              prev.map((l) =>
                l.client_id === savedClient.id ? { ...l, clients: savedClient } : l
              )
            );
            showToast(`Klijent "${savedClient.name}" je uspješno izmijenjen.`);
          } else {
            setClients((prev) => [savedClient, ...prev]);
            showToast(`Novi klijent "${savedClient.name}" je uspješno kreiran.`);
          }
        }}
      />

      {/* MODAL ZA NOVI RADNI UNOS */}
      <NewWorkLogModal
        isOpen={isWorkLogModalOpen}
        onClose={() => setIsWorkLogModalOpen(false)}
        clients={clients}
        onOpenNewClient={handleOpenNewClientModal}
        onSuccess={(savedLog) => {
          setWorkLogs((prev) => [savedLog, ...prev]);
          showToast(`Radni unos za "${savedLog.clients?.name || 'klijenta'}" je zabilježen.`);
        }}
      />

      {/* MODAL ZA DIREKTNO ZAKAZIVANJE TERMINA */}
      <NewAgendaModal
        isOpen={isNewAgendaDirectModalOpen}
        onClose={() => setIsNewAgendaDirectModalOpen(false)}
        clients={clients}
        onOpenNewClient={handleOpenNewClientModal}
        onSuccess={(savedEvent) => {
          setAgendaEvents((prev) => [...prev, savedEvent]);
          showToast(`Novi termin za "${savedEvent.clients?.name || 'klijenta'}" je zakazan!`);
        }}
      />

      {/* MODAL: DETALJNI PREGLED SATI PO KLIJENTU */}
      <ClientHoursModal
        isOpen={isClientHoursModalOpen}
        onClose={() => {
          setIsClientHoursModalOpen(false);
          setSelectedClientForHours(null);
        }}
        client={selectedClientForHours}
      />

      {/* MODAL: DNEVNI IZVJEŠTAJ PO DANIMA & EXPORT U PDF */}
      <DailyReportsModal
        isOpen={isDailyReportsModalOpen}
        onClose={() => setIsDailyReportsModalOpen(false)}
      />

      {/* ========================================================================= */}
      {/* 100% NATIVNI MOBILNI BOTTOM NAVIGATION BAR (5 Glavnih Tabova) */}
      {/* ========================================================================= */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        workLogsCount={workLogs.length}
        clientsCount={clients.length}
        isHidden={isAnyModalOpen}
      />
    </div>
  );
};
