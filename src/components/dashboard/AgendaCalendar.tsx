import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Plus, 
  User, 
  FileText, 
  AlertCircle, 
  RefreshCw, 
  Check, 
  Trash2, 
  X, 
  Loader2, 
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { 
  Client, 
  AgendaEvent, 
  getAgendaEvents, 
  convertAgendaToWorkLog, 
  deleteAgendaEvent,
  updateAgendaStatus,
  formatCurrency, 
  formatMinutesToHours, 
  formatWorkDate, 
  BOSNIAN_MONTHS,
  calculateMinutes,
  parseAgendaDescription
} from '../../lib/supabaseService';
import { NewAgendaModal } from './NewAgendaModal';

interface AgendaCalendarProps {
  clients: Client[];
  onWorkLogCreated?: () => void;
  onOpenNewClient: () => void;
  showToast: (msg: string) => void;
}

const WEEK_DAYS = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

export const AgendaCalendar: React.FC<AgendaCalendarProps> = ({
  clients,
  onWorkLogCreated,
  onOpenNewClient,
  showToast,
}) => {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [isNewAgendaModalOpen, setIsNewAgendaModalOpen] = useState<boolean>(false);

  // Učitavanje događaja za trenutni mjesec
  const loadEvents = async () => {
    setLoading(true);
    const res = await getAgendaEvents(currentYear, currentMonth);
    if (res.data) {
      setEvents(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, [currentYear, currentMonth]);

  // Navigacija kroz mjesece
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleTodayClick = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDate(todayISO);
  };

  // Kalendarska mreža za odabrani mjesec
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
    const totalDays = lastDayOfMonth.getDate();

    // 0 = Ponedjeljak, 6 = Nedjelja
    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;

    const days: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Prethodni dani (padding)
    for (let i = 0; i < startWeekday; i++) {
      days.push({ dayNumber: 0, dateStr: '', isCurrentMonth: false });
    }

    // Dani u mjesecu
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(currentMonth).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: true });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Mapa događaja po danima za brzi prikaz tačkica
  const eventsByDate = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    events.forEach((event) => {
      const list = map.get(event.scheduled_date) || [];
      list.push(event);
      map.set(event.scheduled_date, list);
    });
    return map;
  }, [events]);

  // Događaji za odabrani dan
  const selectedDateEvents = useMemo(() => {
    return eventsByDate.get(selectedDate) || [];
  }, [eventsByDate, selectedDate]);

  // Konverzija u radni log ("Završi posao")
  const handleConvert = async (eventId: string) => {
    setConvertingId(eventId);
    const res = await convertAgendaToWorkLog(eventId);
    setConvertingId(null);

    if (res.success) {
      showToast('Termin je uspješno završen i prebačen u vaše Radne Sate sa obračunatom zaradom!');
      // Ažuriraj lokalno stanje
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: 'completed' } : e))
      );
      if (onWorkLogCreated) {
        onWorkLogCreated();
      }
    } else {
      showToast(res.error || 'Nije uspjela konverzija u radni log.');
    }
  };

  // Brisanje termina
  const handleDelete = async (id: string) => {
    const res = await deleteAgendaEvent(id);
    if (res.success) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      showToast('Termin je obrisan iz kalendara.');
    } else {
      showToast(res.error || 'Nije uspjelo brisanje termina.');
    }
  };

  const monthName = BOSNIAN_MONTHS.find((m) => m.value === currentMonth)?.name || `${currentMonth}`;

  return (
    <div className="space-y-4">
      {/* Glavna kartica kalendara */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
        {/* Navigacijska traka kalendara */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white capitalize">
                {monthName} {currentYear}.
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Planiranje termina i poslova
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTodayClick}
              type="button"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Danas
            </button>
            <button
              onClick={handlePrevMonth}
              type="button"
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Prethodni mjesec"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              type="button"
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Sljedeći mjesec"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dani u sedmici (Header) */}
        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-1">
          {WEEK_DAYS.map((day, idx) => (
            <div key={day} className={`py-1 ${idx >= 5 ? 'text-indigo-500/80' : ''}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Mreža dana */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((item, idx) => {
            if (!item.isCurrentMonth) {
              return (
                <div
                  key={`pad-${idx}`}
                  className="min-h-[48px] sm:min-h-[64px] rounded-2xl opacity-20 pointer-events-none"
                />
              );
            }

            const dayEvents = eventsByDate.get(item.dateStr) || [];
            const hasEvents = dayEvents.length > 0;
            const isSelected = item.dateStr === selectedDate;
            const isToday = item.dateStr === todayISO;

            const hasPending = dayEvents.some((e) => e.status === 'scheduled');
            const hasCompleted = dayEvents.some((e) => e.status === 'completed');

            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                type="button"
                className={`relative min-h-[50px] sm:min-h-[68px] p-1.5 sm:p-2 rounded-2xl flex flex-col items-center justify-between transition-all select-none border text-left ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25 scale-[1.02] z-10'
                    : isToday
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-bold leading-none ${
                      isSelected ? 'text-white' : ''
                    }`}
                  >
                    {item.dayNumber}
                  </span>
                  {hasEvents && (
                    <span
                      className={`text-[9px] font-bold px-1 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                      }`}
                    >
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Vizuelne tačkice za statuse poslova */}
                <div className="flex items-center gap-1 mt-1">
                  {hasPending && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-amber-300 animate-pulse' : 'bg-amber-500'
                      }`}
                      title="Zakazano"
                    />
                  )}
                  {hasCompleted && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                      }`}
                      title="Odrađeno"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DETALJNI PREGLED ZA ODABRANI DAN */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wider">
              Odabrani datum
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {formatWorkDate(selectedDate)}
            </h3>
          </div>

          <button
            onClick={() => setIsNewAgendaModalOpen(true)}
            type="button"
            className="btn-primary py-2 px-3.5 text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Zakaži termin za ovaj dan</span>
          </button>
        </div>

        {/* Lista termina za taj dan */}
        <div className="space-y-3 pt-2">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 mt-2">Učitavanje termina...</p>
            </div>
          ) : selectedDateEvents.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <CalendarIcon className="w-7 h-7 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nema zakazanih termina za ovaj dan
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Kliknite na dugme iznad da zakažete novi posao kod klijenta.
              </p>
            </div>
          ) : (
            selectedDateEvents.map((item) => {
              const parsed = parseAgendaDescription(item.task_description);
              const clientName = item.temp_client_name || item.clients?.name || parsed.tempClientName || 'Nepoznat klijent';
              const typeWorks = item.type_works || parsed.typeWorks || 'po satu';
              const displayDescription = parsed.cleanDescription || item.task_description;
              const isCompleted = item.status === 'completed';
              const isCancelled = item.status === 'cancelled';
              const isPending = item.status === 'scheduled';
              const minutes = calculateMinutes(item.time_from, item.time_to);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : isCancelled
                      ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {clientName}
                        </span>
                        {/* Status bedž */}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Završeno i evidentirano
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                            <Clock className="w-3 h-3" /> Zakazano
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            Otkazano
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          {item.time_from} - {item.time_to}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {formatMinutesToHours(minutes)}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-100/50 dark:border-indigo-900/40 capitalize">
                          {typeWorks}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 pt-0.5">
                        {displayDescription}
                      </p>
                    </div>

                    {/* Akcije */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isPending && (
                        <button
                          onClick={() => handleConvert(item.id)}
                          disabled={convertingId === item.id}
                          type="button"
                          className="btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                          title="Pretvori ovaj zakazani termin u stvarni radni unos i izračunaj zaradu"
                        >
                          {convertingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Pretvori u radni log</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(item.id)}
                        type="button"
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Obriši termin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal za dodavanje novog termina */}
      <NewAgendaModal
        isOpen={isNewAgendaModalOpen}
        onClose={() => setIsNewAgendaModalOpen(false)}
        clients={clients}
        initialDate={selectedDate}
        onOpenNewClient={onOpenNewClient}
        onSuccess={(savedEvent) => {
          setEvents((prev) => [...prev, savedEvent]);
          showToast(`Novi termin za "${savedEvent.temp_client_name || savedEvent.clients?.name || 'klijenta'}" je zakazan!`);
        }}
      />
    </div>
  );
};
