import React, { useEffect, useMemo, useState } from "react";
import { 
  Wallet, Clock, CheckCircle2, AlertCircle, ArrowUpRight, 
  ArrowDownRight, ChevronRight, Search, Filter, 
  MoreVertical, Download, Plus, Calendar, DollarSign,
  FileText, Activity, ShieldCheck, CreditCard,
  Sparkles, Layers, Box, Globe2, IndianRupee,
  Inbox, ImageIcon, Save, RefreshCw, Info,
  Smartphone, Monitor, Banknote, Bell, Sheet, Loader2
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { fetchJson, getAuthHeader } from "../../utils/api";
import * as XLSX from 'xlsx';

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function RentHistory() {
  const [tenants, setTenants] = useState([]);
  const [rents, setRents] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantRes, rentRes, ownerRes] = await Promise.all([
        fetchJson("/api/tenants"),
        fetchJson("/api/rents"),
        fetchJson("/api/owners")
      ]);
      
      const tList = Array.isArray(tenantRes) ? tenantRes : (tenantRes.tenants || []);
      const rList = Array.isArray(rentRes) ? rentRes : (rentRes.rents || []);
      const oList = Array.isArray(ownerRes) ? ownerRes : (ownerRes.owners || []);
      
      setTenants(tList);
      setRents(rList);
      setOwners(oList);
    } catch (err) { console.error("Failed to load rent data:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const mergedData = useMemo(() => {
    const ownerMap = {};
    owners.forEach(o => { ownerMap[o.loginId] = o; });

    const tenantMap = {};
    tenants.forEach(t => { tenantMap[t.loginId] = t; });

    return rents.map(r => {
      const tenant = tenantMap[r.tenantLoginId];
      const owner = ownerMap[r.ownerLoginId];
      return {
        ...r,
        tenant,
        owner,
        bankInfo: owner?.bankDetails || owner?.checkinBankName || "Not Linked"
      };
    });
  }, [rents, tenants, owners]);

  const filteredData = useMemo(() => {
    let list = mergedData;
    if (filterStatus !== "all") {
      list = list.filter(r => r.paymentStatus === filterStatus);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => 
        (r.tenantName || "").toLowerCase().includes(q) ||
        (r.propertyName || "").toLowerCase().includes(q) ||
        (r.tenantLoginId || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [mergedData, filterStatus, searchTerm]);

  const stats = useMemo(() => {
    const total = rents.reduce((acc, r) => acc + (Number(r.totalDue) || 0), 0);
    const collected = rents.reduce((acc, r) => acc + (Number(r.paidAmount) || 0), 0);
    const pending = total - collected;
    const rate = total > 0 ? Math.round((collected / total) * 100) : 0;
    
    return { total, collected, pending, rate };
  }, [rents]);

  const chartData = [
    { name: "Collected", value: stats.collected, color: "#10B981" },
    { name: "Pending", value: stats.pending, color: "#F59E0B" }
  ];

  const handleSendReminders = async () => {
    if (!confirm("Send rent reminders to all unpaid tenants?")) return;
    try {
      await fetchJson("/api/rents/reminders/send", { method: "POST", headers: getAuthHeader() });
      alert("Reminders dispatched successfully");
    } catch (err) { alert("Failed to send reminders"); }
  };

  const exportToExcel = () => {
    const data = filteredData.map(r => ({
      "Tenant": r.tenantName,
      "Property": r.propertyName,
      "Month": r.collectionMonth,
      "Total Due": r.totalDue,
      "Paid": r.paidAmount,
      "Status": r.paymentStatus,
      "Method": r.paymentMethod,
      "Owner ID": r.ownerLoginId
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RentHistory");
    XLSX.writeFile(wb, `Roomhy_Rent_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">Rent History</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Global Revenue Collection, Financial Yield Monitoring & Fiscal Compliance Matrix</p>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={handleSendReminders}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95"
            >
               <Bell className="w-4 h-4" /> Send Reminders
            </button>
            <button 
              onClick={exportToExcel}
              className="bg-white text-slate-600 border border-slate-100 px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-200 transition-all flex items-center gap-3 active:scale-95"
            >
               <Sheet className="w-4 h-4" /> Export Fiscal Audit
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Gross Receivables" value={`₹${(stats.total / 100000).toFixed(1)}L`} trend="Contractual" up icon={IndianRupee} color="blue" />
        <StatCardHorizontal label="Collected Pulse" value={`₹${(stats.collected / 100000).toFixed(1)}L`} trend="Realized" up icon={CheckCircle2} color="emerald" />
        <StatCardHorizontal label="Pending Risk" value={`₹${(stats.pending / 100000).toFixed(1)}L`} trend="Exposure" up={false} icon={AlertCircle} color="amber" />
        <StatCardHorizontal label="Collection Rate" value={`${stats.rate}%`} trend="Velocity" up icon={Activity} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Fiscal Health Hub */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center">
           <div className="flex items-center justify-between w-full mb-10">
              <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Fiscal Health Matrix</h3>
              <button onClick={loadData} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm">
                 <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </button>
           </div>
           <div className="relative w-56 h-56 mb-10">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={chartData} dataKey="value" innerRadius={65} outerRadius={85} paddingAngle={8} stroke="none">
                       {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-3xl font-black text-slate-800 tracking-tighter leading-none">₹{(stats.collected / 100000).toFixed(1)}L</p>
                 <p className="text-[8px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Realized Yield</p>
              </div>
           </div>
           <div className="w-full space-y-4">
              <HealthItem label="Realized Yield" value={`₹${stats.collected.toLocaleString()}`} color="#10B981" percent={`${stats.rate}%`} />
              <HealthItem label="Pending Pulse" value={`₹${stats.pending.toLocaleString()}`} color="#F59E0B" percent={`${100 - stats.rate}%`} />
           </div>
        </div>

        {/* Transaction Ledger */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
           <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                    <Layers size={20} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-800">Transaction Pulse Ledger</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Granular monitoring of all revenue inflows and defaults</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-3 bg-slate-50 px-6 py-3.5 rounded-2xl border border-slate-100 shadow-inner">
                    <Filter size={14} className="text-slate-400" />
                    <select 
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className="bg-transparent text-[10px] font-bold text-slate-600 outline-none uppercase tracking-widest border-none p-0 focus:ring-0"
                    >
                       <option value="all">All Cycles</option>
                       <option value="paid">Paid</option>
                       <option value="pending">Pending</option>
                       <option value="partially_paid">Partial</option>
                    </select>
                 </div>
                 
                 <div className="relative w-64 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search Ledger..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" 
                    />
                 </div>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-slate-100">
                       <th className="px-10 py-8">Resident / Property</th>
                       <th className="px-6 py-8">Collection Cycle</th>
                       <th className="px-6 py-8 text-center">Amount Due</th>
                       <th className="px-6 py-8 text-center">Status</th>
                       <th className="px-10 py-8 text-right">Method</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan="5" className="py-40 text-center">
                         <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin mx-auto mb-8" />
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Accessing Fiscal Database...</p>
                      </td></tr>
                    ) : filteredData.length === 0 ? (
                      <tr><td colSpan="5" className="py-40 text-center">
                         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                            <Wallet size={40} />
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No transaction records found</p>
                      </td></tr>
                    ) : filteredData.map((r, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-all duration-300">
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-6">
                               <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-xl shadow-slate-200/40 shrink-0">
                                  {(r.tenantName || "T").charAt(0).toUpperCase()}
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-slate-800 tracking-tight">{r.tenantName || "Unknown Resident"}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-60 truncate max-w-[150px]">{r.propertyName}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-xl border border-slate-100">
                               <Calendar size={12} className="text-slate-400" />
                               <span className="text-[9px] font-bold uppercase text-slate-600 tracking-widest">{r.collectionMonth}</span>
                            </div>
                         </td>
                         <td className="px-6 py-8 text-center font-bold text-slate-800">
                            ₹{r.totalDue?.toLocaleString()}
                         </td>
                         <td className="px-6 py-8 text-center">
                            <span className={cn(
                               "text-[8px] font-bold px-4 py-1.5 rounded-xl border uppercase tracking-[0.2em] shadow-sm",
                               r.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                               r.paymentStatus === "partially_paid" ? "bg-amber-50 text-amber-600 border-amber-100" :
                               "bg-rose-50 text-rose-600 border-rose-100"
                            )}>
                               {r.paymentStatus || "pending"}
                            </span>
                         </td>
                         <td className="px-10 py-8 text-right font-bold text-slate-400 uppercase text-[9px] tracking-widest">
                            {r.paymentMethod || "Awaiting"}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}

function HealthItem({ label, value, color, percent }) {
  return (
    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white group transition-all cursor-pointer">
       <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: color}} />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{label}</span>
       </div>
       <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-800 leading-none">{value}</span>
          <span className="text-[9px] font-bold text-slate-400 px-2 py-1 bg-white rounded-lg border border-slate-100 uppercase leading-none shadow-sm">{percent}</span>
       </div>
    </div>
  );
}

function StatCardHorizontal({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { 
    blue: "bg-blue-50 text-blue-600 border-blue-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    amber: "bg-amber-50 text-amber-600 border-amber-100", 
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100" 
  };
  
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex items-start gap-5 group hover:translate-y-[-5px] transition-all duration-500">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm transition-transform group-hover:rotate-6", bgColors[color])}>
         <Icon className="w-7 h-7" />
      </div>
      <div className="min-w-0">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none truncate">{label}</p>
         <p className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-3">{value}</p>
         <div className={cn(
           "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider",
           up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
         )}>
            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
         </div>
      </div>
    </div>
  );
}
