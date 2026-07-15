import React, { useState, useMemo } from "react";
import StaffLayout from "../../components/StaffLayout";
import {
  ClipboardList, CheckCircle, PlayCircle, Circle, XCircle,
  Clock, Calendar, Building2, Flag, ChevronDown, Search,
  ArrowUpDown, User, FileText, Lightbulb,
  ArrowRight, CalendarDays
} from "lucide-react";
import { useStaffTasks, useUpdateTaskStatus } from "../../hooks/useTasks";

const STATUS_CONFIG = {
  Pending:       { chip: "bg-amber-50 text-amber-600",      icon: Circle,      accent: "amber",   ring: "border-amber-400", dot: "bg-amber-500" },
  "In Progress": { chip: "bg-blue-50 text-blue-600",        icon: PlayCircle,  accent: "blue",    ring: "border-blue-400",  dot: "bg-blue-500" },
  Completed:     { chip: "bg-emerald-50 text-emerald-600",  icon: FileText,    accent: "emerald", ring: "border-emerald-400", dot: "bg-emerald-500" },
  Cancelled:     { chip: "bg-slate-100 text-slate-500",     icon: XCircle,     accent: "slate",   ring: "border-slate-300", dot: "bg-slate-400" },
};
const PRIORITY_CONFIG = {
  Low:    { color: "text-slate-500",  dot: "bg-slate-400" },
  Medium: { color: "text-amber-600",  dot: "bg-amber-500" },
  High:   { color: "text-orange-600", dot: "bg-orange-500" },
  Urgent: { color: "text-rose-600",   dot: "bg-rose-500" },
};
const ACCENT_HEX = { amber: "#FFB020", blue: "#4F6BFF", emerald: "#2BC48A", rose: "#FF6B6B", slate: "#94A3B8" };

function getStaffSession() {
  try {
    const raw = sessionStorage.getItem("staff_session") || localStorage.getItem("staff_session");
    if (raw) return JSON.parse(raw);
    const empRaw = sessionStorage.getItem("employee_session") || localStorage.getItem("employee_session");
    if (empRaw) return JSON.parse(empRaw);
  } catch (_) {}
  return null;
}

// ── Stat card ──
function StatCard({ icon: Icon, value, label, caption, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${color}1A` }}>
        <Icon size={17} style={{ color }} />
      </div>
      <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
      <p className="text-sm font-bold text-slate-800 mt-2">{label}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{caption}</p>
    </div>
  );
}

// ── Multi-segment donut ──
function DonutRing({ segments, centerTop, centerSub, size = 128, stroke = 14 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const sum = segments.reduce((a, s) => a + s.value, 0);
  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
        {sum > 0 && segments.filter(s => s.value > 0).map((s, i) => {
          const len = (s.value / sum) * c;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color}
              strokeWidth={stroke} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset .5s ease" }} />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xl font-extrabold text-slate-900 leading-none">{centerTop}</p>
        <p className="text-[10px] text-slate-400 font-semibold mt-1">{centerSub}</p>
      </div>
    </div>
  );
}

// ── Semi-circle gauge ──
function SemiGauge({ pct, label }) {
  const w = 180, r = 74, cx = w / 2, cy = 90, stroke = 14;
  const len = Math.PI * r;
  const off = len * (1 - Math.min(1, Math.max(0, pct)));
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <div className="relative" style={{ width: w, height: cy + 8 }}>
      <svg width={w} height={cy + 8}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
        <path d={arc} fill="none" stroke="#F1F5F9" strokeWidth={stroke} strokeLinecap="round" />
        <path d={arc} fill="none" stroke="url(#gaugeGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={len} strokeDashoffset={off} style={{ transition: "stroke-dashoffset .5s ease" }} />
      </svg>
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <p className="text-xl font-extrabold text-slate-900 leading-none">{label}</p>
        <p className="text-[10px] text-slate-400 font-semibold mt-1">Tasks completed</p>
      </div>
    </div>
  );
}

// ── Decorative clipboard illustration ──
function ClipboardIllustration({ className }) {
  return (
    <svg viewBox="0 0 220 180" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="120" cy="70" r="60" fill="#EEF2FF" />
      <path d="M30 44 l6 6 l10 -12" stroke="#C7D2FE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="188" cy="40" r="3" fill="#C7D2FE" />
      <circle cx="196" cy="120" r="4" fill="#DDD6FE" />
      {/* clipboard */}
      <rect x="72" y="42" width="86" height="108" rx="12" fill="#FFFFFF" stroke="#E0E7FF" strokeWidth="2" />
      <rect x="98" y="34" width="34" height="18" rx="6" fill="#4F6BFF" />
      <rect x="104" y="30" width="22" height="10" rx="5" fill="#6C63FF" />
      {/* checklist rows */}
      {[68, 90, 112].map((y, i) => (
        <React.Fragment key={y}>
          <rect x="84" y={y} width="14" height="14" rx="4" fill={i === 2 ? "#FFFFFF" : "#2BC48A"} stroke={i === 2 ? "#CBD5E1" : "none"} strokeWidth="2" />
          {i !== 2 && <path d={`M87 ${y + 7} l3 3 l5 -6`} stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
          <rect x="106" y={y + 3} width="40" height="7" rx="3.5" fill="#E2E8F0" />
        </React.Fragment>
      ))}
      {/* pencil */}
      <rect x="150" y="96" width="10" height="46" rx="4" transform="rotate(38 155 119)" fill="#FFB020" />
      <path d="M168 132 l6 10 l-11 -2 z" fill="#4F6BFF" />
      {/* plant */}
      <path d="M44 150 q-6 -22 4 -34" stroke="#2BC48A" strokeWidth="4" strokeLinecap="round" />
      <path d="M44 150 q10 -16 24 -18" stroke="#34D399" strokeWidth="4" strokeLinecap="round" />
      <rect x="34" y="150" width="26" height="18" rx="4" fill="#C7D2FE" />
      <path d="M18 168 h184" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function StaffTasksPage() {
  const staff = getStaffSession();
  const staffLoginId = staff?.loginId || staff?.login_id || staff?.staffId || "";

  // ── Server state: React Query (single source of truth, cached, deduped) ──
  const { data: tasks = [], isLoading: loading } = useStaffTasks(staffLoginId);
  const updateStatus = useUpdateTaskStatus(staffLoginId);

  // ── UI-only local state ──
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedTask, setExpandedTask] = useState(null);
  const [search, setSearch]             = useState("");
  const [sortAsc, setSortAsc]           = useState(true);
  const [msg, setMsg] = useState("");

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  // Derived from server data — never stored in state.
  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === "Pending").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    completed: tasks.filter(t => t.status === "Completed").length,
  }), [tasks]);

  // The task currently being updated (drives the per-button spinner).
  const updating = updateStatus.isPending ? updateStatus.variables?.taskId : null;

  const handleStatusUpdate = (taskId, newStatus) => {
    updateStatus.mutate(
      { taskId, status: newStatus },
      {
        onSuccess: () => showMsg(`Task marked as "${newStatus}" ✓`),
        onError: () => showMsg("Failed to update status"),
      }
    );
  };

  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed";
  const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const filtered = tasks
    .filter(t => statusFilter === "All" || t.status === statusFilter)
    .filter(t => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (t.title || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return sortAsc ? da - db : db - da;
    });

  const pct = (n) => stats.total > 0 ? Math.round((n / stats.total) * 100) : 0;
  const completionPct = pct(stats.completed);

  const upcoming = [...tasks]
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  const FILTERS = [
    { key: "All", label: "All Tasks", icon: ClipboardList },
    { key: "Pending", label: "Pending", icon: Circle },
    { key: "In Progress", label: "In Progress", icon: PlayCircle },
    { key: "Completed", label: "Completed", icon: CheckCircle },
  ];

  return (
    <StaffLayout title="My Tasks" subtitle="View and update tasks assigned to you">
      <div className="space-y-6">

        {/* Toast */}
        {msg && (
          <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl text-sm font-bold flex items-center gap-2">
            <CheckCircle size={16} /> {msg}
          </div>
        )}

        {/* Top analytics band */}
        <div className="bg-[#FAFBFF] rounded-3xl border border-slate-100 p-4 sm:p-5 flex flex-col lg:flex-row gap-5 items-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 w-full">
            <StatCard icon={ClipboardList} value={stats.total} label="Total Tasks" caption="All assigned tasks" color="#4F6BFF" />
            <StatCard icon={Clock} value={stats.pending} label="Pending" caption="Awaiting action" color="#FFB020" />
            <StatCard icon={PlayCircle} value={stats.inProgress} label="In Progress" caption="Currently in progress" color="#4F6BFF" />
            <StatCard icon={CheckCircle} value={stats.completed} label="Completed" caption="Successfully done" color="#2BC48A" />
          </div>
          <ClipboardIllustration className="hidden lg:block w-52 h-40 shrink-0" />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">

          {/* LEFT */}
          <div className="space-y-5 min-w-0">
            {/* Filter bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {FILTERS.map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setStatusFilter(key)}
                    className={`h-10 px-4 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all border ${
                      statusFilter === key ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}>
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
                    className="w-44 h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium outline-none focus:border-blue-300 transition-all" />
                </div>
                <button onClick={() => setSortAsc(s => !s)} className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-[13px] font-bold flex items-center gap-1.5 hover:border-slate-300 transition-all">
                  <ArrowUpDown size={14} /> Sort
                </button>
              </div>
            </div>

            {/* Task list */}
            {loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">Loading tasks...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 py-16 text-center shadow-sm">
                <ClipboardList size={36} className="text-slate-200 mx-auto mb-3" />
                <p className="font-bold text-slate-400">No tasks found</p>
                <p className="text-xs text-slate-300 mt-1">Tasks assigned to you will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(task => {
                  const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.Pending;
                  const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;
                  const TaskIcon = sc.icon;
                  const overdue = isOverdue(task);
                  const isExpanded = expandedTask === task._id;
                  const accent = overdue ? "rose" : sc.accent;
                  const accentHex = ACCENT_HEX[accent];
                  const isDone = task.status === "Completed";

                  return (
                    <div key={task._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-5 sm:p-6">
                        <div className="flex gap-4">
                          {/* circular icon */}
                          <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: accentHex, backgroundColor: `${accentHex}12` }}>
                            <TaskIcon size={22} style={{ color: accentHex }} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                {/* status badge */}
                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full mb-2 ${
                                  overdue ? "bg-rose-50 text-rose-600" : isDone ? "bg-emerald-50 text-emerald-600" : sc.chip
                                }`}>
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: overdue ? "#FF6B6B" : accentHex }} />
                                  {overdue ? "Overdue" : task.status}
                                </span>
                                <h3 className={`text-[17px] font-bold leading-tight ${isDone ? "text-slate-400" : "text-slate-900"}`}>{task.title}</h3>
                              </div>
                              <button onClick={() => setExpandedTask(isExpanded ? null : task._id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all shrink-0">
                                <ChevronDown size={18} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            </div>

                            {task.description && (
                              <p className="text-[13px] text-slate-500 leading-relaxed mt-1.5">{task.description}</p>
                            )}

                            {/* metadata chips */}
                            <div className="flex flex-wrap gap-2 mt-4">
                              {task.dueDate && (
                                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                                  <Calendar size={12} className="text-slate-400" /> Due: {fmtDate(task.dueDate)}
                                </span>
                              )}
                              {(task.assignedStaffName || task.assignedTo) && (
                                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                                  <User size={12} className="text-slate-400" /> Assigned to: {task.assignedStaffName || task.assignedTo}
                                </span>
                              )}
                              {task.priority && (
                                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                                  <Flag size={12} className="text-slate-400" /> Priority: {task.priority}
                                </span>
                              )}
                            </div>

                            {/* bottom chips */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${sc.chip}`}>{task.status}</span>
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
                                <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} /> {task.priority}
                              </span>
                              {task.category && (
                                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{task.category}</span>
                              )}
                            </div>

                            {/* expanded panel */}
                            {isExpanded && (
                              <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                  {task.propertyName && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                      <Building2 size={12} className="text-slate-400" /> {task.propertyName}
                                    </div>
                                  )}
                                  {task.roomNo && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                      <span className="text-slate-400 font-bold">Room</span> {task.roomNo}
                                    </div>
                                  )}
                                  {task.createdAt && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                      <Clock size={12} /> Assigned: {fmtDate(task.createdAt)}
                                    </div>
                                  )}
                                </div>

                                {task.status !== "Completed" && task.status !== "Cancelled" && (
                                  <div className="flex gap-2 flex-wrap">
                                    {task.status === "Pending" && (
                                      <button onClick={() => handleStatusUpdate(task._id, "In Progress")} disabled={updating === task._id}
                                        className="px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-60">
                                        {updating === task._id ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PlayCircle size={13} />}
                                        Start Working
                                      </button>
                                    )}
                                    {(task.status === "Pending" || task.status === "In Progress") && (
                                      <button onClick={() => handleStatusUpdate(task._id, "Completed")} disabled={updating === task._id}
                                        className="px-4 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-60">
                                        {updating === task._id ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={13} />}
                                        Mark as Completed
                                      </button>
                                    )}
                                  </div>
                                )}

                                {task.status === "Completed" && task.completedAt && (
                                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl font-bold">
                                    <CheckCircle size={13} /> Completed on {fmtDate(task.completedAt)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom banner */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/70 p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Lightbulb size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-800 font-bold text-sm">Stay on top of your tasks!</p>
                  <p className="text-slate-500 text-xs mt-0.5">Regularly update task status and keep everything organized.</p>
                </div>
              </div>
              <button onClick={() => setStatusFilter("Completed")}
                className="h-10 px-5 rounded-xl bg-blue-600 text-white text-[13px] font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shrink-0 shadow-sm shadow-blue-600/20">
                View All Completed <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* RIGHT sidebar */}
          <div className="space-y-5">
            {/* Task Overview */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 text-[15px] mb-5">Task Overview</h3>
              <div className="flex items-center gap-5">
                <DonutRing
                  centerTop={`${completionPct}%`}
                  centerSub="Completion"
                  segments={[
                    { value: stats.completed, color: "#2BC48A" },
                    { value: stats.pending, color: "#FFB020" },
                    { value: stats.inProgress, color: "#4F6BFF" },
                  ]}
                />
                <div className="flex-1 space-y-2.5">
                  {[
                    { label: "Completed", value: stats.completed, p: pct(stats.completed), color: "bg-emerald-500" },
                    { label: "Pending", value: stats.pending, p: pct(stats.pending), color: "bg-amber-500" },
                    { label: "In Progress", value: stats.inProgress, p: pct(stats.inProgress), color: "bg-blue-500" },
                    { label: "Total Tasks", value: stats.total, p: null, color: "bg-violet-500" },
                  ].map(({ label, value, p, color }) => (
                    <div key={label} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-slate-500 font-medium">{label}</span>
                      </div>
                      <span className="font-bold text-slate-800">{value}{p !== null ? ` (${p}%)` : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Today's Progress */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 text-[15px] mb-2">Today's Progress</h3>
              <div className="flex items-center gap-4">
                <SemiGauge pct={stats.total ? stats.completed / stats.total : 0} label={`${stats.completed}/${stats.total}`} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">You're doing great! ✨</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Complete remaining tasks to finish your daily goals.</p>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-[15px] flex items-center gap-2"><CalendarDays size={16} className="text-blue-500" /> Upcoming Deadlines</h3>
                <button className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">View Calendar</button>
              </div>
              {upcoming.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No upcoming deadlines</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(t => {
                    const overdue = isOverdue(t);
                    const done = t.status === "Completed";
                    return (
                      <div key={t._id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-[13px] font-bold truncate ${overdue ? "text-rose-600" : "text-slate-800"}`}>{t.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Due {fmtDate(t.dueDate)}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                          done ? "bg-emerald-50 text-emerald-600" : overdue ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {done ? "Completed" : overdue ? "Overdue" : t.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
