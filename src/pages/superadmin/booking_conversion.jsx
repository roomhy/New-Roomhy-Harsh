import React, { useState, useEffect } from "react";
import { TrendingUp, Percent, Clock, Download } from "lucide-react";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { fetchJson } from "../../utils/api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const cn = (...c) => c.filter(Boolean).join(" ");

export default function BookingConversionRate() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/booking/conversion-stats");
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Error loading conversion stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    const csv = [
      ["Stage / Metric", "Value"],
      ...data.funnel.map(f => [f.label, `${f.val} (pct: ${f.pct}%)`]),
      ["Overall Conversion Rate", data.metrics.overallRate],
      ["Direct Booking Rate", data.metrics.directRate],
      ["Online Request Rate", data.metrics.onlineRate],
      ["Avg Time to Convert", data.metrics.avgTime]
    ].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); 
    a.href = URL.createObjectURL(blob); 
    a.download = "conversion_stats.csv"; 
    a.click();
  };

  const hasData = data && data.funnel && data.funnel.length > 0 && data.funnel[0].val > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Conversion Rate Analysis"
          subtitle="Track lead-to-booking conversion across all stages."
          breadcrumbs={[{ label: "Booking & Leads" }, { label: "Conversion Rate", active: true }]}
        />
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm shrink-0">
            Source: Leads + Bookings
          </span>
          <button onClick={handleExport} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold">Loading conversion statistics...</div>
      ) : !hasData ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center text-slate-400 font-bold flex flex-col items-center justify-center gap-2">
          <span>No Data Available</span>
          <span className="text-xs font-normal text-slate-400">Please register properties, capture leads, or record booking requests to build the conversion metrics.</span>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Lead → Booking Rate",     val: data.metrics.overallRate,  sub: "Source: Leads + Bookings", color: "blue",    icon: Percent },
              { label: "Direct Booking Conversion",val: data.metrics.directRate,   sub: "Source: Bookings",     color: "emerald", icon: TrendingUp },
              { label: "Online Request Conversion",val: data.metrics.onlineRate,   sub: "Source: Bookings",     color: "purple",  icon: TrendingUp },
              { label: "Avg. Time to Convert",     val: data.metrics.avgTime,      sub: "Source: Leads + Bookings",color: "amber",  icon: Clock },
            ].map(c => (
              <div key={c.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-3", `bg-${c.color}-50 text-${c.color}-600`)}>
                    <c.icon size={16} />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{c.val}</p>
                  <p className="text-[11px] font-bold text-slate-600 mt-1">{c.label}</p>
                </div>
                <div className="text-[9px] font-bold text-slate-400 mt-4 border-t border-slate-50 pt-2.5">
                  {c.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Funnel + Monthly Trend */}
          <div className="grid grid-cols-12 gap-6">
            {/* Visual Funnel */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm col-span-12 lg:col-span-5">
              <h3 className="text-sm font-bold text-slate-900 mb-6">Lead Conversion Funnel</h3>
              <div className="space-y-4">
                {data.funnel.map((f, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-600">{f.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-slate-900">{f.val.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-400">{f.pct}%</span>
                      </div>
                    </div>
                    <div className="h-8 bg-slate-50 rounded-xl overflow-hidden flex items-center">
                      <div
                        className="h-full rounded-xl flex items-center justify-end pr-3 transition-all duration-700"
                        style={{ width: `${Math.max(f.pct, 5)}%`, backgroundColor: f.color }}
                      />
                    </div>
                    {f.drop && (
                      <p className="text-[10px] text-red-400 font-bold mt-0.5 text-right">↓ {f.drop}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Overall Conversion</span>
                <span className="text-lg font-black text-blue-600">{data.metrics.overallRate}</span>
              </div>
              <div className="text-[9px] font-bold text-slate-400 mt-4 border-t border-slate-50 pt-2.5">
                Source: Leads + Bookings
              </div>
            </div>

            {/* Monthly Trend + Side charts */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              {/* Monthly Conversion Trend */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Monthly Conversion Trend</h3>
                <div style={{ height: 180 }}>
                  {data.monthlyTrend && data.monthlyTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.monthlyTrend}>
                        <defs>
                          <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9"/>
                        <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:10,fontWeight:600}}/>
                        <YAxis axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:10,fontWeight:600}} tickFormatter={v=>`${v}%`}/>
                        <Tooltip formatter={v => [`${v}%`, "Conversion Rate"]}/>
                        <Area type="monotone" dataKey="conv" stroke="#3B82F6" strokeWidth={2.5} fill="url(#convGrad)" dot={{fill:'#3B82F6',r:3}}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">No Data Available</div>
                  )}
                </div>
                <div className="text-[9px] font-bold text-slate-400 mt-4 border-t border-slate-50 pt-2.5">
                  Source: Leads + Bookings
                </div>
              </div>

              {/* Property + Location Conversion side by side */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-4">Top Properties by Conversion</h4>
                    <div className="space-y-3">
                      {data.propertyConv.length === 0 ? (
                        <div className="text-center text-slate-400 text-xs font-bold py-6">No Data Available</div>
                      ) : data.propertyConv.map((p, i) => (
                        <div key={i}>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-600 truncate pr-2">{p.name}</span>
                            <span className="text-[10px] font-black text-blue-600 shrink-0">{p.rate}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{width:`${Math.max(p.rate, 2)}%`}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 mt-4 border-t border-slate-50 pt-2.5">
                    Source: Leads + Bookings
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-4">Top Locations by Conversion</h4>
                    <div className="space-y-3">
                      {data.locationConv.length === 0 ? (
                        <div className="text-center text-slate-400 text-xs font-bold py-6">No Data Available</div>
                      ) : data.locationConv.map((l, i) => (
                        <div key={i}>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-600 truncate pr-2">{l.loc}</span>
                            <span className="text-[10px] font-black text-emerald-600 shrink-0">{l.rate}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{width:`${Math.max(l.rate, 2)}%`}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 mt-4 border-t border-slate-50 pt-2.5">
                    Source: Leads + Bookings
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
