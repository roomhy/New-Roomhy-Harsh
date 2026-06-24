import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getAuthApiUrl = () =>
  import.meta.env?.VITE_API_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5001"
    : "https://roohmy-backend-xwa9.vercel.app");

const AUTH_STORAGE_KEYS = [
  "token", "staff_token", "user", "staff_user", "manager_user",
  "website_token", "website_user", "userData", "owner_user",
  "owner_session", "tenant_user", "accessToken"
];

const clearAllAuthKeys = () => {
  AUTH_STORAGE_KEYS.forEach((k) => {
    try { localStorage.removeItem(k); } catch (_) {}
    try { sessionStorage.removeItem(k); } catch (_) {}
  });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("website_token") ||
      localStorage.getItem("token");
    const rawUser =
      localStorage.getItem("website_user") ||
      localStorage.getItem("user") ||
      localStorage.getItem("userData");

    if (!token || !rawUser) {
      setLoading(false);
      return;
    }

    fetch(`${getAuthApiUrl()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.ok) return res.json();
        clearAllAuthKeys();
        setLoading(false);
        return null;
      })
      .then((data) => {
        if (!data) return;
        try {
          const backendUser = (data?.user && typeof data.user === "object") ? data.user : data;
          if (backendUser && typeof backendUser === "object" && backendUser.role) {
            setUser(backendUser);
          } else {
            setUser(JSON.parse(rawUser));
          }
        } catch {
          clearAllAuthKeys();
        }
        setLoading(false);
      })
      .catch(() => {
        try { setUser(JSON.parse(rawUser)); } catch { clearAllAuthKeys(); }
        setLoading(false);
      });
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    clearAllAuthKeys();
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
