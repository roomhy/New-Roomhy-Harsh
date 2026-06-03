import React, { useState } from "react";
import { 
  LayoutDashboard, Users, Home, AlertCircle, 
  ClipboardList, Bell, Search, LogOut, 
  ChevronDown, ChevronRight, Menu, UserCheck,
  CalendarCheck, UserPlus, Eye, Zap, Settings
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function StaffLayout({ children, title, subtitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/staff" },
    { label: "Tenants", icon: Users, path: "/staff/tenants" },
    { label: "Room Inventory", icon: Home, path: "/staff/rooms" },
    { label: "Complaints", icon: AlertCircle, path: "/staff/complaints" },
    { label: "Daily Tasks", icon: ClipboardList, path: "/staff/tasks" },
    { label: "Visitors Log", icon: UserPlus, path: "/staff/visitors" },
    { label: "Attendance", icon: CalendarCheck, path: "/staff/attendance" },
  ];

  return (
    <div className="flex min-h-screen bg-white font-['Plus_Jakarta_Sans'] overflow-hidden">
      {/* Premium Dark Sidebar */}
      <aside className={cn(
        "bg-[#0F172A] border-r border-white/5 text-slate-400 flex flex-col z-50 shrink-0 transition-all duration-500 ease-in-out fixed lg:relative h-screen",
        sidebarOpen ? "w-80" : "w-0 lg:w-24 -translate-x-full lg:translate-x-0"
      )}>
        {/* Logo/Brand Area */}
        <div className="p-8 flex items-center gap-4 shrink-0 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20 group cursor-pointer hover:scale-105 transition-transform italic">
            <Zap size={20} />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-xl font-black text-white leading-none tracking-tight italic">Roomhy <span className="text-blue-600">Staff</span></p>
              <p className="text-[10px] text-slate-500 font-black mt-1 uppercase tracking-[0.2em] italic">Operations Pro</p>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-6 space-y-1 mt-4 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} className={cn("transition-all duration-300", isActive ? "text-white scale-110" : "text-slate-500 group-hover:text-slate-300 group-hover:scale-110")} />
                {sidebarOpen && <span className={cn("font-bold text-xs truncate transition-all uppercase tracking-[0.1em] italic", isActive ? "translate-x-1 text-white" : "group-hover:translate-x-1")}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Profile Card Bottom */}
        <div className="p-6 mt-auto shrink-0 overflow-hidden">
          <div className="bg-white/5 rounded-[2rem] p-4 border border-white/5 relative group cursor-pointer hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm italic">
                JS
              </div>
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black text-white truncate italic leading-none mb-1.5">Operations Staff</p>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-black truncate uppercase tracking-widest italic leading-none">staff@roomhy.com</p>
                    <p className="text-[9px] text-slate-500 font-black truncate uppercase tracking-widest italic leading-none opacity-60">Member Since: Jan 2026</p>
                  </div>
                </div>
              )}
              {sidebarOpen && <LogOut size={14} className="text-slate-500 hover:text-rose-500 transition-colors" />}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Transparent Modern Header - More Compact */}
        <header className="h-16 bg-white/50 backdrop-blur-xl border-b border-slate-50 flex items-center justify-between px-8 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all active:scale-90 border border-slate-100 group">
              <Menu size={16} className="text-slate-900 group-hover:rotate-90 transition-transform" />
            </button>
            <div className="relative hidden xl:block group ml-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500/20 transition-all w-64 shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <HeaderIcon icon={Bell} badge />
             <HeaderIcon icon={Settings} />
             <div className="w-10 h-10 rounded-xl bg-blue-50 p-0.5 border border-blue-100 shadow-sm cursor-pointer hover:scale-105 transition-transform active:scale-95 ml-2">
                <div className="w-full h-full rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm italic">
                   JS
                </div>
             </div>
          </div>
        </header>

        {/* Content with Custom Scrollbar - Compact Padding */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white selection:bg-blue-100 selection:text-blue-900">
          <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700 slide-in-from-bottom-2">
            {/* Page Title & Subtitle Section */}
            {title && (
              <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic mb-2">{title}</h1>
                {subtitle && <p className="text-sm font-bold text-slate-400 italic uppercase tracking-wider">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function HeaderIcon({ icon: Icon, badge }) {
  return (
    <button className="p-3 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-100 rounded-2xl transition-all relative group active:scale-90">
      <Icon size={20} />
      {badge && (
        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform shadow-lg shadow-rose-500/20 animate-pulse"></span>
      )}
    </button>
  );
}
