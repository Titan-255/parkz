import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../api/client';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDriver: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  login: (data: { email: string; password: string }) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  quickDemoLogin: (role: UserRole) => Promise<User>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('parkz_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('parkz_token');
      if (savedToken) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.error('Failed to restore session:', err);
          localStorage.removeItem('parkz_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      localStorage.setItem('parkz_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name.split(' ')[0]}!`, 'success');
      return res.user;
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('parkz_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      showToast(`Account created! Welcome to ParkZ, ${res.user.name.split(' ')[0]}!`, 'success');
      return res.user;
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('parkz_token');
    setToken(null);
    setUser(null);
    showToast('You have been logged out', 'info');
  };

  const quickDemoLogin = async (role: UserRole) => {
    let email = '';
    let password = '';
    if (role === 'ADMIN') {
      email = 'admin@parkz.local';
      password = 'ParkZ@Admin123!';
    } else if (role === 'OWNER') {
      email = 'owner@parkz.local';
      password = 'ParkZ@Owner123!';
    } else {
      email = 'driver@parkz.local';
      password = 'ParkZ@Driver123!';
    }
    return login({ email, password });
  };

  const refreshUser = async () => {
    try {
      const updated = await api.getMe();
      setUser(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const isDriver = user?.role === 'DRIVER';
  const isOwner = user?.role === 'OWNER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isDriver,
        isOwner,
        isAdmin,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshUser,
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
