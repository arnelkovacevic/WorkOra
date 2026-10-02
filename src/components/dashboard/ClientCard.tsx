import React, { useState } from 'react';
import { User, Edit2, Trash2, Clock, Calendar, Check, X, Loader2 } from 'lucide-react';
import { Client, formatCurrency } from '../../lib/supabaseService';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => Promise<void>;
  onViewHours: (client: Client) => void;
  workLogsCount?: number;
  totalEarned?: number;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onEdit,
  onDelete,
  onViewHours,
  workLogsCount = 0,
  totalEarned = 0,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(client.id);
    setIsDeleting(false);
    setShowConfirmDelete(false);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header kartice sa ikonom i imenom */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base flex-shrink-0">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                {client.name}
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Dodano: {new Date(client.created_at).toLocaleDateString('bs-BA')}
              </span>
            </div>
          </div>

          {/* Tarifa bedž */}
          <span className="flex-shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 flex items-center gap-1">
            {client.rate_type === 'hourly' ? (
              <Clock className="w-3 h-3 text-indigo-500" />
            ) : (
              <Calendar className="w-3 h-3 text-indigo-500" />
            )}
            <span>
              {formatCurrency(client.rate_amount)} / {client.rate_type === 'hourly' ? 'h' : 'dan'}
            </span>
          </span>
        </div>

        {/* Statistika klijenta */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
              Ukupno poslova:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {workLogsCount} unosa
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
              Generisana zarada:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalEarned)}
            </span>
          </div>
        </div>

        {/* Dugme za Pregled Sati po klijentu */}
        <button
          onClick={() => onViewHours(client)}
          type="button"
          className="w-full mt-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-indigo-200/50 dark:border-indigo-800/60"
        >
          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Pregled sati</span>
        </button>
      </div>

      {/* Akcije (Uredi i Obriši) */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => onEdit(client)}
          type="button"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Uredi</span>
        </button>

        {showConfirmDelete ? (
          <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
            <span className="text-[10px] text-rose-600 font-medium">Obriši klijenta?</span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              type="button"
              className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              title="Potvrdi"
            >
              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              disabled={isDeleting}
              type="button"
              className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
              title="Odustani"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmDelete(true)}
            type="button"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Obriši klijenta"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
