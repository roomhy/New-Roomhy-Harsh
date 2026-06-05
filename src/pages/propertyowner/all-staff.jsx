import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Users, Search, Plus, Trash2, Edit3, 
  CheckCircle2, AlertCircle, Phone, ArrowUpRight
} from "lucide-react";
import { apiFetch } from "../../services/api";

export default function AllStaffPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      // Fetch employees where parentLoginId is owner.loginId (assuming our API returns all or we just filter client-side for now, wait, employeeRoutes returns all by default. We should pass filter, but it's not supported via query yet. We'll filter client side for safety.)
      const data = await apiFetch('/api/employees');
      let myStaff = (data.data || []).filter(e => e.parentLoginId === owner.loginId);

      // Fetch their shifts to show duty hours
      const shiftsData = await apiFetch(`/api/hr/shifts/${owner.loginId}`);
      const shiftsMap = {};
      if (shiftsData.success) {
        shiftsData.data.forEach(sh => {
          if (sh.employeeId && sh.employeeId._id) {
             shiftsMap[sh.employeeId._id] = `${sh.startTime} - ${sh.endTime}`;
          } else if (sh.employeeId) {
             shiftsMap[sh.employeeId] = `${sh.startTime} - ${sh.endTime}`;
          }
        });
      }

      myStaff = myStaff.map(s => ({
        id: s._id,
        loginId: s.loginId,
        name: s.name,
        role: s.role,
        phone: s.phone || 'N/A',
        shift: shiftsMap[s._id] || 'Standard Hours',
        status: s.isActive ? 'Active' : 'Terminated'
      }));

      setStaff(myStaff);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (loginId, isCurrentlyActive) => {
    const action = isCurrentlyActive ? "deactivate" : "reactivate";
    if (!window.confirm(`Are you sure you want to ${action} this staff member?`)) return;
    try {
      await apiFetch(`/api/employees/${loginId}/${action}`, { method: 'POST' });
      setStaff(prev => prev.map(s => s.loginId === loginId ? { ...s, status: isCurrentlyActive ? "Terminated" : "Active" } : s));
    } catch (err) {
      console.error(`Failed to ${action}`, err);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="All Staff" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Staff Management</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage property wardens, cleaners, security personnel, and active workloads.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name or job role..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Grid of Staff */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading staff...</div>
      ) : filteredStaff.length === 0 ? (
        <div className="py-12 text-center text-slate-500">No staff members found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((s) => (
            <div key={s.id} className={`rounded-2xl border ${s.status === 'Active' ? 'border-border bg-card' : 'border-rose-100 bg-rose-50/30'} p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between`}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`size-10 rounded-xl flex items-center justify-center ${s.status === 'Active' ? 'bg-blue-500/10 text-blue-600' : 'bg-slate-500/10 text-slate-500'}`}>
                    <Users size={20} />
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                    s.status === "Active" 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                      : "bg-rose-50 text-rose-600 border border-rose-100"
                  }`}>
                    {s.status}
                  </span>
                </div>

                <div>
                  <h3 className={`font-serif text-[21px] font-bold ${s.status === 'Active' ? 'text-foreground' : 'text-slate-600 line-through'}`}>{s.name}</h3>
                  <p className="text-[12.5px] text-muted-foreground mt-0.5">{s.role}</p>
                  <p className="text-[11.5px] text-muted-foreground mt-1 flex items-center gap-1"><Phone size={11} /> {s.phone}</p>
                </div>

                <div className="border-t border-border/60 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Duty Shift Hours:</span>
                    <span className="font-medium text-foreground">{s.shift}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 mt-6 pt-4 flex gap-2">
                {s.status === "Active" ? (
                  <button 
                    onClick={() => handleToggleActive(s.loginId, true)}
                    className="flex-1 h-10 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition-all"
                  >
                    Deactivate Staff
                  </button>
                ) : (
                  <button 
                    onClick={() => handleToggleActive(s.loginId, false)}
                    className="flex-1 h-10 border border-emerald-200 hover:bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold transition-all"
                  >
                    Reactivate Staff
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
