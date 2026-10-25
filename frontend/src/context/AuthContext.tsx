import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Doctor } from '../types';
import { api } from '../services/api';

export interface AdminUser {
  email: string;
  display_name: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  doctor: Doctor | null;
  admin: AdminUser | null;
  role: 'user' | 'doctor' | 'admin' | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  doctorLogin: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; display_name: string; date_of_birth?: string; life_stage?: string }) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'reset';
  openAuthModal: (mode?: 'login' | 'register' | 'reset') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<'user' | 'doctor' | 'admin' | null>(() => {
    return (localStorage.getItem('herhealth_role') as 'user' | 'doctor' | 'admin') || null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'reset'>('login');

  const refreshUser = async () => {
    if (!api.getToken()) {
      setUser(null);
      setDoctor(null);
      setAdmin(null);
      setRole(null);
      setLoading(false);
      return;
    }

    const currentRole = localStorage.getItem('herhealth_role');

    if (currentRole === 'admin') {
      setAdmin({
        email: 'admin@herhealth360.internal',
        display_name: 'System Administrator',
        name: 'System Administrator',
        role: 'Super Admin',
      });
      setRole('admin');
      setUser(null);
      setDoctor(null);
      setLoading(false);
    } else if (currentRole === 'doctor') {
      try {
        const res = await api.getDoctorMe();
        setDoctor(res.doctor);
        setUser(null);
        setAdmin(null);
        setRole('doctor');
      } catch {
        api.setToken(null);
        localStorage.removeItem('herhealth_role');
        setDoctor(null);
        setUser(null);
        setAdmin(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const res = await api.getMe();
        setUser(res.user);
        setDoctor(null);
        setAdmin(null);
        setRole('user');
      } catch {
        api.setToken(null);
        localStorage.removeItem('herhealth_role');
        setUser(null);
        setDoctor(null);
        setAdmin(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email: email.trim().toLowerCase(), password: password.trim() });
    localStorage.setItem('herhealth_role', 'user');
    setUser(res.user);
    setDoctor(null);
    setAdmin(null);
    setRole('user');
    setIsAuthModalOpen(false);
  };

  const doctorLogin = async (email: string, password: string) => {
    const res = await api.doctorLogin({ email: email.trim().toLowerCase(), password: password.trim() });
    localStorage.setItem('herhealth_role', 'doctor');
    setDoctor(res.doctor);
    setUser(null);
    setAdmin(null);
    setRole('doctor');
  };

  const adminLogin = async (email: string, password: string) => {
    const res = await api.adminLogin({ email: email.trim().toLowerCase(), password: password.trim() });
    localStorage.setItem('herhealth_role', 'admin');
    setAdmin({ ...res.admin, name: res.admin.display_name });
    setUser(null);
    setDoctor(null);
    setRole('admin');
  };

  const register = async (payload: { email: string; password: string; display_name: string; date_of_birth?: string; life_stage?: string }) => {
    const res = await api.register({
      ...payload,
      email: payload.email.trim().toLowerCase(),
      password: payload.password.trim(),
      display_name: payload.display_name.trim(),
    });
    localStorage.setItem('herhealth_role', 'user');
    setUser(res.user);
    setDoctor(null);
    setAdmin(null);
    setRole('user');
    setIsAuthModalOpen(false);
  };

  const resetPassword = async (email: string, newPassword: string) => {
    const res = await api.resetPassword({
      email: email.trim().toLowerCase(),
      new_password: newPassword.trim(),
    });
    localStorage.setItem('herhealth_role', 'user');
    setUser(res.user);
    setDoctor(null);
    setAdmin(null);
    setRole('user');
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      if (role === 'user') {
        await api.logout();
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      api.setToken(null);
      localStorage.removeItem('herhealth_role');
      setUser(null);
      setDoctor(null);
      setAdmin(null);
      setRole(null);
    }
  };

  const openAuthModal = (mode: 'login' | 'register' | 'reset' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        doctor,
        admin,
        role,
        loading,
        login,
        doctorLogin,
        adminLogin,
        register,
        resetPassword,
        logout,
        refreshUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
