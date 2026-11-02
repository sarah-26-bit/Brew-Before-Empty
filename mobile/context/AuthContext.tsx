import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, fullName: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  enterGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_USER_KEY = 'BREW_AUTH_USER';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoredUser() {
      try {
        const stored = await storage.getItem(AUTH_USER_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          // Pre-populate with default sample user Deva
          const defaultUser: User = {
            id: '188673d7-8725-4b73-9b97-53343c798b20',
            email: 'kunjatadevu2008@gmail.com',
            fullName: 'Deva',
            role: 'Grand Magister Cynthia (Lead Alchemist)',
          };
          setUser(defaultUser);
          await storage.setItem(AUTH_USER_KEY, JSON.stringify(defaultUser));
        }
      } catch (err) {
        console.warn('Failed to restore session:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStoredUser();
  }, []);

  const login = async (email: string, _pass: string) => {
    setLoading(true);
    try {
      const loggedUser: User = {
        id: email === 'kunjatadevu2008@gmail.com' ? '188673d7-8725-4b73-9b97-53343c798b20' : `usr-${Date.now()}`,
        email,
        fullName: email === 'kunjatadevu2008@gmail.com' ? 'Deva' : email.split('@')[0],
        role: email === 'kunjatadevu2008@gmail.com' ? 'Grand Magister Cynthia (Lead Alchemist)' : 'Master Alchemist',
      };
      setUser(loggedUser);
      await storage.setItem(AUTH_USER_KEY, JSON.stringify(loggedUser));
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, _pass: string, fullName: string, role = 'Apprentice Alchemist') => {
    setLoading(true);
    try {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        email,
        fullName: fullName || email.split('@')[0],
        role,
      };
      setUser(newUser);
      await storage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    await storage.deleteItem(AUTH_USER_KEY);
  };

  const enterGuestMode = () => {
    setUser({
      id: 'guest-alchemist',
      email: 'guest@brewbeforeempty.sanctum',
      fullName: 'Guest Alchemist',
      role: 'Visiting Scholar',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isGuest: user?.id === 'guest-alchemist',
        loading,
        login,
        register,
        logout,
        enterGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
