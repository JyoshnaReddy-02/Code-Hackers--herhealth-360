import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { DoctorNavbar } from './components/common/DoctorNavbar';
import { AdminNavbar } from './components/common/AdminNavbar';
import { Footer } from './components/common/Footer';
import { EmergencyModal } from './components/common/EmergencyModal';
import { AuthModal } from './components/common/AuthModal';

import { HomePage } from './pages/HomePage';
import { LibraryPage } from './pages/LibraryPage';
import { SymptomTrackerPage } from './pages/SymptomTrackerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NavigatorPage } from './pages/NavigatorPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { MotherCarePage } from './pages/MotherCarePage';
import { PassportPage } from './pages/PassportPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { DoctorLoginPage } from './pages/DoctorLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserLoginPage } from './pages/UserLoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

function AppLayout() {
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const location = useLocation();
  const { role } = useAuth();

  const isDoctorPortal = location.pathname.startsWith('/doctor');
  const isAdminPortal = location.pathname.startsWith('/admin');

  // Strict Portal Separation:
  // 1. If a clinician is signed in, they are isolated to the Clinician Workspace.
  if (role === 'doctor' && !isDoctorPortal) {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  // 2. If an administrator is signed in, they are isolated to the Admin Console.
  if (role === 'admin' && !isAdminPortal) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2D2A32] font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Dedicated Portal Headers */}
      {isDoctorPortal ? (
        <DoctorNavbar />
      ) : isAdminPortal ? (
        <AdminNavbar />
      ) : (
        <Navbar onOpenEmergency={() => setEmergencyModalOpen(true)} />
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/register" element={<UserLoginPage />} />
          <Route path="/user/login" element={<UserLoginPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/tracker" element={<SymptomTrackerPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/navigator" element={<NavigatorPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctor/login" element={<DoctorLoginPage />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/mothercare" element={<MotherCarePage />} />
          <Route path="/wellness" element={<Navigate to="/navigator" replace />} />
          <Route path="/exercises" element={<Navigate to="/navigator" replace />} />
          <Route path="/passport" element={<PassportPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Dedicated Portal Footers */}
      {isDoctorPortal ? (
        <footer className="bg-[#1C171A] text-[#9B8F97] py-4 border-t border-[#382D35] text-xs text-center px-4">
          <p>
            HerHealth 360 Clinician Workspace &bull; Confidential Healthcare Demonstration &bull; Isolated Storage Architecture
          </p>
        </footer>
      ) : isAdminPortal ? (
        <footer className="bg-[#151214] text-[#8A8187] py-4 border-t border-[#2C242A] text-xs text-center px-4">
          <p>
            HerHealth 360 Administrator Console &bull; Aggregated Metrics & Visual Intelligence &bull; Internal Platform
          </p>
        </footer>
      ) : (
        <Footer />
      )}

      {/* Global Modals for public user experience */}
      {!isDoctorPortal && !isAdminPortal && (
        <>
          <EmergencyModal
            isOpen={emergencyModalOpen}
            onClose={() => setEmergencyModalOpen(false)}
          />
          <AuthModal />
        </>
      )}
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
