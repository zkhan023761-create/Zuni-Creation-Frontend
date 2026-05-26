'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore parse errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  function login(accessToken, refreshToken, userProfile) {
    localStorage.setItem('userToken',        accessToken);
    localStorage.setItem('userRefreshToken', refreshToken);
    localStorage.setItem('userProfile',      JSON.stringify(userProfile));
    setUser(userProfile);
  }

  function updateUser(updatedProfile) {
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setUser(updatedProfile);
  }

  function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRefreshToken');
    localStorage.removeItem('userProfile');
    setUser(null);
    router.push('/');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
