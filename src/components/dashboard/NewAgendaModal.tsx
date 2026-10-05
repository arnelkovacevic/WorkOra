import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertCircle, 
  Loader2, 
  Plus, 
  CalendarCheck,
  DollarSign,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ModalWrapper } from '../ui/ModalWrapper';
import { 
  Client, 
  AgendaEvent, 
  addAgendaEvent, 
  getAgendaEvents,
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

type TypeWorksOption = 'po satu' | 'dnevno' | 'po usluzi';

export const NewAgendaModal: React.FC<NewAgendaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clients,
  initialDate,
  onOpenNewClient,
}) => {
  const { t } = useTranslation();
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Stanja forme
  const [clientId, setClientId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(initialDate || todayStr);
  const [timeFrom, setTimeFrom] = useState<string>('10:00');
  const [timeTo, setTimeTo] = useState<string>('13:00');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [agendaMode, setAgendaMode] = useState<'permanent' | 'temporary'>('permanent');
  const [tempClientName, setTempClientName] = useState<string>('');
  const [typeWorks, setTypeWorks] = useState<TypeWorksOption>('po satu');
  const [tempRateAmount, setTempRateAmount] = useState<string>('15');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Stanje za bilješke / šablone
  const [allAgendaEvents, setAllAgendaEvents] = useState<AgendaEvent[]>([]);
  const [showDescDropdown, setShowDescDropdown] = useState<boolean>(false);

  // Sinhronizacija klijenta i modala na otvaranju
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setScheduledDate(initialDate || todayStr);
      setTaskDescription(t('newagenda.defaultDesc1', 'Čišćenje i održavanje'));
      setShowDescDropdown(false);

      if (clients && clients.length > 0 && !clientId) {
        setClientId(clients[0].id);
      }

      // Učitavanje istorije događaja za šablone
      const fetchEvents = async () => {
        try {
          const res = await getAgendaEvents();
          if (res.data) {
            setAllAgendaEvents(res.data);
          }
        } catch (e) {
          console.error('Greška pri dohvatanju šablona:', e);
        }
      };
      fetchEvents();
    }
  }, [isOpen, initialDate, todayStr, clients, clientId, t]);

  // Dinamički šabloni/opisi filtrirani za odabranog klijenta
  const existingDescriptions = useMemo(() => {
    const descSet = new Set<string>();

    const defaultDesc1 = t('newagenda.defaultDesc1', 'Redovno čišćenje');
    const defaultDesc2 = t('newagenda.defaultDesc2', 'Generalno čišćenje');

    if (defaultDesc1) descSet.add(defaultDesc1);
    if (defaultDesc2) descSet.add(defaultDesc2);

    if (agendaMode === 'permanent') {
      if (clientId) {
        allAgendaEvents.forEach((evt) => {
          if (evt.client_id === clientId && evt.task_description?.trim()) {
            descSet.add(evt.task_description.trim());
          }
        });
      }
    } else {
      if (tempClientName.trim()) {
        const queryName = tempClientName.trim().toLowerCase();
        allAgendaEvents.forEach((evt) => {
          const evtName = (evt.temp_client_name || '').trim().toLowerCase();
          if (evtName === queryName && evt.task_description?.trim()) {
            descSet.add(evt.task_description.trim());
          }
        });
      }
    }

    return Array.from(descSet);
  }, [allAgendaEvents, agendaMode, clientId, tempClientName, t]);

  // Odabrani klijent
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === clientId) || null;
  }, [clients, clientId]);

  // Trajanje u minutama
  const totalMinutes = useMemo(() => {
    return calculateMinutes(timeFrom, timeTo);
  }, [timeFrom, timeTo]);

  // Procijenjena zarada
  const estimatedEarned = useMemo(() => {
    const rate = agendaMode === 'permanent' 
      ? Number(selectedClient?.rate_amount || 0)
      : Number(tempRateAmount) || 0;

    if (typeWorks === 'dnevno' || typeWorks === 'po usluzi') {
      return rate;
    }
    
    const hours = totalMinutes / 60;
    return Math.round(hours * rate * 100) / 100;
  }, [agendaMode, selectedClient, totalMinutes, typeWorks, tempRateAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (agendaMode === 'permanent' && !clientId) {
      setErrorMessage(t('newagenda.errSelectClient', 'Molimo odaberite klijenta.'));
      return;
    }

    if (agendaMode === 'temporary' && !tempClientName.trim()) {
      setErrorMessage(t('newagenda.errEnterClientName', 'Unesite naziv privremenog klijenta.'));
      return;
    }

    if (!scheduledDate) {
      setErrorMessage(t('newagenda.errSelectDate', 'Odaberite datum termina.'));
      return;
    }

    if (!timeFrom || !timeTo) {
      setErrorMessage(t('newagenda.errSelectTime', 'Odaberite radno vrijeme.'));
      return;
    }

    if (totalMinutes <= 0) {
      setErrorMessage(t('newagenda.errTimeOrder', 'Vrijeme "Kraj" mora biti nakon vremena "Početak".'));
      return;
    }

    if (!taskDescription.trim()) {
      setErrorMessage(t('newagenda.errEnterDescription', 'Unesite opis zadatka.'));
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
      setErrorMessage(result.error || t('newagenda.errSubmit', 'Došlo je do greške pri spremanju.'));
    } else {
      onSuccess(result.data);
      onClose();
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={t('newagenda.title', 'Novi termin u agendi')}
      subtitle={t('newagenda.subtitle', 'Zakažite novi radni zadatak')}
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
            {t('newagenda.permanentClient', 'Stalni klijent')}
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
            {t('newagenda.temporaryClient', 'Povremeni klijent')}
          </button>
        </div>

        {/* Polja na osnovu odabira klijenta */}
        {agendaMode === 'permanent' ? (
          <div className="space-y-3.5">
            {(!clients || clients.length === 0) ? (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-center space-y-2">
                <p className="text-xs text-indigo-950 dark:text-indigo-200 font-medium">
                  {t('newagenda.noClients', 'Nemate registrovanih klijenta.')}
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
                  <span>{t('newagenda.addFirstClient', 'Dodaj prvog klijenta')}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('newagenda.clientLabel', 'Klijent')} <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNewClient();
                    }}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> {t('newagenda.newClientBtn', 'Novi klijent')}
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
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kartica o ugovorenoj tarifi */}
                {selectedClient && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs transition-all animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{t('newagenda.agreedRate', 'Ugovorena tarifa')}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 text-[11px]">
                      {formatCurrency(selectedClient.rate_amount)} / {selectedClient.rate_type === 'hourly' ? t('newagenda.perHour', 'sat') : t('newagenda.perDay', 'dan')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tip obračuna za stalnog klijenta */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('newagenda.billingType', 'Tip obračuna')} <span className="text-slate-400 font-normal">({t('newagenda.forThisEvent', 'za ovaj termin')})</span>
              </label>
              <select
                value={typeWorks}
                onChange={(e) => setTypeWorks(e.target.value as TypeWorksOption)}
                className="input-field text-sm appearance-none cursor-pointer"
              >
                <option value="po satu">{t('newagenda.hourly', 'Po satu')}</option>
                <option value="dnevno">{t('newagenda.daily', 'Dnevno')}</option>
                <option value="po usluzi">{t('newagenda.perService', 'Po usluzi')}</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('newagenda.clientJobName', 'Naziv posla / Klijenta')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={tempClientName}
                  onChange={(e) => setTempClientName(e.target.value)}
                  placeholder={t('newagenda.tempClientPlaceholder', 'Npr. Privatni stan, Restoran X')}
                  required
                  className="input-field pl-10 text-sm"
                />
              </div>
            </div>

            {/* Tarifa i Tip obračuna za povremenog klijenta */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('newagenda.rateAmount', 'Cijena (€)')}
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('newagenda.billingType', 'Tip obračuna')}
                </label>
                <select
                  value={typeWorks}
                  onChange={(e) => setTypeWorks(e.target.value as TypeWorksOption)}
                  className="input-field text-sm appearance-none cursor-pointer"
                >
                  <option value="po satu">{t('newagenda.hourly', 'Po satu')}</option>
                  <option value="dnevno">{t('newagenda.daily', 'Dnevno')}</option>
                  <option value="po usluzi">{t('newagenda.perService', 'Po usluzi')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Datum termina */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('newagenda.jobDate', 'Datum termina')} <span className="text-rose-500">*</span>
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
              className="input-field pl-10 font-medium cursor-pointer"
            />
          </div>
        </div>

        {/* Vrijeme Od i Vrijeme Do */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('newagenda.timeFrom', 'Vrijeme od')} <span className="text-rose-500">*</span>
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
                className="input-field pl-8 text-sm cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('newagenda.timeTo', 'Vrijeme do')} <span className="text-rose-500">*</span>
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
                className="input-field pl-8 text-sm cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Opis zadatka / Bilješke sa istorijskim šablonima */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('newagenda.jobDescription', 'Opis zadatka')} <span className="text-rose-500">*</span>
            </label>
            {existingDescriptions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDescDropdown(!showDescDropdown)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <History className="w-3 h-3" />
                <span>
                  {showDescDropdown 
                    ? t('newagenda.closeTemplates', 'Zatvori šablone') 
                    : t('newagenda.frequentTemplates', 'Česti šabloni')}
                </span>
                {showDescDropdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
          <div className="relative">
            <div className="absolute top-3 left-3 text-slate-400 pointer-events-none">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder={t('newagenda.descPlaceholder', 'Detaljan opis radnih aktivnosti...')}
              required
              rows={2}
              className="input-field pl-10 text-xs sm:text-sm py-2.5 resize-none"
            />
          </div>

          {/* Padajući meni sa šablonima */}
          {showDescDropdown && existingDescriptions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-1.5 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 mb-1">
                {t('newagenda.selectTemplateHeader', 'Odaberite predložak')}
              </div>

              {existingDescriptions.map((desc) => (
                <button
                  key={desc}
                  type="button"
                  onClick={() => {
                    setTaskDescription(desc);
                    setShowDescDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors truncate"
                  title={desc}
                >
                  {desc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Procijenjeno trajanje i zarada */}
        <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center justify-between text-xs">
          <div>
            <span className="text-indigo-900/70 dark:text-indigo-300 block font-medium">
              {t('newagenda.plannedDuration', 'Planirano trajanje')}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatMinutesToHours(totalMinutes)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-indigo-900/70 dark:text-indigo-300 block font-medium">
              {t('newagenda.expectedEarnings', 'Očekivana zarada')}
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
              <span>{t('newagenda.submitting', 'Spremanje...')}</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>{t('newagenda.submitBtn', 'Sačuvaj termin')}</span>
            </>
          )}
        </button>
      </form>
    </ModalWrapper>
  );
};