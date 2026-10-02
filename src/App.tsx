import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { ResetPasswordModal } from './components/auth/ResetPasswordModal';
import { WelcomeModal } from './components/auth/WelcomeModal';
import { Loader2 } from 'lucide-react';

// Zaštićena komponenta rute za `/dashboard`
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  onRequireLogin: () => void; 
}> = ({ children, onRequireLogin }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-medium text-slate-500">Provjera korisničke sesije...</p>
      </div>
    );
  }

  if (!user) {
    // Ako korisnik nije prijavljen, aktiviramo Login modal i vraćamo na početnu
    onRequireLogin();
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const { isWelcomeModalOpen, setIsWelcomeModalOpen } = useAuth();

  const handleOpenLogin = () => {
    setIsRegisterOpen(false);
    setIsResetPasswordOpen(false);
    setIsLoginOpen(true);
  };

  const handleOpenRegister = () => {
    setIsLoginOpen(false);
    setIsResetPasswordOpen(false);
    setIsRegisterOpen(true);
  };

  const handleOpenResetPassword = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    setIsResetPasswordOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Zaglavlje (Header) sa podrškom za mobilne i desktop ekrane */}
      <Header
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
      />

      {/* Glavni sadržaj aplikacije */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                onOpenLogin={handleOpenLogin}
                onOpenRegister={handleOpenRegister}
              />
            }
          />
          <Route
            path="/login"
            element={
              <LandingPage
                onOpenLogin={handleOpenLogin}
                onOpenRegister={handleOpenRegister}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute onRequireLogin={handleOpenLogin}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute onRequireLogin={handleOpenLogin}>
                <DashboardPage initialTab="settings" />
              </ProtectedRoute>
            }
          />
          {/* Fallback ruta */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Podnožje (Footer) - Mobile Dock + Desktop Footer */}
      <Footer
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
      />

      {/* Autentifikacijski Modali */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={handleOpenRegister}
        onOpenResetPassword={handleOpenResetPassword}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOpenLogin={handleOpenLogin}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        onOpenLogin={handleOpenLogin}
      />

      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
