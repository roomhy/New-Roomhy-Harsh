import React, { useEffect, useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { 
  TrendingUp, Star, Users, MessageSquare, Activity, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Calendar,
  Target, Zap, PieChart as PieIcon, BarChart3
} from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function ReviewAnalytics() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchJson("/api/reviews");
      setReviews(Array.isArray(res) ? res : (res.data || []));
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  const ratingDist = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { 
      const ratingVal = Math.floor(r.rating || 0);
      if (counts[ratingVal] !== undefined) {
        counts[ratingVal]++; 
      }
    });
    return [
      { name: "5 Stars", value: counts[5], color: "#10B981" },
      { name: "4 Stars", value: counts[4], color: "#3B82F6" },
      { name: "3 Stars", value: counts[3], color: "#F59E0B" },
      { name: "2 Stars", value: counts[2], color: "#6366F1" },
      { name: "1 Star",  value: counts[1], color: "#EF4444" },
    ];
  }, [reviews]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : null;
    const verified = reviews.filter(r => r.isVerified || r.bookingId).length; // verified stay badge based reviews
    const vRate = total > 0 ? Math.round((verified / total) * 100) : 0;
    
    let sentiment = null;
    if (total > 0 && avg) {
      const parsedAvg = parseFloat(avg);
      if (parsedAvg >= 4.0) sentiment = "Positive";
      else if (parsedAvg >= 3.0) sentiment = "Neutral";
      else sentiment = "Negative";
    }

    return { total, avg, vRate, sentiment };
  }, [reviews]);

  const formatStat = (val, prefix = "", suffix = "") => {
    if (val === undefined || val === null) {
      return "0";
    }
    return `${prefix}${val}${suffix}`;
  };

  const hasReviewsData = reviews.length > 0;

  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full font-inter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sentiment Analytics</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Deep Dive into Customer Satisfaction & Brand Perception Metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-blue-600 transition-all">
             <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <div className="flex items-center gap-2 bg-white border border-slate-100 px-6 py-3.5 rounded-2xl shadow-sm text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <Calendar size={14} className="text-slate-400" />
            <span>Last 30 Days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Average Rating" value={stats.avg ? `${stats.avg} ★` : "0 ★"} trend="+0.2" up icon={Star} color="blue" source="Reviews" />
        <MetricCard label="Total Reviews" value={formatStat(stats.total)} trend="+12.4%" up icon={MessageSquare} color="indigo" source="Reviews" />
        <MetricCard label="Verified Rate" value={`${stats.vRate || 0}%`} trend="+5.1%" up icon={Zap} color="emerald" source="Reviews" />
        <MetricCard label="Net Sentiment" value={stats.sentiment ? stats.sentiment : "Neutral"} trend="Stable" up icon={Target} color="amber" source="Reviews" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col justify-between">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                    <BarChart3 size={18} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Rating Frequency</h3>
              </div>
           </div>
           <div style={{height: 350}} className="flex-1">
              {!hasReviewsData ? (
                <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest text-xs">No Data Available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={ratingDist}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94A3B8', fontSize:10, fontWeight:600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill:'#94A3B8', fontSize:10, fontWeight:600}} dx={-10} />
                      <Tooltip cursor={{fill: '#F8FAFC'}} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={45}>
                         {ratingDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
              )}
           </div>
           <p className="text-[9px] font-bold text-slate-300 uppercase mt-4 text-right">Data Source: Reviews</p>
        </div>

        <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center justify-between">
           <div className="flex items-center justify-between w-full mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                    <PieIcon size={18} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-800">Review Share</h3>
              </div>
           </div>
           <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
              {!hasReviewsData ? (
                <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Data Available</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={ratingDist} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                           {ratingDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <p className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{stats.total}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Total Samples</p>
                  </div>
                </>
              )}
           </div>
           <div className="w-full space-y-4 mt-auto">
              {ratingDist.slice(0, 3).map(r => (
                <div key={r.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white transition-all group cursor-default">
                   <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: r.color}} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{r.name}</span>
                   </div>
                   <span className="text-xs font-bold text-slate-800">{hasReviewsData ? `${r.value} Reviews` : "No Data"}</span>
                </div>
              ))}
           </div>
           <p className="w-full text-[9px] font-bold text-slate-300 uppercase mt-4 text-right">Data Source: Reviews</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, up, icon: Icon, color, source }) {
  const bgColors = { 
    blue: "bg-blue-50 text-blue-600 border-blue-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    amber: "bg-amber-50 text-amber-600 border-amber-100", 
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100" 
  };
  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 min-h-[220px]">
      <div>
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm group-hover:rotate-6 transition-transform mb-4", bgColors[color])}>
           <Icon className="w-7 h-7" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tighter leading-none mb-2">{value}</p>
      </div>
      
      <div className="w-full border-t border-slate-50 pt-3 flex flex-col items-start gap-1.5 mt-auto">
         {value !== "No Data Available" && (
           <div className={cn(
             "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider",
             up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
           )}>
              {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trend}
           </div>
         )}
         <span className="text-[8px] font-black text-blue-500/80 uppercase tracking-wider">Data Source: {source}</span>
      </div>
    </div>
  );
}
