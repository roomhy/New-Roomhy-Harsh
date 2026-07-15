import React, { useState, useEffect, useMemo } from "react";
import StaffLayout from "../../components/StaffLayout";
import {
  Users, Home, AlertCircle, ClipboardList,
  CheckCircle2, Calendar, LogIn, LogOut,
  ChevronRight, Loader2, UsersRound, Megaphone,
  Sun, MapPin
} from "lucide-react";
import { useMyAttendance, useCheckIn, useCheckOut } from "../../hooks/useAttendance";
import { useStaffTasks } from "../../hooks/useTasks";
import { useOwnerTenants } from "../../hooks/useTenants";
import { useOwnerVisitors } from "../../hooks/useVisitors";
import { useOwnerRooms, useOwnerComplaints, useOwnerAnnouncements } from "../../hooks/useDashboardData";

function getStaffSession() {
  try {
    const raw = sessionStorage.getItem("staff_session") || localStorage.getItem("staff_session");
    if (raw) return JSON.parse(raw);
    const empRaw = sessionStorage.getItem("employee_session") || localStorage.getItem("employee_session");
    if (empRaw) return JSON.parse(empRaw);
  } catch (_) {}
  return null;
}

function isToday(dateVal) {
  if (!dateVal) return false;
  const d = new Date(dateVal);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}

const STAT_ACCENTS = {
  blue: { iconBg: "bg-blue-50", iconColor: "text-blue-600", bar: "bg-blue-500" },
  emerald: { iconBg: "bg-emerald-50", iconColor: "text-emerald-600", bar: "bg-emerald-500" },
  rose: { iconBg: "bg-rose-50", iconColor: "text-rose-600", bar: "bg-rose-500" },
  amber: { iconBg: "bg-amber-50", iconColor: "text-amber-600", bar: "bg-amber-500" },
};

function StatCard({ icon: Icon, value, label, sub, accent }) {
  const a = STAT_ACCENTS[accent];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 min-h-[160px] flex flex-col">
      <div className="flex items-center gap-3.5 mb-6">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${a.iconBg}`}>
          <Icon size={17} className={a.iconColor} />
        </div>
        <span className="text-3xl font-extrabold text-slate-900 leading-none">{value}</span>
      </div>
      <p className="text-base font-bold text-slate-800 leading-tight">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
      <div className={`h-[3px] w-6 rounded-full mt-4 ${a.bar}`} />
    </div>
  );
}

function PanelCard({ title, viewAllLabel, viewAllHref, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 flex flex-col">
      <div className="flex items-center justify-between pb-5 border-b border-slate-50">
        <h3 className="font-bold text-slate-900 text-base">{title}</h3>
        <a href={viewAllHref} className="text-xs font-bold text-blue-600 flex items-center gap-0.5 hover:underline shrink-0">
          {viewAllLabel} <ChevronRight size={13} />
        </a>
      </div>
      <div className="flex-1 flex flex-col min-h-[260px]">{children}</div>
    </div>
  );
}

function EmptyPanel({ icon: Icon, title, sub }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-8">
      <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
        <Icon size={30} className="text-indigo-300" />
      </div>
      <p className="text-sm font-bold text-slate-700">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

// Soft flowing wave pattern behind the hero content
function HeroWavePattern({ className }) {
  return (
    <svg viewBox="0 0 800 400" className={className} preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M-20 260 C 160 200, 260 340, 440 260 S 720 160, 860 240" stroke="white" strokeOpacity="0.07" strokeWidth="115" strokeLinecap="round" />
      <path d="M-20 120 C 180 60, 300 180, 480 110 S 760 40, 900 120" stroke="white" strokeOpacity="0.045" strokeWidth="80" strokeLinecap="round" />
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={640 + col * 18} cy={30 + row * 18} r="1.6" fill="white" fillOpacity="0.35" />
        ))
      )}
    </svg>
  );
}

// Premium isometric building illustration for the hero card
function BuildingIllustration({ className }) {
  return (
    <svg viewBox="0 0 260 220" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* birds */}
      <path d="M150 34 q6 -6 12 0 q6 -6 12 0" stroke="white" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
      <path d="M196 18 q5 -5 10 0 q5 -5 10 0" stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />

      {/* ground shadow */}
      <ellipse cx="140" cy="200" rx="95" ry="10" fill="black" fillOpacity="0.08" />

      {/* left tree */}
      <circle cx="42" cy="150" r="20" fill="white" fillOpacity="0.22" />
      <circle cx="30" cy="165" r="14" fill="white" fillOpacity="0.16" />
      <rect x="39" y="160" width="6" height="34" rx="2" fill="white" fillOpacity="0.22" />

      {/* right tree */}
      <circle cx="228" cy="158" r="17" fill="white" fillOpacity="0.2" />
      <rect x="225" y="166" width="6" height="28" rx="2" fill="white" fillOpacity="0.2" />

      {/* building side face (isometric depth) */}
      <path d="M150 70 L196 92 L196 190 L150 190 Z" fill="white" fillOpacity="0.28" />
      {/* building front face */}
      <path d="M84 92 L150 70 L150 190 L84 190 Z" fill="white" fillOpacity="0.55" />
      {/* roof edge */}
      <path d="M84 92 L150 70 L196 92 L150 108 Z" fill="white" fillOpacity="0.7" />

      {/* front-face windows */}
      {[112, 138, 164].map((y) => (
        <React.Fragment key={y}>
          <rect x="96" y={y} width="14" height="14" rx="2" fill="#3B4CCA" fillOpacity="0.55" />
          <rect x="122" y={y} width="14" height="14" rx="2" fill="#3B4CCA" fillOpacity="0.55" />
        </React.Fragment>
      ))}

      {/* side-face windows */}
      {[112, 138, 164].map((y) => (
        <rect key={y} x="164" y={y} width="12" height="14" rx="2" fill="#3B4CCA" fillOpacity="0.4" />
      ))}

      {/* door */}
      <rect x="105" y="172" width="22" height="18" rx="2" fill="#312E81" fillOpacity="0.6" />

      {/* front porch block */}
      <path d="M60 130 L84 118 L84 190 L60 190 Z" fill="white" fillOpacity="0.4" />
      <rect x="66" y="150" width="10" height="12" rx="2" fill="#3B4CCA" fillOpacity="0.45" />

      {/* background low-rise silhouettes */}
      <rect x="8" y="120" width="26" height="70" rx="2" fill="white" fillOpacity="0.08" />
      <rect x="204" y="100" width="30" height="90" rx="2" fill="white" fillOpacity="0.1" />
    </svg>
  );
}

export default function StaffDashboard() {
  const staff = getStaffSession();
  const staffLoginId = staff?.loginId || staff?.login_id || staff?.staffId || "";
  const staffId = staff?._id || staff?.id || "";
  const parentId = staff?.parentLoginId || "";
  const staffName = staff?.name || "Staff Member";
  const staffRole = staff?.role || "Staff";

  // Auth guard — no session → redirect to login
  useEffect(() => {
    if (!staffLoginId) {
      window.location.href = "/propertyowner/ownerlogin";
    }
  }, [staffLoginId]);

  if (!staffLoginId) return null;

  // ── UI-only local state ──
  const [now, setNow] = useState(new Date());
  const [msg, setMsg] = useState("");
  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // ── Server state via React Query. These use the SAME query keys as the
  //    Attendance / Tasks / Visitors pages, so React Query serves them from one
  //    shared cache — returning here makes no duplicate calls within staleTime. ──
  const attQuery = useMyAttendance(staffLoginId, now.getMonth() + 1, now.getFullYear());
  const tasksQuery = useStaffTasks(staffLoginId);
  const tenantsQuery = useOwnerTenants(parentId);
  const roomsQuery = useOwnerRooms(parentId);
  const complaintsQuery = useOwnerComplaints(parentId);
  const visitorsQuery = useOwnerVisitors(parentId);
  const announcementsQuery = useOwnerAnnouncements(parentId);

  const checkInMut = useCheckIn(staffLoginId);
  const checkOutMut = useCheckOut(staffLoginId);
  const checkInLoading = checkInMut.isPending;
  const checkOutLoading = checkOutMut.isPending;

  const loading = attQuery.isLoading || tasksQuery.isLoading ||
    (!!parentId && (tenantsQuery.isLoading || roomsQuery.isLoading || complaintsQuery.isLoading || visitorsQuery.isLoading));

  const toLocalYMD = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // ── Everything below is DERIVED from cached server data (never stored) ──
  const todayAtt = useMemo(() => {
    const records = attQuery.data || [];
    return records.find(r => r.date && toLocalYMD(r.date) === toLocalYMD(new Date())) || null;
  }, [attQuery.data]);

  const allTasks = tasksQuery.data || [];
  const tasks = useMemo(() => ({
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === "Pending").length,
  }), [allTasks]);
  const recentTasks = useMemo(() => allTasks.filter(t => t.status !== "Completed").slice(0, 3), [allTasks]);

  const stats = useMemo(() => {
    const tenantsArr = tenantsQuery.data || [];
    const roomsArr = roomsQuery.data || [];
    const complaintsArr = complaintsQuery.data || [];
    const complaints = complaintsArr.filter(c => {
      const assignedIdStr = c.assignedStaffId?._id || c.assignedStaffId || "";
      const mine = String(assignedIdStr) === String(staffId) ||
        (c.assignedTo && String(c.assignedTo).toUpperCase() === String(staffLoginId).toUpperCase());
      return mine && c.status !== "Resolved" && c.status !== "Closed";
    }).length;
    return {
      tenants: tenantsArr.filter(t => !t.isDeleted && t.status !== "inactive").length,
      rooms: roomsArr.length,
      complaints,
    };
  }, [tenantsQuery.data, roomsQuery.data, complaintsQuery.data, staffId, staffLoginId]);

  const visitorsToday = useMemo(
    () => (visitorsQuery.data || []).filter(v => isToday(v.createdAt || v.date || v.visitDate)),
    [visitorsQuery.data]
  );
  const announcements = useMemo(() => (announcementsQuery.data || []).slice(0, 4), [announcementsQuery.data]);

  const handleCheckIn = () => {
    if (!staffLoginId) return;
    checkInMut.mutate(undefined, {
      onSuccess: (data) => { if (data?.success) showMsg(`Checked in at ${data.checkInTime} ✓`); },
    });
  };

  const handleCheckOut = () => {
    if (!staffLoginId) return;
    checkOutMut.mutate(undefined, {
      onSuccess: (data) => { if (data?.success) showMsg(`Checked out at ${data.checkOutTime} ✓`); },
    });
  };

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const fullDateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const badgeDateStr = now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const dutyLabel = todayAtt?.checkIn && !todayAtt?.checkOut
    ? "You're on duty"
    : todayAtt?.checkOut
    ? "Shift complete"
    : "Not checked in";

  const shiftStatus = todayAtt?.checkIn && !todayAtt?.checkOut
    ? { label: "Active", dot: "bg-emerald-400" }
    : todayAtt?.checkOut
    ? { label: "Completed", dot: "bg-slate-300" }
    : { label: "Not Started", dot: "bg-slate-300" };

  return (
    <StaffLayout title={staffName} subtitle="Dashboard">
      <div className="space-y-10">

        {/* Toast */}
        {msg && (
          <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={16} /> {msg}
          </div>
        )}

        {/* Greeting row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome, {staffName} 
              
            </h2>
            <p className="text-sm text-slate-400 mt-1">Here's what's happening at your property today.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-100 shadow-sm rounded-full px-4 py-2 text-xs font-bold text-slate-600 shrink-0">
            <Calendar size={14} className="text-slate-400" />
            {badgeDateStr}
          </div>
        </div>

        {/* Hero on-duty card */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-800 via-blue-700 to-indigo-900 p-6 sm:p-12 text-white shadow-2xl shadow-indigo-900/30">
          <HeroWavePattern className="absolute inset-0 w-full h-full pointer-events-none" />
          <BuildingIllustration className="hidden md:block absolute right-2 top-2 w-72 h-72 lg:w-80 lg:h-80 pointer-events-none" />

          <div className="relative z-10 flex flex-wrap items-start gap-x-14 gap-y-8 md:pr-64">
            {/* Time & date — hidden on phones to keep the card short; the client
                asked mobile to show only name, staff ID and the check-in buttons */}
            <div className="hidden sm:block">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">{dutyLabel}</p>
              <p className="text-5xl sm:text-[52px] font-extrabold mt-4 leading-none">{timeStr}</p>
              <p className="text-indigo-200 text-base font-medium mt-4">{fullDateStr}</p>
            </div>
            <div className="hidden sm:block w-px self-stretch bg-white/20" />
            <div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Warden</p>
              <p className="text-3xl sm:text-4xl font-extrabold mt-3 sm:mt-4 leading-none">{staffName}</p>
              <p className="text-indigo-200 text-sm sm:text-base font-medium mt-3 sm:mt-4">STAFF ID: {staffLoginId}</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mt-6 sm:mt-12">
            {/* Minimal status strip — hidden on phones (mobile shows only the buttons) */}
            <div className="hidden sm:flex flex-1 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-8 py-6 flex-wrap items-center gap-x-12 gap-y-4">
              <div className="flex items-center gap-3">
                <Sun size={16} className="text-indigo-200 shrink-0" />
                <div>
                  <p className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider leading-none">Duty Type</p>
                  <p className="text-base font-bold text-white mt-2 leading-none">Day Shift</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/15" />
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-indigo-200 shrink-0" />
                <div>
                  <p className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider leading-none">Check-in Location</p>
                  <p className="text-base font-bold text-white mt-2 leading-none">Main Gate</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/15" />
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${shiftStatus.dot}`} />
                <div>
                  <p className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider leading-none">Shift Status</p>
                  <p className="text-base font-bold text-white mt-2 leading-none">{shiftStatus.label}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 shrink-0 w-full lg:w-auto">
              <button
                onClick={handleCheckIn}
                disabled={checkInLoading || loading || !!todayAtt?.checkIn}
                className="flex-1 lg:flex-none h-14 sm:h-16 px-4 sm:px-10 bg-white text-indigo-700 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all disabled:opacity-50 shadow-lg"
              >
                {checkInLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                {todayAtt?.checkIn ? "Checked In" : "Check In"}
              </button>
              <button
                onClick={handleCheckOut}
                disabled={checkOutLoading || loading || !todayAtt?.checkIn || !!todayAtt?.checkOut}
                className="flex-1 lg:flex-none h-14 sm:h-16 px-4 sm:px-10 bg-indigo-500 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-indigo-400 transition-all disabled:opacity-50 shadow-lg"
              >
                {checkOutLoading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                {todayAtt?.checkOut ? "Checked Out" : "Check Out"}
              </button>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={Users} value={stats.tenants} label="Tenants" sub="Active Tenants" accent="blue" />
          <StatCard icon={Home} value={stats.rooms} label="Rooms" sub="Total Rooms" accent="emerald" />
          <StatCard icon={AlertCircle} value={stats.complaints} label="Complaints" sub="Active Complaints" accent="rose" />
          <StatCard icon={ClipboardList} value={tasks.pending} label="Pending Tasks" sub="Awaiting Action" accent="amber" />
        </div>

        {/* Bottom Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <PanelCard title="Today's Tasks" viewAllLabel="View all" viewAllHref="/propertyowner/my-tasks">
            {recentTasks.length === 0 ? (
              <EmptyPanel icon={ClipboardList} title="No tasks assigned" sub="All clear for today!" />
            ) : (
              <div className="divide-y divide-slate-50">
                {recentTasks.map(task => (
                  <div key={task._id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${task.status === "In Progress" ? "bg-blue-500" : "bg-amber-500"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-slate-800 truncate">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                      )}
                      {task.dueDate && (
                        <p className="text-[11px] font-semibold text-slate-400 mt-1.5">
                          Due {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PanelCard>

          <PanelCard title="Scheduled Visitors" viewAllLabel="View log" viewAllHref="/propertyowner/visitor-entry">
            {visitorsToday.length === 0 ? (
              <EmptyPanel icon={UsersRound} title="No visitors today" sub="Have a peaceful day!" />
            ) : (
              <div className="divide-y divide-slate-50">
                {visitorsToday.slice(0, 3).map(v => (
                  <div key={v._id} className="flex items-center gap-3 py-3">
                    <div className="w-2 h-2 rounded-full shrink-0 bg-indigo-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-slate-700 truncate">{v.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">Visiting {v.hostName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PanelCard>

          <PanelCard title="Announcements" viewAllLabel="View all" viewAllHref="/propertyowner/announcements">
            {announcements.length === 0 ? (
              <EmptyPanel icon={Megaphone} title="No announcements" sub="Nothing new right now." />
            ) : (
              <div>
                <div className="flex items-start gap-3 py-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Megaphone size={16} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-slate-800">{announcements[0].title}</p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{announcements[0].content}</p>
                    <p className="text-[11px] text-slate-300 font-medium mt-2">
                      {new Date(announcements[0].createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}
                      {new Date(announcements[0].createdAt || Date.now()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </p>
                  </div>
                </div>
                {announcements.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-4">
                    {announcements.map((_, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-slate-800" : "bg-slate-200"}`} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </PanelCard>
        </div>
      </div>
    </StaffLayout>
  );
}
