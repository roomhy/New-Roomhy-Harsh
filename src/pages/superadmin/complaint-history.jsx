import React from "react";
import { Ticket, Clock, History, CheckCircle2, AlertCircle, ChevronRight, TrendingUp, Calendar, Star, ArrowDownRight, Building2 } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from "recharts";

const cn = (...c) => c.filter(Boolean).join(" ");

const trendData = [
  { name: "May 22", opened: 150, resolved: 120, overdue: 40 },
  { name: "May 23", opened: 280, resolved: 180, overdue: 60 },
  { name: "May 24", opened: 210, resolved: 200, overdue: 50 },
  { name: "May 25", opened: 320, resolved: 240, overdue: 80 },
  { name: "May 26", opened: 250, resolved: 220, overdue: 70 },
  { name: "May 27", opened: 380, resolved: 310, overdue: 90 },
  { name: "May 28", opened: 340, resolved: 290, overdue: 85 },
];

const categoryData = [
  { name: "Maintenance",      value: 512, color: "#3B82F6", pct: "41.0%" },
  { name: "Payment & Billing",value: 226, color: "#10B981", pct: "18.1%" },
  { name: "Property Related", value: 184, color: "#F59E0B", pct: "14.7%" },
  { name: "Amenities",        value: 158, color: "#6366F1", pct: "12.5%" },
  { name: "General Inquiry",  value: 110, color: "#EC4899", pct: "8.8%"  },
  { name: "Others",           value: 60,  color: "#94A3B8", pct: "4.8%"  },
];

const sourceData = [
  { name: "Tenant",       value: 842, color: "#3B82F6", pct: "67.5%" },
  { name: "Owner",        value: 352, color: "#10B981", pct: "28.2%" },
  { name: "System/Other", value: 54,  color: "#F59E0B", pct: "4.3%"  },
];

const midMetrics = [
  { label: "All Tickets",         val: "1,248", icon: Ticket,       c: "blue"   },
  { label: "Tenants Complaints",  val: "842",   icon: Building2,    c: "emerald"},
  { label: "Owners Complaints",   val: "352",   icon: Building2,    c: "amber"  },
  { label: "Open",                val: "362",   icon: Clock,        c: "blue"   },
  { label: "In Progress",         val: "538",   icon: History,      c: "amber"  },
  { label: "Resolved",            val: "1,086", icon: CheckCircle2, c: "emerald"},
  { label: "Overdue",             val: "72",    icon: AlertCircle,  c: "rose"   },
];

const recentTickets = [
  { id: "#TK-1256", type: "Tenant", raisedBy: "Rahul Sharma", category: "Maintenance",      priority: "High", status: "Open",        assignee: "Amit Verma",  date: "May 28, 2024 10:30 AM" },
  { id: "#TK-1255", type: "Owner",  raisedBy: "Neha Singh",   category: "Property Related", priority: "Med",  status: "In Progress", assignee: "Priya Nair",  date: "May 28, 2024 09:15 AM" },
  { id: "#TK-1254", type: "Tenant", raisedBy: "Vikram Joshi", category: "Payment & Billing",priority: "High", status: "Open",        assignee: "Rohit Patil", date: "May 28, 2024 08:45 AM" },
  { id: "#TK-1253", type: "Tenant", raisedBy: "Aisha Khan",   category: "Amenities",        priority: "Low",  status: "Resolved",    assignee: "Sneha Iyer",  date: "May 28, 2024 07:40 AM" },
  { id: "#TK-1252", type: "Owner",  raisedBy: "Amit Patel",   category: "General Inquiry",  priority: "Med",  status: "In Progress", assignee: "Karan Mehta", date: "May 28, 2024 05:20 AM" },
];

const radialData = [{ name: "Rate", value: 87, fill: "#3B82F6" }];
const sparkData  = [{v:10},{v:18},{v:14},{v:22},{v:19},{v:28},{v:24}];

const iconColors = { blue:"text-blue-600 bg-blue-50", emerald:"text-emerald-500 bg-emerald-50", amber:"text-amber-500 bg-amber-50", rose:"text-rose-500 bg-rose-50" };

export default function SupportOverview() {
  return (
    <div className="p-8 bg-[#F8FAFC] min-h-full font-inter text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Track, manage and resolve all tenant and owner complaints efficiently.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600">
          <Calendar size={14} className="text-slate-400" />
          <span>May 22 – May 28, 2024</span>
        </div>
      </div>

      {/* 6 STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 mb-8">
        {[
          { icon: Ticket,       label: "Total Tickets",        val: "1,248",   trend: "+15.6%", sub: "from last week",  pos: true  },
          { icon: Clock,        label: "Open Tickets",         val: "362",     trend: "-8.4%",  sub: "from last week",  pos: false },
          { icon: History,      label: "In Progress",          val: "538",     trend: "+12.1%", sub: "from last week",  pos: true  },
          { icon: CheckCircle2, label: "Resolved Tickets",     val: "1,086",   trend: "+18.7%", sub: "from last week",  pos: true  },
          { icon: AlertCircle,  label: "Overdue Tickets",      val: "72",      trend: "-4.3%",  sub: "from last week",  pos: false },
          { icon: Clock,        label: "Avg. Resolution Time", val: "2.4 Days",trend: "-0.6 Days",sub:"from last week", pos: true  },
        ].map((c,i)=>(
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><c.icon size={16}/></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{c.label}</p>
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-1">{c.val}</h4>
            <div className="flex items-center gap-1 mb-3">
              <TrendingUp size={10} className={c.pos ? "text-emerald-500" : "text-rose-500"}/>
              <span className={cn("text-[10px] font-bold", c.pos ? "text-emerald-500" : "text-rose-500")}>{c.trend}</span>
              <span className="text-[10px] text-slate-300 font-medium">{c.sub}</span>
            </div>
            <button className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">View Details <ChevronRight size={10}/></button>
          </div>
        ))}
      </div>

      {/* MAIN ROW: Trend + Category Donut + Source Donut */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Tickets Trend */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col" style={{height:400}}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Tickets Trend</h3>
            <select className="bg-slate-50 rounded-xl px-3 py-1 text-[10px] font-bold text-slate-500 outline-none border-none"><option>This Week</option></select>
          </div>
          <div className="flex items-center gap-5 mb-4">
            {[{c:"bg-blue-500",l:"Opened"},{c:"bg-emerald-500",l:"Resolved"},{c:"bg-rose-500",l:"Overdue"}].map(l=>(
              <div key={l.l} className="flex items-center gap-1.5"><div className={cn("w-2 h-2 rounded-full",l.c)}/><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{l.l}</span></div>
            ))}
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:9,fontWeight:600}} dy={8}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:9,fontWeight:600}} dx={-8}/>
                <Tooltip/>
                <Line type="monotone" dataKey="opened"  stroke="#3B82F6" strokeWidth={2.5} dot={{fill:'#3B82F6',r:3}}/>
                <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2.5} dot={{fill:'#10B981',r:3}}/>
                <Line type="monotone" dataKey="overdue"  stroke="#EF4444" strokeWidth={2.5} dot={{fill:'#EF4444',r:3}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tickets by Category */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center" style={{height:400}}>
          <h3 className="text-base font-bold text-slate-900 mb-4 self-start">Tickets by Category</h3>
          <div className="relative flex items-center justify-center mb-4" style={{width:150,height:150}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={categoryData} innerRadius={48} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">{categoryData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-lg font-black text-slate-900">1,248</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Tickets</p>
            </div>
          </div>
          <div className="w-full space-y-2 mt-auto">
            {categoryData.map(c=>(
              <div key={c.name} className="flex items-center justify-between text-[10px] font-bold">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:c.color}}/><span className="text-slate-400 truncate max-w-[110px]">{c.name}</span></div>
                <span className="text-slate-900">{c.value} <span className="text-slate-300 font-medium">({c.pct})</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets by Source */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center" style={{height:400}}>
          <h3 className="text-base font-bold text-slate-900 mb-4 self-start">Tickets by Source</h3>
          <div className="relative flex items-center justify-center mb-4" style={{width:150,height:150}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={sourceData} innerRadius={48} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">{sourceData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-lg font-black text-slate-900">1,248</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Tickets</p>
            </div>
          </div>
          <div className="w-full space-y-3 mt-auto">
            {sourceData.map(s=>(
              <div key={s.name} className="flex items-center justify-between text-[10px] font-bold">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor:s.color}}/><span className="text-slate-400">{s.name}</span></div>
                <span className="text-slate-900">{s.value} <span className="text-slate-300 font-medium">({s.pct})</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MID METRICS BAR — 7 inline metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {midMetrics.map((m,i)=>(
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col items-center text-center hover:-translate-y-0.5 transition-all">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-2 shrink-0", iconColors[m.c])}><m.icon size={16}/></div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight mb-1">{m.label}</p>
            <h4 className="text-lg font-black text-slate-900">{m.val}</h4>
          </div>
        ))}
      </div>

      {/* TABLES ROW */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Recent Tickets */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Recent Tickets</h3>
            <button className="text-xs font-bold text-blue-600 flex items-center gap-1">View All Tickets <ChevronRight size={12}/></button>
          </div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-widest text-[9px] border-b border-slate-50">
                <th className="text-left py-3">Ticket ID</th>
                <th className="text-left py-3">Type</th>
                <th className="text-left py-3">Raised By</th>
                <th className="text-left py-3">Category</th>
                <th className="text-left py-3">Priority</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Assignee</th>
                <th className="text-right py-3">Created On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTickets.map((t,i)=>(
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 font-bold text-blue-600">{t.id}</td>
                  <td className="py-3">
                    <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold", t.type==="Tenant"?"bg-blue-50 text-blue-600":"bg-emerald-50 text-emerald-600")}>{t.type}</span>
                  </td>
                  <td className="py-3 font-bold text-slate-900">{t.raisedBy}</td>
                  <td className="py-3 text-slate-400">{t.category}</td>
                  <td className="py-3">
                    <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold", t.priority==="High"?"bg-rose-50 text-rose-600":t.priority==="Med"?"bg-amber-50 text-amber-600":"bg-slate-100 text-slate-500")}>{t.priority}</span>
                  </td>
                  <td className="py-3">
                    <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold", t.status==="Open"?"bg-blue-50 text-blue-600":t.status==="In Progress"?"bg-amber-50 text-amber-600":"bg-emerald-50 text-emerald-600")}>{t.status}</span>
                  </td>
                  <td className="py-3 font-bold text-slate-600">{t.assignee}</td>
                  <td className="py-3 text-right text-slate-300 text-[9px]">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-4 text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">View All Tickets <ChevronRight size={11}/></button>
        </div>

        {/* Issues Resolutions Tracking */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Issues Resolutions Tracking</h3>
            <select className="bg-slate-50 rounded-xl px-2 py-1 text-[9px] font-bold text-slate-500 outline-none border-none"><option>This Week</option></select>
          </div>
          <div className="relative flex items-center justify-center mb-4" style={{width:140,height:140,alignSelf:'center'}}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={8}/>
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-black text-slate-900">87%</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Resolution Rate</p>
            </div>
          </div>
          <div className="space-y-2.5 flex-1">
            {[
              {l:"Total Issues Raised",v:"1,248"},{l:"Total Resolved",v:"1,086"},
              {l:"Resolution Rate",v:"87%"},{l:"Avg. Resolution Time",v:"2.4 Days"},
              {l:"SLA Met",v:"1,052 (93%)"},{l:"SLA Breached",v:"96 (7%)"},
            ].map(r=>(
              <div key={r.l} className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-400">{r.l}</span>
                <span className="text-slate-900">{r.v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0"/>
            <p className="text-[10px] font-bold text-emerald-700">Great job! Your resolution rate is higher than last week.</p>
          </div>
        </div>
      </div>

      {/* FOOTER ROW: 6 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Top Issue Categories */}
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h4 className="text-[11px] font-bold text-slate-900 mb-4">Top Issue Categories</h4>
          <div className="space-y-3">
            {categoryData.slice(0,3).map(c=>(
              <div key={c.name}>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-slate-500">{c.name}</span>
                  <span className="text-slate-900">{c.value} ({c.pct})</span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{backgroundColor:c.color,width:c.pct}}/>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">View Full Report <ChevronRight size={10}/></button>
        </div>

        {/* Resolution Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
          <h4 className="text-[11px] font-bold text-slate-900 mb-3">Resolution Time (Avg.)</h4>
          <p className="text-2xl font-black text-slate-900 leading-none mb-1">2.4 Days</p>
          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mb-3"><ArrowDownRight size={10}/> 0.6 Days from last week</span>
          <div className="flex-1 min-h-[40px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}><Area type="monotone" dataKey="v" stroke="#10B981" fill="#D1FAE5" strokeWidth={1.5}/></AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Performance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
          <h4 className="text-[11px] font-bold text-slate-900 mb-3">SLA Performance</h4>
          <p className="text-2xl font-black text-slate-900 leading-none mb-1">93%</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">SLA Met this week</p>
          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mb-3"><TrendingUp size={10}/> +5% from last week</span>
          <div className="flex-1 min-h-[40px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}><Area type="monotone" dataKey="v" stroke="#6366F1" fill="#EDE9FE" strokeWidth={1.5}/></AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h4 className="text-[11px] font-bold text-slate-900 mb-3">Customer Satisfaction</h4>
          <p className="text-2xl font-black text-slate-900 leading-none mb-1">4.6 / 5</p>
          <div className="flex items-center gap-0.5 mb-2">
            {[1,2,3,4,5].map(i=><Star key={i} size={12} className="text-amber-400 fill-amber-400"/>)}
          </div>
          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><TrendingUp size={10}/> +0.3 from last week</span>
        </div>

        {/* Pending High Priority */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
          <h4 className="text-[11px] font-bold text-slate-900 mb-3">Pending High Priority</h4>
          <p className="text-3xl font-black text-rose-500 leading-none mb-1">18</p>
          <p className="text-[10px] text-slate-400 font-medium mb-auto">Requires immediate attention</p>
          <button className="mt-4 text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">View Tickets <ChevronRight size={10}/></button>
        </div>

        {/* Export Reports */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
          <h4 className="text-[11px] font-bold text-slate-900 mb-3">Export Reports</h4>
          <p className="text-[10px] text-slate-400 font-medium mb-4">Download support reports in PDF or Excel format.</p>
          <select className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-500 outline-none mb-3 cursor-pointer">
            <option>Export Report</option>
          </select>
          <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all">Download</button>
        </div>
      </div>
    </div>
  );
}
