import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  FileText, 
  Filter, 
  RefreshCw, 
  Briefcase, 
  Download, 
  ChevronRight 
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { 
  Client, 
  WorkLog, 
  getWorkLogsByClientAndMonth, 
  formatCurrency, 
  formatMinutesToHours, 
  formatWorkDate, 
  BOSNIAN_MONTHS 
} from '../../lib/supabaseService';
import { generateMonthlyReportPDF } from '../../lib/pdfReportGenerator';
import { useAuth } from '../../context/AuthContext';

interface ClientHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export const ClientHoursModal: React.FC<ClientHoursModalProps> = ({
  isOpen,
  onClose,
  client,
}) => {
  const { user } = useAuth();
  const currentDate = new Date();

  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Godine za izbor (npr. trenutna, prošla, iduća)
  const availableYears = useMemo(() => {
    const curYear = new Date().getFullYear();
    return [curYear - 1, curYear, curYear + 1];
  }, []);

  // Učitavanje radnih unosa za klijenta i odabrani mjesec
  const loadClientLogs = async () => {
    if (!client) return;
    setLoading(true);
    const res = await getWorkLogsByClientAndMonth(client.id, selectedYear, selectedMonth);
    if (res.data) {
      setLogs(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && client) {
      loadClientLogs();
    }
  }, [isOpen, client, selectedYear, selectedMonth]);

  // Sumarna statistika za odabrani mjesec
  const monthStats = useMemo(() => {
    const totalMinutes = logs.reduce((acc, l) => acc + (Number(l.total_minutes) || 0), 0);
    const totalEarned = logs.reduce((acc, l) => acc + (Number(l.earned_amount) || 0), 0);
    return {
      totalMinutes,
      totalEarned,
      count: logs.length,
    };
  }, [logs]);

  // Export PDF za odabranog klijenta
  const handleExportPDF = () => {
    if (!client || logs.length === 0) return;
    const userDisplayName = (user as any)?.user_metadata?.full_name || 
                            (user as any)?.fullName || 
                            user?.email?.split('@')[0] || 
                            'Korisnik';

    const doc = generateMonthlyReportPDF({
      userDisplayName: `${userDisplayName} (Klijent: ${client.name})`,
      userEmail: user?.email || '',
      year: selectedYear,
      month: selectedMonth,
      workLogs: logs,
    });

    const monthName = BOSNIAN_MONTHS.find((m) => m.value === selectedMonth)?.name || `${selectedMonth}`;
    const safeClientName = client.name.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`WorkOra_${safeClientName}_${monthName}_${selectedYear}.pdf`);
  };

  if (!client) return null;

  const currentMonthName = BOSNIAN_MONTHS.find((m) => m.value === selectedMonth)?.name;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`Pregled sati: ${client.name}`}
      subtitle={`Mesečni pregled radnih sati i finansijskog obračuna`}
      icon={<Clock className="w-5 h-5 text-indigo-500" />}
    >
      <div className="space-y-4">
        {/* 1. FILTERI NA VRHU: Mjesec i Godina */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="relative flex-1">
            <label className="text-[10px] font-bold text-slate-400 block px-1 mb-0.5">
              Mjesec
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input-field py-1.5 text-xs font-semibold"
            >
              {BOSNIAN_MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-28">
            <label className="text-[10px] font-bold text-slate-400 block px-1 mb-0.5">
              Godina
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input-field py-1.5 text-xs font-semibold"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}.
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. STATISTIČKA TRAKA ZA ODABRANI MJESEC */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/60">
            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-1">
              <Clock className="w-4 h-4" />
              <span>Ukupno Sati</span>
            </div>
            <div className="text-xl font-black text-indigo-950 dark:text-white">
              {formatMinutesToHours(monthStats.totalMinutes)}
            </div>
            <span className="text-[10px] text-indigo-600/80 dark:text-indigo-400">
              {monthStats.count} {monthStats.count === 1 ? 'posao' : 'poslova'} u {currentMonthName}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-900/60">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
              <DollarSign className="w-4 h-4" />
              <span>Ukupna Zarada</span>
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(monthStats.totalEarned)}
            </div>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400">
              Tarifa: {formatCurrency(client.rate_amount)} / {client.rate_type === 'hourly' ? 'h' : 'dan'}
            </span>
          </div>
        </div>

        {/* Dugme za PDF ako ima unosa */}
        {logs.length > 0 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Pregled stavki ({logs.length}):
            </span>
            <button
              onClick={handleExportPDF}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Preuzmi PDF</span>
            </button>
          </div>
        )}

        {/* 3. LISTA / KARTICE UNOSA POSLOVA */}
        <div className="max-h-[48vh] overflow-y-auto pr-1 space-y-2.5">
          {loading ? (
            <div className="text-center py-10 space-y-2">
              <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Učitavanje sati za klijenta...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nema zabilježenih sati u {currentMonthName} {selectedYear}.
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Za dodavanje novih poslova koristite dugme "+ Novi Unos Sati" na glavnoj tabli.
              </p>
            </div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {formatWorkDate(log.work_date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pl-7">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{log.time_from} - {log.time_to}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatMinutesToHours(log.total_minutes)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(log.earned_amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {client.rate_type === 'hourly'
                        ? `${formatCurrency(client.rate_amount)}/h`
                        : `${formatCurrency(client.rate_amount)}/dan`}
                    </span>
                  </div>
                </div>

                {log.note && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 pl-7 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                    <FileText className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="leading-snug">{log.note}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Dugme za zatvaranje */}
        <button
          onClick={onClose}
          type="button"
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Zatvori pregled
        </button>
      </div>
    </ModalWrapper>
  );
};
