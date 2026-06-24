import React, { useState, useEffect } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { fetchJson } from "../../utils/api";
import { cacheGet, cacheSet, cacheInvalidate } from "../../utils/cache";
import { AlertCircle, Search, Loader2 } from "lucide-react";
import { MobileEmptyState } from "../../components/propertyowner/MobileComponents";
import toast from "react-hot-toast";

const COMPLAINTS_TTL = 2 * 60 * 1000; // 2 minutes

const Pill = ({ tone="muted", children }) => {
  const t = { success:"bg-green-100 text-green-700", warning:"bg-amber-100 text-amber-700", danger:"bg-red-100 text-red-700", muted:"bg-gray-100 text-gray-600" };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ${t[tone]||t.muted}`}>{children}</span>;
};

const StatCard = ({ label, value, valueColor = "text-foreground", sub }) => (
  <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
    <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    <h3 className={`text-[28px] font-bold mt-1 ${valueColor}`}>
      {value} <span className="text-[16px] font-semibold text-muted-foreground">{sub}</span>
    </h3>
  </div>
);

export default function Complaints() {
  const owner = getOwnerRuntimeSession();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  useEffect(() => {
    const fetchData = async () => {
      const compKey = `complaints:${owner.loginId}`;
      const empKey  = `employees:${owner.loginId}`;

      // Serve cached complaints immediately
      const cachedComp = cacheGet(compKey);
      const cachedEmp  = cacheGet(empKey);
      if (cachedComp) {
        setComplaints(cachedComp);
        setLoading(false);
        if (cachedEmp) setStaffList(cachedEmp);
        return;
      }

      setLoading(true);
      try {
        const compData = await fetchJson(`/api/complaints/owner/${encodeURIComponent(owner.loginId)}`);
        const list = compData?.complaints || [];
        cacheSet(compKey, list, COMPLAINTS_TTL);
        setComplaints(list);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        toast.error("Failed to load complaints. Please refresh.");
      } finally {
        setLoading(false);
      }
      // Staff list is optional — fetch separately so failure doesn't block complaints
      try {
        if (cachedEmp) {
          setStaffList(cachedEmp);
        } else {
          const empData = await fetchJson(`/api/employees?parentLoginId=${encodeURIComponent(owner.loginId)}`);
          if (empData?.data) {
            cacheSet(empKey, empData.data, COMPLAINTS_TTL);
            setStaffList(empData.data);
          }
        }
      } catch {
        // Staff list unavailable — assign dropdown will be empty, not a blocker
      }
    };
    fetchData();
  }, [owner.loginId]);

  const updateStatus = async (id, newStatus) => {
    try {
      const data = await fetchJson(`/api/complaints/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });
      if (data?.success) {
        cacheInvalidate(`complaints:${owner.loginId}`);
        setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
        toast.success(`Complaint marked as ${newStatus}.`);
      }
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status. Please try again.");
    }
  };

  const assignStaff = async (id, staffId) => {
    try {
      const staffObj = staffList.find(s => s._id === staffId);
      const data = await fetchJson(`/api/complaints/${id}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ assignedStaffId: staffId, assignedStaffName: staffObj?.name || null })
      });
      if (data?.success) {
        cacheInvalidate(`complaints:${owner.loginId}`);
        setComplaints(prev => prev.map(c => c._id === id ? {
          ...c,
          assignedStaffId: staffId,
          assignedStaffName: staffObj?.name || null
        } : c));
        toast.success("Staff assigned.");
      }
    } catch (err) {
      console.error("Failed to assign staff", err);
      toast.error("Failed to assign staff. Please try again.");
    }
  };

  const filtered = complaints.filter(c => {
    const cStatus = (c.status || "Open").toLowerCase().replace(" ", "-");
    const matchesTab = tab === "all" || cStatus === tab || (tab === "in-progress" && cStatus === "taken");
    const term = search.toLowerCase();
    const matchesSearch = !search || 
      (c.tenantName || "").toLowerCase().includes(term) || 
      (c.category || "").toLowerCase().includes(term) ||
      (c.description || "").toLowerCase().includes(term);
    return matchesTab && matchesSearch;
  });

  return (
    <PropertyOwnerLayout owner={owner} title="Complaints" onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}>

      
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="size-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading complaints...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total" value={complaints.length} sub="Complaints" />
            <StatCard label="Open" value={complaints.filter(c=>(c.status||"Open")==="Open").length} sub="Tickets" valueColor="text-rose-600" />
            <StatCard label="In Progress" value={complaints.filter(c=>["In Progress","Taken"].includes(c.status)).length} sub="Active" valueColor="text-amber-600" />
            <StatCard label="Resolved" value={complaints.filter(c=>c.status==="Resolved").length} sub="Closed" valueColor="text-emerald-600" />
          </div>
          <div className="hidden md:flex flex-wrap items-center gap-1.5 mb-4 border-b border-border">
            {[{k:"all",l:"All"},{k:"open",l:"Open"},{k:"in-progress",l:"In Progress"},{k:"resolved",l:"Resolved"}].map(({k,l}) => (
              <button key={k} onClick={()=>setTab(k)} className={`px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${tab===k?"border-primary text-foreground":"border-transparent text-muted-foreground hover:text-foreground"}`}>{l}</button>
            ))}
          </div>

          <div className="relative mb-4">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search complaints…" className="w-full h-10 pl-9 pr-3 rounded-lg bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"/>
          </div>
          <div className="w-full">
            {/* Desktop Table */}
            <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead><tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                  <th className="px-4 py-3 font-semibold">Tenant</th>
                  <th className="px-4 py-3 font-semibold">Room</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Assigned To</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                     <tr><td colSpan="7" className="px-4 py-8 text-center text-muted-foreground">No complaints found.</td></tr>
                  ) : filtered.map(c => (
                    <tr key={c._id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {c.tenantName}
                        {c.escalated && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">ESCALATED</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.roomNo}</td>
                      <td className="px-4 py-3 text-foreground">{c.category}</td>
                      <td className="px-4 py-3">
                        <Pill tone={(c.priority||"Low")==="High"?"danger":(c.priority==="Medium"?"warning":"muted")}>{c.priority}</Pill>
                      </td>
                      <td className="px-4 py-3">
                        <Pill tone={c.status==="Resolved"?"success":(c.status==="Open"?"danger":"warning")}>{c.status}</Pill>
                      </td>
                      <td className="px-4 py-3">
                        {c.status !== "Resolved" ? (
                          <select 
                            value={c.assignedStaffId || ""} 
                            onChange={(e) => assignStaff(c._id, e.target.value)}
                            className="bg-muted border border-border text-[11px] rounded px-2 py-1 outline-none"
                          >
                            <option value="">-- Assign Staff --</option>
                            {staffList.map(s => <option key={s._id} value={s._id}>{s.name} ({s.role})</option>)}
                          </select>
                        ) : (
                          <span className="text-[11.5px] font-medium text-muted-foreground">{c.assignedStaffName || "Unassigned"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.status === "Open" && (
                           <button onClick={() => updateStatus(c._id, "In Progress")} className="text-[11px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded">Mark In-Progress</button>
                        )}
                        {(c.status === "In Progress" || c.status === "Taken") && (
                           <button onClick={() => updateStatus(c._id, "Resolved")} className="text-[11px] font-medium text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded mt-1">Mark Resolved</button>
                        )}
                        {c.status === "Resolved" && (
                           <button onClick={() => updateStatus(c._id, "Open")} className="text-[11px] font-medium text-amber-600 hover:text-amber-800 bg-amber-50 px-2 py-1 rounded mt-1">Mark Unresolved</button>
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
              {filtered.length === 0 ? (
                <MobileEmptyState
                  icon={AlertCircle}
                  title="No Complaints"
                  description="Great! There are no complaints matching your criteria."
                  actionText="Refresh"
                  onAction={() => window.location.reload()}
                />
              ) : filtered.map(c => (
                <div key={`mob-${c._id}`} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] relative overflow-hidden">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                       <h3 className="text-[16px] font-black text-slate-900">{c.tenantName}</h3>
                       <p className="text-[11.5px] font-semibold text-slate-500 mt-0.5">Room {c.roomNo} · {c.category}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                       <span className={`inline-flex px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                         c.status === "Resolved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                         c.status === "Open" ? "bg-rose-50 text-rose-600 border-rose-100" :
                         "bg-amber-50 text-amber-600 border-amber-100"
                       }`}>
                         {c.status}
                       </span>
                       {c.escalated && <span className="inline-flex px-2 py-0.5 rounded text-[8.5px] font-bold uppercase text-rose-600 bg-rose-50 border border-rose-100">Escalated</span>}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
                    <p className="text-[12px] font-medium text-slate-700 italic">"{c.description || "No description provided."}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                       <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                         (c.priority||"Low")==="High"?"bg-red-100 text-red-700":(c.priority==="Medium"?"bg-amber-100 text-amber-700":"bg-gray-100 text-gray-600")
                       }`}>{c.priority}</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 w-full">Assigned</p>
                       {c.status !== "Resolved" ? (
                         <select 
                           value={c.assignedStaffId || ""} 
                           onChange={(e) => assignStaff(c._id, e.target.value)}
                           className="bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 rounded-lg px-2 py-1 outline-none w-full max-w-[120px]"
                         >
                           <option value="">Unassigned</option>
                           {staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                         </select>
                       ) : (
                         <span className="text-[12px] font-bold text-slate-700">{c.assignedStaffName || "Unassigned"}</span>
                       )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                     {c.status === "Open" && (
                        <button onClick={() => updateStatus(c._id, "In Progress")} className="flex-1 py-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-wider hover:bg-blue-100 transition-colors">Start Work</button>
                     )}
                     {(c.status === "In Progress" || c.status === "Taken") && (
                        <button onClick={() => updateStatus(c._id, "Resolved")} className="flex-1 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors">Mark Resolved</button>
                     )}
                     {c.status === "Resolved" && (
                        <button onClick={() => updateStatus(c._id, "Open")} className="flex-1 py-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 transition-colors">Reopen</button>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </PropertyOwnerLayout>
  );
}
