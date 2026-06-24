import React, { useMemo, useState, useEffect, useCallback } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import {
  UserCheck, UserX, Clock, Calendar, CheckCircle2, AlertCircle,
  Search, Filter, Plus, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { apiFetch } from "../../utils/api";
import { cacheGet, cacheSet, cacheInvalidate } from "../../utils/cache";

const STATUS_STYLES = {
  Present:   { bg: "bg-emerald-100 text-emerald-700 border-emerald-200",  dot: "bg-emerald-500" },
  Absent:    { bg: "bg-rose-100 text-rose-700 border-rose-200",          dot: "bg-rose-500" },
  "Half Day":{ bg: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-500" },
  Leave:     { bg: "bg-blue-100 text-blue-700 border-blue-200",          dot: "bg-blue-500" },
  Late:      { bg: "bg-orange-100 text-orange-700 border-orange-200",    dot: "bg-orange-500" },
};

export default function StaffAttendancePage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") {
    window.location.href = "/propertyowner/ownerlogin";
    return null;
  }

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split("T")[0]);
  const [staff, setStaff]           = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [markModal, setMarkModal]   = useState(null);
  const [markForm, setMarkForm]     = useState({ status: "Present", checkIn: "", checkOut: "", notes: "" });
  const [saving, setSaving]         = useState(false);

  const fetchData = useCallback(async () => {
    const EMP_KEY = `employees:${owner.loginId}`;
    const ATT_KEY = `attendance:${owner.loginId}`;
    const cachedEmp = cacheGet(EMP_KEY);
    const cachedAtt = cacheGet(ATT_KEY);
    if (cachedEmp && cachedAtt) {
      setStaff(cachedEmp);
      setAttendance(cachedAtt);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [staffRes, attRes] = await Promise.allSettled([
        cachedEmp ? Promise.resolve({ data: cachedEmp }) : apiFetch(`/api/employees?parentLoginId=${owner.loginId}&isActive=true`),
        cachedAtt ? Promise.resolve({ data: cachedAtt }) : apiFetch(`/api/hr/attendance/${owner.loginId}`),
      ]);

      const allStaff = staffRes.status === "fulfilled" ? staffRes.value?.data || [] : [];
      const allAtt = attRes.status === "fulfilled" ? attRes.value?.data || [] : [];
      setStaff(allStaff);
      setAttendance(allAtt);
      if (!cachedEmp) cacheSet(EMP_KEY, allStaff, 3 * 60 * 1000);
      if (!cachedAtt) cacheSet(ATT_KEY, allAtt, 2 * 60 * 1000);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [owner.loginId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const dateAtt = useMemo(() => attendance.filter(a => {
    const d = new Date(a.date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}` === selectedDate;
  }), [attendance, selectedDate]);

  const attMap = useMemo(() => {
    const m = {};
    dateAtt.forEach(a => {
      const empId = a.employeeId?._id || a.employeeId;
      if (empId) m[String(empId)] = a;
    });
    return m;
  }, [dateAtt]);

  const staffWithAtt = useMemo(() => staff.map(s => ({
    ...s,
    attendance: attMap[String(s._id)] || null,
  })), [staff, attMap]);

  const filtered = useMemo(() => staffWithAtt.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.role?.toLowerCase().includes(search.toLowerCase())
  ), [staffWithAtt, search]);

  const stats = useMemo(() => ({
    total: staff.length,
    present: dateAtt.filter(a => a.status === "Present" || a.status === "Late").length,
    absent: dateAtt.filter(a => a.status === "Absent").length,
    leave: dateAtt.filter(a => a.status === "Leave" || a.status === "Half Day").length,
    notMarked: staff.length - dateAtt.length,
  }), [staff, dateAtt]);

  const handleMark = async () => {
    setSaving(true);
    try {
      await apiFetch("/api/hr/attendance", {
        method: "POST",
        body: JSON.stringify({
          employeeId: markModal._id,
          ownerLoginId: owner.loginId,
          date: selectedDate,
          status: markForm.status,
          checkIn: markForm.checkIn,
          checkOut: markForm.checkOut,
          notes: markForm.notes,
        }),
      });
      cacheInvalidate(`attendance:`);
      await fetchData();
      setMarkModal(null);
    } catch (err) { alert("Failed: " + err.message); }
    finally { setSaving(false); }
  };

  const changeDate = (dir) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  return (
    <PropertyOwnerLayout
      owner={owner}
      title="Staff Attendance"
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Attendance</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Track daily check-ins, check-outs, and leaves</p>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
          <ChevronLeft size={18} className="text-slate-500" />
        </button>
        <div className="text-center">
          <p className="font-black text-slate-900 text-base">
            {new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="mt-1 text-xs text-blue-600 font-bold outline-none cursor-pointer hover:underline bg-transparent"
          />
        </div>
        <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-100 rounded-xl transition-all" disabled={selectedDate >= today.toISOString().split("T")[0]}>
          <ChevronRight size={18} className={`text-slate-500 ${selectedDate >= today.toISOString().split("T")[0] ? "opacity-30" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Total Staff", value: stats.total, color: "bg-slate-700", icon: UserCheck },
          { label: "Present", value: stats.present, color: "bg-emerald-500", icon: CheckCircle2 },
          { label: "Absent", value: stats.absent, color: "bg-rose-500", icon: UserX },
          { label: "On Leave", value: stats.leave, color: "bg-blue-500", icon: Calendar },
          { label: "Not Marked", value: stats.notMarked, color: "bg-amber-400", icon: AlertCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400" />
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Member</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check In</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check Out</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm font-medium">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm font-medium">No staff found</td></tr>
              ) : filtered.map(s => {
                const att = s.attendance;
                const sc = STATUS_STYLES[att?.status] || null;
                return (
                  <tr key={s._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-black text-sm overflow-hidden">
                          {s.photoDataUrl ? <img src={s.photoDataUrl} alt={s.name} className="w-full h-full object-cover" /> : s.name?.[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-[13px]">{s.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{s.loginId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold text-slate-600">{s.role}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {att ? (
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${sc?.bg}`}>{att.status}</span>
                      ) : (
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full border bg-slate-100 text-slate-400 border-slate-200">Not Marked</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold text-slate-600">{att?.checkIn || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold text-slate-600">{att?.checkOut || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => { setMarkModal(s); setMarkForm({ status: att?.status || "Present", checkIn: att?.checkIn || "", checkOut: att?.checkOut || "", notes: att?.notes || "" }); }}
                        className="px-3 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-black transition-all border border-blue-200"
                      >
                        {att ? "Edit" : "Mark"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Modal */}
      {markModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900">Mark Attendance</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{markModal.name} — {new Date(selectedDate).toLocaleDateString("en-IN")}</p>
              </div>
              <button onClick={() => setMarkModal(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Attendance Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Present", "Absent", "Late", "Half Day", "Leave"].map(s => (
                    <button key={s} type="button" onClick={() => setMarkForm(f => ({ ...f, status: s }))}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${markForm.status === s ? "bg-blue-600 border-blue-600 text-white shadow-md" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Check In Time</label>
                  <input type="time" value={markForm.checkIn} onChange={e => setMarkForm(f => ({ ...f, checkIn: e.target.value }))}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Check Out Time</label>
                  <input type="time" value={markForm.checkOut} onChange={e => setMarkForm(f => ({ ...f, checkOut: e.target.value }))}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Notes</label>
                <input type="text" value={markForm.notes} onChange={e => setMarkForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional note..." className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setMarkModal(null)} className="flex-1 h-11 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={handleMark} disabled={saving}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={14} />}
                  Save Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
