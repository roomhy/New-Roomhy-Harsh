import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, Home, AlertCircle, ClipboardList, 
  UserPlus, CalendarCheck, Zap, X, Plus, Menu, Bell, 
  ChevronRight, LogOut, MessageSquare, ShieldCheck, Clock
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function getStaffSession() {
  try {
    const raw = sessionStorage.getItem("staff_session") || localStorage.getItem("staff_session");
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

export default function StaffMobileLayout({
  staff: propsStaff = null,
  title,
  children,
  mainClassName = "flex-1 overflow-y-auto p-4 pb-24",
  contentClassName = "",
  onLogout,
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const staff = propsStaff || getStaffSession();

  // Drawer / Menu states
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  const displayName = useMemo(() => staff?.name || "Staff Member", [staff]);
  const staffInitial = useMemo(() => String(displayName).charAt(0).toUpperCase() || "S", [displayName]);

  const handleLogout = () => {
    if (typeof onLogout === "function") {
      onLogout();
      return;
    }
    try {
      sessionStorage.removeItem("staff_session");
      localStorage.removeItem("staff_session");
      sessionStorage.removeItem("employee_session");
      localStorage.removeItem("employee_session");
    } catch (_) {}
    window.location.href = "/staff/login";
  };

  // Helper to determine active tab
  const isTabActive = (paths) => {
    return paths.some(path => pathname === path || pathname.startsWith(`${path}/`));
  };

  // Close drawers on route change
  useEffect(() => {
    setMoreDrawerOpen(false);
    setNotifDrawerOpen(false);
    setProfileDrawerOpen(false);
    setQuickActionsOpen(false);
  }, [pathname]);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-50 font-sans relative overflow-hidden">
      
      {/* 1. PREMIUM HEADER */}
      <header className="sticky top-0 z-40 bg-white text-slate-800 px-4 py-3 flex flex-col justify-between shadow-sm shrink-0 border-b border-slate-100">
        <div className="flex items-center justify-between w-full">
          {/* Menu & Brand Logo & Name */}
          <div className="flex items-center gap-2">
            {/* Hamburger Menu trigger */}
            <button 
              onClick={() => setMoreDrawerOpen(true)}
              className="p-1 text-slate-700 hover:text-slate-900 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} className="stroke-[2.5]" />
            </button>
            <span className="text-lg font-black tracking-tight text-slate-900 font-sans flex items-center shrink-0">
              Roomhy<span className="text-blue-600"> Staff</span>
            </span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button 
              onClick={() => setNotifDrawerOpen(true)}
              className="relative p-1.5 text-slate-700 transition-all"
              aria-label="Notifications"
            >
              <Bell size={21} className="stroke-[2]" />
            </button>

            {/* Profile Avatar */}
            <button 
              onClick={() => setProfileDrawerOpen(true)}
              className="w-9 h-9 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center border-2 border-white/30 shadow-md shrink-0 hover:scale-105 transition-transform"
            >
              {staffInitial}
            </button>
          </div>
        </div>

        {/* Assigned Property Indicator */}
        {staff?.assignedPropertyName && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <div className="flex items-center gap-1">
              <Home size={12} className="text-blue-600" />
              <span>{staff.assignedPropertyName}</span>
            </div>
            <div className="text-[9px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>On Duty</span>
            </div>
          </div>
        )}
      </header>

      {/* 2. BODY CONTENT */}
      <main className={cn("flex-1 overflow-y-auto bg-slate-50 custom-scrollbar", mainClassName)}>
        {title && (
          <div className="px-4 pt-5 pb-2 text-center">
            <h2 className="text-[24px] font-black text-slate-900 tracking-tight font-sans">{title}</h2>
            <div className="w-10 h-1 bg-blue-600 rounded-full mx-auto mt-2 opacity-80" />
          </div>
        )}
        <div className={cn("w-full px-2.5 py-2 mobile-page-container", contentClassName)}>
          {children}
        </div>
      </main>

      {/* 3. PREMIUM BOTTOM NAVBAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 px-2 py-1 flex items-center justify-around text-slate-500 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)] shrink-0">
        
        {/* Tab 1: Dashboard */}
        <Link 
          to="/staff"
          className={cn(
            "flex flex-col items-center justify-center w-14 py-1.5 transition-all rounded-xl",
            pathname === "/staff" 
              ? "text-blue-600 scale-105 font-bold" 
              : "hover:text-slate-800"
          )}
        >
          <Home size={18} />
          <span className="text-[9px] mt-1 font-bold">Home</span>
        </Link>

        {/* Tab 2: Tenants */}
        <Link 
          to="/staff/tenants"
          className={cn(
            "flex flex-col items-center justify-center w-14 py-1.5 transition-all rounded-xl",
            isTabActive(["/staff/tenants"]) 
              ? "text-blue-600 scale-105 font-bold" 
              : "hover:text-slate-800"
          )}
        >
          <Users size={18} />
          <span className="text-[9px] mt-1 font-bold">Tenants</span>
        </Link>

        {/* Tab 3: Rooms */}
        <Link 
          to="/staff/rooms"
          className={cn(
            "flex flex-col items-center justify-center w-14 py-1.5 transition-all rounded-xl",
            isTabActive(["/staff/rooms"]) 
              ? "text-blue-600 scale-105 font-bold" 
              : "hover:text-slate-800"
          )}
        >
          <LayoutDashboard size={18} />
          <span className="text-[9px] mt-1 font-bold">Rooms</span>
        </Link>

        {/* Tab 4: Complaints */}
        <Link 
          to="/staff/complaints"
          className={cn(
            "flex flex-col items-center justify-center w-14 py-1.5 transition-all rounded-xl",
            isTabActive(["/staff/complaints"]) 
              ? "text-blue-600 scale-105 font-bold" 
              : "hover:text-slate-800"
          )}
        >
          <AlertCircle size={18} />
          <span className="text-[9px] mt-1 font-bold">Complaints</span>
        </Link>

        {/* Tab 5: More Trigger */}
        <button 
          onClick={() => setMoreDrawerOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center w-14 py-1.5 transition-all rounded-xl",
            moreDrawerOpen 
              ? "text-blue-600 scale-105 font-bold" 
              : "hover:text-slate-800"
          )}
        >
          <Menu size={18} />
          <span className="text-[9px] mt-1 font-bold">More</span>
        </button>
      </nav>

      {/* 4. GLOBAL FLOATING ACTION BUTTON (FAB) */}
      <button 
        onClick={() => setQuickActionsOpen(true)}
        className="fixed bottom-[80px] right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center z-30 hover:scale-105 active:scale-95 transition-all"
        aria-label="Add Action"
      >
        <Plus size={28} className="stroke-[2.5]" />
      </button>

      {/* 5. MODALS & SLIDE-UP DRAWER OVERLAYS */}

      {/* BACKDROP SHIELD */}
      {(moreDrawerOpen || notifDrawerOpen || profileDrawerOpen || quickActionsOpen) && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-45 transition-opacity duration-300"
          onClick={() => {
            setMoreDrawerOpen(false);
            setNotifDrawerOpen(false);
            setProfileDrawerOpen(false);
            setQuickActionsOpen(false);
          }}
        />
      )}

      {/* GLOBAL FAB ACTION MENU (BOTTOM SHEET) */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 p-6 transition-transform duration-300 ease-out transform",
        quickActionsOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 cursor-pointer" onClick={() => setQuickActionsOpen(false)} />
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-5 text-center">Quick Operational Log</h3>
        
        <div className="space-y-3">
          <Link to="/staff/visitors" onClick={() => setQuickActionsOpen(false)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <UserPlus size={24} className="text-indigo-600" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-[15px] font-black text-indigo-900 leading-tight">Log Visitor</h4>
              <p className="text-[11px] font-semibold text-indigo-600/70 mt-0.5">Register a new guest entry</p>
            </div>
            <ChevronRight size={20} className="text-indigo-300" />
          </Link>

          <Link to="/staff/electricity" onClick={() => setQuickActionsOpen(false)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Zap size={24} className="text-amber-600" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-[15px] font-black text-amber-900 leading-tight">Meter Reading</h4>
              <p className="text-[11px] font-semibold text-amber-600/70 mt-0.5">Record electricity units for a room</p>
            </div>
            <ChevronRight size={20} className="text-amber-300" />
          </Link>

          <Link to="/staff/complaints" onClick={() => setQuickActionsOpen(false)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
              <AlertCircle size={24} className="text-rose-600" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-[15px] font-black text-rose-900 leading-tight">Report Incident</h4>
              <p className="text-[11px] font-semibold text-rose-600/70 mt-0.5">Log a complaint or maintenance issue</p>
            </div>
            <ChevronRight size={20} className="text-rose-300" />
          </Link>
        </div>
        <button onClick={() => setQuickActionsOpen(false)} className="w-full mt-6 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors">
          Cancel
        </button>
      </div>

      {/* NOTIFICATIONS DRAWER */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 rounded-t-[2rem] shadow-2xl z-50 p-6 transition-all duration-500 ease-out transform max-h-[80vh] flex flex-col",
        notifDrawerOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 cursor-pointer" onClick={() => setNotifDrawerOpen(false)} />
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-blue-500" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Alerts & Logs</h3>
          </div>
          <button onClick={() => setNotifDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5">
          <div className="py-16 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto opacity-30 mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">No notifications yet</p>
          </div>
        </div>
      </div>

      {/* PROFILE & LOGOUT SLIDE-UP DRAWER */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 rounded-t-[2rem] shadow-2xl z-50 p-6 transition-all duration-500 ease-out transform",
        profileDrawerOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 cursor-pointer" onClick={() => setProfileDrawerOpen(false)} />
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Staff Account</h3>
          <button onClick={() => setProfileDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center font-black text-lg text-white">
            {staffInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-900 truncate leading-none mb-1">{displayName}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider italic leading-none">{staff?.loginId}</p>
          </div>
        </div>

        <div className="space-y-2">
          <button 
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-rose-200"
          >
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* MORE SERVICES SLIDE-UP DRAWER */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-200 rounded-t-[2.5rem] shadow-2xl z-50 p-6 pb-8 transition-all duration-500 ease-out transform max-h-[85vh] flex flex-col",
        moreDrawerOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 cursor-pointer" onClick={() => setMoreDrawerOpen(false)} />
        <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-blue-500 fill-blue-200" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Extended Panel</h3>
          </div>
          <button onClick={() => setMoreDrawerOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
            <X size={18} />
          </button>
        </div>

        {/* GROUPED SERVICES */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4 space-y-4">
          <div>
            <div className="grid grid-cols-3 gap-3">
              <GridItem to="/staff" icon={LayoutDashboard} label="Dashboard" active={pathname === "/staff"} />
              <GridItem to="/staff/tenants" icon={Users} label="Tenants" active={pathname === "/staff/tenants"} />
              <GridItem to="/staff/rooms" icon={Home} label="Rooms" active={pathname === "/staff/rooms"} />
              <GridItem to="/staff/complaints" icon={AlertCircle} label="Complaints" active={pathname === "/staff/complaints"} />
              <GridItem to="/staff/tasks" icon={ClipboardList} label="Daily Tasks" active={pathname === "/staff/tasks"} />
              <GridItem to="/staff/visitors" icon={UserPlus} label="Visitors" active={pathname === "/staff/visitors"} />
              <GridItem to="/staff/attendance" icon={CalendarCheck} label="Attendance" active={pathname === "/staff/attendance"} />
              <GridItem to="/staff/electricity" icon={Zap} label="Electricity" active={pathname === "/staff/electricity"} />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-200 pt-4 shrink-0 flex items-center justify-between">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Roomhy Staff Pro v2.0</p>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-500 hover:text-rose-600"
          >
            <LogOut size={12} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact grid item helper for the "More" bottom sheet
function GridItem({ to, icon: Icon, label, active }) {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all",
        active 
          ? "bg-blue-50 border-blue-200 text-blue-600" 
          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
      )}
    >
      <Icon size={20} className={cn("mb-1.5", active ? "text-blue-500" : "text-slate-500")} />
      <span className="text-[10px] font-bold tracking-tight text-center leading-tight">{label}</span>
    </Link>
  );
}
