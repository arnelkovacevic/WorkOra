import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Briefcase,
  Users,
  ChevronLeft
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

type ClientType = 'select' | 'permanent' | 'temporary';

export const NewWorkLogModal: React.FC<NewWorkLogModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clients,
  onOpenNewClient,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Stanje koraka: 'select' (izbor) | 'permanent' (stalni) | 'temporary' (povremeni)
  const [modalMode, setModalMode] = useState<ClientType>('select');

  // Zajednička i specifična stanja
  const [clientId, setClientId] = useState<string>('');
  const [tempClientName, setTempClientName] = useState<string>('');
  const [tempRateType, setTempRateType] = useState<'hourly' | 'daily' | 'service'>('hourly');
  const [permRateType, setPermRateType] = useState<'hourly' | 'daily' | 'service'>('hourly');
  const [tempRateAmount, setTempRateAmount] = useState<string>('15');

  const [workDate, setWorkDate] = useState<string>(todayStr);
  const [timeFrom, setTimeFrom] = useState<string>('09:00');
  const [timeTo, setTimeTo] = useState<string>('12:30');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Defaultni stalni klijent
  useEffect(() => {
    if (clients && clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [clients, clientId]);

  // Reset forme pri otvaranju i zatvaranju
  useEffect(() => {
    if (isOpen) {
      setModalMode('select');
      setWorkDate(todayStr);
      setErrorMessage('');
      setNote('');
      setTempClientName('');
      setTempRateAmount('15');
      setTempRateType('hourly');
      if (clients && clients.length > 0 && !clientId) {
        setClientId(clients[0].id);
      }
    }
  }, [isOpen, todayStr, clients]);

  // Trenutno odabrani stalni klijent
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === clientId) || null;
  }, [clients, clientId]);

  useEffect(() => {
    if (selectedClient) {
      setPermRateType(selectedClient.rate_type === 'hourly' ? 'hourly' : 'daily');
    }
  }, [selectedClient]);

  // Real-time izračun minuta
  const totalMinutes = useMemo(() => {
    return calculateMinutes(timeFrom, timeTo);
  }, [timeFrom, timeTo]);

  // Real-time izračun zarade
  const earnedAmount = useMemo(() => {
    if (modalMode === 'permanent') {
      if (!selectedClient) return 0;
      const rate = Number(selectedClient.rate_amount);
      if (permRateType === 'daily' || permRateType === 'service') {
        return rate;
      }
      const hours = totalMinutes / 60;
      return Math.round(hours * rate * 100) / 100;
    } else if (modalMode === 'temporary') {
      const rate = Number(tempRateAmount) || 0;
      if (tempRateType === 'daily' || tempRateType === 'service') {
        return rate;
      }
      const hours = totalMinutes / 60;
      return Math.round(hours * rate * 100) / 100;
    }
    return 0;
  }, [modalMode, selectedClient, totalMinutes, tempRateAmount, tempRateType, permRateType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (modalMode === 'permanent' && !clientId) {
      setErrorMessage('Molimo odaberite klijenta sa liste.');
      return;
    }

    if (modalMode === 'temporary' && !tempClientName.trim()) {
      setErrorMessage('Molimo unesite naziv klijenta ili posla.');
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

    // Za povremenog klijenta možemo spakovati naziv u bilješku ako nemamo poseban client_id
    const finalNote = modalMode === 'temporary'
      ? `[Povremeni klijent: ${tempClientName.trim()}] ${note.trim()}`.trim()
      : note.trim() || null;

    const result = await addWorkLog({
      client_id: modalMode === 'permanent' ? clientId : null,
      work_date: workDate,
      time_from: timeFrom,
      time_to: timeTo,
      total_minutes: totalMinutes,
      earned_amount: earnedAmount,
      note: note.trim() || null,
      temp_client_name: modalMode === 'temporary' ? tempClientName.trim() : (selectedClient?.name || null),
      type_works: modalMode === 'permanent'
        ? (permRateType === 'hourly' ? 'po satu' : permRateType === 'daily' ? 'dnevno' : 'po usluzi')
        : (tempRateType === 'hourly' ? 'po satu' : tempRateType === 'daily' ? 'dnevno' : 'po usluzi')
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
      title={
        modalMode === 'select'
          ? "Novi radni unos"
          : modalMode === 'permanent'
          ? "Unos za stalnog klijenta"
          : "Unos za povremenog klijenta"
      }
      subtitle={
        modalMode === 'select'
          ? "Odaberite tip klijenta za koji bilježite sate"
          : "Evidentirajte sate i obračunajte zaradu"
      }
      icon={<Clock className="w-5 h-5" />}
    >
      {/* ----------------- KORAK 1: SELEKTOR ----------------- */}
      {modalMode === 'select' && (
        <div className="space-y-4 py-2">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Odaberite kako želite evidentirati ovaj radni posao:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opcija 1: Stalni klijent */}
            <button
              type="button"
              onClick={() => {
                if (!clients || clients.length === 0) {
                  onClose();
                  onOpenNewClient();
                } else {
                  setModalMode('permanent');
                }
              }}
              className="flex flex-col items-start p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Stalni klijent
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Klijenti koje već imate sačuvanje u bazi i sa definisanom tarifom.
              </p>
            </button>

            {/* Opcija 2: Povremeni klijent */}
            <button
              type="button"
              onClick={() => setModalMode('temporary')}
              className="flex flex-col items-start p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 bg-white dark:bg-slate-900 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Povremeni klijent
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Brzi ili jednokratni unos bez kreiranja stalnog profila u bazi.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- KORAK 2: FORMA (STALNI / POVREMENI) ----------------- */}
      {modalMode !== 'select' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dugme za povratak na izbor */}
          <button
            type="button"
            onClick={() => setModalMode('select')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-1"
          >
            <ChevronLeft className="w-4 h-4" /> Promijeni tip klijenta
          </button>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ----- STALNI KLIJENT SPECIFIČNO ----- */}
          {modalMode === 'permanent' && (
            <div className="space-y-3">
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
                    {/* SAMO IME KLIJENTA - bez zagrada i cijene */}
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tip obračuna za stalnog klijenta */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tip obračuna <span className="text-slate-400">(za ovaj unos)</span>
                </label>
                <select
                  value={permRateType}
                  onChange={(e) => setPermRateType(e.target.value as 'hourly' | 'daily' | 'service')}
                  className="input-field text-sm appearance-none cursor-pointer"
                >
                  <option value="hourly">Po satu</option>
                  <option value="daily">Dnevno / Fiksno</option>
                  <option value="service">Po usluzi</option>
                </select>
              </div>
            </div>
          )}

          {/* ----- POVREMENI KLIJENT SPECIFIČNO ----- */}
          {modalMode === 'temporary' && (
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

              {/* Tarifa i Tip obračuna za povremenog */}
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
                    value={tempRateType}
                    onChange={(e) => setTempRateType(e.target.value as 'hourly' | 'daily' | 'service')}
                    className="input-field text-sm appearance-none cursor-pointer"
                  >
                    <option value="hourly">Po satu</option>
                    <option value="daily">Dnevno / Fiksno</option>
                    <option value="service">Po usluzi</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ----- ZAJEDNIČKA POLJA (Datum, Vrijeme OD/DO) ----- */}
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
                Izračunata zarada ({
                  modalMode === 'permanent'
                    ? (selectedClient?.rate_type === 'hourly' ? 'po satu' : 'dnevna tarifa')
                    : (tempRateType === 'hourly' ? 'po satu' : 'dnevna tarifa')
                }):
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
                placeholder="Opis posla ili dodatne napomene..."
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