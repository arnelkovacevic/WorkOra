import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  DollarSign, 
  AlertCircle, 
  Loader2, 
  Plus, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { 
  Client, 
  WorkLog, 
  addWorkLog, 
  calculateMinutes, 
  formatMinutesToHours, 
  formatCurrency 
} from '../../lib/supabaseService';

interface NewWorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (workLog: WorkLog) => void;
  clients: Client[];
  onOpenNewClient: () => void;
}

export const NewWorkLogModal: React.FC<NewWorkLogModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clients,
  onOpenNewClient,
}) => {
  // Danasnji datum u formatu YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [clientId, setClientId] = useState<string>('');
  const [workDate, setWorkDate] = useState<string>(todayStr);
  const [timeFrom, setTimeFrom] = useState<string>('09:00');
  const [timeTo, setTimeTo] = useState<string>('12:30');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Postavi prvog klijenta kao defaultnog čim se lista učita
  useEffect(() => {
    if (clients && clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [clients, clientId]);

  // Reset forme pri ponovnom otvaranju
  useEffect(() => {
    if (isOpen) {
      setWorkDate(todayStr);
      setErrorMessage('');
      if (clients && clients.length > 0 && !clientId) {
        setClientId(clients[0].id);
      }
    }
  }, [isOpen, todayStr, clients]);

  // Trenutno odabrani klijent
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === clientId) || null;
  }, [clients, clientId]);

  // Real-time izračun minuta
  const totalMinutes = useMemo(() => {
    return calculateMinutes(timeFrom, timeTo);
  }, [timeFrom, timeTo]);

  // Real-time izračun zarade
  const earnedAmount = useMemo(() => {
    if (!selectedClient) return 0;
    if (selectedClient.rate_type === 'daily') {
      return Number(selectedClient.rate_amount);
    }
    // Hourly: (total_minutes / 60) * rate_amount
    const hours = totalMinutes / 60;
    const amount = hours * Number(selectedClient.rate_amount);
    return Math.round(amount * 100) / 100;
  }, [selectedClient, totalMinutes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!clientId) {
      setErrorMessage('Molimo odaberite klijenta sa liste.');
      return;
    }

    if (!workDate) {
      setErrorMessage('Molimo odaberite datum rada.');
      return;
    }

    if (!timeFrom || !timeTo) {
      setErrorMessage('Molimo unesite vrijeme početka i završetka rada.');
      return;
    }

    if (totalMinutes <= 0) {
      setErrorMessage('Vrijeme završetka mora biti veće od vremena početka rada.');
      return;
    }

    setLoading(true);
    const result = await addWorkLog({
      client_id: clientId,
      work_date: workDate,
      time_from: timeFrom,
      time_to: timeTo,
      total_minutes: totalMinutes,
      earned_amount: earnedAmount,
      note: note.trim() || null,
    });
    setLoading(false);

    if (result.error || !result.data) {
      setErrorMessage(result.error || 'Greška pri spremanju radnog unosa.');
    } else {
      onSuccess(result.data);
      setNote('');
      onClose();
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Novi radni unos"
      subtitle="Zabilježite odrađene sate i automatski izračunajte zaradu"
      icon={<Clock className="w-5 h-5" />}
    >
      {/* Ako korisnik još nema klijenata */}
      {(!clients || clients.length === 0) ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Još nemate unesenih klijenata
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Prije evidentiranja radnih sati, potrebno je definisati barem jednog klijenta sa tarifom.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenNewClient();
            }}
            className="btn-primary text-xs py-2.5 px-4 font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj prvog klijenta</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Odabir klijenta */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Klijent <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewClient();
                }}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Novi klijent
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="input-field pl-10 pr-8 font-medium appearance-none cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({formatCurrency(c.rate_amount)} / {c.rate_type === 'hourly' ? 'sat' : 'dan'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Datum posla */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Datum rada <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                required
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Vrijeme Od i Vrijeme Do (Grid 2 kolone) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Vrijeme Od <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  required
                  className="input-field pl-8 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Vrijeme Do <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  required
                  className="input-field pl-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Automatski izračun - Live Preview kartica */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-900/70 dark:text-indigo-300 font-medium">
                Ukupno radno vrijeme:
              </span>
              <span className="font-bold text-indigo-950 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900">
                {formatMinutesToHours(totalMinutes)} ({totalMinutes} min)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-indigo-100 dark:border-indigo-900/50">
              <span className="text-indigo-900/70 dark:text-indigo-300 font-medium">
                Izračunata zarada ({selectedClient?.rate_type === 'hourly' ? 'po satu' : 'dnevna tarifa'}):
              </span>
              <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(earnedAmount)}
              </span>
            </div>
          </div>

          {/* Opcionalna bilješka / opis */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Bilješka posla (opcionalno)
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 text-slate-400 pointer-events-none">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Npr. Završen modul za fakturisanje i popravljeni bagovi..."
                rows={2}
                className="input-field pl-10 text-xs sm:text-sm py-2.5 resize-none"
              />
            </div>
          </div>

          {/* Dugme za upis */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-2 py-3 text-sm font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Spremanje unosa...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Upiši radne sate</span>
              </>
            )}
          </button>
        </form>
      )}
    </ModalWrapper>
  );
};
