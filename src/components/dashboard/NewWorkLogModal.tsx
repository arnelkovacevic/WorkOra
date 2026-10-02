import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertCircle, 
  Loader2, 
  Plus, 
  UserPlus,
  Briefcase,
  ChevronLeft
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [selectionType, setSelectionType] = useState<'permanent' | 'occasional' | null>(null);
  const [clientId, setClientId] = useState<string>('');
  const [jobName, setJobName] = useState<string>('');
  const [workDate, setWorkDate] = useState<string>(todayStr);
  const [timeFrom, setTimeFrom] = useState<string>('09:00');
  const [timeTo, setTimeTo] = useState<string>('12:30');
  const [note, setNote] = useState<string>('');
  const [rateType, setRateType] = useState<'hourly' | 'daily' | 'service'>('hourly');
  const [rateAmount, setRateAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Reset forme pri otvaranju
  useEffect(() => {
    if (isOpen) {
      setSelectionType(null);
      setClientId('');
      setJobName('');
      setWorkDate(todayStr);
      setNote('');
      setErrorMessage('');
      if (clients && clients.length > 0) {
        setClientId(clients[0].id);
      }
    }
  }, [isOpen, todayStr, clients]);

  // Učitaj default rate za stalnog klijenta
  useEffect(() => {
    if (selectionType === 'permanent' && clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setRateType(client.rate_type as 'hourly' | 'daily' | 'service');
        setRateAmount(Number(client.rate_amount));
      }
    }
  }, [selectionType, clientId, clients]);

  const totalMinutes = useMemo(() => calculateMinutes(timeFrom, timeTo), [timeFrom, timeTo]);

  const earnedAmount = useMemo(() => {
    if (rateType === 'hourly') {
      const hours = totalMinutes / 60;
      return Math.round(hours * rateAmount * 100) / 100;
    }
    return rateAmount;
  }, [rateType, rateAmount, totalMinutes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectionType === 'permanent' && !clientId) {
      setErrorMessage(t('workLogs.errorSelectClient'));
      return;
    }
    if (selectionType === 'occasional' && !jobName) {
      setErrorMessage(t('workLogs.errorJobName'));
      return;
    }

    setLoading(true);
    const result = await addWorkLog({
      client_id: selectionType === 'permanent' ? clientId : null,
      job_name: selectionType === 'occasional' ? jobName : null,
      work_date: workDate,
      time_from: timeFrom,
      time_to: timeTo,
      total_minutes: totalMinutes,
      earned_amount: earnedAmount,
      note: note.trim() || null,
      payment_type: rateType,
    });
    setLoading(false);

    if (result.error || !result.data) {
      setErrorMessage(result.error || t('workLogs.errorSave'));
    } else {
      onSuccess(result.data);
      onClose();
    }
  };

  const SelectionScreen = () => (
    <div className="grid grid-cols-1 gap-3">
      <button
        onClick={() => setSelectionType('permanent')}
        className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-left hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all flex items-center gap-3"
      >
        <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('workLogs.permanent')}</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('workLogs.permanentDesc')}</p>
        </div>
      </button>
      <button
        onClick={() => setSelectionType('occasional')}
        className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-left hover:bg-purple-100 dark:hover:bg-purple-900 transition-all flex items-center gap-3"
      >
        <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('workLogs.occasional')}</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('workLogs.occasionalDesc')}</p>
        </div>
      </button>
    </div>
  );

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={selectionType ? t('workLogs.addNew') : t('workLogs.selectType')}
      subtitle={selectionType ? "" : t('workLogs.selectTypeDesc')}
      icon={selectionType ? <Clock className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
    >
      {selectionType === null ? (
        <SelectionScreen />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <button 
            type="button" 
            onClick={() => setSelectionType(null)}
            className="flex items-center text-xs text-slate-500 hover:text-indigo-600 mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> {t('common.back')}
          </button>
          
          {selectionType === 'permanent' ? (
             <select
               value={clientId}
               onChange={(e) => setClientId(e.target.value)}
               className="input-field w-full"
             >
               {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          ) : (
            <input 
              type="text" 
              value={jobName} 
              onChange={(e) => setJobName(e.target.value)} 
              placeholder={t('workLogs.clientNameOrJob')}
              className="input-field w-full"
            />
          )}

          {/* Segmented Control */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['hourly', 'daily', 'service'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setRateType(type)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${rateType === type ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
              >
                {t(`workLogs.${type}`)}
              </button>
            ))}
          </div>

          <input 
            type="number" 
            value={rateAmount} 
            onChange={(e) => setRateAmount(Number(e.target.value))} 
            placeholder={t('workLogs.rateAmount')}
            className="input-field w-full"
          />

          <div className="grid grid-cols-2 gap-3">
            <input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} className="input-field" />
            <input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} className="input-field" />
          </div>

          <button type="submit" className="w-full btn-primary py-3">{t('common.save')}</button>
        </form>
      )}
    </ModalWrapper>
  );
};
