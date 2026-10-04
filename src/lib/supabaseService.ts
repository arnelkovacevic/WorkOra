import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  rate_type: 'hourly' | 'daily';
  rate_amount: number;
  created_at: string;
}

export interface WorkLog {
  id: string;
  user_id: string;
  client_id?: string | null;
  work_date: string;
  time_from: string;
  time_to: string;
  total_minutes: number;
  earned_amount: number;
  note?: string | null;
  temp_client_name?: string | null;
  type_works?: string | null;
  created_at: string;
  clients?: Client | null;
}

export interface AgendaEvent {
  id: string;
  user_id: string;
  client_id?: string | null;
  scheduled_date: string;
  time_from: string;
  time_to: string;
  task_description: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  temp_client_name?: string | null;
  type_works?: string | null;
  created_at?: string;
  clients?: Client | null;
}

// Local storage ključevi za rad bez konfigurisanog Supabase projekta (WorkOra Demo način)
const STORAGE_CLIENTS_KEY = 'workora_clients_data';
const STORAGE_WORK_LOGS_KEY = 'workora_worklogs_data';
const STORAGE_AGENDA_KEY = 'workora_agenda_data';

// Početni demo podaci za trenutno testiranje ukoliko baza nije povezana
const defaultDemoClients: Client[] = [
  {
    id: 'client-1',
    user_id: 'demo-user-123',
    name: 'Silvano Tehnologije',
    rate_type: 'hourly',
    rate_amount: 15.0,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'client-2',
    user_id: 'demo-user-123',
    name: 'Eurotrans Logistika',
    rate_type: 'daily',
    rate_amount: 90.0,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const defaultDemoWorkLogs: WorkLog[] = [
  {
    id: 'log-1',
    user_id: 'demo-user-123',
    client_id: 'client-1',
    work_date: new Date().toISOString().split('T')[0],
    time_from: '09:00',
    time_to: '13:30',
    total_minutes: 270,
    earned_amount: 67.5,
    note: 'Razvoj frontend komponenti i PWA manifesta',
    created_at: new Date().toISOString(),
    clients: defaultDemoClients[0],
  },
  {
    id: 'log-2',
    user_id: 'demo-user-123',
    client_id: 'client-2',
    work_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time_from: '08:30',
    time_to: '16:30',
    total_minutes: 480,
    earned_amount: 90.0,
    note: 'Cjelodnevna podrška i nadzor sistema',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    clients: defaultDemoClients[1],
  },
];

// Helperi za rad sa lokalnim demo skladištem
function getLocalClients(): Client[] {
  try {
    const raw = localStorage.getItem(STORAGE_CLIENTS_KEY) || localStorage.getItem('mojpwa_clients_data');
    if (!raw) {
      localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(defaultDemoClients));
      return defaultDemoClients;
    }
    return JSON.parse(raw);
  } catch {
    return defaultDemoClients;
  }
}

function saveLocalClients(clients: Client[]) {
  localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(clients));
}

function getLocalWorkLogs(): WorkLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_WORK_LOGS_KEY) || localStorage.getItem('mojpwa_worklogs_data');
    if (!raw) {
      localStorage.setItem(STORAGE_WORK_LOGS_KEY, JSON.stringify(defaultDemoWorkLogs));
      return defaultDemoWorkLogs;
    }
    return JSON.parse(raw);
  } catch {
    return defaultDemoWorkLogs;
  }
}

function saveLocalWorkLogs(logs: WorkLog[]) {
  localStorage.setItem(STORAGE_WORK_LOGS_KEY, JSON.stringify(logs));
}

// -------------------------------------------------------------
// KLIJENTI (Clients) - CRUD OPERACIJE
// -------------------------------------------------------------

/**
 * Dohvata sve klijente prijavljenog korisnika
 */
export async function getClients(): Promise<{ data: Client[] | null; error: string | null }> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }
      return { data: (data as Client[]) || [], error: null };
    } else {
      // Demo fallback
      const clients = getLocalClients();
      return { data: clients, error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri dohvatanju klijenata';
    return { data: null, error: message };
  }
}

/**
 * Dodaje novog klijenta
 */
export async function addClient(clientData: {
  name: string;
  rate_type: 'hourly' | 'daily';
  rate_amount: number;
}): Promise<{ data: Client | null; error: string | null }> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            name: clientData.name.trim(),
            rate_type: clientData.rate_type,
            rate_amount: Number(clientData.rate_amount),
          },
        ])
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }
      return { data: data as Client, error: null };
    } else {
      // Demo mod
      const newClient: Client = {
        id: `client-${Date.now()}`,
        user_id: 'demo-user-123',
        name: clientData.name.trim(),
        rate_type: clientData.rate_type,
        rate_amount: Number(clientData.rate_amount),
        created_at: new Date().toISOString(),
      };
      const current = getLocalClients();
      const updated = [newClient, ...current];
      saveLocalClients(updated);
      return { data: newClient, error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri kreiranju klijenta';
    return { data: null, error: message };
  }
}

/**
 * Uređuje postojećeg klijenta
 */
export async function updateClient(
  id: string,
  clientData: {
    name: string;
    rate_type: 'hourly' | 'daily';
    rate_amount: number;
  }
): Promise<{ data: Client | null; error: string | null }> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: clientData.name.trim(),
          rate_type: clientData.rate_type,
          rate_amount: Number(clientData.rate_amount),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }
      return { data: data as Client, error: null };
    } else {
      const current = getLocalClients();
      let updatedClient: Client | null = null;
      const updated = current.map((c) => {
        if (c.id === id) {
          updatedClient = {
            ...c,
            name: clientData.name.trim(),
            rate_type: clientData.rate_type,
            rate_amount: Number(clientData.rate_amount),
          };
          return updatedClient;
        }
        return c;
      });
      saveLocalClients(updated);
      return { data: updatedClient, error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri izmjeni klijenta';
    return { data: null, error: message };
  }
}

/**
 * Briše klijenta
 */
export async function deleteClient(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } else {
      const clients = getLocalClients().filter((c) => c.id !== id);
      saveLocalClients(clients);
      // Također ukloni njegove work logs radi kaskadnog ponašanja
      const logs = getLocalWorkLogs().filter((l) => l.client_id !== id);
      saveLocalWorkLogs(logs);
      return { success: true, error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri brisanju klijenta';
    return { success: false, error: message };
  }
}

// -------------------------------------------------------------
// RADNI UNOSI (Work Logs) - CRUD OPERACIJE
// -------------------------------------------------------------

/**
 * Pomoćna funkcija za mapiranje privremenih klijenata u virtuelne klijentske objekte
 */
export function mapWorkLogClients(log: WorkLog): WorkLog {
  if (!log) return log;
  if (!log.client_id || log.temp_client_name) {
    const displayName = log.temp_client_name || log.clients?.name || 'Povremeni klijent';
    return {
      ...log,
      clients: log.clients ? {
        ...log.clients,
        name: displayName,
      } : {
        id: log.client_id || 'temp-client',
        user_id: log.user_id,
        name: displayName,
        rate_type: 'hourly',
        rate_amount: 0,
        created_at: log.created_at
      }
    };
  }
  return log;
}

/**
 * Dohvata sve radne sate / poslove logovanog korisnika
 */
export async function getWorkLogs(): Promise<{ data: WorkLog[] | null; error: string | null }> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('work_logs')
        .select('*, clients(*)')
        .order('work_date', { ascending: false })
        .order('time_from', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }
      const mapped = (data as WorkLog[] || []).map(mapWorkLogClients);
      return { data: mapped, error: null };
    } else {
      // Demo mod
      const logs = getLocalWorkLogs();
      const clients = getLocalClients();
      // Poveži klijente
      const joinedLogs = logs.map((log) => ({
        ...log,
        clients: (log.client_id ? clients.find((c) => c.id === log.client_id) : null) || log.clients || null,
      })).map(mapWorkLogClients);
      return { data: joinedLogs, error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri dohvatanju radnih unosa';
    return { data: null, error: message };
  }
}

/**
 * Dodaje novi radni unos sa automatski izračunatim minutama i zaradom
 */
export async function addWorkLog(logData: {
  client_id?: string | null;
  work_date: string;
  time_from: string;
  time_to: string;
  total_minutes: number;
  earned_amount: number;
  note?: string | null;
  temp_client_name?: string | null;
  type_works?: string | null;
}): Promise<{ data: WorkLog | null; error: string | null }> {
  try {
    const rawId = logData.client_id ? String(logData.client_id).trim() : '';
    const cleanClientId = (rawId && rawId !== 'temp-client' && rawId !== 'null' && rawId !== 'undefined')
      ? rawId
      : null;

    const cleanTimeFrom = (logData.time_from || '00:00').slice(0, 5);
    const cleanTimeTo = (logData.time_to || '00:00').slice(0, 5);
    const finalTypeWorks = logData.type_works || 'po satu';

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('work_logs')
        .insert([
          {
            client_id: cleanClientId,
            work_date: logData.work_date,
            time_from: cleanTimeFrom,
            time_to: cleanTimeTo,
            total_minutes: Number(logData.total_minutes) || 0,
            earned_amount: Number(logData.earned_amount) || 0,
            note: logData.note?.trim() || null,
            temp_client_name: logData.temp_client_name?.trim() || null,
            type_works: finalTypeWorks,
          },
        ])
        .select('*, clients(*)')
        .single();

      if (error) {
        return { data: null, error: error.message };
      }
      return { data: mapWorkLogClients(data as WorkLog), error: null };
    } else {
      // Demo mod
      const clients = getLocalClients();
      const matchedClient = cleanClientId ? (clients.find((c) => c.id === cleanClientId) || null) : null;

      const newLog: WorkLog = {
        id: `log-${Date.now()}`,
        user_id: 'demo-user-123',
        client_id: cleanClientId,
        work_date: logData.work_date,
        time_from: cleanTimeFrom,
        time_to: cleanTimeTo,
        total_minutes: Number(logData.total_minutes) || 0,
        earned_amount: Number(logData.earned_amount) || 0,
        note: logData.note?.trim() || null,
        temp_client_name: logData.temp_client_name?.trim() || null,
        type_works: finalTypeWorks,
        created_at: new Date().toISOString(),
        clients: matchedClient,
      };

      const current = getLocalWorkLogs();
      const updated = [newLog, ...current];
      saveLocalWorkLogs(updated);
      return { data: mapWorkLogClients(newLog), error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri dodavanju unosa rada';
    return { data: null, error: message };
  }
}

/**
 * Briše radni unos
 */
export async function deleteWorkLog(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('work_logs').delete().eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } else {
      const logs = getLocalWorkLogs().filter((l) => l.id !== id);
      saveLocalWorkLogs(logs);
      return { success: true, error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri brisanju unosa rada';
    return { success: false, error: message };
  }
}

/**
 * Dohvata unose rada filtrirane po određenom klijentu i odabranom mjesecu i godini
 */
export async function getWorkLogsByClientAndMonth(
  clientId: string,
  year: number,
  month: number
): Promise<{ data: WorkLog[] | null; error: string | null }> {
  try {
    const monthStr = String(month).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('work_logs')
        .select('*, clients(*)')
        .eq('client_id', clientId)
        .gte('work_date', startDate)
        .lte('work_date', endDate)
        .order('work_date', { ascending: true })
        .order('time_from', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }
      const mapped = (data as WorkLog[] || []).map(mapWorkLogClients);
      return { data: mapped, error: null };
    } else {
      const allLogs = getLocalWorkLogs();
      const clients = getLocalClients();
      const filtered = allLogs
        .filter((l) => l.client_id === clientId && l.work_date >= startDate && l.work_date <= endDate)
        .map((l) => ({
          ...l,
          clients: clients.find((c) => c.id === l.client_id) || l.clients || null,
        }))
        .map(mapWorkLogClients)
        .sort((a, b) => a.work_date.localeCompare(b.work_date) || a.time_from.localeCompare(b.time_from));

      return { data: filtered, error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri dohvatanju unosa za klijenta';
    return { data: null, error: message };
  }
}

/**
 * Dohvata sve unose rada svih klijenata za odabrani mjesec i godinu (za mjesečne izvještaje i PDF)
 */
export async function getWorkLogsByMonth(
  year: number,
  month: number
): Promise<{ data: WorkLog[] | null; error: string | null }> {
  try {
    const monthStr = String(month).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('work_logs')
        .select('*, clients(*)')
        .gte('work_date', startDate)
        .lte('work_date', endDate)
        .order('work_date', { ascending: true })
        .order('time_from', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }
      const mapped = (data as WorkLog[] || []).map(mapWorkLogClients);
      return { data: mapped, error: null };
    } else {
      const allLogs = getLocalWorkLogs();
      const clients = getLocalClients();
      const filtered = allLogs
        .filter((l) => l.work_date >= startDate && l.work_date <= endDate)
        .map((l) => ({
          ...l,
          clients: clients.find((c) => c.id === l.client_id) || l.clients || null,
        }))
        .map(mapWorkLogClients)
        .sort((a, b) => a.work_date.localeCompare(b.work_date) || a.time_from.localeCompare(b.time_from));

      return { data: filtered, error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri dohvatanju unosa za mjesec';
    return { data: null, error: message };
  }
}

// Nazivi mjeseci na bosanskom jeziku
export const BOSNIAN_MONTHS = [
  { value: 1, name: 'Januar' },
  { value: 2, name: 'Februar' },
  { value: 3, name: 'Mart' },
  { value: 4, name: 'April' },
  { value: 5, name: 'Maj' },
  { value: 6, name: 'Juni' },
  { value: 7, name: 'Juli' },
  { value: 8, name: 'August' },
  { value: 9, name: 'Septembar' },
  { value: 10, name: 'Oktobar' },
  { value: 11, name: 'Novembar' },
  { value: 12, name: 'Decembar' },
];

export const ITALIAN_MONTHS = [
  { value: 1, name: 'Gennaio' },
  { value: 2, name: 'Febbraio' },
  { value: 3, name: 'Marzo' },
  { value: 4, name: 'Aprile' },
  { value: 5, name: 'Maggio' },
  { value: 6, name: 'Giugno' },
  { value: 7, name: 'Luglio' },
  { value: 8, name: 'Agosto' },
  { value: 9, name: 'Settembre' },
  { value: 10, name: 'Ottobre' },
  { value: 11, name: 'Novembre' },
  { value: 12, name: 'Dicembre' },
];

// -------------------------------------------------------------
// KALENDAR / AGENDA (Termini poslova) - CRUD & KONVERZIJA
// -------------------------------------------------------------

function getLocalAgenda(): AgendaEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_AGENDA_KEY) || localStorage.getItem('mojpwa_agenda_data');
    if (!raw) {
      const defaultDemoAgenda: AgendaEvent[] = [
        {
          id: 'agenda-1',
          user_id: 'demo-user-123',
          client_id: 'client-1',
          scheduled_date: new Date().toISOString().split('T')[0],
          time_from: '14:00',
          time_to: '17:00',
          task_description: 'Čišćenje kancelarijskog prostora i prozora',
          status: 'scheduled',
          created_at: new Date().toISOString(),
        },
        {
          id: 'agenda-2',
          user_id: 'demo-user-123',
          client_id: 'client-2',
          scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time_from: '10:00',
          time_to: '15:00',
          task_description: 'Peglanje i organizacija ormara',
          status: 'scheduled',
          created_at: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_AGENDA_KEY, JSON.stringify(defaultDemoAgenda));
      return defaultDemoAgenda;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalAgenda(events: AgendaEvent[]) {
  localStorage.setItem(STORAGE_AGENDA_KEY, JSON.stringify(events));
}

/**
 * Pomoćna funkcija za mapiranje privremenih klijenata u agendi
 */
export function mapAgendaClients(event: AgendaEvent): AgendaEvent {
  if (event && event.temp_client_name) {
    return {
      ...event,
      clients: event.clients ? {
        ...event.clients,
        name: event.temp_client_name,
      } : {
        id: event.client_id || 'temp-client',
        user_id: event.user_id,
        name: event.temp_client_name,
        rate_type: 'hourly',
        rate_amount: 0,
        created_at: event.created_at || new Date().toISOString(),
      },
    };
  }
  return event;
}

/**
 * Dohvata sve termine iz tabele `agenda` (opcionalno filtrirano po mjesecu/godini)
 */
export async function getAgendaEvents(
  year?: number,
  month?: number
): Promise<{ data: AgendaEvent[] | null; error: string | null }> {
  try {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('agenda')
        .select('*, clients(*)')
        .order('scheduled_date', { ascending: true })
        .order('time_from', { ascending: true });

      if (year && month) {
        const monthStr = String(month).padStart(2, '0');
        const startDate = `${year}-${monthStr}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
        query = query.gte('scheduled_date', startDate).lte('scheduled_date', endDate);
      }

      const { data, error } = await query;
      if (error) {
        return { data: null, error: error.message };
      }
      const mapped = (data as AgendaEvent[] || []).map(mapAgendaClients);
      return { data: mapped, error: null };
    } else {
      let events = getLocalAgenda();
      const clients = getLocalClients();

      if (year && month) {
        const monthStr = String(month).padStart(2, '0');
        const prefix = `${year}-${monthStr}`;
        events = events.filter((e) => e.scheduled_date.startsWith(prefix));
      }

      const joined = events.map((e) => ({
        ...e,
        clients: (e.client_id ? clients.find((c) => c.id === e.client_id) : null) || e.clients || null,
      })).map(mapAgendaClients).sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date) || a.time_from.localeCompare(b.time_from));

      return { data: joined, error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri dohvatanju kalendara';
    return { data: null, error: message };
  }
}

/**
 * Dodaje novi zakazani termin u tabelu `agenda`
 */
export async function addAgendaEvent(data: {
  client_id?: string | null;
  scheduled_date: string;
  time_from: string;
  time_to: string;
  task_description: string;
  temp_client_name?: string | null;
  type_works?: string | null;
}): Promise<{ data: AgendaEvent | null; error: string | null }> {
  try {
    const rawId = data.client_id ? String(data.client_id).trim() : '';
    const cleanClientId = (rawId && rawId !== 'temp-client' && rawId !== 'null' && rawId !== 'undefined')
      ? rawId
      : null;

    const cleanTimeFrom = (data.time_from || '00:00').slice(0, 5);
    const cleanTimeTo = (data.time_to || '00:00').slice(0, 5);
    const finalTypeWorks = data.type_works || 'po satu';

    if (isSupabaseConfigured) {
      const { data: created, error } = await supabase
        .from('agenda')
        .insert([
          {
            client_id: cleanClientId,
            scheduled_date: data.scheduled_date,
            time_from: cleanTimeFrom,
            time_to: cleanTimeTo,
            task_description: data.task_description.trim(),
            status: 'scheduled',
            temp_client_name: data.temp_client_name?.trim() || null,
            type_works: finalTypeWorks,
          },
        ])
        .select('*, clients(*)')
        .single();

      if (error) {
        return { data: null, error: error.message };
      }
      return { data: mapAgendaClients(created as AgendaEvent), error: null };
    } else {
      const clients = getLocalClients();
      const matchedClient = cleanClientId ? (clients.find((c) => c.id === cleanClientId) || null) : null;

      const newEvent: AgendaEvent = {
        id: `agenda-${Date.now()}`,
        user_id: 'demo-user-123',
        client_id: cleanClientId,
        scheduled_date: data.scheduled_date,
        time_from: cleanTimeFrom,
        time_to: cleanTimeTo,
        task_description: data.task_description.trim(),
        temp_client_name: data.temp_client_name?.trim() || null,
        type_works: finalTypeWorks,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        clients: matchedClient,
      };

      const current = getLocalAgenda();
      const updated = [...current, newEvent];
      saveLocalAgenda(updated);
      return { data: mapAgendaClients(newEvent), error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri zakazivanju termina';
    return { data: null, error: message };
  }
}

/**
 * Mijenja status termina ('scheduled' | 'completed' | 'cancelled')
 */
export async function updateAgendaStatus(
  id: string,
  status: 'scheduled' | 'completed' | 'cancelled'
): Promise<{ success: boolean; error: string | null }> {
  try {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('agenda')
        .update({ status })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } else {
      const events = getLocalAgenda();
      const updated = events.map((e) => (e.id === id ? { ...e, status } : e));
      saveLocalAgenda(updated);
      return { success: true, error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri promjeni statusa';
    return { success: false, error: message };
  }
}

/**
 * Briše termin iz agende
 */
export async function deleteAgendaEvent(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('agenda').delete().eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } else {
      const events = getLocalAgenda().filter((e) => e.id !== id);
      saveLocalAgenda(events);
      return { success: true, error: null };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri brisanju termina';
    return { success: false, error: message };
  }
}

/**
 * Prebacuje zakazani termin iz `agenda` u `work_logs` sa automatskim obračunom zarade
 * i mijenja status u agendi na 'completed'
 */
export async function convertAgendaToWorkLog(agendaId: string): Promise<{
  success: boolean;
  workLog: WorkLog | null;
  error: string | null;
}> {
  try {
    // 1. Dohvati stavku agende
    let agendaItem: AgendaEvent | null = null;
    let client: Client | null = null;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('agenda')
        .select('*, clients(*)')
        .eq('id', agendaId)
        .single();

      if (error || !data) {
        return { success: false, workLog: null, error: error?.message || 'Termin nije pronađen' };
      }
      agendaItem = data as AgendaEvent;
      client = (data as any).clients as Client;
    } else {
      const events = getLocalAgenda();
      agendaItem = events.find((e) => e.id === agendaId) || null;
      if (!agendaItem) {
        return { success: false, workLog: null, error: 'Termin nije pronađen' };
      }
      const clients = getLocalClients();
      client = (agendaItem?.client_id ? clients.find((c) => c.id === agendaItem?.client_id) : null) || null;
    }

    if (!agendaItem) {
      return { success: false, workLog: null, error: 'Nije moguće učitati podatke termina' };
    }

    // 2. Parsiraj opis zakazanog termina ili direktno koristi kolone iz baze
    const parsed = parseAgendaDescription(agendaItem.task_description);
    const finalTempClientName = agendaItem.temp_client_name || parsed.tempClientName || (client?.name ?? null);
    const finalTypeWorks = agendaItem.type_works || parsed.typeWorks || 'po satu';
    const isTemp = Boolean(finalTempClientName || parsed.isTemporary || !agendaItem.client_id);

    const cleanTimeFrom = (agendaItem.time_from || '00:00').slice(0, 5);
    const cleanTimeTo = (agendaItem.time_to || '00:00').slice(0, 5);

    const totalMinutes = calculateMinutes(cleanTimeFrom, cleanTimeTo);
    
    let earnedAmount = 0;
    const rateType = finalTypeWorks === 'po satu' ? 'hourly' : finalTypeWorks === 'dnevno' ? 'daily' : 'service';

    if (isTemp) {
      const rate = parsed.tempRateAmount || (client ? Number(client.rate_amount) : 15);
      if (rateType === 'daily' || rateType === 'service') {
        earnedAmount = rate;
      } else {
        earnedAmount = Math.round(((totalMinutes / 60) * rate) * 100) / 100;
      }
    } else if (client) {
      const rate = Number(client.rate_amount);
      if (rateType === 'daily' || rateType === 'service') {
        earnedAmount = rate;
      } else {
        earnedAmount = Math.round(((totalMinutes / 60) * rate) * 100) / 100;
      }
    }

    const rawId = agendaItem.client_id ? String(agendaItem.client_id).trim() : '';
    const cleanClientId = (rawId && rawId !== 'temp-client' && rawId !== 'null' && rawId !== 'undefined')
      ? rawId
      : null;

    // 3. Dodaj u work_logs
    const logRes = await addWorkLog({
      client_id: cleanClientId,
      work_date: agendaItem.scheduled_date,
      time_from: cleanTimeFrom,
      time_to: cleanTimeTo,
      total_minutes: totalMinutes,
      earned_amount: earnedAmount,
      note: parsed.cleanDescription || agendaItem.task_description,
      temp_client_name: finalTempClientName,
      type_works: finalTypeWorks,
    });

    if (logRes.error || !logRes.data) {
      return { success: false, workLog: null, error: logRes.error || 'Nije uspjelo kreiranje radnog loga' };
    }

    // 4. Ažuriraj status u agendi na 'completed'
    await updateAgendaStatus(agendaId, 'completed');

    return { success: true, workLog: logRes.data, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Greška pri konverziji u radni log';
    return { success: false, workLog: null, error: message };
  }
}

// -------------------------------------------------------------
// FORMATIRANJE I POMOĆNE MATEMATIČKE FUNKCIJE
// -------------------------------------------------------------

/**
 * Izračunava ukupno minuta između dva vremena (HH:MM i HH:MM)
 */
export function calculateMinutes(timeFrom: string, timeTo: string): number {
  if (!timeFrom || !timeTo) return 0;
  const [h1, m1] = timeFrom.split(':').map(Number);
  const [h2, m2] = timeTo.split(':').map(Number);

  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;

  const startMin = h1 * 60 + m1;
  let endMin = h2 * 60 + m2;

  // Ukoliko je vrijeme završetka manje od početka, pretpostavlja se rad preko ponoći
  if (endMin < startMin) {
    endMin += 24 * 60;
  }

  return Math.max(0, endMin - startMin);
}

/**
 * Formatira minute u čitljiv tekst npr. "2h 30min"
 */
export function formatMinutesToHours(minutes: number): string {
  if (!minutes || minutes <= 0) return '0h 0min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Formatira iznos novca u EUR sa dvije decimale npr. "150,00 €"
 */
export function formatCurrency(amount: number): string {
  const safeAmount = Number(amount) || 0;
  return new Intl.NumberFormat('bs-BA', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

/**
 * Formatira datum (YYYY-MM-DD) u bosanski format npr. "15. Oktobar 2026" ili "15.10.2026"
 */
export function formatWorkDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return new Intl.DateTimeFormat('bs-BA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Ažurira lozinku trenutno prijavljenog korisnika
 */
export async function updateUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } else {
      // Demo mod
      const userRaw = localStorage.getItem('workora_demo_user') || localStorage.getItem('mojpwa_demo_user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        u.password = newPassword;
        localStorage.setItem('workora_demo_user', JSON.stringify(u));
      }
      return { success: true };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error occurred while changing the password.';
    return { success: false, error: msg };
  }
}

/**
 * Briše nalog korisnika uz provjeru lozinke i čisti sve povezane podatke
 */
export async function deleteUserAccount(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!password) {
      return { success: false, error: 'Please enter your password to confirm.' };
    }

    if (isSupabaseConfigured) {
      // 1. Re-autentifikacija za provjeru lozinke
      const { data: sessionData } = await supabase.auth.getSession();
      const currentEmail = sessionData?.session?.user?.email;
      const userId = sessionData?.session?.user?.id;

      if (!currentEmail || !userId) {
        return { success: false, error: 'Session not found.' };
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: password,
      });

      if (signInError) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      // 2. Brisanje podataka korisnika iz baze iz tri tabele (agenda_events, work_logs, clients)
      await supabase.from('agenda_events').delete().eq('user_id', userId);
      await supabase.from('work_logs').delete().eq('user_id', userId);
      await supabase.from('clients').delete().eq('user_id', userId);

      // 3. Pokušaj brisanja iz Supabase auth.users preko RPC ako je funkcija definisana
      try {
        await supabase.rpc('delete_user');
      } catch {
        try {
          await supabase.rpc('delete_current_user');
        } catch {
          // Nastavi sa odjavom
        }
      }

      await supabase.auth.signOut();
      return { success: true };
    } else {
      // Demo mod brisanje
      const userRaw = localStorage.getItem('orawork_demo_user') || 
                      localStorage.getItem('workora_demo_user') || 
                      localStorage.getItem('mojpwa_demo_user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u.password && u.password !== password) {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }
      }
      localStorage.removeItem('orawork_demo_user');
      localStorage.removeItem('workora_demo_user');
      localStorage.removeItem('mojpwa_demo_user');
      localStorage.removeItem('orawork_clients_data');
      localStorage.removeItem('workora_clients_data');
      localStorage.removeItem('mojpwa_clients_data');
      localStorage.removeItem('orawork_worklogs_data');
      localStorage.removeItem('workora_worklogs_data');
      localStorage.removeItem('mojpwa_worklogs_data');
      localStorage.removeItem('orawork_agenda_data');
      localStorage.removeItem('workora_agenda_data');
      localStorage.removeItem('mojpwa_agenda_data');
      return { success: true };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error occurred while deleting the account.';
    return { success: false, error: msg };
  }
}

export interface ParsedAgendaEvent {
  isTemporary: boolean;
  tempClientName?: string | null;
  typeWorks: string;
  tempRateAmount?: number;
  cleanDescription: string;
}

export function parseAgendaDescription(description: string): ParsedAgendaEvent {
  const result: ParsedAgendaEvent = {
    isTemporary: false,
    tempClientName: null,
    typeWorks: 'po satu',
    tempRateAmount: 0,
    cleanDescription: description || '',
  };

  if (!description) return result;

  let workingDesc = description;

  // Check for [Povremeni: Name]
  const povremeniRegex = /\[Povremeni:\s*([^\]]+)\]/;
  const povMatch = workingDesc.match(povremeniRegex);
  if (povMatch) {
    result.isTemporary = true;
    result.tempClientName = povMatch[1].trim();
    workingDesc = workingDesc.replace(povremeniRegex, '').trim();
  }

  // Check for [Tip: Type]
  const tipRegex = /\[Tip:\s*([^\]]+)\]/;
  const tipMatch = workingDesc.match(tipRegex);
  if (tipMatch) {
    result.typeWorks = tipMatch[1].trim();
    workingDesc = workingDesc.replace(tipRegex, '').trim();
  }

  // Check for [Cijena: Amount]
  const cijenaRegex = /\[Cijena:\s*([^\]]+)\]/;
  const cijenaMatch = workingDesc.match(cijenaRegex);
  if (cijenaMatch) {
    result.tempRateAmount = Number(cijenaMatch[1]) || 0;
    workingDesc = workingDesc.replace(cijenaRegex, '').trim();
  }

  result.cleanDescription = workingDesc;
  return result;
}

