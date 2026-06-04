import React, { useEffect, useMemo, useState } from "react";
import { fetchJson } from "../../utils/api";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { useHtmlPage } from "../../utils/htmlPage";
import {
  Users,
  BedDouble,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Wallet,
  AlertTriangle,
  Send,
  Plus,
  Sparkles,
  TrendingUp,
  MessageSquareWarning,
  CalendarClock,
  Calendar,
  Building2,
  MessageCircle,
  ChevronRight,
  Clock,
  AlertCircle
} from "lucide-react";
import { StatCard } from "../../components/propertyowner/StatCard";
import { Pill } from "../../components/propertyowner/Pill";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";
import {
  clearOwnerRuntimeSession,
  fetchOwnerTenants,
  formatDate,
  getOwnerRuntimeSession,
  filterByActiveProperty
} from "../../utils/propertyowner";

export default function Admin() {
  useHtmlPage({
    title: "Roomhy - Owner Dashboard",
    bodyClass: "text-slate-800",
    htmlAttrs: { lang: "en" },
    metas: [
      { charset: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" }
    ],
    links: [
      { href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap", rel: "stylesheet" },
      { rel: "stylesheet", href: "/propertyowner/assets/css/admin.css" }
    ],
    scripts: [{ src: "https://cdn.tailwindcss.com" }, { src: "https://unpkg.com/lucide@latest" }],
    inlineScripts: []
  });

  const [owner, setOwner] = useState(null);
  const [roomsCount, setRoomsCount] = useState(0);
  const [totalBedsCapacity, setTotalBedsCapacity] = useState(0);
  const [tenantsCount, setTenantsCount] = useState(0);
  const [rentTotal, setRentTotal] = useState(0);
  const [enquiries, setEnquiries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [mobileChartTab, setMobileChartTab] = useState("revenue");

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good Morning";
    if (hrs < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const notificationCount = useMemo(
    () => {
      const pendingEnquiries = enquiries.filter((item) => ["pending", "hold"].includes(String(item.status || "").toLowerCase())).length;
      const unreadNotifs = notifications.filter(n => !n.read).length;
      return pendingEnquiries + unreadNotifs;
    },
    [enquiries, notifications]
  );

  useEffect(() => {
    if (window?.lucide?.createIcons) window.lucide.createIcons();
  }, [owner, enquiries, loading]);

  const loadDashboard = async (loginId) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [ownerRes, roomsRes, tenantsRes, rentRes, enquiryRes, notificationRes, chatRes] = await Promise.all([
        fetchJson(`/api/owners/${encodeURIComponent(loginId)}`).catch(() => null),
        fetchJson(`/api/owners/${encodeURIComponent(loginId)}/rooms`),
        fetchOwnerTenants(loginId),
        fetchJson(`/api/owners/${encodeURIComponent(loginId)}/rent`),
        fetchJson(`/api/owners/${encodeURIComponent(loginId)}/enquiries`),
        fetchJson(`/api/notifications?toLoginId=${encodeURIComponent(loginId)}`),
        fetchJson(`/api/chat/inbox/${encodeURIComponent(loginId)}?search=`).catch(() => null)
      ]);
      setOwner((prev) => ({ ...prev, ...(ownerRes || {}) }));
      
      const filteredRooms = filterByActiveProperty(roomsRes?.rooms || [], false);
      const allEnquiries = filterByActiveProperty(Array.isArray(enquiryRes) ? enquiryRes : enquiryRes?.enquiries || [], false);
      const filteredTenants = Array.isArray(tenantsRes) ? tenantsRes : tenantsRes?.tenants || []; // already filtered by fetchOwnerTenants
      
      setRoomsCount(filteredRooms.length);
      setTotalBedsCapacity(filteredRooms.reduce((s, r) => s + (r.beds || 1), 0));
      setTenantsCount(filteredTenants.length);
      setPropertiesCount(roomsRes?.properties?.length || 0);
      setRecentChats(chatRes?.conversations || []);
      
      const computedRent = allEnquiries
          .filter(e => String(e.status).toLowerCase() === 'accepted' || String(e.status).toLowerCase() === 'approved' || String(e.status).toLowerCase() === 'active')
          .reduce((sum, e) => sum + (Number(e.paidAmount) || Number(e.agreedRent) || 0), 0);
      
      // If manager, use computed rent from their assigned properties. Otherwise use backend total
      const session = getOwnerRuntimeSession();
      setRentTotal(session?.role === 'manager' ? computedRent : (rentRes?.totalRent || 0));
      
      setEnquiries(allEnquiries);
      setNotifications(Array.isArray(notificationRes) ? notificationRes : []);
    } catch (err) {
      setErrorMsg(err?.body || err?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = getOwnerRuntimeSession();
    if (!session?.loginId) {
      window.location.href = "/propertyowner/ownerlogin";
      return;
    }
    setOwner(session);
    loadDashboard(session.loginId);
  }, []);

  const handleEnquiryAction = async (enquiryId, status) => {
    try {
      await fetchJson(`/api/owners/enquiries/${encodeURIComponent(enquiryId)}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      if (owner?.loginId) {
        await loadDashboard(owner.loginId);
      }
    } catch (err) {
      setErrorMsg(err?.body || err?.message || "Failed to update enquiry.");
    }
  };

  return (
    <PropertyOwnerLayout
      owner={owner}
      title="Dashboard"
      navVariant="default"
      notificationCount={notificationCount}
      notifications={[
        ...notifications.slice(0, 10).map(n => {
          const meta = typeof n.meta === 'string' ? JSON.parse(n.meta) : (n.meta || {});
          return {
            ...n,
            title: meta.title || n.title || (n.type === 'user_filter_match' ? 'New Lead Match' : 'Notification'),
            message: meta.message || n.message || '',
            type: n.type,
            meta: meta
          };
        }),
        ...enquiries.slice(0, 5).map((item) => ({
          title: item.propertyName || item.property?.name || "Enquiry",
          message: `${item.name || item.tenantName || "Tenant"} | ${item.status || "pending"}`,
          type: 'enquiry',
          meta: { bookingId: item._id }
        }))
      ]}
      onLogout={() => {
        clearOwnerRuntimeSession();
        window.location.href = "/propertyowner/ownerlogin";
      }}
      contentClassName="max-w-7xl mx-auto"
    >
      {/* Desktop Header - Touched None */}
      <div className="hidden md:flex flex-row items-end justify-between gap-3 mb-7">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-primary mb-1.5 flex items-center gap-1.5">
            <Sparkles className="size-3.5" /> Hi, {owner?.name || "Owner"}
          </div>
          <h1 className="font-serif text-[40px] leading-[1.05]">
            Here's what's happening today.
          </h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            {loading ? "..." : tenantsCount} beds occupied across {loading ? "..." : roomsCount} rooms.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => window.location.href = '/propertyowner/payment'}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-[13px] font-medium hover:border-primary/40">
            <Send className="size-3.5" /> Send rent reminders
          </button>
          <button 
            onClick={() => window.location.href = '/propertyowner/tenantrec'}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90">
            <Plus className="size-3.5" /> Add tenant
          </button>
        </div>
      </div>

      {/* Mobile Header - Mockup Match */}
      <div className="block md:hidden mb-4 mt-0.5 px-1">
        <div>
          <h2 className="text-[22px] font-black text-slate-900 tracking-tight flex items-center gap-1.5 font-sans">
            {getGreeting()}, {owner?.name || "Owner"}! 👋
          </h2>
          <p className="text-[12.5px] font-semibold text-slate-500 mt-0.5 leading-normal">
            Here's what's happening with your properties today.
          </p>
        </div>
      </div>

      {errorMsg ? <div className="text-sm text-red-600 mb-4">{errorMsg}</div> : null}

      {/* Stat cards */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Monthly Rent Expected</p>
              <h3 className="text-[32px] font-bold text-foreground mt-2">₹{loading ? "0" : (rentTotal * 30).toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-[13px] text-muted-foreground">Expected from {tenantsCount} tenants</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Total Tenants</p>
              <h3 className="text-[32px] font-bold text-emerald-600 mt-2">{loading ? "0" : tenantsCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-muted-foreground">Active residing tenants</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Total Leads</p>
              <h3 className="text-[32px] font-bold text-rose-600 mt-2">{loading ? "0" : enquiries.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-rose-600" />
            </div>
          </div>
          <p className="text-[13px] text-muted-foreground">Enquiries & Booking requests</p>
        </div>
      </div>

      {/* MOBILE VIEW - RESTORED ORIGINAL CONTENT WITH PREMIUM UI STYLING */}
      <div className="block md:hidden space-y-5 pb-24 px-1">
        
        {/* 1. Today's Overview (The 3 Stats Cards in 1 Row) */}
        <div>
          <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 font-sans flex items-center gap-1.5">
            <span className="w-1 h-3 rounded-full bg-blue-650 shrink-0" /> Today's Overview
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {/* Card 1: Expected Rent */}
            <div className="bg-white border border-slate-100 rounded-[20px] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col justify-between min-h-[96px] active:scale-[0.98] transition-transform duration-200">
              <div>
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mb-2">
                  <IndianRupee className="w-3.5 h-3.5" />
                </div>
                <div className="text-[14.5px] font-black text-slate-900 leading-tight">₹{loading ? "0" : (rentTotal * 30).toLocaleString('en-IN')}</div>
                <div className="text-[9px] font-bold text-slate-500 mt-1 leading-none">Expected Rent</div>
              </div>
              <span className="text-[8px] text-slate-400 font-semibold truncate mt-1.5 block">From {tenantsCount} tenants</span>
            </div>

            {/* Card 2: Total Tenants */}
            <div className="bg-white border border-slate-100 rounded-[20px] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col justify-between min-h-[96px] active:scale-[0.98] transition-transform duration-200">
              <div>
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mb-2">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="text-[14.5px] font-black text-slate-900 leading-tight">{loading ? "0" : tenantsCount}</div>
                <div className="text-[9px] font-bold text-slate-500 mt-1 leading-none">Residing Tenants</div>
              </div>
              <span className="text-[8px] text-slate-400 font-semibold truncate mt-1.5 block">Active residents</span>
            </div>

            {/* Card 3: Total Leads */}
            <div className="bg-white border border-slate-100 rounded-[20px] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col justify-between min-h-[96px] active:scale-[0.98] transition-transform duration-200">
              <div>
                <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div className="text-[14.5px] font-black text-slate-900 leading-tight">{loading ? "0" : enquiries.length}</div>
                <div className="text-[9px] font-bold text-slate-500 mt-1 leading-none">Total Leads</div>
              </div>
              <span className="text-[8px] text-slate-400 font-semibold truncate mt-1.5 block">Booking requests</span>
            </div>
          </div>
        </div>

        {/* 2. QUICK ACTION TILES GRID - 1 Row (4 Columns) */}
        <div>
          <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 font-sans flex items-center gap-1.5">
            <span className="w-1 h-3 rounded-full bg-blue-650 shrink-0" /> Quick Actions
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <button 
              onClick={() => window.location.href = '/propertyowner/tenantrec'}
              className="flex flex-col items-center justify-center p-3 bg-white border border-slate-100 rounded-[20px] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.01)] active:scale-95 duration-200"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mb-2 shadow-sm">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-extrabold text-slate-700 mt-1 text-center leading-tight">Add Tenant</span>
            </button>

            <button 
              onClick={() => window.location.href = '/propertyowner/payment'}
              className="flex flex-col items-center justify-center p-3 bg-white border border-slate-100 rounded-[20px] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.01)] active:scale-95 duration-200"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mb-2 shadow-sm">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-extrabold text-slate-700 mt-1 text-center leading-tight">Reminders</span>
            </button>

            <button 
              onClick={() => window.location.href = '/propertyowner/booking'}
              className="flex flex-col items-center justify-center p-3 bg-white border border-slate-100 rounded-[20px] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.01)] active:scale-95 duration-200"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mb-2 shadow-sm">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-extrabold text-slate-700 mt-1 text-center leading-tight">Book Bed</span>
            </button>

            <button 
              onClick={() => window.location.href = '/propertyowner/rooms'}
              className="flex flex-col items-center justify-center p-3 bg-white border border-slate-100 rounded-[20px] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.01)] active:scale-95 duration-200"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mb-2 shadow-sm">
                <BedDouble className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-extrabold text-slate-700 mt-1 text-center leading-tight">Rooms</span>
            </button>
          </div>
        </div>

        {/* 3. Portfolio Analytics */}
        <div>
          <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 font-sans flex items-center gap-1.5">
            <span className="w-1 h-3 rounded-full bg-blue-650 shrink-0" /> Portfolio Analytics
          </h3>
          <div className="bg-white border border-slate-100 rounded-[24px] p-4 shadow-[0_6px_24px_rgba(0,0,0,0.015)] space-y-5">
            {/* Chart 1: Revenue (Collection Flow) */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[12px] font-extrabold text-slate-800 font-sans">Weekly Collection</h4>
                  <p className="text-[9.5px] text-slate-400 font-bold font-sans">Last 7 days revenue flow</p>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                  <TrendingUp size={11} className="stroke-[2.5]" /> +12.4%
                </span>
              </div>
              
              <div className="h-[130px] mt-2 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{day: "Mon", amount: 15000}, {day: "Tue", amount: 25000}, {day: "Wed", amount: 10000}, {day: "Thu", amount: 45000}, {day: "Fri", amount: 30000}, {day: "Sat", amount: 50000}, {day: "Sun", amount: 15000}]} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="g1-mobile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "#ffffff", fontSize: 9, fontWeight: "bold" }}
                      formatter={(v) => [`Rs ${v}`, "Collected"]}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fill="url(#g1-mobile)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Chart 2: Occupancy */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[12px] font-extrabold text-slate-800 font-sans">Property Occupancy</h4>
                  <p className="text-[9.5px] text-slate-400 font-bold font-sans">Active vs Vacant capacity</p>
                </div>
                <div className="text-[9.5px] font-bold text-blue-650 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                  {totalBedsCapacity ? Math.min(100, Math.round(((tenantsCount||0) / totalBedsCapacity) * 100)) : 0}% Occupied
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3 items-center mt-3">
                {/* Circular Chart (Left) */}
                <div className="col-span-5 relative h-[90px] flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-600"
                      strokeDasharray={`${totalBedsCapacity ? Math.min(100, Math.round((tenantsCount / totalBedsCapacity) * 100)) : 87}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[12.5px] font-black text-slate-800 leading-none">{tenantsCount}</span>
                    <span className="text-[7.5px] text-slate-400 font-extrabold mt-0.5">residing</span>
                  </div>
                </div>

                {/* Table details (Right) */}
                <div className="col-span-7 space-y-1.5 pl-2">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                    <div className="flex items-center gap-1.5 text-[9.5px] text-slate-500 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>Occupied Beds</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-800">{tenantsCount || 0}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                    <div className="flex items-center gap-1.5 text-[9.5px] text-slate-500 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0" />
                      <span>Vacant Beds</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-800">{Math.max((totalBedsCapacity || 0) - (tenantsCount || 0), 0)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[9.5px] text-slate-500 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                      <span>Total Capacity</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-800">{totalBedsCapacity || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mt-5">
        {/* Collection chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-medium text-[15px] text-foreground">Collection — last 7 days</h3>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">
                Rs {loading ? "0" : rentTotal} collected this week
              </p>
            </div>
            <Pill tone="success"><TrendingUp className="size-3" /> +12.4%</Pill>
          </div>
          <div className="h-[230px] mt-3 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{day: "Mon", amount: 15000}, {day: "Tue", amount: 25000}, {day: "Wed", amount: 10000}, {day: "Thu", amount: 45000}, {day: "Fri", amount: 30000}, {day: "Sat", amount: 50000}, {day: "Sun", amount: 15000}]} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(var(--border))", background: "oklch(var(--card))", boxShadow: "var(--shadow-pop)", fontSize: 12 }}
                  formatter={(v) => [`Rs ${v}`, "Collected"]}
                />
                <Area type="monotone" dataKey="amount" stroke="oklch(var(--primary))" strokeWidth={2.2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy donut */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-medium text-[15px] text-foreground">Occupancy</h3>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">Across all properties</p>
          <div className="relative h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{name: "Occupied", value: Math.min(tenantsCount || 0, totalBedsCapacity || tenantsCount || 1)}, {name: "Vacant", value: Math.max((totalBedsCapacity || 0) - (tenantsCount || 0), 0)}]} dataKey="value" innerRadius={60} outerRadius={82} paddingAngle={3} stroke="none">
                  <Cell fill="oklch(var(--primary))" />
                  <Cell fill="oklch(var(--muted))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="font-serif text-[34px] leading-none text-foreground">{totalBedsCapacity ? Math.min(100, Math.round(((tenantsCount||0) / totalBedsCapacity) * 100)) : 0}%</div>
                <div className="text-[11px] text-muted-foreground mt-1">{tenantsCount}/{totalBedsCapacity} beds</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-around text-center mt-1">
            <div>
              <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground"><span className="size-2 w-2 h-2 rounded-full bg-primary" /> Occupied</div>
              <div className="font-medium text-[14px] mt-0.5 text-foreground">{tenantsCount || 0}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground"><span className="size-2 w-2 h-2 rounded-full bg-muted-foreground/30" /> Vacant</div>
              <div className="font-medium text-[14px] mt-0.5 text-foreground">{Math.max((totalBedsCapacity || 0) - (tenantsCount || 0), 0)}</div>
            </div>
          </div>
        </div>
      </div>

    </PropertyOwnerLayout>
  );
}
