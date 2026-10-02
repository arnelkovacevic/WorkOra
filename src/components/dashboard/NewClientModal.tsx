import React, { useState, useEffect } from 'react';
import { User, DollarSign, Clock, Calendar, AlertCircle, Loader2, Plus, Check } from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { addClient, updateClient, Client } from '../../lib/supabaseService';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: Client) => void;
  clientToEdit?: Client | null;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientToEdit,
}) => {
  const [name, setName] = useState('');
  const [rateType, setRateType] = useState<'hourly' | 'daily'>('hourly');
  const [rateAmount, setRateAmount] = useState<string>('15.00');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEditing = Boolean(clientToEdit);

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name);
      setRateType(clientToEdit.rate_type);
      setRateAmount(String(clientToEdit.rate_amount));
    } else {
      setName('');
      setRateType('hourly');
      setRateAmount('15.00');
    }
    setErrorMessage('');
  }, [clientToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Molimo unesite naziv ili ime klijenta.');
      return;
    }

    const numericRate = parseFloat(rateAmount);
    if (isNaN(numericRate) || numericRate < 0) {
      setErrorMessage('Iznos tarife mora biti pozitivan broj.');
      return;
    }

    setLoading(true);

    if (isEditing && clientToEdit) {
      const res = await updateClient(clientToEdit.id, {
        name: name.trim(),
        rate_type: rateType,
        rate_amount: numericRate,
      });
      setLoading(false);

      if (res.error || !res.data) {
        setErrorMessage(res.error || 'Greška pri izmjeni klijenta.');
      } else {
        onSuccess(res.data);
        onClose();
      }
    } else {
      const res = await addClient({
        name: name.trim(),
        rate_type: rateType,
        rate_amount: numericRate,
      });
      setLoading(false);

      if (res.error || !res.data) {
        setErrorMessage(res.error || 'Greška pri kreiranju klijenta.');
      } else {
        onSuccess(res.data);
        setName('');
        onClose();
      }
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Uredi klijenta' : 'Novi klijent'}
      subtitle={
        isEditing
          ? 'Prilagodite naziv ili tarifu odabranog klijenta'
          : 'Dodajte klijenta za kojeg ćete evidentirati radne sate'
      }
      icon={<User className="w-5 h-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Naziv klijenta */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Ime / Naziv klijenta <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Npr. Silvano ili Alfa d.o.o."
              required
              className="input-field pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Vrsta tarife (Radio / Tab izbor) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Model obračuna tarife <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setRateType('hourly')}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                rateType === 'hourly'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-500 dark:text-indigo-300 shadow-xs'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Po satu (€ / h)</span>
            </button>

            <button
              type="button"
              onClick={() => setRateType('daily')}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                rateType === 'daily'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-500 dark:text-indigo-300 shadow-xs'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Po danu (€ / dan)</span>
            </button>
          </div>
        </div>

        {/* Iznos tarife */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Iznos tarife u EUR (€) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
              €
            </div>
            <input
              type="number"
              step="0.50"
              min="0"
              value={rateAmount}
              onChange={(e) => setRateAmount(e.target.value)}
              placeholder="0.00"
              required
              className="input-field pl-10 pr-16 font-semibold"
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs text-slate-400 font-medium">
              {rateType === 'hourly' ? '/ sat' : '/ dan'}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {rateType === 'hourly'
              ? 'Svaki odrađeni sat množi se ovim iznosom srazmjerno minutama.'
              : 'Fiksni iznos po jednom radnom unosu bez obzira na minute.'}
          </p>
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
              <span>Spremanje klijenta...</span>
            </>
          ) : (
            <>
              {isEditing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isEditing ? 'Sačuvaj izmjene' : 'Kreiraj klijenta'}</span>
            </>
          )}
        </button>
      </form>
    </ModalWrapper>
  );
};
