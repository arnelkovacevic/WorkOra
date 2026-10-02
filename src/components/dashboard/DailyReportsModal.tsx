import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Loader2, 
  Filter, 
  RefreshCw, 
  Briefcase 
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { 
  WorkLog, 
  getWorkLogsByMonth, 
  formatCurrency, 
  formatMinutesToHours, 
  formatWorkDate, 
  BOSNIAN_MONTHS 
} from '../../lib/supabaseService';
import { generateMonthlyReportPDF } from '../../lib/pdfReportGenerator';
import { useAuth } from '../../context/AuthContext';

interface DailyReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyReportsModal: React.FC<DailyReportsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const currentDate = new Date();

  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [monthlyLogs, setMonthlyLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const availableYears = useMemo(() => {
    const curYear = new Date().getFullYear();
    return [curYear - 1, curYear, curYear + 1];
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const res = await getWorkLogsByMonth(selectedYear, selectedMonth);
    if (res.data) {
      setMonthlyLogs(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, selectedYear, selectedMonth]);

  // Sumarni izračun
  const totals = useMemo(() => {
    const totalMinutes = monthlyLogs.reduce((acc, l) => acc + (Number(l.total_minutes) || 0), 0);
    const totalEarned = monthlyLogs.reduce((acc, l) => acc + (Number(l.earned_amount) || 0), 0);
    const clientsSet = new Set(monthlyLogs.map((l) => l.client_id));
    return {
      totalMinutes,
      totalEarned,
      totalLogsCount: monthlyLogs.length,
      uniqueClientsCount: clientsSet.size,
    };
  }, [monthlyLogs]);

  const monthName = BOSNIAN_MONTHS.find((m) => m.value === selectedMonth)?.name || `${selectedMonth}.`;

  const userDisplayName = (user as any)?.user_metadata?.full_name || 
                          (user as any)?.fullName || 
                          user?.email?.split('@')[0] || 
                          'Korisnik';

  // Export u PDF
  const handleDownloadPDF = () => {
    if (monthlyLogs.length === 0) return;
    setIsExporting(true);

    try {
      const doc = generateMonthlyReportPDF({
        userDisplayName,
        userEmail: user?.email || '',
        year: selectedYear,
        month: selectedMonth,
        workLogs: monthlyLogs,
      });

      doc.save(`WorkOra_Izvjestaj_${monthName}_${selectedYear}.pdf`);
    } catch (err) {
      console.error('Greška pri kreiranju PDF-a:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Dnevni Izvještaj & PDF Export"
      subtitle={`Službeni mjesečni pregled radnih sati i izrada PDF izvještaja`}
      icon={<FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
    >
      <div className="space-y-4">
        {/* Filteri Mjeseca i Godine */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="relative flex-1">
            <label className="text-[10px] font-bold text-slate-400 block px-1 mb-0.5">
              Odabir Mjeseca
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input-field py-1.5 text-xs font-semibold cursor-pointer"
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
              className="input-field py-1.5 text-xs font-semibold cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}.
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sumarni panel za odabrani period */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/60">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">
              Ukupno Sati
            </span>
            <span className="text-lg font-black text-indigo-950 dark:text-white">
              {formatMinutesToHours(totals.totalMinutes)}
            </span>
            <span className="text-[10px] text-indigo-500 block">
              {totals.totalLogsCount} radnih unosa
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-900/60">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
              Ukupno za Isplatu
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totals.totalEarned)}
            </span>
            <span className="text-[10px] text-emerald-500 block">
              {totals.uniqueClientsCount} različita klijenta
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
            <button
              onClick={handleDownloadPDF}
              disabled={monthlyLogs.length === 0 || isExporting}
              type="button"
              className="w-full btn-primary py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              title="Preuzmi zvanični PDF dokument sa tabelom"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Preuzmi PDF</span>
            </button>
            <span className="text-[9px] text-slate-400 text-center mt-1 block">
              {monthlyLogs.length > 0 ? 'Formatirano za štampu (A4)' : 'Nema unosa za export'}
            </span>
          </div>
        </div>

        {/* Tabela / Lista posložena po datumima */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
            <span>Hronološki prikaz po danima ({monthName} {selectedYear})</span>
            <span>{monthlyLogs.length} stavki</span>
          </div>

          <div className="max-h-[44vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            {loading ? (
              <div className="text-center py-12 space-y-2">
                <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Učitavanje izvještaja...</p>
              </div>
            ) : monthlyLogs.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nema evidentiranih poslova za {monthName} {selectedYear}.
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Odaberite drugi mjesec ili dodajte radne sate preko forme na nadzornoj ploči.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-xs">
                  <tr>
                    <th className="py-2.5 px-3">Datum</th>
                    <th className="py-2.5 px-3">Klijent</th>
                    <th className="py-2.5 px-2 text-center">Trajanje</th>
                    <th className="py-2.5 px-2 text-right">Tarifa</th>
                    <th className="py-2.5 px-3 text-right">Zarada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {monthlyLogs.map((log) => {
                    const clientName = log.clients?.name || 'Nepoznat';
                    const rateDisplay =
                      log.clients?.rate_type === 'hourly'
                        ? `${formatCurrency(log.clients.rate_amount)}/h`
                        : `${formatCurrency(log.clients?.rate_amount || 0)}/d`;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          {formatWorkDate(log.work_date)}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {log.time_from} - {log.time_to}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[120px] sm:max-w-[180px]">
                            {clientName}
                          </span>
                          {log.note && (
                            <span className="text-[10px] text-slate-400 block truncate max-w-[120px] sm:max-w-[180px]">
                              {log.note}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center font-medium whitespace-nowrap">
                          {formatMinutesToHours(log.total_minutes)}
                        </td>
                        <td className="py-2 px-2 text-right text-slate-500 whitespace-nowrap text-[11px]">
                          {rateDisplay}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {formatCurrency(log.earned_amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Red UKUPNO na dnu tabele */}
                <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white sticky bottom-0">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 uppercase text-[11px] tracking-wider">
                      UKUPNO ZA {monthName}
                    </td>
                    <td className="py-2.5 px-2 text-center text-indigo-600 dark:text-indigo-400">
                      {formatMinutesToHours(totals.totalMinutes)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-[10px] text-slate-400 font-normal">
                      Suma
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                      {formatCurrency(totals.totalEarned)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>

        {/* Dugme za zatvaranje */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleDownloadPDF}
            disabled={monthlyLogs.length === 0 || isExporting}
            type="button"
            className="flex-1 btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Preuzmi Službeni PDF Izvještaj</span>
          </button>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Zatvori
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
