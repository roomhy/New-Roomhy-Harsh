import React, { useState } from "react";
import { MapPin, TrendingUp, TrendingDown, Download, Award, AlertTriangle } from "lucide-react";
import { PageHeader } from "../../components/superadmin/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

const cn = (...c) => c.filter(Boolean).join(" ");

const LOCATIONS = [
  { rank: 1, loc: "Koramangala, Bangalore", leads: 856, bookings: 278, revenue: 3248000, conversion: 32.4, occupancy: 91 },
  { rank: 2, loc: "Andheri West, Mumbai",   leads: 742, bookings: 216, revenue: 2980000, conversion: 29.1, occupancy: 88 },
  { rank: 3, loc: "Baner, Pune",            leads: 620, bookings: 167, revenue: 2340000, conversion: 26.9, occupancy: 85 },
  { rank: 4, loc: "Whitefield, Bangalore",  leads: 512, bookings: 124, revenue: 1920000, conversion: 24.2, occupancy: 82 },
  { rank: 5, loc: "Gachibowli, Hyderabad",  leads: 478, bookings: 104, revenue: 1680000, conversion: 21.8, occupancy: 79 },
  { rank: 6, loc: "Velachery, Chennai",     leads: 390, bookings: 82,  revenue: 1240000, conversion: 21.0, occupancy: 76 },
  { rank: 7, loc: "Sector 62, Noida",       leads: 340, bookings: 68,  revenue: 1080000, conversion: 20.0, occupancy: 72 },
  { rank: 8, loc: "Kothrud, Pune",          leads: 290, bookings: 48,  revenue: 820000,  conversion: 16.6, occupancy: 65 },
];

const TABS = ["By Revenue", "By Bookings", "By Conversion", "By Occupancy"];
const TAB_KEY = { "By Revenue": "revenue", "By Bookings": "bookings", "By Conversion": "conversion", "By Occupancy": "occupancy" };
const COLORS = ["#6366F1","#3B82F6","#06B6D4","#10B981","#F59E0B","#EC4899","#8B5CF6","#EF4444"];

const fmt = (val, key) => {
  if (key === "revenue") return `₹${(val/100000).toFixed(1)}L`;
  if (key === "conversion" || key === "occupancy") return `${val}%`;
  return val;
};

export default function TopPerformingLocations() {
  const [activeTab, setActiveTab] = useState("By Revenue");
  const sortKey = TAB_KEY[activeTab];
  const sorted = [...LOCATIONS].sort((a, b) => b[sortKey] - a[sortKey]);
  const chartKey = sortKey;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Top Performing Locations"
        subtitle="Identify your best-performing markets by revenue, bookings, and conversion."
        breadcrumbs={[{ label: "Booking & Leads" }, { label: "Top Performing Locations", active: true }]}
        actions={
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm">
            <Download size={14} /> Export CSV
          </button>
        }
      />

      {/* Insight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Highest Revenue",    val: "Koramangala",  sub: "₹32.5L this month",  icon: Award,         color: "blue"   },
          { label: "Highest Conversion", val: "Koramangala",  sub: "32.4% conv. rate",   icon: TrendingUp,    color: "emerald"},
          { label: "Fastest Growing",    val: "Baner, Pune",  sub: "+34% MoM bookings",  icon: TrendingUp,    color: "purple" },
          { label: "Lowest Performing",  val: "Kothrud, Pune",sub: "65% occupancy",      icon: AlertTriangle, color: "red"    },
        ].map(c => (
          <div key={c.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-3", `bg-${c.color}-50 text-${c.color}-600`)}>
              <c.icon size={16} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{c.label}</p>
            <p className="text-base font-black text-slate-900 mt-1">{c.val}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Chart + Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-4 text-xs font-bold whitespace-nowrap transition-all border-b-2",
                activeTab === tab
                  ? "border-blue-600 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="p-6 border-b border-slate-50">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sorted} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9"/>
                <XAxis dataKey="loc" axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:9,fontWeight:600}} interval={0} angle={-15} textAnchor="end" height={50}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:9,fontWeight:600}} tickFormatter={v => fmt(v, chartKey)}/>
                <Tooltip formatter={v => [fmt(v, chartKey), activeTab.replace("By ","")]}/>
                <Bar dataKey={chartKey} radius={[6,6,0,0]}>
                  {sorted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left">#</th>
                <th className="px-6 py-4 text-left">Location</th>
                <th className="px-6 py-4 text-right">Total Leads</th>
                <th className="px-6 py-4 text-right">Bookings</th>
                <th className="px-6 py-4 text-right">Revenue</th>
                <th className="px-6 py-4 text-right">Conv. Rate</th>
                <th className="px-6 py-4 text-right">Occupancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.map((loc, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black",
                      i === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                    )}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-slate-300 shrink-0"/>
                      <span className="text-xs font-bold text-slate-900">{loc.loc}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-bold text-slate-700">{loc.leads.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-xs font-bold text-slate-700">{loc.bookings.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-black text-slate-900">₹{(loc.revenue/100000).toFixed(1)}L</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn("text-xs font-black", loc.conversion >= 25 ? "text-emerald-600" : loc.conversion >= 20 ? "text-amber-600" : "text-red-500")}>
                      {loc.conversion}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{width:`${loc.occupancy}%`}}/>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">{loc.occupancy}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
