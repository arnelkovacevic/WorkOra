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
  calculateMinutes 
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

  useEffect(() => {
    if (selectionType === 'permanent' && clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setRateType(client.rate_type as 'hourly' | 'daily' | 'service');
        setRateAmount(Number(client.rate_amount));
      }
    }
  }, [selectionType, clientId, clients]);

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
      total_minutes: calculateMinutes(timeFrom, timeTo),
      earned_amount: rateAmount,
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

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={selectionType ? t('workLogs.addNew') : t('workLogs.selectType')}
      subtitle={selectionType ? "" : t('workLogs.selectTypeDesc')}
      icon={selectionType ? <Clock className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
    >
      {selectionType === null ? (
        <div className="grid grid-cols-1 gap-3">
          <button onClick={() => setSelectionType('permanent')} className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-left transition-all">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('workLogs.permanent')}</h4>
          </button>
          <button onClick={() => setSelectionType('occasional')} className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-left transition-all">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('workLogs.occasional')}</h4>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <button type="button" onClick={() => setSelectionType(null)} className="text-xs text-indigo-600 mb-2">{t('common.back')}</button>
          
          {selectionType === 'permanent' ? (
             <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="input-field w-full">
               {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          ) : (
            <input type="text" value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder={t('workLogs.clientNameOrJob')} className="input-field w-full" />
          )}

          <div className="grid grid-cols-3 gap-2">
            {(['hourly', 'daily', 'service'] as const).map(type => (
              <button key={type} type="button" onClick={() => setRateType(type)} className={`py-2 text-[10px] font-bold rounded-lg border ${rateType === type ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                {t(`workLogs.${type}`)}
              </button>
            ))}
          </div>

          <div>
             <label className="text-xs font-semibold">{t('workLogs.rateAmount')}</label>
             <div className="relative">
                <input type="number" value={rateAmount} onChange={(e) => setRateAmount(Number(e.target.value))} className="input-field w-full pr-8" />
                <span className="absolute right-3 top-3 text-sm text-slate-500">€</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-xs font-semibold">Od</label>
                <input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} className="input-field w-full" />
             </div>
             <div>
                <label className="text-xs font-semibold">Do</label>
                <input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} className="input-field w-full" />
             </div>
          </div>

          <label className="text-xs font-semibold">Bilješke</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="input-field w-full" rows={2} />

          <button type="submit" className="w-full btn-primary py-3">{t('common.save')}</button>
        </form>
      )}
    </ModalWrapper>
  );
};
