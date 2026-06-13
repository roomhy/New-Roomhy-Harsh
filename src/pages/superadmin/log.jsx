import React, { useState, useEffect } from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, RefreshCw,
  LayoutGrid, ShieldCheck, Fingerprint, Check, X,
  Eye, ShieldAlert, Activity, CreditCard, Download,
  Smartphone, Monitor, AlertCircle, Sparkles,
  BarChart3, Layers, Database, Lock
} from "lucide-react";
import { fetchAuditLogs } from "../../utils/api";
import useSEO from "../../hooks/useSEO";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function Log() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  useSEO({
    title: "Governance Ledger - Roomhy Super Admin",
    description: "Track system actions, admin configurations, review moderations and payouts audit trail.",
    canonical: "https://roomhy.com/superadmin/log"
  });

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetchAuditLogs();
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.actorId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.module?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPayloadValue = (val) => {
    if (val === undefined || val === null) return "N/A";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  // Helper to extract old/new values from different types of payloads
  const getOldAndNewValues = (log) => {
    const payload = log.payload || {};
    let oldVal = payload.oldValue;
    let newVal = payload.newValue;

    // Settings split fallback
    if (log.module === "Settings" && payload.commission_percentage !== undefined) {
      oldVal = "Previous Configuration";
      newVal = `Commission Split: ${payload.commission_percentage}%`;
    }
    // Review moderation fallback
    if (log.module === "Reviews" && payload.status !== undefined) {
      newVal = `Moderated status to: ${payload.status}`;
    }
    // Lead mapping fallback
    if (log.module === "Chats" && payload.mappedLeadId !== undefined) {
      newVal = `Mapped to Lead ID: ${payload.mappedLeadId}`;
    }

    return {
      oldValue: formatPayloadValue(oldVal),
      newValue: formatPayloadValue(newVal)
    };
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Governance Ledger</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Integrity & Global Administrative Audit Pulse</p>
         </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={loadLogs}
              className="bg-white text-slate-400 border border-slate-100 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
            >
               <RefreshCw className="w-3.5 h-3.5" /> Refresh Trails
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Audit Count" value={logs.length.toString()} trend="Total Logs" up icon={Layers} color="indigo" />
        <StatCardHorizontal label="Active Modules" value="6 Tracked" trend="Commission, Payout, Tickets" up icon={ShieldCheck} color="blue" />
        <StatCardHorizontal label="System Status" value="Healthy" trend="Pulse Online" up icon={Activity} color="emerald" />
        <StatCardHorizontal label="Access Level" value="Super Admin" trend="Full Access" up icon={Lock} color="amber" />
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Audit Trail Intelligence</h3>
            <div className="flex items-center gap-3">
               <div className="relative group w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input 
                    placeholder="Search trails..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" 
                  />
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            {filteredLogs.length === 0 ? (
               <div className="py-12 text-center text-xs font-bold text-slate-400 bg-slate-50/50 rounded-xl">
                  No Data Available
               </div>
            ) : (
               <table className="w-full text-left text-[11px] font-semibold text-slate-700">
                  <thead>
                     <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                        <th className="pb-4">Admin Identity</th>
                        <th className="pb-4">Entity / Module</th>
                        <th className="pb-4">Action Description</th>
                        <th className="pb-4 text-center">Timestamp</th>
                        <th className="pb-4 text-center">Old Value</th>
                        <th className="pb-4 text-center">New Value</th>
                        <th className="pb-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredLogs.map((l, i) => {
                       const { oldValue, newValue } = getOldAndNewValues(l);
                       return (
                         <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                            <td className="py-3">
                               <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs bg-indigo-600 shadow-indigo-50 shrink-0">
                                     {l.actorId ? l.actorId.charAt(0).toUpperCase() : 'A'}
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[120px]">{l.actorId || 'Super Admin'}</p>
                                     <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest truncate">{l.actorRole || 'admin'}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="py-3">
                               <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 uppercase tracking-widest shadow-sm">
                                  {l.module}
                               </span>
                            </td>
                            <td className="py-3 text-slate-800 max-w-[200px] truncate">
                               {l.action}
                            </td>
                            <td className="py-3 text-center text-slate-400">
                               {l.createdAt ? new Date(l.createdAt).toLocaleString() : 'N/A'}
                            </td>
                            <td className="py-3 text-center text-slate-500 max-w-[150px] truncate font-mono text-[10px]">
                               {oldValue}
                            </td>
                            <td className="py-3 text-center text-indigo-600 max-w-[150px] truncate font-mono text-[10px]">
                               {newValue}
                            </td>
                            <td className="py-3 text-right">
                               <button 
                                 onClick={() => setSelectedLog(l)}
                                 className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm"
                               >
                                  <Eye className="w-3.5 h-3.5" />
                               </button>
                            </td>
                         </tr>
                       );
                     })}
                  </tbody>
               </table>
            )}
         </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-slate-100 shadow-2xl relative">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                   <Shield className="size={20}" />
                </div>
                <div>
                   <h3 className="text-base font-bold text-slate-900">Audit Trail Detail</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Governance Log Record</p>
                </div>
             </div>

             <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Actor</p>
                      <p className="bg-slate-50 rounded-xl px-4 py-2 font-bold">{selectedLog.actorId || 'Super Admin'} ({selectedLog.actorRole})</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Entity / Module</p>
                      <p className="bg-slate-50 rounded-xl px-4 py-2 font-bold">{selectedLog.module}</p>
                   </div>
                </div>

                <div>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Action</p>
                   <p className="bg-slate-50 rounded-xl px-4 py-2.5 font-bold">{selectedLog.action}</p>
                </div>

                <div>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                   <p className="bg-slate-50 rounded-xl px-4 py-2 font-mono">{selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : 'N/A'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">HTTP Request</p>
                      <p className="bg-slate-50 rounded-xl px-4 py-2 font-mono uppercase text-indigo-600">{selectedLog.method} {selectedLog.path}</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Network Identity</p>
                      <p className="bg-slate-50 rounded-xl px-4 py-2 font-mono">{selectedLog.ip || 'Local Connection'}</p>
                   </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payload Details</p>
                   <div className="bg-slate-50 rounded-2xl p-4 font-mono text-[10px] max-h-48 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(selectedLog.payload, null, 2)}</pre>
                   </div>
                </div>
             </div>

             <div className="flex justify-end mt-6">
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="bg-indigo-600 text-white rounded-xl px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all"
                >
                   Close Details
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCardHorizontal({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { 
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", 
    blue: "bg-blue-50 text-blue-600 border-blue-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    amber: "bg-amber-50 text-amber-600 border-amber-100" 
  };
  
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md flex items-start gap-3 group hover:translate-y-[-2px] transition-all">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105", bgColors[color])}>
         <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none truncate">{label}</p>
         <p className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">{value}</p>
         <div className="text-[7px] font-bold uppercase text-slate-400">
            {trend}
         </div>
      </div>
    </div>
  );
}
