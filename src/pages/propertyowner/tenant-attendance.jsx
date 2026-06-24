import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession, fetchOwnerTenants } from "../../utils/propertyowner";
import { 
  Users, Search, ShieldCheck, MapPin, 
  Clock, CheckCircle2, PlayCircle, LogIn, LogOut
} from "lucide-react";
import { apiFetch } from "../../utils/api";

export default function TenantAttendancePage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    syncAndFetchAttendance();
  }, [owner.loginId]);

  const syncAndFetchAttendance = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch active tenants
      const tenantsData = await fetchOwnerTenants(owner.loginId);
      
      if (Array.isArray(tenantsData)) {
          const activeTenants = tenantsData.map(t => ({
             id: t._id,
             name: t.name,
             room: t.roomNo || "N/A"
          }));

          // 2. Sync attendance
          await apiFetch('/api/tenant-attendance/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ownerLoginId: owner.loginId, tenants: activeTenants })
          });
      }

      // 3. Fetch attendance records
      const attData = await apiFetch(`/api/tenant-attendance/owner/${owner.loginId}`);
      
      if (attData.success && attData.attendance) {
          setTenants(attData.attendance.map(a => ({
             id: a.tenantId, // Use tenantId for the toggle mapping
             name: a.tenantName,
             room: a.roomNo,
             status: a.status,
             lastScan: a.lastScanTime ? new Date(a.lastScanTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "N/A"
          })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, nextStatus) => {
    try {
      const tenant = tenants.find(t => t.id === id);
      if (!tenant) return;

      const data = await apiFetch('/api/tenant-attendance/update', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            ownerLoginId: owner.loginId,
            tenantId: id,
            tenantName: tenant.name,
            roomNo: tenant.room,
            status: nextStatus
         })
      });
      if (data.success) {
         setTenants(prev => prev.map(t => t.id === id ? { 
           ...t, 
           status: nextStatus,
           lastScan: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
         } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.room.includes(search)
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Residents Presence Tracker" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Tenant Attendance</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor who is inside the hostel, track late check-outs, and review leave applications.</p>
        </div>
      </div>

      {/* Toolbar */}
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
                <th className="px-6 py-3.5 font-semibold">Last Gate Activity</th>
                <th className="px-6 py-3.5 font-semibold">Current State</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading attendance data...</td></tr>
              ) : filteredTenants.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No tenants found.</td></tr>
              ) : filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{t.name}</td>
                  <td className="px-6 py-4 font-bold text-foreground">Room {t.room}</td>
                  <td className="px-6 py-4 text-muted-foreground">{t.lastScan}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      t.status === "Inside" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : t.status === "Outside" 
                        ? "bg-amber-50 text-amber-600 border-amber-100" 
                        : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {t.status !== "Inside" && (
                      <button 
                        onClick={() => handleStatusToggle(t.id, "Inside")}
                        className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                      >
                        <LogIn size={12} /> Check-In
                      </button>
                    )}
                    {t.status === "Inside" && (
                      <button 
                        onClick={() => handleStatusToggle(t.id, "Outside")}
                        className="inline-flex items-center gap-1 h-8 px-3 border border-border rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <LogOut size={12} /> Check-Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3 pb-12">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-[14px] font-bold text-slate-700">No tenants found</p>
            <p className="text-[12px] text-slate-400 mt-1">Try a different search term.</p>
          </div>
        ) : filteredTenants.map((t) => (
          <div key={`mob-${t.id}`} className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm relative overflow-hidden">
            
            {/* Header: Avatar + Name + Room + Status Badge */}
            <div className="flex justify-between items-start mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[16px] font-bold shrink-0 border border-slate-200/50 shadow-inner">
                  {(t.name || "T")[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 leading-tight">{t.name}</h3>
                  <p className="text-[11.5px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-slate-400" /> Room {t.room}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                t.status === "Inside"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                  : t.status === "Outside"
                  ? "bg-amber-50 text-amber-600 border-amber-100/50"
                  : "bg-blue-50 text-blue-600 border-blue-100/50"
              }`}>
                {t.status === "Inside" ? "● Inside" : t.status === "Outside" ? "● Outside" : t.status}
              </span>
            </div>

            {/* Footer: Last Scan + Action Buttons */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100/80">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Last Activity</p>
                <p className="text-[12px] font-semibold text-slate-700 leading-none flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> {t.lastScan || "No activity"}
                </p>
              </div>

              <div className="flex gap-1.5 items-center shrink-0">
                {t.status !== "Inside" && (
                  <button
                    onClick={() => handleStatusToggle(t.id, "Inside")}
                    className="h-8 px-3.5 rounded-full bg-emerald-50 border border-emerald-100/50 text-emerald-700 flex items-center gap-1.5 hover:bg-emerald-100 transition-colors text-[11px] font-bold"
                  >
                    <LogIn size={12} /> Check-In
                  </button>
                )}
                {t.status === "Inside" && (
                  <button
                    onClick={() => handleStatusToggle(t.id, "Outside")}
                    className="h-8 px-3.5 rounded-full bg-amber-50 border border-amber-100/50 text-amber-700 flex items-center gap-1.5 hover:bg-amber-100 transition-colors text-[11px] font-bold"
                  >
                    <LogOut size={12} /> Check-Out
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && filteredTenants.length > 0 && (
          <div className="text-center text-[12px] font-semibold text-slate-400 py-2">
            Showing {filteredTenants.length} resident{filteredTenants.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </PropertyOwnerLayout>
  );
}
