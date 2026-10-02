import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | UserProfile | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  isWelcomeModalOpen: boolean;
  setIsWelcomeModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_DEMO_USER_KEY = 'workora_demo_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);
  const isDemoMode = !isSupabaseConfigured;

  useEffect(() => {
    if (isSupabaseConfigured) {
      // 1. Live Supabase sesija
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // 2. Demo mod (pamti se u localStorage radi besprijekornog testiranja)
      try {
        const savedDemo = localStorage.getItem(LOCAL_STORAGE_DEMO_USER_KEY);
        if (savedDemo) {
          const parsed = JSON.parse(savedDemo);
          setUser(parsed);
        }
      } catch (e) {
        console.warn('Greška pri učitavanju demo korisnika iz memorije', e);
      }
      setLoading(false);
    }
  }, [isDemoMode]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          return { success: false, error: mapSupabaseError(error.message) };
        }
        return { success: true };
      } else {
        // Simulacija prijave u demo načinu
        const demoUser: UserProfile = {
          id: 'demo-user-123',
          email: email.trim(),
          fullName: email.split('@')[0].toUpperCase(),
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
          createdAt: new Date().toISOString(),
        };
        setUser(demoUser);
        localStorage.setItem(LOCAL_STORAGE_DEMO_USER_KEY, JSON.stringify(demoUser));
        return { success: true };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Došlo je do neočekivane greške.';
      return { success: false, error: message };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });
        if (error) {
          return { success: false, error: mapSupabaseError(error.message) };
        }
        return { success: true };
      } else {
        // Simulacija registracije
        const newUser: UserProfile = {
          id: `user-${Date.now()}`,
          email: email.trim(),
          fullName: fullName.trim(),
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
          createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        localStorage.setItem(LOCAL_STORAGE_DEMO_USER_KEY, JSON.stringify(newUser));
        setIsWelcomeModalOpen(true);
        return { success: true };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Došlo je do neočekivane greške pri registraciji.';
      return { success: false, error: message };
    }
  };

  const signOut = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(LOCAL_STORAGE_DEMO_USER_KEY);
    }
    setUser(null);
    setSession(null);
    setIsWelcomeModalOpen(false);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/`,
        });
        if (error) {
          return { success: false, error: mapSupabaseError(error.message) };
        }
        return { success: true };
      } else {
        // Simulirani uspjeh
        return { success: true };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Došlo je do greške prilikom slanja linka za reset.';
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        resetPassword,
        isWelcomeModalOpen,
        setIsWelcomeModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth se mora koristiti unutar AuthProvider komponente');
  }
  return context;
};

// Pomoćna funkcija za prevod Supabase poruka na čisti Bosanski jezik
function mapSupabaseError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Pogrešna email adresa ili lozinka. Molimo provjerite podatke i pokušajte ponovo.';
  }
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'Korisnik sa ovom email adresom već postoji u bazi.';
  }
  if (lower.includes('password should be at least')) {
    return 'Lozinka mora sadržavati najmanje 6 znakova.';
  }
  if (lower.includes('rate limit')) {
    return 'Previše zahtjeva u kratkom periodu. Molimo sačekajte minutu.';
  }
  return msg;
}
