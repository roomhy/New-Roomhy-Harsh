import React, { useState, useEffect, useCallback } from "react";
import StaffLayout from "../../components/StaffLayout";
import {
  CheckCircle2, Clock, LogIn, LogOut, Calendar, AlertCircle,
  ChevronLeft, ChevronRight, Loader2, History, Users, UserCheck, UserX
} from "lucide-react";

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
  const [leaveForm, setLeaveForm]     = useState({ leaveType: "Sick Leave", leaveReason: "", date: new Date().toISOString().split("T")[0] });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [historyMonth, setHistoryMonth] = useState(new Date().getMonth() + 1);
  const [historyYear, setHistoryYear]   = useState(new Date().getFullYear());

  // ── TENANT ATTENDANCE STATE ──
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [tenantDate, setTenantDate] = useState(new Date().toISOString().split("T")[0]);
  const [tenantAttMap, setTenantAttMap] = useState({}); // { loginId: "Present"|"Absent" }
  const [markingTenant, setMarkingTenant] = useState({});
  const [tenantMsg, setTenantMsg] = useState("");

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
      const res = await fetch(`/api/hr/my-attendance/${staffLoginId}?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`);
      const data = await res.json();
      const records = data?.data || [];
      const todayStr = new Date().toISOString().split("T")[0];
      const todayRec = records.find(r => r.date && new Date(r.date).toISOString().split("T")[0] === todayStr);
      setTodayRecord(todayRec || null);
      setHistory(records);
    } catch (_) {}
    finally { setLoadingToday(false); }
  }, [staffLoginId]);

  const fetchHistory = useCallback(async () => {
    if (!staffLoginId) return;
    try {
      const res = await fetch(`/api/hr/my-attendance/${staffLoginId}?month=${historyMonth}&year=${historyYear}`);
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
      const res = await fetch(`/api/tenants/owner/${parentLoginId}`);
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
      const res = await fetch(`/api/tenant-attendance?ownerLoginId=${parentLoginId}&date=${tenantDate}`);
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
      const res = await fetch("/api/tenant-attendance", {
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

  // ── CHECK IN / OUT ──
  const handleCheckIn = async () => {
    if (!staffLoginId) { showMsg("Staff session not found. Please login again.", "error"); return; }
    setCheckInLoading(true);
    try {
      const res = await fetch("/api/hr/checkin", {
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
      const res = await fetch("/api/hr/checkout", {
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
      await fetch("/api/hr/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeLoginId: staffLoginId,
          ownerLoginId: parentLoginId,
          date: leaveForm.date,
          status: "Leave",
          leaveType: leaveForm.leaveType,
          leaveReason: leaveForm.leaveReason,
        }),
      });
      showMsg("Leave request submitted ✓");
      setShowLeaveForm(false);
      fetchToday();
    } catch (_) { showMsg("Failed to submit leave", "error"); }
    finally { setLeaveSubmitting(false); }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const present = history.filter(r => r.status === "Present" || r.status === "Late").length;
  const absent  = history.filter(r => r.status === "Absent").length;
  const leaves  = history.filter(r => r.status === "Leave" || r.status === "Half Day").length;
  const attPct  = history.length > 0 ? Math.round((present / history.length) * 100) : 0;

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
          <div className="space-y-6 max-w-3xl">
            {/* Today Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Today</p>
                  <p className="text-3xl font-black mt-1">{timeStr}</p>
                  <p className="text-blue-200 text-sm font-medium mt-0.5">{dateStr}</p>
                </div>
                <div className="text-right">
                  {todayRecord ? (
                    <div className={`inline-block text-[10px] font-black px-3 py-1 rounded-full border ${STATUS_STYLES[todayRecord.status]?.bg || "bg-white/20 text-white border-white/20"}`}>
                      {todayRecord.status}
                    </div>
                  ) : (
                    <div className="inline-block text-[10px] font-black px-3 py-1 rounded-full bg-white/20 text-white border border-white/20">Not Marked</div>
                  )}
                </div>
              </div>

              {todayRecord && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "Check In", value: todayRecord.checkIn || "—", icon: LogIn },
                    { label: "Check Out", value: todayRecord.checkOut || "Pending", icon: LogOut },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm border border-white/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={12} className="text-blue-200" />
                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">{label}</p>
                      </div>
                      <p className="text-lg font-black text-white">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleCheckIn} disabled={checkInLoading || !!todayRecord?.checkIn}
                  className="flex-1 h-12 bg-white text-blue-700 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                  {checkInLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                  {todayRecord?.checkIn ? "Checked In ✓" : "Check In"}
                </button>
                <button onClick={handleCheckOut} disabled={checkOutLoading || !todayRecord?.checkIn || !!todayRecord?.checkOut}
                  className="flex-1 h-12 bg-white/20 text-white border border-white/30 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm">
                  {checkOutLoading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  {todayRecord?.checkOut ? "Checked Out ✓" : "Check Out"}
                </button>
              </div>
            </div>

            {/* Leave Request */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-800 text-sm">Apply for Leave</h3>
                <button onClick={() => setShowLeaveForm(!showLeaveForm)} className="text-xs font-black text-blue-600 hover:underline">{showLeaveForm ? "Cancel" : "+ Apply"}</button>
              </div>
              {showLeaveForm && (
                <form onSubmit={handleLeaveRequest} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Leave Type</label>
                      <select value={leaveForm.leaveType} onChange={e => setLeaveForm(f => ({ ...f, leaveType: e.target.value }))}
                        className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 bg-white">
                        {["Sick Leave", "Casual Leave", "Emergency Leave"].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
                      <input type="date" value={leaveForm.date} onChange={e => setLeaveForm(f => ({ ...f, date: e.target.value }))}
                        className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Reason</label>
                    <textarea value={leaveForm.leaveReason} onChange={e => setLeaveForm(f => ({ ...f, leaveReason: e.target.value }))}
                      placeholder="Reason for leave..." rows={2} required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 resize-none" />
                  </div>
                  <button type="submit" disabled={leaveSubmitting}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {leaveSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Submit Leave Request
                  </button>
                </form>
              )}
            </div>

            {/* Monthly Summary */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Present", value: present, color: "bg-emerald-500" },
                { label: "Absent", value: absent, color: "bg-rose-500" },
                { label: "Leaves", value: leaves, color: "bg-blue-500" },
                { label: "Attendance %", value: `${attPct}%`, color: "bg-indigo-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${color} mx-auto mb-2`} />
                  <p className="text-lg font-black text-slate-900">{value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>

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
          <div className="space-y-5 max-w-3xl">
            {/* Date Picker */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
              <Calendar size={18} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Select Date</p>
                <input type="date" value={tenantDate} onChange={e => setTenantDate(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:border-blue-400" />
              </div>
              <div className="ml-auto text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenants</p>
                <p className="text-xl font-black text-slate-800">{tenants.length}</p>
              </div>
            </div>

            {/* Toast */}
            {tenantMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2">
                <CheckCircle2 size={14} />{tenantMsg}
              </div>
            )}

            {/* Tenant List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2"><Users size={16} className="text-blue-500" /> Tenant Attendance List</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Mark Present or Absent for each tenant</p>
              </div>

              {loadingTenants ? (
                <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-blue-400" /></div>
              ) : tenants.length === 0 ? (
                <div className="py-12 text-center">
                  <Users size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-bold">No active tenants found</p>
                  <p className="text-slate-300 text-xs mt-1">Tenants will appear here once added by the owner</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {tenants.map(tenant => {
                    const loginId = tenant.loginId || tenant._id;
                    const currentStatus = tenantAttMap[loginId];
                    const isMarking = markingTenant[loginId];
                    const initials = (tenant.name || "T").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

                    return (
                      <div key={loginId} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm shrink-0">
                          {initials}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 text-sm truncate">{tenant.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">
                            {tenant.roomNo ? `Room ${tenant.roomNo}` : ""}
                            {tenant.roomNo && tenant.phone ? " · " : ""}
                            {tenant.phone || ""}
                          </p>
                        </div>

                        {/* Status + Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {currentStatus && (
                            <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${STATUS_STYLES[currentStatus]?.bg || ""}`}>
                              {currentStatus}
                            </span>
                          )}
                          <button
                            onClick={() => markTenantAttendance(tenant, "Present")}
                            disabled={isMarking || currentStatus === "Present"}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${currentStatus === "Present" ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"} disabled:opacity-50`}
                            title="Mark Present">
                            {isMarking ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                          </button>
                          <button
                            onClick={() => markTenantAttendance(tenant, "Absent")}
                            disabled={isMarking || currentStatus === "Absent"}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${currentStatus === "Absent" ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"} disabled:opacity-50`}
                            title="Mark Absent">
                            {isMarking ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
