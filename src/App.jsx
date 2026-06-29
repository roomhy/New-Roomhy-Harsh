import React, { Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import routes from "./routes";
import { getOwnerSession } from "./utils/ownerSession";
import SharedShell from "./components/SharedShell";
import { OwnerPanelShell } from "./components/propertyowner/OwnerPanelErrorBoundary";
import { Toaster } from "react-hot-toast";
import InstallPWA from "./components/InstallPWA";

const PageLoader = () => (
  <div className="min-h-[40vh] flex items-center justify-center px-4 py-12 text-sm text-slate-500">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      <p className="font-bold tracking-widest uppercase text-[10px]">Loading Roomhy...</p>
    </div>
  </div>
);

const resolveHostHome = () => {
  if (typeof window === "undefined") return "/coming-soon";
  const host = (window.location.hostname || "").toLowerCase();

  const readStoredUser = () => {
    const keys = ["user", "staff_user", "manager_user"];
    for (const key of keys) {
      try {
        const sessionValue = sessionStorage.getItem(key);
        if (sessionValue) return JSON.parse(sessionValue);
      } catch (_) {
        // ignore bad storage values
      }
      try {
        const localValue = localStorage.getItem(key);
        if (localValue) return JSON.parse(localValue);
      } catch (_) {
        // ignore bad storage values
      }
    }
    return null;
  };

  const staffUser = readStoredUser();
  const role = String(staffUser?.role || "").toLowerCase();
  const owner = getOwnerSession();
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1") || !host.includes(".");

  if (host === "admin.roomhy.com" || host === "www.admin.roomhy.com") {
    if (role === "superadmin" || role === "admin") return "/superadmin/superadmin";
    if (role === "manager") {
      const hasManagerSession =
        !!sessionStorage.getItem("managerToken") ||
        !!localStorage.getItem("managerToken") ||
        !!localStorage.getItem("managerData");
      if (hasManagerSession) return "/propertyowner/admin";
    }
    if (role === "areamanager" || role === "employee") return "/employee/areaadmin";
    return "/superadmin/index";
  }
  if (host === "app.roomhy.com" || host === "www.app.roomhy.com") {
    if (owner?.loginId) return "/propertyowner/admin";
    return "/propertyowner/index";
  }

  if (isLocalhost) {
    if (role === "superadmin" || role === "admin") return "/superadmin/superadmin";
    if (role === "manager") {
      const hasManagerSession =
        !!sessionStorage.getItem("managerToken") ||
        !!localStorage.getItem("managerToken") ||
        !!localStorage.getItem("managerData");
      if (hasManagerSession) return "/propertyowner/admin";
    }
    if (role === "areamanager" || role === "employee") return "/employee/areaadmin";
    if (owner?.loginId) return "/propertyowner/admin";
    return "/coming-soon";
  }

  return "/coming-soon";
};

const HtmlRedirectOrHome = () => {
  const location = useLocation();
  const path = location.pathname || "";
  if (path.endsWith(".html")) {
    const clean = path.replace(/\.html$/i, "");
    return <Navigate to={clean || "/"} replace />;
  }
  return <Navigate to={resolveHostHome()} replace />;
};

const ManagerRouteGuard = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getActiveRole = () => {
      const keys = ["user", "staff_user", "manager_user", "managerData"];
      for (const key of keys) {
        try {
          const val = sessionStorage.getItem(key) || localStorage.getItem(key);
          if (val) {
            const parsed = JSON.parse(val);
            if (parsed && parsed.role) return String(parsed.role).toLowerCase();
          }
        } catch (_) {}
      }
      return "";
    };

    const activeRole = getActiveRole();
    if (activeRole !== "manager") return;

    const currentPath = location.pathname || "";
    const blockedPrefixes = ["/superadmin/", "/staff"];
    const isBlockedRoute = blockedPrefixes.some((prefix) => currentPath.startsWith(prefix)) &&
      !["/superadmin", "/superadmin/", "/superadmin/index"].includes(currentPath);

    if (isBlockedRoute) {
      window.location.replace("/propertyowner/admin");
    }
  }, [location.pathname]);

  return null;
};

const RouteRoleGuard = () => {
  const location = useLocation();
  const { user: authUser, loading } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (loading) return;

    const path = location.pathname || '';

    // Only guard admin/employee routes
    const isAdminRoute = path.startsWith('/superadmin/') && path !== '/superadmin/index';
    const isEmployeeRoute = path.startsWith('/employee/');
    if (!isAdminRoute && !isEmployeeRoute) return;

    // Use backend-confirmed role from AuthContext — never trust localStorage role directly
    const role = String(authUser?.role || '').toLowerCase();

    // Owner session must not access admin panels unless they are logged in as superadmin/admin
    const owner = getOwnerSession();
    if (owner?.loginId && role !== 'superadmin' && role !== 'admin') {
      window.location.replace('/propertyowner/admin');
      return;
    }

    if (isAdminRoute && role !== 'superadmin' && role !== 'admin') {
      window.location.replace('/superadmin/index');
      return;
    }

    if (isEmployeeRoute && role !== 'areamanager' && role !== 'employee') {
      window.location.replace('/superadmin/index');
    }
  }, [location.pathname, authUser, loading]);

  return null;
};

const DomainGuard = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const host = (window.location.hostname || "").toLowerCase();
    
    // Allow all paths on localhost/127.0.0.1 for local development ease
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1") || !host.includes(".");
    if (isLocalhost) return;

    const path = location.pathname || "";

    // 1. Admin / Superadmin Domain
    const isAdminDomain = host === "admin.roomhy.com" || host === "www.admin.roomhy.com";
    if (isAdminDomain) {
      if (path === "/") {
        window.location.replace(resolveHostHome());
        return;
      }
      const isAllowed = path.startsWith("/superadmin") || path.startsWith("/employee") || path.startsWith("/staff") || path.startsWith("/digital-checkin");
      if (!isAllowed) {
        window.location.replace("/superadmin/index");
      }
      return;
    }

    // 2. Property Owner / Tenant App Domain
    const isAppDomain = host === "app.roomhy.com" || host === "www.app.roomhy.com";
    if (isAppDomain) {
      if (path === "/") {
        window.location.replace(resolveHostHome());
        return;
      }
      const isAllowed = path.startsWith("/propertyowner") || path.startsWith("/tenant") || path.startsWith("/digital-checkin") || path.startsWith("/manager") || path.startsWith("/staff");
      if (!isAllowed) {
        window.location.replace("/propertyowner/index");
      }
      return;
    }

    // 3. Fallback for main website domain (roomhy.com) and others
    // Show only coming-soon page on root URL or paths not matching allowed website routes
    const allowedWebsiteRoutes = [
      "/website",
      "/coming-soon"
    ];

    if (!allowedWebsiteRoutes.some(route => path.startsWith(route))) {
      if (path === "/" || path === "") {
        window.location.replace("/coming-soon");
      }
    }
  }, [location.pathname]);

  return null;
};

const RouteChromeCleanup = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname || "";
    if (!path.startsWith("/tenant/")) return;

    const cleanup = () => {
      document.querySelectorAll(".shared-shell").forEach((shell) => {
        shell.querySelectorAll(".shared-sidebar, .shared-header").forEach((node) => node.remove());

        const content = shell.querySelector(".shared-content");
        if (content) {
          content.style.padding = "0";
          content.style.minHeight = "100vh";
        }

        shell.setAttribute("data-tenant-cleanup", "1");
        shell.style.display = "block";
        shell.style.background = "transparent";
        shell.style.minHeight = "auto";
      });
    };

    cleanup();
    const timer = window.setTimeout(cleanup, 50);
    const observer = new MutationObserver(() => cleanup());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  return null;
};

export default function App() {
  // Categorize routes for nested layout
  const shellRoutes = routes.filter(r => {
    const isSuperadmin = r.path.startsWith("/superadmin/") && r.path !== "/superadmin/index";
    const isEmployee = r.path.startsWith("/employee/") && r.path !== "/employee/index";
    // Employees and Superadmins use the same shared shell layout
    return isSuperadmin || isEmployee;
  });

  const standaloneRoutes = routes.filter(r => !shellRoutes.find(sr => sr.path === r.path));
  const ownerRoutes = standaloneRoutes.filter(r => r.path.startsWith("/propertyowner/"));
  const otherStandaloneRoutes = standaloneRoutes.filter(r => !r.path.startsWith("/propertyowner/"));

  return (
    <AuthProvider>
      <TranslationProvider>
        <ThemeProvider>
          <Router>
            <Toaster position="top-right" reverseOrder={false} />
            <DomainGuard />
            <InstallPWA />
            <ManagerRouteGuard />
            <RouteRoleGuard />
            <RouteChromeCleanup />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Routes wrapped in SharedShell Layout */}
                <Route element={<SharedShell />}>
                  {shellRoutes.map(route => (
                    <Route key={route.path} path={route.path} element={route.element} />
                  ))}
                </Route>

                {/* Owner Panel routes — wrapped in ErrorBoundary */}
                <Route element={<OwnerPanelShell />}>
                  {ownerRoutes.map(route => (
                    <Route key={route.path} path={route.path} element={route.element} />
                  ))}
                </Route>

                {/* Other standalone routes (tenant, website, staff, etc.) */}
                {otherStandaloneRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}

                <Route path="/" element={<Navigate to={resolveHostHome()} replace />} />
                <Route path="/superadmin" element={<Navigate to="/superadmin/index" replace />} />
                <Route path="/employee" element={<Navigate to="/employee/areaadmin" replace />} />
                <Route path="/employee/superadmin" element={<Navigate to="/employee/areaadmin" replace />} />
                <Route path="/propertyowner" element={<Navigate to="/propertyowner/index" replace />} />
                <Route path="/website" element={<Navigate to="/website/index" replace />} />
                <Route path="*" element={<HtmlRedirectOrHome />} />
              </Routes>
            </Suspense>
          </Router>
        </ThemeProvider>
      </TranslationProvider>
    </AuthProvider>
  );
}
