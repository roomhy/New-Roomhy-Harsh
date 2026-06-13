import React, { useState, useEffect } from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, Percent, Database, TrendingUp,
  LayoutGrid, BarChart3, RefreshCw
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { fetchJson } from "../../utils/api";
import useSEO from "../../hooks/useSEO";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function Commission() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    commissionEarned: 0,
    ownerEarnings: 0,
    pendingPayouts: 0,
    paidPayouts: 0,
    walletBalance: 0,
    totalTransactions: 0
  });
  const [trend, setTrend] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useSEO({
    title: "Commission Hub - Roomhy Super Admin",
    description: "View platform commissions, base payment amounts, splits, and dynamic revenue charts.",
    canonical: "https://roomhy.com/superadmin/accounting_commission"
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetchJson("/api/superadmin/revenue/stats");
      if (statsRes.success) {
        setStats(statsRes.stats);
        setTrend(statsRes.trend || []);
      }
      const txRes = await fetchJson("/api/superadmin/revenue/transactions");
      if (txRes.success) {
        setCommissions(txRes.commissions || []);
      }
    } catch (error) {
      console.error("Error loading commission hub data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCommissions = commissions.filter(c => 
    c.booking_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.razorpay_payment_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Commission Hub</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform Service Fee Analytics & Global Revenue Lifecycle Ledger</p>
         </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={loadData}
              className="bg-white text-slate-400 border border-slate-100 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
            >
               <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal 
          label="Total Commission Earned" 
          value={stats.commissionEarned > 0 ? `₹${stats.commissionEarned.toLocaleString('en-IN')}` : "No Revenue Data Available"} 
          trend="Platform Earnings" 
          up 
          icon={Database} 
          color="indigo" 
          source="Payments"
        />
        <StatCardHorizontal 
          label="Gross Revenue Collected" 
          value={stats.totalRevenue > 0 ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : "No Revenue Data Available"} 
          trend="Total Payments" 
          up 
          icon={Zap} 
          color="blue" 
          source="Payments"
        />
        <StatCardHorizontal 
          label="Owner Share share" 
          value={stats.ownerEarnings > 0 ? `₹${stats.ownerEarnings.toLocaleString('en-IN')}` : "No Data Available"} 
          trend="Owner Earnings" 
          up 
          icon={Wallet} 
          color="amber" 
          source="Payments"
        />
        <StatCardHorizontal 
          label="Current Wallet Balance" 
          value={stats.walletBalance > 0 ? `₹${stats.walletBalance.toLocaleString('en-IN')}` : "No Revenue Data Available"} 
          trend="Escrow Balance" 
          up 
          icon={TrendingUp} 
          color="emerald" 
          source="Payments"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Trend Chart */}
         <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col">
            <div className="mb-8">
               <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Earnings Trend</h3>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1">Source: Payments</p>
            </div>
            <div className="flex-1 h-64">
               {trend.length === 0 || trend[0]?.name === 'No Data' ? (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-50/50 rounded-2xl">
                     No Data Available
                  </div>
               ) : (
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={trend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 700}} cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey="revenue" radius={[4, 4, 4, 4]} barSize={20}>
                           {trend.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index === trend.length - 1 ? '#4F46E5' : '#E0E7FF'} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               )}
            </div>
         </div>

         {/* Commission Ledger */}
         <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Revenue Ledger</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Source: Payments</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="relative group w-48">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                     <input 
                       placeholder="Search transaction..." 
                       value={searchQuery}
                       onChange={e => setSearchQuery(e.target.value)}
                       className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" 
                     />
                  </div>
               </div>
            </div>
            <div className="overflow-x-auto">
               {filteredCommissions.length === 0 ? (
                  <div className="py-12 text-center text-xs font-bold text-slate-400 bg-slate-50/50 rounded-xl">
                     No Data Available
                  </div>
               ) : (
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                           <th className="pb-4">Audit ID</th>
                           <th className="pb-4">Payment ID</th>
                           <th className="pb-4 text-center">Base Amount</th>
                           <th className="pb-4 text-center">Commission Percentage</th>
                           <th className="pb-4 text-center">Commission Amount</th>
                           <th className="pb-4 text-center">Owner Share</th>
                           <th className="pb-4 text-right">Date</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50 text-[11px] font-semibold text-slate-700">
                        {filteredCommissions.map((r, i) => (
                          <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                             <td className="py-3">
                                <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 shadow-sm">
                                   {r.booking_id ? r.booking_id.substring(r.booking_id.length - 8).toUpperCase() : 'N/A'}
                                </span>
                             </td>
                             <td className="py-3">
                                <p className="font-mono text-xs">{r.razorpay_payment_id || 'N/A'}</p>
                             </td>
                             <td className="py-3 text-center font-black text-slate-800">
                                ₹{(r.booking_amount || 0).toLocaleString('en-IN')}
                             </td>
                             <td className="py-3 text-center text-indigo-600">
                                {r.commission_percentage || 0}%
                             </td>
                             <td className="py-3 text-center font-black text-emerald-600">
                                ₹{(r.commission_amount || 0).toLocaleString('en-IN')}
                             </td>
                             <td className="py-3 text-center font-black text-indigo-600">
                                ₹{(r.owner_amount || 0).toLocaleString('en-IN')}
                             </td>
                             <td className="py-3 text-right text-slate-400">
                                {r.date}
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCardHorizontal({ label, value, trend, up, icon: Icon, color, source }) {
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
      <div className="min-w-0 flex-1">
         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none truncate">{label}</p>
         <p className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">{value}</p>
         <div className="flex items-center justify-between">
           <span className="text-[7px] font-bold uppercase text-slate-400">
             {trend}
           </span>
           {source && (
             <span className="text-[7px] font-bold uppercase text-blue-500/80">
               Source: {source}
             </span>
           )}
         </div>
      </div>
    </div>
  );
}
