import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, BedDouble, ClipboardList, CalendarCheck, MessageCircle, 
  User, Settings, CreditCard, MapPin, MessageSquare, ChevronDown, 
  UserCircle, LogOut, Home, X, Plus, Menu, Bell, Settings2, Search, 
  Lock, ChevronRight, Crown, Zap, Users, BookOpen, FileText, Smartphone, 
  Wallet, PieChart, Shield, Target, Navigation, Megaphone, Coffee, 
  Receipt, Sparkles, LinkIcon, UserPlus, AlertCircle, Calendar, HelpCircle, Building2,
  IndianRupee, Headset, Briefcase, Globe, BarChart3
} from "lucide-react";
import { SILVER_NAV, GOLD_NAV } from './navConfig';
import { fetchOwnerProperties } from "../../utils/propertyowner";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function PropertyOwnerMobileLayout({
  owner,
  title,
  children,
  mainClassName = "flex-1 overflow-y-auto p-4 pb-24",
  contentClassName = "",
  headerRight = null,
  notificationCount = 0,
  notifications = [],
  onLogout,
  disableSubmenuStrip = false
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
  // Navigation lists
  const CURRENT_NAV = GOLD_NAV;

  const activeParent = useMemo(() => {
    return CURRENT_NAV.find(item => 
      item.href === pathname || 
      (item.submenus && item.submenus.some(sub => sub.href === pathname || pathname.startsWith(sub.href + '/')))
    );
  }, [pathname, CURRENT_NAV]);

  // Drawer / Menu states
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // Property Switcher state
  const [properties, setProperties] = useState([]);
  const [activePropertyId, setActivePropertyId] = useState('all');

  useEffect(() => {
    const storedActive = localStorage.getItem('owner_active_property');
    if (storedActive) {
      setActivePropertyId(storedActive);
    }
  }, []);

  useEffect(() => {
    if (owner?.loginId) {
      fetchOwnerProperties(owner.loginId, true).then(props => {
        setProperties(props || []);
      }).catch(err => console.error("Failed to fetch properties in mobile switcher", err));
    }
  }, [owner?.loginId]);

  const handlePropertySwitch = (propId) => {
    localStorage.setItem('owner_active_property', propId);
    setActivePropertyId(propId);
    setSwitcherOpen(false);
    window.location.reload();
  };

  // Notification caching / fetching
  const [globalNotifications, setGlobalNotifications] = useState([]);
  const _NOTIF_TTL = 30_000;

  useEffect(() => {
    if (owner?.loginId) {
      const fetchNotifs = async () => {
        try {
          const { fetchJson } = await import("../../utils/api");
          const res = await fetchJson(`/api/notifications?toLoginId=${encodeURIComponent(owner.loginId)}`);
          if (Array.isArray(res)) {
            const formatted = res.map(n => {
              const meta = typeof n.meta === 'string' ? JSON.parse(n.meta) : (n.meta || {});
              return {
                ...n,
                title: meta.title || n.title || "Notification",
                message: meta.message || n.message || "",
                type: n.type || "system",
                meta: meta
              };
            });
            setGlobalNotifications(formatted);
          }
        } catch (e) {
          console.error("Failed to fetch mobile notifications", e);
        }
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, _NOTIF_TTL);
      return () => clearInterval(interval);
    }
  }, [owner?.loginId]);

  const displayNotifications = globalNotifications.length > 0 ? globalNotifications : notifications;
  const displayNotificationCount = globalNotifications.length > 0 
    ? globalNotifications.filter(n => !n.read).length 
    : notificationCount;

  const displayName = useMemo(() => owner?.name || owner?.ownerName || "Owner", [owner]);
  const ownerInitial = useMemo(() => String(displayName).charAt(0).toUpperCase() || "O", [displayName]);
  const activePropertyName = useMemo(() => {
    if (activePropertyId === 'all') return "All Properties";
    return properties.find(p => String(p._id || p.id) === activePropertyId)?.title || "Active Property";
  }, [activePropertyId, properties]);

  const handleLogout = () => {
    if (typeof onLogout === "function") {
      onLogout();
      return;
    }
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch (_) {}
    window.location.href = "/propertyowner/ownerlogin";
  };

  // Helper to determine active tab
  const isTabActive = (paths) => {
    return paths.some(path => pathname === path || pathname.startsWith(`${path}/`));
  };

  // Quick Action handler
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  // Close drawers on route change
  useEffect(() => {
    setMoreDrawerOpen(false);
    setNotifDrawerOpen(false);
    setProfileDrawerOpen(false);
    setSwitcherOpen(false);
    setQuickActionsOpen(false);
  }, [pathname]);

  return (
    <div className="flex flex-col h-screen w-full bg-white font-['Plus_Jakarta_Sans'] overflow-hidden text-slate-800">
      
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
              Roomhy<span className="text-blue-600">.com</span>
            </span>
          </div>

          {/* Quick Header Icon Shortcuts for Mobile (Middle Space) */}
          <div className="flex items-center gap-1.5 mx-2 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
            <Link 
              to="/propertyowner/ownerchat" 
              title="Chat" 
              className={cn("p-1.5 rounded-lg text-slate-500 hover:text-blue-600 transition-colors", pathname.startsWith("/propertyowner/ownerchat") && "text-blue-600 bg-white shadow-sm")}
            >
              <MessageSquare size={15} className="stroke-[2.5]" />
            </Link>
            <Link 
              to="/propertyowner/payment" 
              title="Payments" 
              className={cn("p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors", pathname.startsWith("/propertyowner/payment") && "text-emerald-600 bg-white shadow-sm")}
            >
              <IndianRupee size={15} className="stroke-[2.5]" />
            </Link>
            <Link 
              to="/propertyowner/complaints" 
              title="Complaints" 
              className={cn("p-1.5 rounded-lg text-slate-500 hover:text-rose-600 transition-colors", pathname.startsWith("/propertyowner/complaints") && "text-rose-600 bg-white shadow-sm")}
            >
              <Headset size={15} className="stroke-[2.5]" />
            </Link>
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
              {displayNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 bg-[#E11D48] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white shadow-sm">
                  {displayNotificationCount}
                </span>
              )}
            </button>

            {/* Profile Avatar */}
            <button 
              onClick={() => setProfileDrawerOpen(true)}
              className="w-7.5 h-7.5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center border border-white/20 shadow-sm shrink-0"
            >
              {ownerInitial}
            </button>
          </div>
        </div>

        {/* Context Switcher / Active Property Bar */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-lg text-slate-700 transition-all text-[11px] font-semibold max-w-[170px]"
          >
            <Building2 size={12} className="text-blue-600 shrink-0" />
            <span className="truncate">{activePropertyName}</span>
            <ChevronDown size={11} className={cn("text-slate-500 transition-transform shrink-0", switcherOpen && "rotate-180")} />
          </button>

          {/* Mini Stats Indicator */}
          <div className="text-[9px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Active</span>
          </div>
        </div>

        {/* Horizontal Submenus Strip */}
        {!disableSubmenuStrip && activeParent && activeParent.submenus && activeParent.submenus.length > 0 && (
          <>
            <style dangerouslySetInnerHTML={{__html: `
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}} />
            <div className="mt-2 pt-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 pb-1 whitespace-nowrap">
                {activeParent.submenus.map((sub, index) => {
                  const isActive = pathname === sub.href || pathname.startsWith(sub.href + '/');
                  return (
                    <Link
                      key={index}
                      to={sub.href}
                      className={cn(
                        "text-[10px] px-2.5 py-1 rounded-full font-bold transition-all inline-block",
                        isActive 
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20" 
                          : "bg-slate-100 text-slate-650 hover:text-slate-800 hover:bg-slate-200"
                      )}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </header>

      {/* 2. BODY CONTENT */}
      <main className={cn("flex-1 overflow-y-auto bg-white custom-scrollbar", mainClassName)}>
        {title && (
          <div className="px-2.5 pt-4 pb-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
          </div>
        )}
        <div className={cn("w-full px-2.5 py-2", contentClassName)}>
          {children}
        </div>
      </main>

      {/* 3. PREMIUM BOTTOM NAVBAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 px-2 py-1 flex items-center justify-around text-slate-500 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)] shrink-0">
        
        {/* Tab 1: Dashboard */}
        <Link 
          to="/propertyowner/admin"
          className={cn(
            "flex flex-col items-center justify-center w-14 py-1.5 transition-all rounded-xl",
            isTabActive(["/propertyowner/admin"]) 
              ? "text-blue-600 scale-105 font-bold" 
              : "hover:text-slate-800"
          )}
        >
          <Home size={18} />
          <span className="text-[9px] mt-1 font-bold">Home</span>
        </Link>

        {/* Tab 2: Properties */}
        <Link 
          to="/propertyowner/properties"
          className={cn(
            "flex flex-col items-center justify-center w-14 py-1.5 transition-all rounded-xl",
            isTabActive(["/propertyowner/properties", "/propertyowner/rooms", "/propertyowner/add-property", "/propertyowner/amenities", "/propertyowner/location"]) 
              ? "text-blue-600 scale-105 font-bold" 
              : "hover:text-slate-800"
          )}
        >
          <Building2 size={18} />
          <span className="text-[9px] mt-1 font-bold">Properties</span>
        </Link>

        {/* Tab 3: Chat */}
        <Link 
          to="/propertyowner/ownerchat"
          className={cn(
            "flex flex-col items-center justify-center w-14 py-1.5 transition-all rounded-xl",
            isTabActive(["/propertyowner/ownerchat", "/propertyowner/announcements", "/propertyowner/whatsapp"]) 
              ? "text-blue-600 scale-105 font-bold" 
              : "hover:text-slate-800"
          )}
        >
          <MessageSquare size={18} />
          <span className="text-[9px] mt-1 font-bold">Chat</span>
        </Link>

        {/* Tab 4: Tenants */}
        <Link 
          to="/propertyowner/tenants"
          className={cn(
            "flex flex-col items-center justify-center w-14 py-1.5 transition-all rounded-xl",
            isTabActive(["/propertyowner/tenants", "/propertyowner/tenantrec", "/propertyowner/active-tenants", "/propertyowner/upcoming-moveins", "/propertyowner/moveout-requests", "/propertyowner/ex-tenants", "/propertyowner/tenant-docs", "/propertyowner/police-verification", "/propertyowner/review"]) 
              ? "text-blue-600 scale-105 font-bold" 
              : "hover:text-slate-800"
          )}
        >
          <Users size={18} />
          <span className="text-[9px] mt-1 font-bold">Tenants</span>
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

      {/* ======================================================== */}
      {/* 4. MODALS & SLIDE-UP DRAWER OVERLAYS (GLASSMORPHISM)      */}
      {/* ======================================================== */}

      {/* BACKDROP SHIELD */}
      {(moreDrawerOpen || notifDrawerOpen || profileDrawerOpen || switcherOpen || quickActionsOpen) && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-45 transition-opacity duration-300"
          onClick={() => {
            setMoreDrawerOpen(false);
            setNotifDrawerOpen(false);
            setProfileDrawerOpen(false);
            setSwitcherOpen(false);
            setQuickActionsOpen(false);
          }}
        />
      )}

      {/* QUICK ACTIONS OVERLAY */}
      <div className={cn(
        "fixed right-4 top-16 bg-[#1E293B] border border-white/10 rounded-2xl p-2.5 w-52 shadow-2xl z-50 transition-all duration-300 origin-top-right transform",
        quickActionsOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 -translate-y-2 pointer-events-none"
      )}>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1.5 border-b border-white/5 mb-1">Add Quick</h4>
        <div className="space-y-1">
          <Link to="/propertyowner/tenantrec" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors">
            <UserPlus size={14} className="text-blue-400" /> Add Tenant
          </Link>
          <Link to="/propertyowner/payment" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors">
            <Wallet size={14} className="text-emerald-400" /> Collect Rent
          </Link>
          <Link to="/propertyowner/complaints" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors">
            <AlertCircle size={14} className="text-rose-400" /> Add Complaint
          </Link>
          <Link to="/propertyowner/expense-tracking" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors">
            <Receipt size={14} className="text-amber-400" /> Add Expense
          </Link>
          <Link to="/propertyowner/add-property" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/5 transition-colors">
            <Building2 size={14} className="text-indigo-400" /> Add Property
          </Link>
        </div>
      </div>

      {/* PROPERTY SWITCHER DRAWER (BOTTOM SHEET) */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-white/10 rounded-t-[2rem] shadow-2xl z-50 p-6 transition-all duration-500 ease-out transform max-h-[70vh] flex flex-col",
        switcherOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-4 cursor-pointer" onClick={() => setSwitcherOpen(false)} />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Switch Property</h3>
          <button onClick={() => setSwitcherOpen(false)} className="text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {/* All Properties overview */}
          <button
            onClick={() => handlePropertySwitch('all')}
            className={cn(
              "w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all border text-left",
              activePropertyId === 'all' 
                ? "bg-blue-600/10 border-blue-500/30 text-blue-400" 
                : "border-white/5 hover:bg-white/5 text-slate-300"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                <LayoutDashboard size={14} />
              </div>
              <span>All Properties (Overview)</span>
            </div>
            {activePropertyId === 'all' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
          </button>

          {/* Properties loop */}
          {properties.map(p => {
            const pId = String(p._id || p.id);
            const isActive = activePropertyId === pId;
            return (
              <button
                key={pId}
                onClick={() => handlePropertySwitch(pId)}
                className={cn(
                  "w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all border text-left",
                  isActive 
                    ? "bg-blue-600/10 border-blue-500/30 text-blue-400" 
                    : "border-white/5 hover:bg-white/5 text-slate-300"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <Building2 size={14} className={isActive ? "text-blue-400" : "text-slate-400"} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-white">{p.title || p.name || "Property"}</span>
                    <span className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{p.city || p.area || "No Location"}</span>
                  </div>
                </div>
                {isActive && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* NOTIFICATIONS SLIDE-UP DRAWER */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-white/10 rounded-t-[2rem] shadow-2xl z-50 p-6 transition-all duration-500 ease-out transform max-h-[80vh] flex flex-col",
        notifDrawerOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-4 cursor-pointer" onClick={() => setNotifDrawerOpen(false)} />
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-blue-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Alerts & Logs</h3>
          </div>
          <div className="flex gap-4">
            {displayNotifications.length > 0 && (
              <button 
                onClick={async () => {
                  setGlobalNotifications([]);
                  if (owner?.loginId) {
                    try {
                      const { fetchJson } = await import("../../utils/api");
                      await fetchJson(`/api/notifications/mark-all-read`, { 
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ toLoginId: owner.loginId })
                      });
                    } catch (e) {
                      console.error("Failed to clear notifications", e);
                    }
                  }
                }}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
              >
                Mark Read
              </button>
            )}
            <button onClick={() => setNotifDrawerOpen(false)} className="text-slate-450 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5">
          {displayNotifications.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Bell className="w-10 h-10 mx-auto opacity-20 mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest">No notifications yet</p>
            </div>
          ) : (
            displayNotifications.map((n, i) => (
              <div key={i} className="p-3.5 bg-white/5 border border-white/5 rounded-2xl">
                <p className="text-[11px] font-black text-white leading-tight mb-1">{n.title}</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PROFILE & LOGOUT SLIDE-UP DRAWER */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-white/10 rounded-t-[2rem] shadow-2xl z-50 p-6 transition-all duration-500 ease-out transform",
        profileDrawerOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-4 cursor-pointer" onClick={() => setProfileDrawerOpen(false)} />
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Account Control</h3>
          <button onClick={() => setProfileDrawerOpen(false)} className="text-slate-450 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-600 border border-white/15 flex items-center justify-center font-black text-lg text-white">
            {ownerInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-white truncate leading-none mb-1">{displayName}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider italic leading-none">{owner?.loginId}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Link 
            to="/propertyowner/ownerprofile"
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-center text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <UserCircle size={15} className="text-blue-400" />
            <span>Profile Settings</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-rose-600/20"
          >
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* MORE SERVICES SLIDE-UP DRAWER (THE SYSTEM PORTAL) */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-white/10 rounded-t-[2.5rem] shadow-2xl z-50 p-6 pb-8 transition-all duration-500 ease-out transform max-h-[85vh] flex flex-col",
        moreDrawerOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-4 cursor-pointer" onClick={() => setMoreDrawerOpen(false)} />
        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400 fill-yellow-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Extended Panel</h3>
          </div>
          <button onClick={() => setMoreDrawerOpen(false)} className="text-slate-450 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* SERVICES GRID */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-3 gap-3 mb-6">
          <GridItem to="/propertyowner/payment" icon={IndianRupee} label="Payments" active={pathname.startsWith("/propertyowner/payment")} />
          <GridItem to="/propertyowner/booking" icon={Calendar} label="Leads & Bookings" active={pathname.startsWith("/propertyowner/booking") || pathname.startsWith("/propertyowner/enquiry")} />
          <GridItem to="/propertyowner/collection-report" icon={Wallet} label="Accounting" active={pathname.startsWith("/propertyowner/collection-report")} />
          <GridItem to="/propertyowner/complaints" icon={Headset} label="Complaints" active={pathname.startsWith("/propertyowner/complaints")} />
          <GridItem to="/propertyowner/all-staff" icon={Briefcase} label="Staff Mgmt" active={pathname.startsWith("/propertyowner/all-staff")} />
          <GridItem to="/propertyowner/tenant-attendance" icon={ClipboardList} label="Attendance" active={pathname.startsWith("/propertyowner/tenant-attendance")} />
          <GridItem to="/propertyowner/vacancy-promotion" icon={Globe} label="Marketing" active={pathname.startsWith("/propertyowner/vacancy-promotion")} />
          <GridItem to="/propertyowner/reports" icon={BarChart3} label="Reports" active={pathname.startsWith("/propertyowner/reports")} />
          <GridItem to="/propertyowner/agreement" icon={FileText} label="Documents" active={pathname.startsWith("/propertyowner/agreement")} />
          <GridItem to="/propertyowner/settings" icon={Settings} label="Settings" active={pathname.startsWith("/propertyowner/settings") && window.location.hash !== "#backup"} />
          <GridItem to="/propertyowner/settings#backup" icon={Database} label="Data Backup" active={pathname.startsWith("/propertyowner/settings") && window.location.hash === "#backup"} />
          
          <button 
            onClick={() => {
              setMoreDrawerOpen(false);
              setSwitcherOpen(true);
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 transition-all text-slate-350 col-span-3 sm:col-span-1"
          >
            <Building2 size={20} className="text-blue-400 mb-1.5" />
            <span className="text-[10px] font-bold tracking-tight text-center leading-tight">Switch Property</span>
          </button>
        </div>

        {/* FOOTER */}
        <div className="border-t border-white/5 pt-4 shrink-0 flex items-center justify-between">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Roomhy Owner Pro v2.0</p>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-500 hover:text-rose-400"
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
        "flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-slate-300",
        active 
          ? "bg-blue-600/10 border-blue-500/30 text-blue-400" 
          : "border-white/5 bg-white/5 hover:bg-white/10"
      )}
    >
      <Icon size={20} className={cn("mb-1.5", active ? "text-blue-400" : "text-slate-400")} />
      <span className="text-[10px] font-bold tracking-tight text-center leading-tight">{label}</span>
    </Link>
  );
}
