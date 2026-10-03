import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Trash2, 
  User, 
  FileText, 
  DollarSign, 
  Loader2, 
  Check, 
  X,
  AlertTriangle
} from 'lucide-react';
import { 
  WorkLog, 
  formatMinutesToHours, 
  formatCurrency, 
  formatWorkDate 
} from '../../lib/supabaseService';

interface WorkLogCardProps {
  workLog: WorkLog;
  onDelete: (id: string) => Promise<void>;
}

export const WorkLogCard: React.FC<WorkLogCardProps> = ({ workLog, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const clientName = (!workLog.client_id || workLog.temp_client_name)
    ? (workLog.temp_client_name || workLog.clients?.name || 'Povremeni klijent')
    : (workLog.clients?.name || workLog.temp_client_name || 'Klijent');
  const rateTypeLabel = workLog.type_works || (workLog.clients?.rate_type === 'hourly' ? 'po satu' : 'dnevno');

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(workLog.id);
    setIsDeleting(false);
    setShowConfirmDelete(false);
  };

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        {/* Lijeva strana: Klijent & Tag */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
              {clientName}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              {rateTypeLabel}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              {formatWorkDate(workLog.work_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {workLog.time_from} - {workLog.time_to}
            </span>
          </div>
        </div>

        {/* Desna strana: Zarada & Trajanje */}
        <div className="text-right flex flex-col items-end">
          <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(workLog.earned_amount)}
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg mt-0.5">
            {formatMinutesToHours(workLog.total_minutes)}
          </span>
        </div>
      </div>

      {/* Bilješka (ako postoji) */}
      {workLog.note && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl">
          <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2 leading-relaxed">{workLog.note}</p>
        </div>
      )}

      {/* Donja traka: Akcija brisanja */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          Evidentirano: {new Date(workLog.created_at).toLocaleDateString('bs-BA')}
        </span>

        {showConfirmDelete ? (
          <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              Obrisati unos?
            </span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              type="button"
              className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              title="Potvrdi brisanje"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              disabled={isDeleting}
              type="button"
              className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
              title="Odustani"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmDelete(true)}
            type="button"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Obriši ovaj unos"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
