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
import { MobileStatCard, MobileSectionCard } from "../../components/propertyowner/MobileComponents";
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
  const [tenants, setTenants] = useState([]);
  const [complaints, setComplaints] = useState([]);
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
      const [ownerRes, roomsRes, tenantsRes, rentRes, enquiryRes, notificationRes, chatRes, complaintsRes] = await Promise.all([
        fetchJson(`/api/owners/${encodeURIComponent(loginId)}`).catch(() => null),
        fetchJson(`/api/owners/${encodeURIComponent(loginId)}/rooms`),
        fetchOwnerTenants(loginId),
        fetchJson(`/api/owners/${encodeURIComponent(loginId)}/rent`),
        fetchJson(`/api/owners/${encodeURIComponent(loginId)}/enquiries`),
        fetchJson(`/api/notifications?toLoginId=${encodeURIComponent(loginId)}`),
        fetchJson(`/api/chat/inbox/${encodeURIComponent(loginId)}?search=`).catch(() => null),
        fetchJson(`/api/complaints/owner/${encodeURIComponent(loginId)}`).catch(() => null)
      ]);
      setOwner((prev) => ({ ...prev, ...(ownerRes || {}) }));
      
      const filteredRooms = filterByActiveProperty(roomsRes?.rooms || [], false);
      const allEnquiries = filterByActiveProperty(Array.isArray(enquiryRes) ? enquiryRes : enquiryRes?.enquiries || [], false);
      const filteredTenants = Array.isArray(tenantsRes) ? tenantsRes : tenantsRes?.tenants || []; // already filtered by fetchOwnerTenants
      
      setRoomsCount(filteredRooms.length);
      setTotalBedsCapacity(filteredRooms.reduce((s, r) => s + (r.beds || 1), 0));
      setTenantsCount(filteredTenants.length);
      setTenants(filteredTenants);
      setPropertiesCount(roomsRes?.properties?.length || 0);
      setRecentChats(chatRes?.conversations || []);
      setComplaints(Array.isArray(complaintsRes) ? complaintsRes : (complaintsRes?.complaints || []));
      
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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const newLeadsCount = enquiries.filter(e => !e.status || String(e.status).toLowerCase() === 'pending').length;
  const bookingsCount = enquiries.filter(e => ['approved', 'accepted', 'active'].includes(String(e.status).toLowerCase())).length;
  const occupancyPercent = totalBedsCapacity ? Math.min(100, Math.round(((tenantsCount||0) / totalBedsCapacity) * 100)) : 0;
  
  const moveInsToday = tenants.filter(t => {
    if (!t.doj) return false;
    const d = new Date(t.doj);
    d.setHours(0,0,0,0);
    return d.getTime() === todayStart.getTime();
  }).length;
  
  const openComplaintsCount = complaints.filter(c => ['open', 'pending'].includes(String(c.status).toLowerCase())).length;
  const inProgressComplaintsCount = complaints.filter(c => String(c.status).toLowerCase() === 'in progress').length;
  const resolvedComplaintsCount = complaints.filter(c => ['resolved', 'closed'].includes(String(c.status).toLowerCase())).length;

  const recentLeads = [...enquiries].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3);
  const recentTenantsList = [...tenants].sort((a, b) => new Date(b.doj || b.createdAt || 0) - new Date(a.doj || a.createdAt || 0)).slice(0, 3);

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

      {/* MOBILE VIEW - REDESIGNED (Match Screenshot & Rules) */}
      <div className="block md:hidden space-y-5 pb-24 px-1">
        
        {/* 1. Today's Overview (Grid) */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-900 mb-3 px-1">Today's Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            <MobileStatCard 
              title="New Leads" 
              value={newLeadsCount} 
              subtext="+3 today" 
              icon={Users} 
              iconBgClass="bg-blue-50" 
              iconTextClass="text-blue-600"
              onClick={() => window.location.href = '/propertyowner/booking'} 
            />
            <MobileStatCard 
              title="Open Complaints" 
              value={openComplaintsCount} 
              subtext="Needs attention" 
              icon={AlertCircle} 
              iconBgClass="bg-rose-50" 
              iconTextClass="text-rose-600"
              onClick={() => window.location.href = '/propertyowner/complaints'} 
            />
            <MobileStatCard 
              title="Pending Rent" 
              value={`₹${(rentTotal * 10).toLocaleString('en-IN')}`} 
              subtext="Action needed" 
              icon={Wallet} 
              iconBgClass="bg-amber-50" 
              iconTextClass="text-amber-600"
              onClick={() => window.location.href = '/propertyowner/payment'} 
            />
            <MobileStatCard 
              title="Vacant Beds" 
              value={Math.max((totalBedsCapacity || 0) - (tenantsCount || 0), 0)} 
              subtext="Available" 
              icon={BedDouble} 
              iconBgClass="bg-purple-50" 
              iconTextClass="text-purple-600"
              onClick={() => window.location.href = '/propertyowner/properties'} 
            />
          </div>
        </div>

        {/* 2. Monthly Earnings (Rent Target) */}
        <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-[15px] font-bold text-slate-900">Monthly Expected Rent</h3>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-0.5">This Month</p>
                <h4 className="text-[22px] font-black text-slate-900 leading-none">₹{(rentTotal * 30).toLocaleString('en-IN')}</h4>
                <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1.5"><ArrowUpRight className="w-3 h-3" /> 15.2% vs last month</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded uppercase tracking-wider">Target: ₹{(rentTotal * 40).toLocaleString('en-IN')}</span>
              <div className="w-[100px] mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '78%' }} />
                </div>
                <span className="text-[10px] font-bold text-emerald-600">78%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Properties Summary */}
        <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-slate-900">Properties Summary</h3>
            <button onClick={() => window.location.href = '/propertyowner/properties'} className="text-[12px] font-semibold text-blue-600 hover:underline">View all</button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 flex items-center justify-center mb-1">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-lg font-black text-slate-900">{propertiesCount}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase">Total<br/>Properties</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 flex items-center justify-center mb-1">
                <BedDouble className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-lg font-black text-slate-900">{tenantsCount}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase">Occupied<br/>Beds</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 flex items-center justify-center mb-1">
                <BedDouble className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-lg font-black text-slate-900">{Math.max((totalBedsCapacity || 0) - (tenantsCount || 0), 0)}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase">Vacant<br/>Beds</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto relative flex items-center justify-center mb-1">
                 <svg className="w-12 h-12 transform -rotate-90 absolute" viewBox="0 0 36 36">
                   <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                   <path className="text-blue-500" strokeDasharray={`${occupancyPercent}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                 </svg>
                 <span className="text-[11px] font-black text-blue-600">{occupancyPercent}%</span>
              </div>
              <div className="text-[9px] font-bold text-slate-500 uppercase">Occupancy</div>
            </div>
          </div>
        </div>

        {/* 4. New Leads */}
        <MobileSectionCard title="New Leads" actionText="View all" onAction={() => window.location.href = '/propertyowner/booking'}>
          <div className="space-y-4">
            {recentLeads.length === 0 ? (
               <div className="text-center py-4 text-[12px] font-semibold text-slate-400">No new leads</div>
            ) : recentLeads.map(lead => (
               <div key={lead._id} className="border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                 <div className="flex items-start justify-between mb-3">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[14px] uppercase shrink-0">
                       {(lead.name || "U")[0]}
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <span className="text-[14px] font-bold text-slate-900 leading-none">Lead #{String(lead._id).slice(-4)}</span>
                         <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[9px] font-black rounded uppercase">New</span>
                       </div>
                       <p className="text-[11px] font-medium text-slate-500 mt-1">Looking for {lead.propertyName || "PG in Area"}</p>
                       <div className="flex gap-3 mt-1.5">
                         <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Budget: ₹{lead.budget || "8,000"}</span>
                         <span className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Move-in: 10 Jun</span>
                       </div>
                     </div>
                   </div>
                   <span className="text-[10px] font-semibold text-slate-400">10m ago</span>
                 </div>
                 <button className="w-full py-2 border border-blue-200 text-blue-600 rounded-xl bg-blue-50/50 hover:bg-blue-50 text-[12px] font-bold flex items-center justify-center gap-2 transition-colors">
                   <MessageCircle className="w-4 h-4" /> Open
                 </button>
               </div>
            ))}
          </div>
        </MobileSectionCard>

        {/* 5. Rent Collection Status */}
        <MobileSectionCard title="Rent Collection" actionText="View details" onAction={() => window.location.href = '/propertyowner/payment'}>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-900 mb-0.5">Collected</p>
                <p className="text-[14px] font-black text-slate-900 leading-none">₹{(rentTotal * 15).toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-amber-200 bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-900 mb-0.5">Pending</p>
                <p className="text-[14px] font-black text-slate-900 leading-none">₹{(rentTotal * 10).toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-rose-200 bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-900 mb-0.5">Overdue</p>
                <p className="text-[14px] font-black text-slate-900 leading-none">₹{(rentTotal * 5).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </MobileSectionCard>

        {/* 6. Upcoming Move-ins */}
        <MobileSectionCard title="Upcoming Move-ins" actionText="View all" onAction={() => window.location.href = '/propertyowner/upcoming-moveins'}>
          <div className="space-y-4">
            {moveInsToday === 0 ? (
               <div className="text-center py-4 text-[12px] font-semibold text-slate-400">No move-ins today</div>
            ) : recentTenantsList.map((tenant, i) => (
               <div key={i} className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[14px] uppercase shrink-0">
                     {(tenant.name || "T")[0]}
                   </div>
                   <div>
                     <h4 className="text-[13px] font-bold text-slate-900">{tenant.name || "Tenant"}</h4>
                     <p className="text-[11px] font-medium text-slate-500 mt-0.5">Room {tenant.roomNumber || "TBD"} • {tenant.propertyName || "Property"}</p>
                   </div>
                 </div>
                 <button className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-bold tracking-wider uppercase shadow-sm">
                   Check-in
                 </button>
               </div>
            ))}
          </div>
        </MobileSectionCard>

        {/* 7. Recent Complaints */}
        <MobileSectionCard title="Recent Complaints" actionText="View all" onAction={() => window.location.href = '/propertyowner/complaints'}>
          <div className="space-y-3">
             {complaints.length === 0 ? (
                <div className="text-[12px] text-slate-400 text-center">No open complaints</div>
             ) : complaints.slice(0, 3).map((c, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-[14px] uppercase">
                        {(c.reportedBy?.name || "T")[0]}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-rose-500 border border-white rounded-full"></span>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                        {c.reportedBy?.name || "Tenant"}
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[8px] font-black rounded uppercase tracking-wider">{c.category || "Plumbing"}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px]">{c.description || "Issue reported"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-medium text-slate-400">10:30 AM</span>
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              ))}
          </div>
        </MobileSectionCard>

        {/* 8. Recent Payments */}
        <MobileSectionCard title="Recent Payments" actionText="View history" onAction={() => window.location.href = '/propertyowner/collection-report'}>
          <div className="space-y-3">
             <div className="flex items-center justify-between border-b border-slate-50 pb-3">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                   <ArrowDownRight className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="text-[13px] font-bold text-slate-900">₹15,000 received</h4>
                   <p className="text-[11px] font-medium text-slate-500 mt-0.5">from Rahul Sharma (Room 102)</p>
                 </div>
               </div>
               <span className="text-[10px] font-semibold text-slate-400">2h ago</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                   <ArrowDownRight className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="text-[13px] font-bold text-slate-900">₹8,500 received</h4>
                   <p className="text-[11px] font-medium text-slate-500 mt-0.5">from Amit Patel (Room 205)</p>
                 </div>
               </div>
               <span className="text-[10px] font-semibold text-slate-400">5h ago</span>
             </div>
          </div>
        </MobileSectionCard>
      </div>

      <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mt-5">
        {/* Collection chart */}
        <div className="lg:col-span-2 min-w-0 rounded-2xl border border-border bg-card p-5 shadow-soft">
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
        <div className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-soft">
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
