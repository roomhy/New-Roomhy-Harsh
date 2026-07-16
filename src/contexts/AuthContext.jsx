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
    : "https://api.roomhy.com");

const AUTH_STORAGE_KEYS = [
  "token", "staff_token", "user", "staff_user", "manager_user",
  "website_token", "website_user", "userData", "owner_user",
  "owner_session", "tenant_user", "accessToken"
];

export const clearAllAuthKeys = () => {
  AUTH_STORAGE_KEYS.forEach((k) => {
    try { localStorage.removeItem(k); } catch (_) {}
    try { sessionStorage.removeItem(k); } catch (_) {}
  });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdminRoute = typeof window !== 'undefined' && 
      (window.location.pathname.startsWith("/superadmin") || window.location.pathname.startsWith("/employee"));

    const token = isAdminRoute
      ? (localStorage.getItem("staff_token") || sessionStorage.getItem("staff_token") || localStorage.getItem("token") || sessionStorage.getItem("token"))
      : (localStorage.getItem("website_token") || sessionStorage.getItem("website_token") || localStorage.getItem("token") || sessionStorage.getItem("token"));

    const rawUser = isAdminRoute
      ? (localStorage.getItem("staff_user") || sessionStorage.getItem("staff_user") || localStorage.getItem("user") || sessionStorage.getItem("user") || localStorage.getItem("userData"))
      : (localStorage.getItem("website_user") || sessionStorage.getItem("website_user") || localStorage.getItem("user") || sessionStorage.getItem("user") || localStorage.getItem("userData"));

    if (!token || !rawUser) {
      setLoading(false);
      return;
    }

    fetch(`${getAuthApiUrl()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.ok) return res.json();
        if (res.status === 401 || res.status === 403) {
          clearAllAuthKeys();
        }
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
            // Backend returned 200 but no recognisable user shape — treat as auth failure.
            clearAllAuthKeys();
          }
        } catch {
          clearAllAuthKeys();
        }
        setLoading(false);
      })
      .catch(() => {
        // Network failure, timeout, or server connectivity issue — keep cached local credentials.
        setLoading(false);
      });
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    const role = String(userData?.role || '').toLowerCase();
    const isAdmin = role === 'superadmin' || role === 'admin' || role === 'areamanager' || role === 'employee';

    if (isAdmin) {
      localStorage.setItem('staff_token', token);
      localStorage.setItem('staff_user', JSON.stringify(userData));
      sessionStorage.setItem('staff_token', token);
      sessionStorage.setItem('staff_user', JSON.stringify(userData));
    } else {
      localStorage.setItem('website_token', token);
      localStorage.setItem('website_user', JSON.stringify(userData));
      sessionStorage.setItem('website_token', token);
      sessionStorage.setItem('website_user', JSON.stringify(userData));
    }

    // Fallbacks for general/legacy components
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userData', JSON.stringify(userData));
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
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
