import React from "react";
import { Users, Calendar, ChevronRight, TrendingUp, ArrowUpRight, MapPin, IndianRupee, Clock, Percent } from "lucide-react";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from "recharts";

const cn = (...c) => c.filter(Boolean).join(" ");

const trendData = [
  { name: "May 22", leads: 250, bookings: 120 },
  { name: "May 23", leads: 480, bookings: 180 },
  { name: "May 24", leads: 420, bookings: 210 },
  { name: "May 25", leads: 680, bookings: 240 },
  { name: "May 26", leads: 520, bookings: 220 },
  { name: "May 27", leads: 750, bookings: 310 },
  { name: "May 28", leads: 620, bookings: 290 },
];

const funnelData = [
  { label: "Total Leads",  val: "3,689", pct: null,     color: "#6366F1", w: 100 },
  { label: "Contacted",    val: "2,456", pct: "66.6%",  color: "#3B82F6", w: 82 },
  { label: "Interested",   val: "1,254", pct: "34.0%",  color: "#22D3EE", w: 64 },
  { label: "Site Visit",   val: "986",   pct: "26.7%",  color: "#10B981", w: 48 },
  { label: "Bookings",     val: "876",   pct: "23.5%",  color: "#F59E0B", w: 34 },
];

const recentLeads = [
  { name: "Rohan Mehta",  loc: "Andheri West, Mumbai",    src: "Website",  budget: "₹20K - ₹25K", status: "New",       sc: "bg-blue-50 text-blue-600",   time: "May 28, 2024 10:30 AM" },
  { name: "Priya Sharma", loc: "Koramangala, Bangalore",  src: "WhatsApp", budget: "₹15K - ₹20K", status: "Contacted", sc: "bg-amber-50 text-amber-600", time: "May 28, 2024 09:45 AM" },
  { name: "Amit Verma",   loc: "Pune",                    src: "App",      budget: "₹18K - ₹22K", status: "Interested",sc: "bg-purple-50 text-purple-600",time: "May 28, 2024 09:20 AM" },
  { name: "Neha Singh",   loc: "Hyderabad",               src: "Website",  budget: "₹12K - ₹18K", status: "Site Visit", sc: "bg-emerald-50 text-emerald-600",time: "May 28, 2024 08:55 AM"},
  { name: "Vikram Joshi", loc: "Thane, Mumbai",           src: "Referral", budget: "₹22K - ₹28K", status: "New",       sc: "bg-blue-50 text-blue-600",   time: "May 28, 2024 08:30 AM" },
];

const topLocations = [
  { loc: "Andheri West, Mumbai",     leads: 856, bookings: 234, rate: "27.34%", w: "75%" },
  { loc: "Koramangala, Bangalore",   leads: 642, bookings: 176, rate: "27.42%", w: "76%" },
  { loc: "Baner, Pune",              leads: 512, bookings: 138, rate: "26.95%", w: "74%" },
  { loc: "Whitefield, Bangalore",    leads: 478, bookings: 121, rate: "25.31%", w: "72%" },
  { loc: "Indiranagar, Bangalore",   leads: 421, bookings: 102, rate: "24.23%", w: "70%" },
];

const sourceData = [
  { name: "Website",  value: 1542, color: "#6366F1", pct: "41.8%" },
  { name: "WhatsApp", value: 1021, color: "#3B82F6", pct: "27.7%" },
  { name: "App",      value: 678,  color: "#10B981", pct: "18.4%" },
  { name: "Referral", value: 448,  color: "#F59E0B", pct: "12.1%" },
];

const statusData = [
  { name: "New",       value: 1245, color: "#6366F1", pct: "33.7%" },
  { name: "Contacted", value: 1021, color: "#3B82F6", pct: "27.7%" },
  { name: "Interested",value: 812,  color: "#10B981", pct: "22.0%" },
  { name: "Site Visit",value: 356,  color: "#F59E0B", pct: "9.6%"  },
  { name: "Converted", value: 255,  color: "#EC4899", pct: "6.9%"  },
];

const sparkData = [
  {v:10},{v:18},{v:14},{v:22},{v:19},{v:28},{v:24}
];

export default function BookingOverview() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Booking & Leads Overview"
        subtitle="Track your leads, bookings and conversion performance."
        actions={
          <div className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600">
            <Calendar size={14} className="text-slate-400" />
            <span>May 22 – May 28, 2024</span>
          </div>
        }
      />

      {/* 6 STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 mb-8">
        {[
          { icon: Users,    label: "Total Leads (Today)",      val: "128",        trend: "+18.5%", sub: "from yesterday"   },
          { icon: Users,    label: "Total Leads (This Week)",  val: "894",        trend: "+16.3%", sub: "from last week"    },
          { icon: Users,    label: "Total Leads (This Month)", val: "3,689",      trend: "+21.8%", sub: "from last month"   },
          { icon: Calendar, label: "Bookings (Today)",         val: "32",         trend: "+23.1%", sub: "from yesterday"    },
          { icon: Calendar, label: "Bookings (This Week)",     val: "210",        trend: "+19.4%", sub: "from last week"    },
          { icon: Calendar, label: "Bookings (This Month)",    val: "876",        trend: "+24.7%", sub: "from last month"   },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <c.icon size={16} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{c.label}</p>
            </div>
            <h4 className="text-2xl font-black text-slate-900 mb-1">{c.val}</h4>
            <div className="flex items-center gap-1 mb-3">
              <TrendingUp size={10} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500">{c.trend}</span>
              <span className="text-[10px] text-slate-300 font-medium">{c.sub}</span>
            </div>
            <button className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">View Details <ChevronRight size={10} /></button>
          </div>
        ))}
      </div>

      {/* MAIN ROW: Chart + Conversion + Funnel */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Leads vs Bookings Trend */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col" style={{height: 400}}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Leads vs Bookings Trend</h3>
            <select className="bg-slate-50 rounded-xl px-3 py-1 text-[10px] font-bold text-slate-500 outline-none border-none">
              <option>This Week</option>
            </select>
          </div>
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"/><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leads</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bookings</span></div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:9,fontWeight:600}} dy={8}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:9,fontWeight:600}} dx={-8} tickFormatter={v=>`${v/1000>0.5?Math.round(v/100)/10+'k':v}`}/>
                <Tooltip/>
                <Area type="monotone" dataKey="leads" stroke="#3B82F6" strokeWidth={2.5} fill="url(#gLeads)" dot={{fill:'#3B82F6',r:3}}/>
                <Area type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={2.5} fill="none" dot={{fill:'#10B981',r:3}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center" style={{height: 400}}>
          <h3 className="text-base font-bold text-slate-900 mb-6 self-start">Conversion Rate %</h3>
          <div className="relative flex items-center justify-center" style={{width:180,height:160}}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{name:'r',value:23.45,fill:'#3B82F6'}]} startAngle={180} endAngle={0}>
                <RadialBar background dataKey="value" cornerRadius={8}/>
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
              <p className="text-2xl font-black text-slate-900">23.45%</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Conversion Rate</p>
            </div>
            <div className="absolute bottom-0 left-2 text-[9px] font-bold text-slate-300">0%</div>
            <div className="absolute bottom-0 right-2 text-[9px] font-bold text-slate-300">100%</div>
          </div>
          <div className="grid grid-cols-2 gap-6 w-full mt-auto pt-6 border-t border-slate-50">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Previous Period</p>
              <p className="text-lg font-black text-slate-900">19.02%</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Improvement</p>
              <p className="text-lg font-black text-emerald-500">+4.43%</p>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col" style={{height: 400}}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Conversion Funnel</h3>
            <select className="bg-slate-50 rounded-xl px-3 py-1 text-[10px] font-bold text-slate-500 outline-none border-none">
              <option>This Month</option>
            </select>
          </div>
          {/* Visual Funnel */}
          <div className="flex-1 flex flex-col justify-center gap-1.5">
            {funnelData.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex justify-center" style={{width: '100%'}}>
                  <div
                    className="flex items-center justify-between px-4 rounded-lg transition-all"
                    style={{
                      backgroundColor: f.color,
                      width: `${f.w}%`,
                      height: 36,
                      opacity: 0.85 + i * 0.03,
                    }}
                  >
                    <span className="text-white text-[11px] font-bold">{f.label}</span>
                    <span className="text-white text-[11px] font-black">{f.val}{f.pct ? ` (${f.pct})` : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
            <span className="text-[11px] font-bold text-slate-400">Overall Conversion Rate</span>
            <span className="text-base font-black text-blue-600">23.45%</span>
          </div>
        </div>
      </div>

      {/* TABLES ROW */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Recent Leads */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Recent Leads</h3>
            <button className="text-xs font-bold text-blue-600">View All</button>
          </div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-widest text-[9px] border-b border-slate-50">
                <th className="text-left py-3">Lead Name</th>
                <th className="text-left py-3">Location</th>
                <th className="text-left py-3">Source</th>
                <th className="text-left py-3">Budget</th>
                <th className="text-left py-3">Status</th>
                <th className="text-right py-3">Created On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentLeads.map((l, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[9px] shrink-0">
                        {l.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <span className="font-bold text-slate-900">{l.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400">{l.loc}</td>
                  <td className="py-3 font-bold text-slate-600">{l.src}</td>
                  <td className="py-3 font-black text-slate-900">{l.budget}</td>
                  <td className="py-3">
                    <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold", l.sc)}>{l.status}</span>
                  </td>
                  <td className="py-3 text-right text-slate-300">{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Performing Locations */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Top Performing Locations</h3>
            <select className="bg-slate-50 rounded-xl px-3 py-1 text-[10px] font-bold text-slate-500 outline-none border-none">
              <option>This Month</option>
            </select>
          </div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest grid grid-cols-12 gap-2 px-1 mb-3">
            <span className="col-span-1">#</span>
            <span className="col-span-4">Location</span>
            <span className="col-span-2 text-center">Leads</span>
            <span className="col-span-2 text-center">Bookings</span>
            <span className="col-span-3 text-right">Conv. Rate</span>
          </div>
          <div className="space-y-4 flex-1">
            {topLocations.map((t, i) => (
              <div key={i}>
                <div className="grid grid-cols-12 gap-2 items-center px-1 mb-1">
                  <span className="col-span-1 text-[11px] font-bold text-slate-300">{i+1}</span>
                  <span className="col-span-4 text-[11px] font-bold text-slate-900 truncate">{t.loc}</span>
                  <span className="col-span-2 text-center text-[11px] font-bold text-slate-600">{t.leads}</span>
                  <span className="col-span-2 text-center text-[11px] font-bold text-slate-600">{t.bookings}</span>
                  <span className="col-span-3 text-right text-[11px] font-black text-blue-600">{t.rate}</span>
                </div>
                <div className="h-1 bg-slate-50 rounded-full overflow-hidden mx-1">
                  <div className="h-full bg-blue-500 rounded-full" style={{width: t.w}}/>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">View All Locations <ChevronRight size={11}/></button>
        </div>
      </div>

      {/* FOOTER ROW: 5 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Lead Sources */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-bold text-slate-900">Lead Sources</h4>
            <span className="text-[9px] text-slate-400 font-bold">This Month</span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{width:70,height:70}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} innerRadius={20} outerRadius={32} paddingAngle={3} dataKey="value" stroke="none">
                    {sourceData.map((e,idx)=><Cell key={idx} fill={e.color}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {sourceData.map(s=>(
                <div key={s.name} className="flex justify-between text-[9px] font-bold">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:s.color}}/><span className="text-slate-400">{s.name}</span></div>
                  <span className="text-slate-900">{s.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-bold text-slate-900">Lead Status</h4>
            <span className="text-[9px] text-slate-400 font-bold">This Month</span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{width:70,height:70}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} innerRadius={20} outerRadius={32} paddingAngle={3} dataKey="value" stroke="none">
                    {statusData.map((e,idx)=><Cell key={idx} fill={e.color}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {statusData.map(s=>(
                <div key={s.name} className="flex justify-between text-[9px] font-bold">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:s.color}}/><span className="text-slate-400">{s.name}</span></div>
                  <span className="text-slate-900">{s.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
          <h4 className="text-[11px] font-bold text-slate-900 mb-3">Avg. Response Time</h4>
          <p className="text-2xl font-black text-slate-900 mb-1">2h 18m</p>
          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mb-3"><TrendingUp size={10}/> +18.5% from last month</span>
          <div className="flex-1 min-h-[50px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}>
                <Area type="monotone" dataKey="v" stroke="#10B981" fill="#D1FAE5" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
          <h4 className="text-[11px] font-bold text-slate-900 mb-3">Bookings Value</h4>
          <p className="text-xl font-black text-slate-900 mb-1">₹2,48,76,320</p>
          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mb-3"><TrendingUp size={10}/> +22.4% from last month</span>
          <div className="flex-1 min-h-[50px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}>
                <Area type="monotone" dataKey="v" stroke="#3B82F6" fill="#DBEAFE" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Converting Agents */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-bold text-slate-900">Top Converting Agents</h4>
            <button className="text-[9px] font-bold text-blue-600">View All</button>
          </div>
          <div className="space-y-4">
            {[{n:"Rahul Singh",r:"48.6%",i:"RS"},{n:"Priya Nair",r:"45.2%",i:"PN"},{n:"Amit Patel",r:"42.7%",i:"AP"}].map((a,i)=>(
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[9px] shrink-0">{a.i}</div>
                  <span className="text-[11px] font-bold text-slate-700">{a.n}</span>
                </div>
                <span className="text-[11px] font-black text-slate-900">{a.r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
