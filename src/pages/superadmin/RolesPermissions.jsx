import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, Users, Search, Filter, 
  ChevronRight, Save, RotateCcw, X, 
  UserPlus, ShieldAlert, CheckCircle2, 
  Activity, Lock, Edit3, Trash2
} from "lucide-react";
import { fetchJson, getAuthHeader } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const allPermissions = [
  { id: "dashboard", label: "Dashboard" },
  { id: "home", label: "Home" },
  { id: "user_management", label: "User Management" },
  { id: "property_management", label: "Property Management" },
  { id: "accounting", label: "Accounting" },
  { id: "chat_management", label: "Chat Management" },
  { id: "report_analytics", label: "Report & Analytics" },
  { id: "booking_leads", label: "Booking & Leads" },
  { id: "review", label: "Review" },
  { id: "support", label: "Support" },
  { id: "crm", label: "CRM" },
  { id: "subscription_control", label: "Subscription Control" },
  { id: "settings", label: "Settings" }
];

export default function RolesPermissions() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Matrix Edit State
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedPerms, setSelectedPerms] = useState(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetchJson("/api/employees", { headers: getAuthHeader() });
      if (res.success) setEmployees(res.data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const openMatrix = (staff) => {
    setEditingStaff(staff);
    setSelectedPerms(new Set(staff.permissions || []));
  };

  const togglePermission = (id) => {
    const next = new Set(selectedPerms);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPerms(next);
  };

  const savePermissions = async () => {
    if (!editingStaff) return;
    setSaving(true);
    try {
      const res = await fetchJson(`/api/employees/${editingStaff.loginId}`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({ permissions: Array.from(selectedPerms) })
      });
      if (res.success) {
        setEmployees(prev => prev.map(e => e.loginId === editingStaff.loginId ? res.data : e));
        setEditingStaff(null);
      }
    } catch (err) {
      alert("Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.loginId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">Roles & Permissions</h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <p className="text-sm font-bold text-slate-400 max-w-2xl">Manage staff access levels and define operational boundaries. Assign specific modules to personnel based on their administrative roles.</p>
         <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search staff by name or ID..."
              className="w-full bg-white border border-slate-100 pl-12 pr-6 py-4 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
            />
         </div>
      </div>

      {/* Staff Grid/Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
               <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                     <th className="px-10 py-8">Personnel Identity</th>
                     <th className="px-6 py-8">Designated Role</th>
                     <th className="px-6 py-8">Active Access Modules</th>
                     <th className="px-10 py-8 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan="4" className="px-10 py-20 text-center text-slate-400 font-bold uppercase text-[10px]">Synchronizing Access Records...</td></tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr><td colSpan="4" className="px-10 py-20 text-center text-slate-400 font-bold uppercase text-[10px]">No staff records found</td></tr>
                  ) : filteredEmployees.map((e) => (
                    <tr key={e.loginId} className="group hover:bg-slate-50/50 transition-all">
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-white group-hover:shadow-md transition-all">
                                {e.name[0]}
                             </div>
                             <div>
                                <p className="text-base font-bold text-slate-800">{e.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{e.loginId}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-8">
                          <span className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl">
                             {e.role === "Custom" ? e.customRole || "Custom Access" : e.role}
                          </span>
                       </td>
                       <td className="px-6 py-8 max-w-md">
                          <div className="flex flex-wrap gap-2">
                             {(e.permissions || []).length === 0 ? (
                               <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest italic opacity-60">No access granted</span>
                             ) : e.permissions.map(p => {
                               const label = allPermissions.find(ap => ap.id === p)?.label || p;
                               return (
                                 <span key={p} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-tight rounded-lg border border-blue-100/50">
                                    {label}
                                 </span>
                               );
                             })}
                          </div>
                       </td>
                       <td className="px-10 py-8 text-right">
                          <button 
                            onClick={() => openMatrix(e)}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-600 border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all shadow-sm"
                          >
                             <ShieldCheck className="w-4 h-4" /> Update Matrix
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Permission Matrix Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/40 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                 <div>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Access Control Matrix</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel: <span className="text-blue-600">{editingStaff.name}</span> ({editingStaff.loginId})</p>
                 </div>
                 <button onClick={() => setEditingStaff(null)} className="p-3 rounded-2xl bg-white text-slate-400 hover:text-rose-600 transition-all shadow-sm border border-slate-100">
                    <X size={20} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-200">
                          <ShieldCheck size={20} />
                       </div>
                       <h4 className="text-lg font-bold text-slate-800 tracking-tight">Module Authority Definition</h4>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setSelectedPerms(new Set(allPermissions.map(p => p.id)))} className="text-[10px] font-bold text-emerald-600 uppercase hover:underline">Grant All</button>
                       <button onClick={() => setSelectedPerms(new Set())} className="text-[10px] font-bold text-slate-400 uppercase hover:underline">Revoke All</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allPermissions.map((perm) => {
                       const active = selectedPerms.has(perm.id);
                       return (
                          <div 
                            key={perm.id}
                            onClick={() => togglePermission(perm.id)}
                            className={cn(
                               "p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                               active 
                                 ? "bg-blue-50 border-blue-100 shadow-md ring-4 ring-blue-50/50" 
                                 : "bg-white border-slate-50 hover:border-slate-100 hover:bg-slate-50/50"
                            )}
                          >
                             <div className="flex items-center gap-4">
                                <div className={cn(
                                   "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                   active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-white"
                                )}>
                                   {active ? <CheckCircle2 size={18} /> : <Lock size={18} />}
                                </div>
                                <span className={cn("text-xs font-bold uppercase tracking-tight", active ? "text-blue-700" : "text-slate-500")}>{perm.label}</span>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>

              <div className="px-10 py-8 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-4">
                 <button onClick={() => setEditingStaff(null)} className="px-8 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-white transition-all">Cancel Audit</button>
                 <button 
                   onClick={savePermissions}
                   disabled={saving}
                   className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                 >
                    {saving ? "Commiting..." : "Update Governance Matrix"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
