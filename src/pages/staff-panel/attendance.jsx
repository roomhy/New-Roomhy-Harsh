import React, { useState, useEffect, useCallback } from "react";
import StaffLayout from "../../components/StaffLayout";
import {
  CheckCircle2, Clock, LogIn, LogOut, Calendar, AlertCircle,
  ChevronLeft, ChevronRight, ChevronDown, Loader2, History, Users, UserCheck, UserX,
  X, Send, Search, SlidersHorizontal, MoreVertical, Download, Check, Zap
} from "lucide-react";
import { getApiBase, getAuthHeader } from "../../utils/api";

const apiBase = getApiBase();

const STATUS_STYLES = {
  Present:    { bg: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  Absent:     { bg: "bg-rose-100 text-rose-700 border-rose-200" },
  "Half Day": { bg: "bg-amber-100 text-amber-700 border-amber-200" },
  Leave:      { bg: "bg-blue-100 text-blue-700 border-blue-200" },
  Late:       { bg: "bg-orange-100 text-orange-700 border-orange-200" },
};

function getStaffSession() {
  try {
    const raw = sessionStorage.getItem("staff_session") || localStorage.getItem("staff_session");
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

const DURATIONS = ["Full Day", "Half Day", "Custom"];

function ProgressRing({ pct, size = 128, stroke = 11 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#10B981" strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

// One isometric building block (front + right side + top faces)
function IsoBlock({ x, y, w, h, front, side, top }) {
  const dx = 22, dy = -12;
  const topPts = `${x},${y} ${x + w},${y} ${x + w + dx},${y + dy} ${x + dx},${y + dy}`;
  const sidePts = `${x + w},${y} ${x + w + dx},${y + dy} ${x + w + dx},${y + dy + h} ${x + w},${y + h}`;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={front} />
      <polygon points={sidePts} fill={side} />
      <polygon points={topPts} fill={top} />
    </g>
  );
}

// Premium isometric cityscape illustration for the attendance hero
function AttendanceBuildingIllustration({ className }) {
  return (
    <svg viewBox="0 0 300 220" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* soft circular backdrop */}
      <circle cx="205" cy="118" r="116" fill="#F5F3FF" />

      {/* clouds */}
      <g fill="#EDE9FE">
        <circle cx="238" cy="54" r="11" /><circle cx="251" cy="50" r="14" /><circle cx="265" cy="55" r="10" />
        <rect x="238" y="52" width="28" height="12" rx="6" />
        <circle cx="104" cy="46" r="8" /><circle cx="116" cy="43" r="11" /><circle cx="127" cy="47" r="7" />
        <rect x="104" y="44" width="24" height="9" rx="4.5" />
      </g>

      {/* birds */}
      <path d="M196 46 q5 -5 10 0 q5 -5 10 0" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />
      <path d="M220 36 q4 -4 8 0 q4 -4 8 0" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />

      {/* ground shadow */}
      <ellipse cx="172" cy="203" rx="122" ry="8" fill="#EDE9FE" opacity="0.7" />

      {/* ── building A (tall, back center) ── */}
      <IsoBlock x={150} y={78} w={48} h={122} front="#EDE9FE" side="#C4B5FD" top="#F5F3FF" />
      {[90, 110, 130, 150].map((wy) => (
        <React.Fragment key={wy}>
          <rect x="158" y={wy} width="12" height="14" rx="2" fill="#6366F1" />
          <rect x="178" y={wy} width="12" height="14" rx="2" fill="#6366F1" />
        </React.Fragment>
      ))}

      {/* ── building C (right) ── */}
      <IsoBlock x={206} y={112} w={32} h={88} front="#E9E5FF" side="#C4B5FD" top="#F5F3FF" />
      {[124, 146, 168].map((wy) => (
        <rect key={wy} x="214" y={wy} width="16" height="14" rx="2" fill="#818CF8" />
      ))}

      {/* ── building B (short, front left) ── */}
      <IsoBlock x={96} y={128} w={50} h={72} front="#DDD6FE" side="#C4B5FD" top="#EDE9FE" />
      {[142, 164].map((wy) => (
        <React.Fragment key={wy}>
          <rect x="104" y={wy} width="12" height="14" rx="2" fill="#6366F1" />
          <rect x="124" y={wy} width="12" height="14" rx="2" fill="#6366F1" />
        </React.Fragment>
      ))}
      <rect x="112" y="180" width="18" height="20" rx="2" fill="#4F46E5" />

      {/* trees */}
      <g>
        <rect x="64" y="168" width="5" height="24" rx="2" fill="#C4B5FD" />
        <circle cx="66" cy="164" r="17" fill="#DDD6FE" />
        <circle cx="58" cy="170" r="11" fill="#C4B5FD" />
      </g>
      <g>
        <rect x="252" y="172" width="5" height="22" rx="2" fill="#C4B5FD" />
        <circle cx="254" cy="167" r="15" fill="#DDD6FE" />
      </g>
      <g>
        <rect x="140" y="186" width="4" height="16" rx="2" fill="#C4B5FD" />
        <circle cx="142" cy="183" r="10" fill="#C4B5FD" />
      </g>
    </svg>
  );
}

function LeaveModal({ form, setForm, onClose, onSubmit, submitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[24px] shadow-2xl border border-slate-100 w-full max-w-[820px] p-8">
        <div className="flex items-start justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Calendar size={19} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Apply for Leave</h3>
              <p className="text-xs text-slate-400 mt-1">Fill in the details to apply for leave</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Leave Type</label>
              <select
                value={form.leaveType}
                onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 bg-white"
              >
                {["Sick Leave", "Casual Leave", "Emergency Leave"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Duration</label>
            <div className="grid grid-cols-3 gap-3">
              {DURATIONS.map(d => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setForm(f => ({ ...f, duration: d }))}
                  className={`h-11 rounded-xl text-sm font-bold border transition-all ${
                    form.duration === d
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Reason</label>
            <textarea
              value={form.leaveReason}
              onChange={e => setForm(f => ({ ...f, leaveReason: e.target.value.slice(0, 250) }))}
              placeholder="Reason for leave..."
              rows={3}
              required
              maxLength={250}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 resize-none"
            />
            <p className="text-right text-[11px] text-slate-300 font-semibold mt-1">{form.leaveReason.length}/250</p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-xl transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Submit Leave Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Multi-segment donut ring for the tenant attendance summary
function DonutRing({ segments, total, size = 168, stroke = 16 }) {
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
          const dash = `${len} ${c - len}`;
          const el = (
            <circle
              key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={dash} strokeDashoffset={-offset}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-extrabold text-slate-900 leading-none">{total}</p>
        <p className="text-[11px] text-slate-400 font-semibold mt-1">Total Tenants</p>
      </div>
    </div>
  );
}

// Front-facing building illustration for the purple tenant hero (white / translucent)
function TenantHeroBuilding({ className }) {
  return (
    <svg viewBox="0 0 320 190" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="95" r="105" fill="#FFFFFF" fillOpacity="0.06" />
      <path d="M150 34 q6 -6 12 0 q6 -6 12 0" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      <path d="M214 24 q5 -5 10 0 q5 -5 10 0" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />

      {/* left low building */}
      <rect x="70" y="112" width="46" height="66" rx="3" fill="#FFFFFF" fillOpacity="0.18" />
      {[120, 138, 156].map(y => (
        <React.Fragment key={y}>
          <rect x="78" y={y} width="10" height="10" rx="2" fill="#FFFFFF" fillOpacity="0.4" />
          <rect x="98" y={y} width="10" height="10" rx="2" fill="#FFFFFF" fillOpacity="0.4" />
        </React.Fragment>
      ))}

      {/* main tall building */}
      <rect x="118" y="58" width="78" height="120" rx="3" fill="#FFFFFF" fillOpacity="0.9" />
      {[70, 90, 110, 130, 150].map(y => (
        <React.Fragment key={y}>
          <rect x="128" y={y} width="12" height="12" rx="2" fill="#6366F1" />
          <rect x="147" y={y} width="12" height="12" rx="2" fill="#6366F1" />
          <rect x="166" y={y} width="12" height="12" rx="2" fill="#6366F1" />
        </React.Fragment>
      ))}
      <rect x="146" y="160" width="20" height="18" rx="2" fill="#4F46E5" />

      {/* right medium building */}
      <rect x="198" y="88" width="52" height="90" rx="3" fill="#FFFFFF" fillOpacity="0.28" />
      {[98, 118, 138, 158].map(y => (
        <React.Fragment key={y}>
          <rect x="207" y={y} width="11" height="11" rx="2" fill="#FFFFFF" fillOpacity="0.55" />
          <rect x="228" y={y} width="11" height="11" rx="2" fill="#FFFFFF" fillOpacity="0.55" />
        </React.Fragment>
      ))}

      {/* trees */}
      <g fill="#FFFFFF" fillOpacity="0.22">
        <circle cx="52" cy="150" r="15" /><rect x="49.5" y="150" width="5" height="28" rx="2" />
        <circle cx="270" cy="150" r="14" /><rect x="267.5" y="150" width="5" height="28" rx="2" />
        <circle cx="290" cy="160" r="10" />
      </g>

      {/* ground line */}
      <path d="M40 178 L300 178" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function StaffAttendancePage() {
  const staff = getStaffSession();
  const staffLoginId = staff?.loginId || "";
  const parentLoginId = staff?.parentLoginId || "";

  // Tab: "mine" | "tenants"
  const [tab, setTab] = useState("mine");

  // ── MY ATTENDANCE STATE ──
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory]         = useState([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm]     = useState({ leaveType: "Sick Leave", leaveReason: "", date: new Date().toISOString().split("T")[0], duration: "Full Day" });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [summaryPeriod, setSummaryPeriod] = useState("month"); // "week" | "month"
  const [historyMonth, setHistoryMonth] = useState(new Date().getMonth() + 1);
  const [historyYear, setHistoryYear]   = useState(new Date().getFullYear());

  // ── TENANT ATTENDANCE STATE ──
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [tenantDate, setTenantDate] = useState(new Date().toISOString().split("T")[0]);
  const [tenantAttMap, setTenantAttMap] = useState({}); // { loginId: "Present"|"Absent" }
  const [markingTenant, setMarkingTenant] = useState({});
  const [tenantMsg, setTenantMsg] = useState("");
  const [tenantSearch, setTenantSearch] = useState("");
  const [bulkMarking, setBulkMarking] = useState(false);

  const [msg, setMsg] = useState({ text: "", type: "" });
  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  // ── MY ATTENDANCE FETCHES ──
  const fetchToday = useCallback(async () => {
    if (!staffLoginId) return;
    setLoadingToday(true);
    try {
      const res = await fetch(`${apiBase}/api/hr/my-attendance/${staffLoginId}?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`);
      const data = await res.json();
      const records = data?.data || [];
      const toLocalYMD = (d) => {
        if (!d) return "";
        const date = new Date(d);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      };
      const todayRec = records.find(r => r.date && toLocalYMD(r.date) === toLocalYMD(new Date()));
      setTodayRecord(todayRec || null);
      setHistory(records);
    } catch (_) {}
    finally { setLoadingToday(false); }
  }, [staffLoginId]);

  const fetchHistory = useCallback(async () => {
    if (!staffLoginId) return;
    try {
      const res = await fetch(`${apiBase}/api/hr/my-attendance/${staffLoginId}?month=${historyMonth}&year=${historyYear}`);
      const data = await res.json();
      setHistory(data?.data || []);
    } catch (_) {}
  }, [staffLoginId, historyMonth, historyYear]);

  useEffect(() => { fetchToday(); }, [fetchToday]);
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── TENANT LIST FETCH ──
  const fetchTenants = useCallback(async () => {
    if (!parentLoginId) return;
    setLoadingTenants(true);
    try {
      // Use the correct owner-scoped endpoint
      const res = await fetch(`${apiBase}/api/tenants/owner/${parentLoginId}`, { headers: getAuthHeader() });
      const data = await res.json();
      // Response: array or { tenants: [...] } or { data: [...] }
      const list = Array.isArray(data) ? data : (data?.tenants || data?.data || []);
      // Only show active (non-deleted) tenants
      setTenants(list.filter(t => !t.isDeleted && t.status !== 'inactive'));
    } catch (_) {}
    finally { setLoadingTenants(false); }
  }, [parentLoginId]);

  // Fetch tenant attendance for selected date
  const fetchTenantAtt = useCallback(async () => {
    if (!parentLoginId || !tenantDate) return;
    try {
      const res = await fetch(`${apiBase}/api/tenant-attendance?ownerLoginId=${parentLoginId}&date=${tenantDate}`);
      const data = await res.json();
      const records = data?.data || data || [];
      const map = {};
      records.forEach(r => { if (r.tenantLoginId) map[r.tenantLoginId] = r.status; });
      setTenantAttMap(map);
    } catch (_) {}
  }, [parentLoginId, tenantDate]);

  useEffect(() => {
    if (tab === "tenants") {
      fetchTenants();
      fetchTenantAtt();
    }
  }, [tab, fetchTenants, fetchTenantAtt]);

  useEffect(() => { if (tab === "tenants") fetchTenantAtt(); }, [tenantDate, fetchTenantAtt]);

  const markTenantAttendance = async (tenant, status) => {
    const loginId = tenant.loginId || tenant._id;
    setMarkingTenant(m => ({ ...m, [loginId]: true }));
    try {
      const res = await fetch(`${apiBase}/api/tenant-attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantLoginId: loginId,
          tenantName: tenant.name,
          ownerLoginId: parentLoginId,
          markedBy: staffLoginId,
          date: tenantDate,
          status,
        }),
      });
      const data = await res.json();
      if (data.success !== false) {
        setTenantAttMap(m => ({ ...m, [loginId]: status }));
        setTenantMsg(`${tenant.name} — ${status} ✓`);
        setTimeout(() => setTenantMsg(""), 2000);
      }
    } catch (_) {}
    finally { setMarkingTenant(m => ({ ...m, [loginId]: false })); }
  };

  // ── QUICK ACTIONS ──
  const markAllTenants = async (status) => {
    if (bulkMarking || tenants.length === 0) return;
    setBulkMarking(true);
    try {
      await Promise.all(tenants.map(t => markTenantAttendance(t, status)));
      setTenantMsg(`All tenants marked ${status} ✓`);
      setTimeout(() => setTenantMsg(""), 2000);
    } finally { setBulkMarking(false); }
  };

  const exportTenantReport = () => {
    const rows = [["Name", "Room", "Tenant ID", "Status", "Date"]];
    tenants.forEach(t => {
      const lid = t.loginId || t._id;
      rows.push([t.name || "", t.roomNo || "", lid, tenantAttMap[lid] || "Not Marked", tenantDate]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tenant-attendance-${tenantDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── CHECK IN / OUT ──
  const handleCheckIn = async () => {
    if (!staffLoginId) { showMsg("Staff session not found. Please login again.", "error"); return; }
    setCheckInLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/hr/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffLoginId }),
      });
      const data = await res.json();
      if (data.success) {
        setTodayRecord(data.data);
        showMsg(`Checked in at ${data.checkInTime} ✓`);
      } else {
        showMsg(data.error || "Check-in failed", "error");
      }
    } catch (_) { showMsg("Failed to check in", "error"); }
    finally { setCheckInLoading(false); }
  };

  const handleCheckOut = async () => {
    if (!staffLoginId) return;
    setCheckOutLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/hr/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffLoginId }),
      });
      const data = await res.json();
      if (data.success) {
        setTodayRecord(data.data);
        showMsg(`Checked out at ${data.checkOutTime} ✓`);
      } else {
        showMsg(data.error || "Check-out failed", "error");
      }
    } catch (_) { showMsg("Failed to check out", "error"); }
    finally { setCheckOutLoading(false); }
  };

  const handleLeaveRequest = async (e) => {
    e.preventDefault();
    if (!staffLoginId) return;
    setLeaveSubmitting(true);
    try {
      await fetch(`${apiBase}/api/hr/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeLoginId: staffLoginId,
          ownerLoginId: parentLoginId,
          date: leaveForm.date,
          status: "Leave",
          leaveType: leaveForm.leaveType,
          leaveReason: leaveForm.leaveReason,
          leaveDuration: leaveForm.duration,
        }),
      });
      showMsg("Leave request submitted ✓");
      setShowLeaveForm(false);
      setLeaveForm(f => ({ ...f, leaveReason: "" }));
      fetchToday();
    } catch (_) { showMsg("Failed to submit leave", "error"); }
    finally { setLeaveSubmitting(false); }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  // Attendance Summary card — derived client-side from the already-fetched month `history`
  const summarySource = summaryPeriod === "week"
    ? history.filter(r => {
        if (!r.date) return false;
        const d = new Date(r.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 6);
        return d >= new Date(weekAgo.toDateString()) && d <= now;
      })
    : history;
  const presentDays = summarySource.filter(r => r.status === "Present" || r.status === "Late").length;
  const absentDays  = summarySource.filter(r => r.status === "Absent").length;
  const halfDays    = summarySource.filter(r => r.status === "Half Day").length;
  const leaveDays   = summarySource.filter(r => r.status === "Leave").length;
  const totalDays   = summarySource.length;
  const ringPct     = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Recent Activity feed — built from real check-in/out + leave records, most recent first
  const recentActivities = [
    ...(todayRecord?.checkOut ? [{ icon: LogOut, label: "Checked Out", time: `Today, ${todayRecord.checkOut}` }] : []),
    ...(todayRecord?.checkIn ? [{ icon: LogIn, label: "Checked In", time: `Today, ${todayRecord.checkIn}` }] : []),
    ...history
      .filter(r => r.status === "Leave" && r.date)
      .slice(0, 3)
      .map(r => ({
        icon: Calendar,
        label: "Leave Applied",
        time: new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      })),
  ].slice(0, 4);

  // ── TENANT TAB derived data ──
  const tenantStatusOf = (t) => tenantAttMap[t.loginId || t._id];
  const filteredTenants = tenants.filter(t => {
    const q = tenantSearch.trim().toLowerCase();
    if (!q) return true;
    return (t.name || "").toLowerCase().includes(q) ||
      (t.roomNo || "").toString().toLowerCase().includes(q) ||
      (t.loginId || t._id || "").toString().toLowerCase().includes(q);
  });
  const tPresent   = tenants.filter(t => tenantStatusOf(t) === "Present").length;
  const tAbsent    = tenants.filter(t => tenantStatusOf(t) === "Absent").length;
  const tLeave     = tenants.filter(t => { const s = tenantStatusOf(t); return s === "Leave" || s === "On Leave"; }).length;
  const tMarked    = tenants.filter(t => !!tenantStatusOf(t)).length;
  const tPending   = tenants.length - tMarked;

  return (
    <StaffLayout title="Attendance" subtitle="Your attendance & tenant check-in management">
      <div className="space-y-6">

        {/* Toast */}
        {msg.text && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2 ${msg.type === "error" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}>
            {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {msg.text}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
          {[
            { key: "mine", label: "My Attendance", icon: Clock },
            { key: "tenants", label: "Tenant Attendance", icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${tab === key ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* ──────── MY ATTENDANCE TAB ──────── */}
        {tab === "mine" && (
          <div className="space-y-6 max-w-[1400px] mx-auto">
            {/* Attendance Hero */}
            <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-100 shadow-xl shadow-slate-200/60 p-6 sm:p-8">
              {/* decorative gradient blobs */}
              <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 opacity-[0.12] blur-3xl pointer-events-none" />

              {/* building illustration — large, bleeding to the right edge */}
              <AttendanceBuildingIllustration className="hidden md:block absolute right-0 top-1/2 -translate-y-[60%] w-[380px] lg:w-[440px] h-auto pointer-events-none" />

              <div className="relative z-10 flex items-center gap-8 flex-wrap">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Today</p>
                  <p className="text-4xl font-extrabold text-slate-900 mt-2 leading-none">{timeStr}</p>
                  <p className="text-sm text-slate-500 font-medium mt-2.5">{dateStr}</p>
                  <div className={`inline-flex items-center gap-1.5 mt-3.5 px-3 py-1 rounded-full border text-xs font-bold ${STATUS_STYLES[todayRecord?.status]?.bg || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {todayRecord?.status || "Not Marked"}
                  </div>
                </div>

                <div className="hidden sm:block w-px self-stretch bg-slate-200/70 my-1" />

                <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="bg-emerald-50 rounded-2xl px-5 py-4 flex-1 sm:flex-none sm:min-w-[148px]">
                    <div className="flex items-center gap-1.5 text-emerald-600 mb-1.5">
                      <LogIn size={13} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Check In</p>
                    </div>
                    <p className="text-lg font-extrabold text-slate-900">{todayRecord?.checkIn || "—"}</p>
                  </div>
                  <div className="bg-rose-50 rounded-2xl px-5 py-4 flex-1 sm:flex-none sm:min-w-[148px]">
                    <div className="flex items-center gap-1.5 text-rose-500 mb-1.5">
                      <LogOut size={13} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Check Out</p>
                    </div>
                    <p className="text-lg font-extrabold text-slate-900">{todayRecord?.checkOut || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Bottom status bar */}
              <div className="relative z-10 mt-8 bg-slate-50 rounded-2xl px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <CheckCircle2 size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Attendance Status</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {todayRecord?.checkOut ? "You have checked out for today" : todayRecord?.checkIn ? "You are checked in" : "You have not checked in yet"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap w-full sm:w-auto">
                  <button onClick={() => setShowLeaveForm(true)}
                    className="h-11 px-5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold flex items-center gap-2 hover:bg-slate-100 transition-all">
                    <Calendar size={15} /> Apply for Leave
                  </button>
                  <button onClick={handleCheckIn} disabled={checkInLoading || !!todayRecord?.checkIn}
                    className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-60">
                    {checkInLoading ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
                    {todayRecord?.checkIn ? "Checked In" : "Check In"}
                    {!!todayRecord?.checkIn && <CheckCircle2 size={15} />}
                  </button>
                  <button onClick={handleCheckOut} disabled={checkOutLoading || !todayRecord?.checkIn || !!todayRecord?.checkOut}
                    className="h-11 px-6 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold flex items-center gap-2 hover:bg-slate-100 transition-all disabled:opacity-50">
                    {checkOutLoading ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                    {todayRecord?.checkOut ? "Checked Out" : "Check Out"}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity + Attendance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col">
                <h3 className="font-bold text-slate-900 text-base mb-4">Recent Activity</h3>
                {recentActivities.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <p className="text-sm text-slate-400 font-medium">No activity yet today</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {recentActivities.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 py-3 first:pt-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <a.icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold text-slate-800">{a.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-slate-900 text-base">Attendance Summary</h3>
                  <div className="relative">
                    <select
                      value={summaryPeriod}
                      onChange={e => setSummaryPeriod(e.target.value)}
                      className="appearance-none text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg pl-3 pr-7 py-1.5 outline-none cursor-pointer"
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="relative shrink-0">
                    <ProgressRing pct={ringPct} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-lg font-extrabold text-slate-900 leading-none">{presentDays}/{totalDays || 0}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">Days Present</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5">
                    {[
                      { label: "Present Days", value: presentDays, color: "bg-emerald-500" },
                      { label: "Absent Days", value: absentDays, color: "bg-rose-500" },
                      { label: "Half Days", value: halfDays, color: "bg-amber-500" },
                      { label: "Leave Days", value: leaveDays, color: "bg-blue-500" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
                          <span className="text-slate-500 font-medium">{label}</span>
                        </div>
                        <span className="font-bold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {showLeaveForm && (
              <LeaveModal
                form={leaveForm}
                setForm={setLeaveForm}
                onClose={() => setShowLeaveForm(false)}
                onSubmit={handleLeaveRequest}
                submitting={leaveSubmitting}
              />
            )}

            {/* History */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2"><History size={16} className="text-blue-500" /> Attendance History</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => { const d = new Date(historyYear, historyMonth - 2, 1); setHistoryMonth(d.getMonth() + 1); setHistoryYear(d.getFullYear()); }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"><ChevronLeft size={14} className="text-slate-500" /></button>
                  <span className="text-xs font-bold text-slate-600">
                    {new Date(historyYear, historyMonth - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  </span>
                  <button onClick={() => { const d = new Date(historyYear, historyMonth, 1); setHistoryMonth(d.getMonth() + 1); setHistoryYear(d.getFullYear()); }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"><ChevronRight size={14} className="text-slate-500" /></button>
                </div>
              </div>
              <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                {history.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">No records for this month</div>
                ) : history.map(r => {
                  const sc = STATUS_STYLES[r.status];
                  return (
                    <div key={r._id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-black text-slate-800 text-xs">{new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {r.checkIn ? `In: ${r.checkIn}` : ""}{r.checkIn && r.checkOut ? " · " : ""}{r.checkOut ? `Out: ${r.checkOut}` : ""}
                          {!r.checkIn && !r.checkOut && (r.leaveType || "")}
                        </p>
                      </div>
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${sc?.bg || "bg-slate-100 text-slate-400 border-slate-200"}`}>{r.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ──────── TENANT ATTENDANCE TAB ──────── */}
        {tab === "tenants" && (
          <div className="space-y-5 max-w-[1400px] mx-auto">
            {/* Tenant Hero */}
            <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-violet-500/25">
              <div className="absolute right-0 top-0 w-1/2 h-full bg-white/5 [clip-path:ellipse(70%_120%_at_100%_50%)] pointer-events-none" />
              <TenantHeroBuilding className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 w-[420px] lg:w-[480px] h-auto pointer-events-none" />

              <div className="relative z-10 flex items-center gap-5 flex-wrap">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Calendar size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-indigo-100 uppercase tracking-widest">Select Date</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-3xl font-extrabold leading-none">
                      {new Date(tenantDate).toLocaleDateString("en-GB").replace(/\//g, "/")}
                    </p>
                    <label className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 transition-all flex items-center justify-center cursor-pointer relative">
                      <Calendar size={16} />
                      <input type="date" value={tenantDate} onChange={e => setTenantDate(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer" />
                    </label>
                  </div>
                  <p className="text-sm text-indigo-100 font-medium mt-2">
                    {new Date(tenantDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>

                <div className="ml-auto text-right relative z-10">
                  <p className="text-[11px] font-bold text-indigo-100 uppercase tracking-widest">Tenants</p>
                  <p className="text-5xl font-extrabold mt-1 leading-none">{tenants.length}</p>
                  <p className="text-xs text-indigo-100 font-medium mt-1">Total</p>
                </div>
              </div>
            </div>

            {/* Toast */}
            {tenantMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2">
                <CheckCircle2 size={14} />{tenantMsg}
              </div>
            )}

            {/* Workspace grid */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start">
              {/* ── Tenant Attendance List workspace ── */}
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                {/* toolbar */}
                <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-5 border-b border-slate-50 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <Users size={18} className="text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-base leading-tight truncate">Tenant Attendance List</h3>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">Mark Present or Absent for each tenant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={tenantSearch}
                        onChange={e => setTenantSearch(e.target.value)}
                        placeholder="Search tenant..."
                        className="w-full sm:w-52 h-9 pl-9 pr-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:border-indigo-300 focus:bg-white transition-all"
                      />
                    </div>
                    <button className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all shrink-0" title="Filter">
                      <SlidersHorizontal size={15} />
                    </button>
                  </div>
                </div>

                {/* column headers (desktop only) */}
                <div className="hidden md:grid md:grid-cols-[1fr_100px_130px_110px] gap-4 px-6 py-3 bg-slate-50/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Tenant</span>
                  <span>Room</span>
                  <span>Status</span>
                  <span className="text-right">Actions</span>
                </div>

                {loadingTenants ? (
                  <div className="py-16 flex justify-center"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>
                ) : filteredTenants.length === 0 ? (
                  <div className="py-16 text-center">
                    <Users size={32} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-bold">{tenantSearch ? "No tenants match your search" : "No active tenants found"}</p>
                    {!tenantSearch && <p className="text-slate-300 text-xs mt-1">Tenants will appear here once added by the owner</p>}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {filteredTenants.map(tenant => {
                      const loginId = tenant.loginId || tenant._id;
                      const currentStatus = tenantAttMap[loginId];
                      const isMarking = markingTenant[loginId];
                      const initials = (tenant.name || "T").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

                      return (
                        <div key={loginId} className="flex md:grid md:grid-cols-[1fr_100px_130px_110px] items-center gap-3 md:gap-4 px-4 sm:px-6 py-3.5 hover:bg-slate-50/70 transition-colors">
                          {/* Tenant */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 text-sm truncate">{tenant.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">
                                <span className="md:hidden">{tenant.roomNo ? `Room ${tenant.roomNo} · ` : ""}</span>ID: {loginId}
                              </p>
                            </div>
                          </div>

                          {/* Room (desktop column) */}
                          <span className="hidden md:block text-sm text-slate-600 font-medium truncate">{tenant.roomNo ? `Room ${tenant.roomNo}` : "—"}</span>

                          {/* Status */}
                          <div className="hidden sm:block shrink-0">
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                              currentStatus === "Present" ? "bg-emerald-50 text-emerald-600"
                              : currentStatus === "Absent" ? "bg-rose-50 text-rose-600"
                              : "bg-slate-100 text-slate-400"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${currentStatus === "Present" ? "bg-emerald-500" : currentStatus === "Absent" ? "bg-rose-500" : "bg-slate-300"}`} />
                              {currentStatus || "Not Marked"}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-1.5 shrink-0">
                            <button
                              onClick={() => markTenantAttendance(tenant, "Present")}
                              disabled={isMarking || currentStatus === "Present"}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentStatus === "Present" ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"} disabled:opacity-60`}
                              title="Mark Present">
                              {isMarking ? <Loader2 size={14} className="animate-spin" /> : <Check size={15} />}
                            </button>
                            <button
                              onClick={() => markTenantAttendance(tenant, "Absent")}
                              disabled={isMarking || currentStatus === "Absent"}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentStatus === "Absent" ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-100"} disabled:opacity-60`}
                              title="Mark Absent">
                              {isMarking ? <Loader2 size={14} className="animate-spin" /> : <UserX size={15} />}
                            </button>
                            <button className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-slate-400 hover:bg-slate-100 transition-all" title="More">
                              <MoreVertical size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* footer bar */}
                {tenants.length > 0 && (
                  <div className="flex items-center gap-4 px-6 py-4 bg-slate-50/60 border-t border-slate-50 flex-wrap">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                      <Users size={15} className="text-indigo-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{tenants.length} Total Tenants</span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{tPresent} Present</span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />{tAbsent} Absent</span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" />{tPending} Pending</span>
                    <button onClick={() => setTab("mine")} className="ml-auto text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                      <History size={13} /> View History
                    </button>
                  </div>
                )}
              </div>

              {/* ── Right column ── */}
              <div className="space-y-5">
                {/* Attendance Summary */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Users size={16} className="text-indigo-500" /> Attendance Summary
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                      <Calendar size={12} /> Today
                    </div>
                  </div>

                  <div className="flex items-center justify-center mb-6">
                    <DonutRing
                      total={tenants.length}
                      segments={[
                        { value: tPresent, color: "#10B981" },
                        { value: tAbsent, color: "#F43F5E" },
                        { value: tLeave, color: "#F59E0B" },
                        { value: tPending, color: "#6366F1" },
                      ]}
                    />
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Present", value: tPresent, color: "bg-emerald-500" },
                      { label: "Absent", value: tAbsent, color: "bg-rose-500" },
                      { label: "On Leave", value: tLeave, color: "bg-amber-500" },
                      { label: "Not Marked", value: tPending, color: "bg-indigo-500" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full ${color}`} />
                          <span className="text-sm text-slate-500 font-medium">{label}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-5">
                    <Zap size={16} className="text-indigo-500" /> Quick Actions
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => markAllTenants("Present")}
                      disabled={bulkMarking || tenants.length === 0}
                      className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 transition-all disabled:opacity-50">
                      {bulkMarking ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      <span className="text-[11px] font-bold text-center leading-tight">Mark All<br />Present</span>
                    </button>
                    <button
                      onClick={() => markAllTenants("Absent")}
                      disabled={bulkMarking || tenants.length === 0}
                      className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 transition-all disabled:opacity-50">
                      {bulkMarking ? <Loader2 size={18} className="animate-spin" /> : <UserX size={18} />}
                      <span className="text-[11px] font-bold text-center leading-tight">Mark All<br />Absent</span>
                    </button>
                    <button
                      onClick={exportTenantReport}
                      disabled={tenants.length === 0}
                      className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 transition-all disabled:opacity-50">
                      <Download size={18} />
                      <span className="text-[11px] font-bold text-center leading-tight">Export<br />Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
