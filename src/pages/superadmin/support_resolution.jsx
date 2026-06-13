import React, { useState, useEffect, useMemo } from "react";
import { fetchJson } from "../../utils/api";
import {
  CheckCircle, Clock, TrendingUp, AlertTriangle, ChevronRight,
  Download, BarChart3, Layers
} from "lucide-react";
import { PageHeader } from "../../components/superadmin/PageHeader";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const cn = (...c) => c.filter(Boolean).join(" ");

const RES_STATUS_CFG = {
  "Pending Review":           { cls: "bg-slate-100 text-slate-500",    bar: "#94A3B8" },
  "Under Investigation":      { cls: "bg-blue-50 text-blue-600",       bar: "#3B82F6" },
  "Awaiting User Response":   { cls: "bg-purple-50 text-purple-600",   bar: "#8B5CF6" },
  "Awaiting Owner Response":  { cls: "bg-amber-50 text-amber-600",     bar: "#F59E0B" },
  "Resolution Proposed":      { cls: "bg-cyan-50 text-cyan-600",       bar: "#06B6D4" },
  "Resolved":                 { cls: "bg-emerald-50 text-emerald-600", bar: "#10B981" },
  "Closed":                   { cls: "bg-slate-200 text-slate-600",    bar: "#64748B" },
};

export default function IssuesResolutionTracking() {
  const [activeTab, setActiveTab] = useState("All Issues");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchJson("/api/superadmin/support/resolution-data");
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load resolution tracking data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const counts = data?.counts || { total: 0, resolved: 0, pending: 0, escalated: 0 };
  const resRate = data?.resRate || "0";
  const avgTime = data?.avgTime || "No Data Available";
  const resolutionTrend = data?.resolutionTrend || [];
  const categoryData = data?.categoryData || [];
  const resolutionTime = data?.resolutionTime || [];
  const issues = data?.issues || [];

  const longestPending = useMemo(() => {
    return [...issues]
      .filter(i => !["Resolved", "Closed"].includes(i.res_status))
      .sort((a, b) => parseFloat(b.res_time) - parseFloat(a.res_time));
  }, [issues]);

  const recentlyResolved = useMemo(() => {
    return [...issues].filter(i => ["Resolved", "Closed"].includes(i.res_status));
  }, [issues]);

  const displayList = activeTab === "Longest Pending" ? longestPending
    : activeTab === "Recently Resolved" ? recentlyResolved
    : issues;

  const handleExport = () => {
    const csv = [
      ["Issue ID","Ticket ID","Type","Property","Tenant","Owner","Assigned Admin","Resolution Status","Time Open","Created Date"],
      ...displayList.map(i => [i.id, i.ticket_id, i.type, i.property, i.tenant, i.owner, i.admin, i.res_status, i.res_time, i.created])
    ].map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download="issues.csv"; a.click();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-40">
        Accessing Platform Support Intelligence...
      </div>
    );
  }

  const isNoData = issues.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issues Resolution Tracking"
        subtitle="Monitor the full complaint lifecycle from creation to closure."
        breadcrumbs={[{ label: "Support" }, { label: "Issues Resolution Tracking", active: true }]}
        actions={
          <button onClick={handleExport} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm">
            <Download size={14}/> Export
          </button>
        }
      />

      {/* Workflow Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center gap-0 overflow-x-auto">
          {["Complaint Raised","Ticket Created","Admin Assigned","Investigation","Resolution Proposed","Resolved","Closed"].map((step, i, arr) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center shrink-0 px-3">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black mb-1",
                  i < 4 ? "bg-blue-600 text-white" : i < 6 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>{i+1}</div>
                <p className="text-[9px] font-bold text-slate-500 text-center whitespace-nowrap">{step}</p>
              </div>
              {i < arr.length - 1 && <ChevronRight size={12} className="text-slate-200 shrink-0"/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Issues",       val: isNoData ? "No Data Available" : counts.total,     icon: Layers,       color: "blue"   },
          { label: "Resolved",           val: isNoData ? "No Data Available" : counts.resolved,  icon: CheckCircle,  color: "emerald"},
          { label: "Avg. Resolution",    val: isNoData ? "No Data Available" : avgTime,          icon: Clock,        color: "amber"  },
          { label: "Resolution Rate",    val: isNoData ? "No Data Available" : `${resRate}%`,    icon: TrendingUp,   color: "purple" },
          { label: "Escalated Cases",    val: isNoData ? "No Data Available" : counts.escalated, icon: AlertTriangle,color: "red"    },
        ].map(c => (
          <div key={c.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[140px]">
            <div>
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-3", `bg-${c.color}-50 text-${c.color}-600`)}>
                <c.icon size={16}/>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">{c.val}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{c.label}</p>
            </div>
            <p className="text-[8px] font-bold text-blue-500/80 uppercase tracking-wider mt-3">Source: Support</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Resolution Trend */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Issue Resolution Trend</h3>
          <div style={{height: 200}}>
            {isNoData ? (
              <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest text-xs">No Data Available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resolutionTrend}>
                  <defs>
                    <linearGradient id="raisedG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="resolvedG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9"/>
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:9,fontWeight:600}}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:9,fontWeight:600}}/>
                  <Tooltip/>
                  <Area type="monotone" dataKey="raised" stroke="#3B82F6" strokeWidth={2} fill="url(#raisedG)"/>
                  <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} fill="url(#resolvedG)"/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"/><span className="text-[10px] font-bold text-slate-400">Raised</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/><span className="text-[10px] font-bold text-slate-400">Resolved</span></div>
          </div>
        </div>

        {/* Issues by Category */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Issues by Category</h3>
          <div className="flex items-center gap-4 flex-1">
            <div style={{width:100,height:100,shrink:0}} className="flex items-center justify-center">
              {isNoData ? (
                <div className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">No Data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} innerRadius={28} outerRadius={46} paddingAngle={3} dataKey="value" stroke="none">
                      {categoryData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex-1 space-y-2">
              {isNoData ? (
                <div className="text-slate-400 font-bold uppercase tracking-widest text-[9px] text-center">No Category Data</div>
              ) : categoryData.map(c => (
                <div key={c.name} className="flex items-center gap-1.5 text-[10px] font-bold">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{backgroundColor:c.color}}/>
                  <span className="text-slate-500 truncate">{c.name}</span>
                  <span className="text-slate-800 ml-auto shrink-0">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Avg Resolution Time by Type */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Avg. Resolution Time by Type</h3>
          <div style={{height:200}}>
            {isNoData ? (
              <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest text-xs">No Data Available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resolutionTime} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9"/>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:9,fontWeight:600}} tickFormatter={v => `${v}d`}/>
                  <YAxis dataKey="type" type="category" axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:9,fontWeight:600}} width={90}/>
                  <Tooltip formatter={v => [`${v} days`, "Avg. Resolution"]}/>
                  <Bar dataKey="days" radius={[0,4,4,0]}>
                    {resolutionTime.map((_, i) => <Cell key={i} fill={["#3B82F6","#10B981","#F59E0B","#EC4899","#6366F1"][i % 5]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Issues Table with Tabs */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {["All Issues","Longest Pending","Recently Resolved"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
              "px-6 py-4 text-xs font-bold whitespace-nowrap transition-all border-b-2",
              activeTab === tab ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            )}>
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 text-left">Issue / Ticket</th>
                <th className="px-5 py-4 text-left">Type</th>
                <th className="px-5 py-4 text-left">Property</th>
                <th className="px-5 py-4 text-left">Tenant</th>
                <th className="px-5 py-4 text-left">Owner</th>
                <th className="px-5 py-4 text-left">Assigned Admin</th>
                <th className="px-5 py-4 text-left">Resolution Status</th>
                <th className="px-5 py-4 text-right">Time Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayList.map(i => (
                <tr key={i.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-mono font-bold text-blue-600 text-xs">{i.id}</p>
                    <p className="text-[10px] text-slate-400 font-mono">via {i.ticket_id}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">{i.type}</span>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-slate-700">{i.property}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">{i.tenant}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">{i.owner}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-slate-700">{i.admin}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap", RES_STATUS_CFG[i.res_status]?.cls || "bg-slate-100 text-slate-500")}>
                      {i.res_status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={cn("text-xs font-black", parseInt(i.res_time) > 5 ? "text-rose-500" : parseInt(i.res_time) > 3 ? "text-amber-600" : "text-emerald-600")}>
                      {i.res_time}
                    </span>
                  </td>
                </tr>
              ))}
              {displayList.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400">No Data Available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
