import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { 
  Client, 
  AgendaEvent, 
  addAgendaEvent, 
  calculateMinutes, 
  formatMinutesToHours, 
  formatCurrency 
} from '../../lib/supabaseService';

interface NewAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (event: AgendaEvent) => void;
  clients: Client[];
  initialDate?: string;
  onOpenNewClient: () => void;
}

export const NewAgendaModal: React.FC<NewAgendaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clients,
  initialDate,
  onOpenNewClient,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [clientId, setClientId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(initialDate || todayStr);
  const [timeFrom, setTimeFrom] = useState<string>('10:00');
  const [timeTo, setTimeTo] = useState<string>('13:00');
  const [taskDescription, setTaskDescription] = useState<string>('Čišćenje i peglanje');
  const [agendaMode, setAgendaMode] = useState<'permanent' | 'temporary'>('permanent');
  const [tempClientName, setTempClientName] = useState<string>('');
  const [typeWorks, setTypeWorks] = useState<'po satu' | 'dnevno' | 'po usluzi'>('po satu');
  const [tempRateAmount, setTempRateAmount] = useState<string>('15');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (clients && clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [clients, clientId]);

  useEffect(() => {
    if (initialDate) {
      setScheduledDate(initialDate);
    }
  }, [initialDate, isOpen]);

  // Odabrani klijent
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === clientId) || null;
  }, [clients, clientId]);

  // Trajanje
  const totalMinutes = useMemo(() => {
    return calculateMinutes(timeFrom, timeTo);
  }, [timeFrom, timeTo]);

  // Procijenjena zarada
  const estimatedEarned = useMemo(() => {
    if (agendaMode === 'permanent') {
      if (!selectedClient) return 0;
      const rate = Number(selectedClient.rate_amount);
      if (typeWorks === 'dnevno' || typeWorks === 'po usluzi') {
        return rate;
      }
      const hours = totalMinutes / 60;
      return Math.round((hours * rate) * 100) / 100;
    } else {
      const rate = Number(tempRateAmount) || 0;
      if (typeWorks === 'dnevno' || typeWorks === 'po usluzi') {
        return rate;
      }
      const hours = totalMinutes / 60;
      return Math.round((hours * rate) * 100) / 100;
    }
  }, [agendaMode, selectedClient, totalMinutes, typeWorks, tempRateAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (agendaMode === 'permanent' && !clientId) {
      setErrorMessage('Molimo odaberite klijenta sa liste.');
      return;
    }

    if (agendaMode === 'temporary' && !tempClientName.trim()) {
      setErrorMessage('Molimo unesite naziv klijenta.');
      return;
    }

    if (!scheduledDate) {
      setErrorMessage('Molimo odaberite datum zakazanog termina.');
      return;
    }

    if (!timeFrom || !timeTo) {
      setErrorMessage('Molimo odaberite vrijeme početka i završetka.');
      return;
    }

    if (totalMinutes <= 0) {
      setErrorMessage('Vrijeme završetka mora biti poslije početka termina.');
      return;
    }

    if (!taskDescription.trim()) {
      setErrorMessage('Molimo unesite opis zadatka / posla.');
      return;
    }

    setLoading(true);

    const result = await addAgendaEvent({
      client_id: agendaMode === 'permanent' ? clientId : null,
      temp_client_name: agendaMode === 'temporary' ? tempClientName.trim() : (selectedClient?.name || null),
      type_works: typeWorks,
      scheduled_date: scheduledDate,
      time_from: timeFrom,
      time_to: timeTo,
      task_description: taskDescription.trim(),
    });
    setLoading(false);

    if (result.error || !result.data) {
      setErrorMessage(result.error || 'Greška pri zakazivanju termina.');
    } else {
      onSuccess(result.data);
      onClose();
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Zakaži novi termin"
      subtitle="Planirajte poslove i termine kod klijenata u kalendaru"
      icon={<CalendarCheck className="w-5 h-5 text-indigo-500" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tip klijenta (Stalni vs Povremeni) */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-center text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAgendaMode('permanent')}
            className={`py-1.5 rounded-lg transition-all ${
              agendaMode === 'permanent'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Stalni klijent
          </button>
          <button
            type="button"
            onClick={() => setAgendaMode('temporary')}
            className={`py-1.5 rounded-lg transition-all ${
              agendaMode === 'temporary'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Povremeni klijent
          </button>
        </div>

        {/* Polja na osnovu odabira */}
        {agendaMode === 'permanent' ? (
          <div className="space-y-3">
            {(!clients || clients.length === 0) ? (
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-center space-y-2">
                <p className="text-xs text-indigo-950 dark:text-indigo-200 font-medium">
                  Nemate sačuvanih stalnih klijenata.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNewClient();
                  }}
                  className="btn-primary text-xs py-1.5 px-3 font-semibold mx-auto inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dodaj prvog klijenta</span>
                </button>
              </div>
            ) : (
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
            )}

            {/* Tip obračuna za stalnog klijenta */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tip obračuna <span className="text-slate-400">(za ovaj termin)</span>
              </label>
              <select
                value={typeWorks}
                onChange={(e) => setTypeWorks(e.target.value as 'po satu' | 'dnevno' | 'po usluzi')}
                className="input-field text-sm appearance-none cursor-pointer"
              >
                <option value="po satu">Po satu</option>
                <option value="dnevno">Dnevno / Fiksno</option>
                <option value="po usluzi">Po usluzi</option>
              </select>
            </div>
          </div>
        ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Naziv klijenta / posla <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={tempClientName}
                    onChange={(e) => setTempClientName(e.target.value)}
                    placeholder="Npr. Popravka ograde - Marko"
                    required
                    className="input-field pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Tarifa i Tip obračuna za povremenog klijenta */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Iznos tarife (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempRateAmount}
                    onChange={(e) => setTempRateAmount(e.target.value)}
                    className="input-field text-sm"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tip obračuna
                  </label>
                  <select
                    value={typeWorks}
                    onChange={(e) => setTypeWorks(e.target.value as 'po satu' | 'dnevno' | 'po usluzi')}
                    className="input-field text-sm appearance-none cursor-pointer"
                  >
                    <option value="po satu">Po satu</option>
                    <option value="dnevno">Dnevno / Fiksno</option>
                    <option value="po usluzi">Po usluzi</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Datum termina */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Datum posla <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="input-field pl-10 font-medium"
              />
            </div>
          </div>

          {/* Vrijeme Od i Vrijeme Do */}
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

          {/* Opis zadatka */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Opis posla / zadatka <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 text-slate-400 pointer-events-none">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Npr. Peglanje i generalno čišćenje dnevne sobe..."
                required
                rows={2}
                className="input-field pl-10 text-xs sm:text-sm py-2.5 resize-none"
              />
            </div>
          </div>

          {/* Procijenjeno trajanje i zarada */}
          <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-indigo-900/70 dark:text-indigo-300 block font-medium">
                Planirano trajanje:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatMinutesToHours(totalMinutes)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-indigo-900/70 dark:text-indigo-300 block font-medium">
                Očekivana zarada:
              </span>
              <span className="font-extrabold text-base text-indigo-600 dark:text-indigo-400">
                {formatCurrency(estimatedEarned)}
              </span>
            </div>
          </div>

          {/* Dugme za spremanje */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-2 py-3 text-sm font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Zakazivanje...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Zakaži termin u kalendaru</span>
              </>
            )}
          </button>
        </form>
    </ModalWrapper>
  );
};
