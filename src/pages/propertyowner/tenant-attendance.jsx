import React, { useState, useCallback, useEffect } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession, fetchOwnerTenants } from "../../utils/propertyowner";
import {
  Users, Search, MapPin, Clock, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Calendar, Loader2
} from "lucide-react";
import { apiFetch } from "../../utils/api";

const toYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Visual style per attendance status
const STATUS_STYLE = {
  Present:      { pill: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500" },
  Inside:       { pill: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500" },
  Absent:       { pill: "bg-rose-50 text-rose-600 border-rose-100", dot: "bg-rose-500" },
  Outside:      { pill: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-500" },
  "On Leave":   { pill: "bg-blue-50 text-blue-600 border-blue-100", dot: "bg-blue-500" },
  "Not Marked": { pill: "bg-slate-100 text-slate-400 border-slate-200", dot: "bg-slate-300" },
};

export default function TenantAttendancePage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") {
    window.location.href = "/propertyowner/ownerlogin";
    return null;
  }

  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(toYMD(new Date()));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const todayYMD = toYMD(new Date());
  const isToday = selectedDate === todayYMD;
  const isFuture = selectedDate > todayYMD;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const tenantsData = await fetchOwnerTenants(owner.loginId);
      const list = Array.isArray(tenantsData)
        ? tenantsData.filter(t => !t.isDeleted && t.status !== "inactive")
        : [];

      const attRes = await apiFetch(`/api/tenant-attendance/owner/${owner.loginId}?date=${selectedDate}`);
      const records = attRes?.attendance || attRes?.data || [];
      const map = {};
      records.forEach(r => { if (r.tenantId) map[String(r.tenantId)] = r; });

      setRows(list.map(t => {
        const rec = map[String(t._id)];
        return {
          id: t._id,
          name: t.name,
          room: t.roomNo || "N/A",
          loginId: t.loginId || "",
          status: rec?.status || "Not Marked",
          markedAt: rec ? new Date(rec.lastScanTime || rec.updatedAt || rec.createdAt) : null,
        };
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [owner.loginId, selectedDate]);

  useEffect(() => { load(); }, [load]);

  const shiftDay = (delta) => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + delta);
    setSelectedDate(toYMD(d));
  };

  const ownerMark = async (row, status) => {
    setSavingId(row.id);
    try {
      const data = await apiFetch("/api/tenant-attendance/update", {
        method: "POST",
        body: JSON.stringify({
          ownerLoginId: owner.loginId,
          tenantId: row.id,
          tenantName: row.name,
          roomNo: row.room,
          status,
          date: selectedDate,
        }),
      });
      if (data.success) {
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, status, markedAt: new Date() } : r));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const filtered = rows.filter(t =>
    (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.room || "").toString().includes(search)
  );

  const present = rows.filter(r => r.status === "Present" || r.status === "Inside").length;
  const absent  = rows.filter(r => r.status === "Absent" || r.status === "Outside").length;
  const leave   = rows.filter(r => r.status === "On Leave").length;
  const pending = rows.filter(r => r.status === "Not Marked").length;

  const fmtTime = (d) => d ? d.toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
  const prettyDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <PropertyOwnerLayout
      owner={owner}
      title="Residents Presence Tracker"
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Tenant Attendance</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Review the attendance your warden marked for any day, with the exact time each resident was recorded.</p>
        </div>
      </div>

      {/* Date navigator */}
      <div className="rounded-2xl border border-border bg-card shadow-soft p-4 md:p-5 mb-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Viewing attendance for</p>
              <p className="text-[15px] font-bold text-foreground mt-0.5">{prettyDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:ml-auto flex-wrap">
            <button onClick={() => shiftDay(-1)} className="h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors" title="Previous day">
              <ChevronLeft size={16} />
            </button>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                max={todayYMD}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="h-10 px-3 rounded-xl border border-border bg-card text-[13px] font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button onClick={() => shiftDay(1)} disabled={isToday || isFuture} className="h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40" title="Next day">
              <ChevronRight size={16} />
            </button>
            <button onClick={() => setSelectedDate(todayYMD)} disabled={isToday} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-bold hover:opacity-90 transition disabled:opacity-40">
              Today
            </button>
          </div>
        </div>

        {/* summary chips */}
        <div className="flex items-center gap-4 flex-wrap mt-4 pt-4 border-t border-border">
          <span className="text-[13px] font-bold text-foreground">{rows.length} Residents</span>
          <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground"><span className="w-2 h-2 rounded-full bg-emerald-500" />{present} Present</span>
          <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground"><span className="w-2 h-2 rounded-full bg-rose-500" />{absent} Absent</span>
          <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground"><span className="w-2 h-2 rounded-full bg-blue-500" />{leave} On Leave</span>
          <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground"><span className="w-2 h-2 rounded-full bg-slate-300" />{pending} Not Marked</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search residents by name or room number..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Tenant Name</th>
                <th className="px-6 py-3.5 font-semibold">Room</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold">Marked At</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-muted-foreground"><Loader2 className="size-5 animate-spin inline" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No residents found.</td></tr>
              ) : filtered.map((t) => {
                const st = STATUS_STYLE[t.status] || STATUS_STYLE["Not Marked"];
                return (
                  <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">{t.name}</td>
                    <td className="px-6 py-4 font-bold text-foreground">Room {t.room}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${st.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{fmtTime(t.markedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => ownerMark(t, "Present")}
                          disabled={savingId === t.id || isFuture || t.status === "Present"}
                          className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          {savingId === t.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Present
                        </button>
                        <button
                          onClick={() => ownerMark(t, "Absent")}
                          disabled={savingId === t.id || isFuture || t.status === "Absent"}
                          className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={12} /> Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3 pb-12">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-[14px] font-bold text-slate-700">No residents found</p>
            <p className="text-[12px] text-slate-400 mt-1">Try a different search term.</p>
          </div>
        ) : filtered.map((t) => {
          const st = STATUS_STYLE[t.status] || STATUS_STYLE["Not Marked"];
          return (
            <div key={`mob-${t.id}`} className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
              <div className="flex justify-between items-start mb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[16px] font-bold shrink-0 border border-slate-200/50">
                    {(t.name || "T")[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 leading-tight">{t.name}</h3>
                    <p className="text-[11.5px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" /> Room {t.room}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md border ${st.pill}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{t.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100/80">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Marked At</p>
                  <p className="text-[12px] font-semibold text-slate-700 leading-none flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {fmtTime(t.markedAt)}
                  </p>
                </div>
                <div className="flex gap-1.5 items-center shrink-0">
                  <button
                    onClick={() => ownerMark(t, "Present")}
                    disabled={savingId === t.id || isFuture || t.status === "Present"}
                    className="h-8 px-3 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center gap-1.5 hover:bg-emerald-100 transition-colors text-[11px] font-bold disabled:opacity-50"
                  >
                    {savingId === t.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Present
                  </button>
                  <button
                    onClick={() => ownerMark(t, "Absent")}
                    disabled={savingId === t.id || isFuture || t.status === "Absent"}
                    className="h-8 px-3 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center gap-1.5 hover:bg-rose-100 transition-colors text-[11px] font-bold disabled:opacity-50"
                  >
                    <XCircle size={12} /> Absent
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length > 0 && (
          <div className="text-center text-[12px] font-semibold text-slate-400 py-2">
            Showing {filtered.length} resident{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </PropertyOwnerLayout>
  );
}
