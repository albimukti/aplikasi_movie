import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [activeView, setActiveView] = useState('catalog'); // 'catalog' | 'superadmin' | 'admin' | 'support'

  // Automatically navigate to the correct dashboard based on role upon login
  const navigateByRole = (userRole) => {
    if (userRole === 'SUPERADMIN') {
      setActiveView('superadmin');
    } else if (userRole === 'ADMIN') {
      setActiveView('admin');
    } else {
      setActiveView('catalog');
    }
  };

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api.getMe()
        .then((res) => {
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('moviehub_user', JSON.stringify(res.data));
            // Navigate directly based on saved role
            navigateByRole(res.data.role);
          }
        })
        .catch(() => {
          api.clearTokens();
          setUser(null);
          setActiveView('catalog');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password, captchaId = '', captchaCode = '') => {
    const res = await api.login({
      email: identifier,
      username: identifier,
      login: identifier,
      password,
      captcha_id: captchaId,
      captcha_code: captchaCode,
    });

    if (res.data?.access_token) {
      api.setTokens(res.data.access_token, res.data.refresh_token);
      setUser(res.data.user);
      localStorage.setItem('moviehub_user', JSON.stringify(res.data.user));
      // Directly redirect to role view upon authentic login
      navigateByRole(res.data.user.role);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.register({ name, email, password });
    if (res.data?.access_token) {
      api.setTokens(res.data.access_token, res.data.refresh_token);
      setUser(res.data.user);
      localStorage.setItem('moviehub_user', JSON.stringify(res.data.user));
      navigateByRole(res.data.user.role);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      api.clearTokens();
    } finally {
      setUser(null);
      setActiveView('catalog');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        activeView,
        setActiveView,
        navigateByRole,
        login,
        register,
        logout,
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
