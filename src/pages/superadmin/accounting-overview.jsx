import React, { useState, useEffect } from "react";
import { 
  IndianRupee, Wallet, TrendingUp, Clock, 
  ArrowUpRight, ArrowDownRight, ChevronRight, 
  MoreVertical, Search, Calendar, FileText,
  CheckCircle2, AlertCircle, Activity,
  Users, Building2, CreditCard, Filter, Download,
  Bell, XCircle, Settings
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { StatCard } from "../../components/superadmin/StatCard";
import { fetchAccountingOverviewStats } from "../../utils/api";
import useSEO from "../../hooks/useSEO";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function AccountingOverview() {
  const [stats, setStats] = useState({
    summary: {
      totalCollection: 0,
      totalPayout: 0,
      revenue: 0,
      dueRent: 0,
      pendingPayout: 0
    },
    trends: [],
    ledger: [],
    dueRentAging: []
  });
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Accounting Overview - Roomhy Super Admin",
    description: "Track platform revenue, commissions, payouts, and outstanding rents with live analytics.",
    canonical: "https://roomhy.com/superadmin/accounting-overview"
  });

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await fetchAccountingOverviewStats();
        if (res.success) {
          setStats(res);
        }
      } catch (error) {
        console.error("Error fetching accounting overview stats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const { summary, trends, ledger, dueRentAging } = stats;

  const totalDueRent = summary.dueRent || 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Accounting Overview" 
        subtitle="Comprehensive overview of platform financials and transactions."
        actions={
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-white border border-border/60 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Live Database Metrics</span>
             </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
         <StatCard 
           label="Collections" 
           value={summary.totalCollection > 0 ? `₹ ${summary.totalCollection.toLocaleString('en-IN')}` : "No Revenue Data Available"} 
           icon={Wallet} 
           iconColor="green" 
           loading={loading}
           source="Payments" 
         />
         <StatCard 
           label="Payouts Completed" 
           value={summary.totalPayout > 0 ? `₹ ${summary.totalPayout.toLocaleString('en-IN')}` : "No Revenue Data Available"} 
           icon={CreditCard} 
           iconColor="blue" 
           loading={loading}
           source="Payments" 
         />
         <StatCard 
           label="Commission Revenue" 
           value={summary.revenue > 0 ? `₹ ${summary.revenue.toLocaleString('en-IN')}` : "No Revenue Data Available"} 
           icon={TrendingUp} 
           iconColor="purple" 
           loading={loading}
           source="Payments" 
         />
         <StatCard 
           label="Outstanding Rents" 
           value={summary.dueRent > 0 ? `₹ ${summary.dueRent.toLocaleString('en-IN')}` : "No Data Available"} 
           icon={Clock} 
           iconColor="yellow" 
           loading={loading}
           source="Payments" 
         />
         <StatCard 
           label="Pending Payouts" 
           value={summary.pendingPayout > 0 ? `₹ ${summary.pendingPayout.toLocaleString('en-IN')}` : "No Data Available"} 
           icon={AlertCircle} 
           iconColor="red" 
           loading={loading}
           source="Payments" 
         />
      </div>

      <div className="grid grid-cols-12 gap-6">
         <div className="col-span-12 lg:col-span-8 panel">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Collection vs Payout Trend</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Source: Payments</p>
               </div>
               <div className="flex items-center gap-6">
                  <div className="hidden md:flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Collection</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Payout</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className="h-72">
               {trends.length === 0 ? (
                 <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-50/50 rounded-2xl">
                   No Data Available
                 </div>
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends}>
                       <defs>
                          <linearGradient id="coll" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                             <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="pay" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                             <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 600}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 600}} tickFormatter={(v) => `${v / 1000}K`} />
                       <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                       <Area type="monotone" dataKey="collection" stroke="#3B82F6" strokeWidth={3} fill="url(#coll)" dot={{fill: "#3B82F6", r: 4}} />
                       <Area type="monotone" dataKey="payout" stroke="#10B981" strokeWidth={3} fill="url(#pay)" dot={{fill: "#10B981", r: 4}} />
                    </AreaChart>
                 </ResponsiveContainer>
               )}
            </div>
         </div>

         <div className="col-span-12 lg:col-span-4 panel flex flex-col justify-between">
            <div className="mb-4">
               <h3 className="text-lg font-bold text-slate-900">Recent Ledger</h3>
               <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 mb-6">Source: Payments</p>
               <div className="space-y-5 flex-1 overflow-y-auto max-h-[350px] custom-scrollbar pr-2">
                  {ledger.length === 0 ? (
                     <div className="py-12 text-center text-xs font-bold text-slate-400 bg-slate-50/50 rounded-xl">
                        No Data Available
                     </div>
                  ) : (
                     ledger.map((t, i) => (
                        <div key={i} className="flex items-center gap-4 group border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                           <div className={cn("icon-bubble !h-10 !w-10 transition-transform group-hover:scale-105 bg-blue-50 text-blue-600")}>
                              <span className="text-[10px] font-black">{t.type ? t.type.split(' ').map(x => x[0]).join('') : 'TX'}</span>
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                 <p className="text-[13px] font-bold text-slate-900 truncate leading-none">{t.desc}</p>
                                 <p className={cn("text-sm font-black text-slate-900")}>{t.amount}</p>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.type}</p>
                                 <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600")}>{t.status}</span>
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="panel">
            <div className="mb-8">
               <h3 className="text-lg font-bold text-slate-900">Due Rent Aging</h3>
               <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Source: Payments</p>
            </div>
            {dueRentAging.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-50/50 rounded-2xl">
                No Data Available
              </div>
            ) : (
              <>
                <div className="relative h-48 mb-8">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie data={dueRentAging} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                            {dueRentAging.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                         </Pie>
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-xl font-black text-slate-900">₹ {totalDueRent.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Due</p>
                   </div>
                </div>
                <div className="space-y-3">
                   {dueRentAging.map((item) => (
                      <div key={item.name} className="flex items-center justify-between group">
                         <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}} />
                            <span className="text-xs font-semibold text-slate-500">{item.name}</span>
                         </div>
                         <span className="text-xs font-black text-slate-900">₹ {item.value.toLocaleString('en-IN')}</span>
                      </div>
                   ))}
                </div>
              </>
            )}
         </div>

         <div className="panel bg-slate-900 text-white border-none shadow-xl flex flex-col justify-between">
            <div>
               <h3 className="text-lg font-bold mb-8">General Information</h3>
               <p className="text-sm text-slate-400 leading-relaxed mb-6">
                 This dashboard aggregates real-time data from the PaymentTransaction and Rent collections. It serves as the single source of truth for platform revenues, commissions, owner payments, and outstanding tenant rents.
               </p>
            </div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              Generated dynamically from Roomhy Database
            </div>
         </div>
      </div>
    </div>
  );
}
