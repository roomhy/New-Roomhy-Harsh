import React, { useEffect, useMemo, useState } from "react";
import { fetchJson } from "../../utils/api";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { useHtmlPage } from "../../utils/htmlPage";
import {
  Users,
  BedDouble,
  IndianRupee,
  ArrowUpRight,
  BarChart2,
  Wallet,
  AlertTriangle,
  Send,
  Plus,
  Sparkles,
  TrendingUp,
  MessageSquareWarning,
  CalendarClock
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
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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
      const [ownerRes, roomsRes, tenantsRes, rentRes, enquiryRes, notificationRes] = await Promise.all([
        fetchJson(`/api/owners/${encodeURIComponent(loginId)}`).catch(() => null),
        fetchJson(`/api/owners/${encodeURIComponent(loginId)}/rooms`),
        fetchOwnerTenants(loginId),
        fetchJson(`/api/owners/${encodeURIComponent(loginId)}/rent`),
        fetchJson(`/api/owners/${encodeURIComponent(loginId)}/enquiries`),
        fetchJson(`/api/notifications?toLoginId=${encodeURIComponent(loginId)}`)
      ]);
      setOwner((prev) => ({ ...prev, ...(ownerRes || {}) }));
      
      const filteredRooms = filterByActiveProperty(roomsRes?.rooms || [], false);
      const allEnquiries = filterByActiveProperty(Array.isArray(enquiryRes) ? enquiryRes : enquiryRes?.enquiries || [], false);
      const filteredTenants = Array.isArray(tenantsRes) ? tenantsRes : tenantsRes?.tenants || []; // already filtered by fetchOwnerTenants
      
      setRoomsCount(filteredRooms.length);
      setTotalBedsCapacity(filteredRooms.reduce((s, r) => s + (r.beds || 1), 0));
      setTenantsCount(filteredTenants.length);
      
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

      {/* Mobile Header - Compact, Aligned & Professional */}
      <div className="block md:hidden mb-6 mt-1">
        <div>
          <h2 className="text-[19px] font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
            Hi, {owner?.name || "Owner"}! 👋
          </h2>
          <p className="text-[11.5px] font-medium text-slate-500 mt-1 leading-normal">
            {loading ? "..." : tenantsCount} beds occupied across {loading ? "..." : roomsCount} rooms today.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button 
            onClick={() => window.location.href = '/propertyowner/payment'}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 text-blue-600 rounded-xl text-[11px] font-bold transition-all shadow-sm shadow-blue-100/10">
            <Send className="size-3.5" /> Send Reminders
          </button>
          <button 
            onClick={() => window.location.href = '/propertyowner/tenantrec'}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold transition-all shadow-sm shadow-slate-900/10">
            <Plus className="size-3.5" /> Add Tenant
          </button>
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

      {/* Mobile Stat Cards - SS2 style */}
      <div className="block md:hidden mb-6">
        <h3 className="text-[13px] font-extrabold text-slate-900 mb-3 tracking-tight">Today's Overview</h3>
        <div className="grid grid-cols-4 gap-2">
          {/* Card 1: New Leads */}
          <div className="bg-white border border-slate-100 rounded-2xl p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[96px]">
            <div>
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-[17px] font-extrabold text-slate-800 mt-2">{loading ? "0" : enquiries.length}</div>
              <div className="text-[9px] font-bold text-slate-500 leading-tight mt-0.5">New Leads</div>
            </div>
            <div className="text-[8px] font-bold text-blue-500 mt-1 flex items-center gap-0.5">
              +{enquiries.filter(e => {
                if (!e.createdAt) return false;
                return new Date(e.createdAt).toDateString() === new Date().toDateString();
              }).length} today
            </div>
          </div>

          {/* Card 2: Active Chats */}
          <div className="bg-white border border-slate-100 rounded-2xl p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[96px]">
            <div>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <MessageSquareWarning className="w-4 h-4" />
              </div>
              <div className="text-[17px] font-extrabold text-slate-800 mt-2">
                {loading ? "0" : (notifications.filter(n => n.type === 'chat' || n.message?.toLowerCase().includes('chat')).length || 8)}
              </div>
              <div className="text-[9px] font-bold text-slate-500 leading-tight mt-0.5">Active Chats</div>
            </div>
            <div className="text-[8px] font-bold text-emerald-500 mt-1">
              {notifications.filter(n => !n.read && (n.type === 'chat' || n.message?.toLowerCase().includes('chat'))).length || 2} unread
            </div>
          </div>

          {/* Card 3: Pending Bookings */}
          <div className="bg-white border border-slate-100 rounded-2xl p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[96px]">
            <div>
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <CalendarClock className="w-4 h-4" />
              </div>
              <div className="text-[17px] font-extrabold text-slate-800 mt-2">
                {loading ? "0" : enquiries.filter(e => ['pending', 'hold'].includes(String(e.status || '').toLowerCase())).length}
              </div>
              <div className="text-[9px] font-bold text-slate-500 leading-tight mt-0.5">Pending Bookings</div>
            </div>
            <button 
              onClick={() => window.location.href = '/propertyowner/booking_request'}
              className="text-[8px] font-bold text-amber-600 mt-1 text-left hover:underline">
              View all
            </button>
          </div>

          {/* Card 4: Vacant Beds */}
          <div className="bg-white border border-slate-100 rounded-2xl p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[96px]">
            <div>
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <BedDouble className="w-4 h-4" />
              </div>
              <div className="text-[17px] font-extrabold text-slate-800 mt-2">
                {loading ? "0" : Math.max(0, totalBedsCapacity - tenantsCount)}
              </div>
              <div className="text-[9px] font-bold text-slate-500 leading-tight mt-0.5">Vacant Beds</div>
            </div>
            <button 
              onClick={() => window.location.href = '/propertyowner/rooms'}
              className="text-[8px] font-bold text-purple-600 mt-1 text-left hover:underline">
              View all
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mt-5">
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
