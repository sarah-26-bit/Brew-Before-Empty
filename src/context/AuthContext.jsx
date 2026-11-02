import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, authService, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [devGuestMode, setDevGuestMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      try {
        const currentSession = await authService.getSession();
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            const userProfile = await authService.getProfile(currentSession.user.id);
            setProfile(userProfile || {
              full_name: currentSession.user.user_metadata?.full_name || 'Deva',
              role: currentSession.user.user_metadata?.role || 'Grand Magister Cynthia',
            });
          }
        }
      } catch (err) {
        console.warn('Initial session check error:', err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase Auth state changes
    const { data: authListener } = authService.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        try {
          const userProfile = await authService.getProfile(newSession.user.id);
          setProfile(userProfile || {
            full_name: newSession.user.user_metadata?.full_name || 'Deva',
            role: newSession.user.user_metadata?.role || 'Grand Magister Cynthia',
          });
        } catch (err) {
          console.warn('Failed to load profile on auth change:', err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.signIn({ email, password });
      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        const prof = await authService.getProfile(data.user.id);
        setProfile(prof);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, password, fullName, role }) => {
    setLoading(true);
    try {
      const data = await authService.signUp({ email, password, fullName, role });
      setUser(data.user);
      setSession(data.session);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setDevGuestMode(false);
    } finally {
      setLoading(false);
    }
  };

  const enterGuestMode = () => {
    setDevGuestMode(true);
  };

  const isAuthenticated = Boolean(user || devGuestMode);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        isAuthenticated,
        devGuestMode,
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

