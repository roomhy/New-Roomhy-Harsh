import React, { useState, useEffect } from "react";
import StaffMobileLayout from "./StaffMobileLayout";
import {
  LayoutDashboard, Users, Home, AlertCircle,
  ClipboardList, LogOut, ChevronRight,
  CalendarCheck, UserPlus, Zap
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function getStaffSession() {
  try {
    const raw = sessionStorage.getItem("staff_session") || localStorage.getItem("staff_session");
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function clearStaffSession() {
  sessionStorage.removeItem("staff_session");
  localStorage.removeItem("staff_session");
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
}

export default function StaffLayout({ children, title, subtitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const session = getStaffSession();
    if (!session?.loginId) {
      window.location.href = "/staff/login";
      return;
    }
    setStaff(session);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    clearStaffSession();
    window.location.href = "/staff/login";
  };

  if (!staff) return null; // wait for session check

  if (isMobile) {
    return (
      <StaffMobileLayout
        staff={staff}
        title={title === "Dashboard" ? "" : title}
        onLogout={handleLogout}
      >
        {children}
      </StaffMobileLayout>
    );
  }

  const initials = (staff.name || "S").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/staff" },
    { label: "Tenants", icon: Users, path: "/staff/tenants" },
    { label: "Room Inventory", icon: Home, path: "/staff/rooms" },
    { label: "Complaints", icon: AlertCircle, path: "/staff/complaints" },
    { label: "Daily Tasks", icon: ClipboardList, path: "/staff/tasks" },
    { label: "Visitors Log", icon: UserPlus, path: "/staff/visitors" },
    { label: "Attendance", icon: CalendarCheck, path: "/staff/attendance" },
    { label: "Electricity", icon: Zap, path: "/staff/electricity" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white font-['Plus_Jakarta_Sans']">
      {/* Fixed Dark Sidebar */}
      <aside className="w-64 bg-[#0F172A] border-r border-white/5 text-slate-400 flex flex-col shrink-0 h-screen">
        {/* Logo/Brand Area */}
        <div className="px-6 py-7 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <Zap size={18} fill="currentColor" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-white leading-none tracking-tight">Roomhy <span className="text-blue-500">Staff</span></p>
            <p className="text-[9px] text-slate-500 font-bold mt-1.5 uppercase tracking-[0.15em]">Operations Pro</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1 mt-2 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm",
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20"
                    : "text-slate-400 font-medium hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={17} className={isActive ? "text-white" : "text-slate-500"} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Card + Logout Bottom */}
        <div className="px-4 pb-6 pt-2 mt-auto shrink-0 space-y-1">
          <div className="bg-white/5 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white truncate leading-tight">{staff.name || "Staff Member"}</p>
              <p className="text-[11px] text-slate-400 font-medium truncate leading-tight mt-0.5">{staff.role || "Staff"}</p>
              <p className="text-[11px] text-slate-500 font-medium truncate leading-tight">STAFF ID: {staff.loginId}</p>
            </div>
            <ChevronRight size={15} className="text-slate-500 shrink-0" />
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
            <LogOut size={16} className="text-slate-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Header - title left, avatar right, nothing else */}
        <header className="border-b border-slate-100 px-8 py-5 flex items-start justify-between shrink-0">
          <div>
            {title && <h1 className="text-[22px] font-bold text-slate-900 leading-tight">{title}</h1>}
            {subtitle && <p className="text-sm text-slate-400 font-medium mt-0.5">{subtitle}</p>}
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer" onClick={handleLogout} title="Logout">
            {initials}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-white selection:bg-blue-100 selection:text-blue-900 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
