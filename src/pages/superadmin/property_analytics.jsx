import React, { useState, useEffect } from "react";
import { 
  Eye, MousePointerClick, MessageSquare, TrendingUp,
  Search, Filter, RefreshCw, ArrowUpRight, 
  ArrowDownRight, Layers, Globe, Activity,
  ChevronRight, Calendar, BarChart3, AlertCircle, Building2, Percent
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function Analytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [localities, setLocalities] = useState([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState([]);
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkType, setBulkType] = useState("percentage");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [demandRes, localityRes] = await Promise.all([
        fetchJson("/api/reports/superadmin/demand"),
        fetchJson("/api/reports/locality-analytics")
      ]);
      if (demandRes && demandRes.success) {
        setData(demandRes.properties || []);
      }
      if (localityRes && localityRes.success) {
        setLocalities(localityRes.localities || []);
      }
    } catch (err) {
      console.error("Failed to load demand reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRentUpdate = async () => {
    if (selectedPropertyIds.length === 0) return alert("Select at least one property");
    if (!bulkAmount || isNaN(Number(bulkAmount))) return alert("Enter a valid amount");

    setBulkUpdating(true);
    try {
      const res = await fetchJson("/api/reports/bulk-rent-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyIds: selectedPropertyIds,
          type: bulkType,
          amount: Number(bulkAmount)
        })
      });
      if (res && res.success) {
        setSuccessMsg(`Successfully updated rent for ${selectedPropertyIds.length} properties.`);
        setSelectedPropertyIds([]);
        setBulkAmount("");
        setShowBulkModal(false);
        await loadData();
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        alert(res?.message || "Failed to bulk update rent");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setBulkUpdating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full flex flex-col items-center justify-center py-40">
        <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing Property Intelligence...</p>
      </div>
    );
  }

  // Filtered properties
  const filteredProperties = data.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.locality || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.ownerName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics from real data
  const totalViews = data.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalClicks = data.reduce((sum, p) => sum + (p.clicks || 0), 0);
  const totalInquiries = data.reduce((sum, p) => sum + (p.inquiryCount || 0), 0);
  const averageOccupancy = data.length > 0 
    ? Math.round(data.reduce((sum, p) => sum + (p.occupancyPct || 0), 0) / data.length) 
    : 0;

  const globalConversion = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(2) : "0.00";

  // City Yield Data
  const cityViewsMap = {};
  data.forEach(p => {
    const city = p.city || "GEN";
    cityViewsMap[city] = (cityViewsMap[city] || 0) + (p.views || 0);
  });
  const cityViewsData = Object.keys(cityViewsMap).map(city => ({
    city,
    views: cityViewsMap[city]
  })).sort((a, b) => b.views - a.views);

  // Type Segment Distribution (Dummy segments derived from names or properties)
  const segmentCounts = { PG: 0, Hostel: 0, Apartment: 0, CoLiving: 0 };
  data.forEach(p => {
    const name = (p.title || "").toLowerCase();
    if (name.includes("pg")) segmentCounts.PG++;
    else if (name.includes("hostel")) segmentCounts.Hostel++;
    else if (name.includes("apartment") || name.includes("flat")) segmentCounts.Apartment++;
    else segmentCounts.CoLiving++;
  });
  const totalProperties = data.length || 1;
  const segmentsData = [
    { name: "PG", value: Math.round((segmentCounts.PG / totalProperties) * 100), color: "#2563eb" },
    { name: "Hostel", value: Math.round((segmentCounts.Hostel / totalProperties) * 100), color: "#10b981" },
    { name: "Apartment", value: Math.round((segmentCounts.Apartment / totalProperties) * 100), color: "#6366f1" },
    { name: "Co-Living", value: Math.max(1, 100 - Math.round((segmentCounts.PG / totalProperties) * 100) - Math.round((segmentCounts.Hostel / totalProperties) * 100) - Math.round((segmentCounts.Apartment / totalProperties) * 100)), color: "#f59e0b" }
  ].filter(s => s.value > 0);

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Intelligence Hub</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform Engagement Pulse & Market Intelligence</p>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={loadData} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-slate-800/10 hover:bg-slate-900 transition-all flex items-center gap-2">
               <RefreshCw className="w-3.5 h-3.5" /> Re-Sync
            </button>
         </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
          {successMsg}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Global Views" value={totalViews.toLocaleString()} trend="All Listings" icon={Eye} color="blue" />
        <StatCardHorizontal label="Yield Clicks" value={totalClicks.toLocaleString()} trend="All Listings" icon={MousePointerClick} color="emerald" />
        <StatCardHorizontal label="Active Enquiries" value={totalInquiries.toLocaleString()} trend="All Listings" icon={MessageSquare} color="indigo" />
        <StatCardHorizontal label="Global Conversion" value={`${globalConversion}%`} trend="Views to Leads" icon={TrendingUp} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* City/Regional Performance */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Regional Yield (Views by City)</h3>
          </div>
          <div className="h-64">
            {cityViewsData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest text-xs">No Data Generated Yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityViewsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="city" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 700 }}
                  />
                  <Bar dataKey="views" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Type Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col">
           <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-8">Asset Segments</h3>
           <div className="h-44 relative mb-4">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={segmentsData} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={8} stroke="none">
                       {segmentsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-xl font-bold text-slate-800 leading-none">{averageOccupancy}%</p>
                 <p className="text-[7px] text-slate-400 font-bold uppercase mt-0.5">Avg Occupancy</p>
              </div>
           </div>
           <div className="mt-auto space-y-2.5">
              {segmentsData.map((s) => (
                <div key={s.name} className="flex items-center justify-between group">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-800 transition-colors">{s.name}</span>
                   </div>
                   <span className="text-[9px] font-bold text-slate-800">{s.value}%</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Area Heatmap & Grades Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Demand Heatmap */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-4">Area Demand Heatmap (Localities)</h3>
          <div className="overflow-y-auto max-h-60 flex-1 divide-y divide-slate-50">
            {localities.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center py-10">No Locality Analytics Available</p>
            ) : (
              localities.map((loc, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[12px] font-bold text-slate-800">{loc.locality}</span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{loc.city}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                      loc.status === 'High Demand' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      loc.status === 'Low Demand' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>{loc.status}</span>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">{loc.occupancyPct}% Occ • {loc.inquiryCount} Leads</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global Health Grades Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-4">Global Health Grade Distribution</h3>
          <div className="flex-1 flex flex-col justify-center gap-4">
            {['A', 'B', 'C', 'D'].map(grade => {
              const count = data.filter(p => p.healthGrade === grade).length;
              const pct = data.length > 0 ? Math.round((count / data.length) * 100) : 0;
              const colors = {
                A: 'bg-amber-500',
                B: 'bg-blue-600',
                C: 'bg-slate-600',
                D: 'bg-rose-600'
              };
              return (
                <div key={grade} className="flex items-center justify-between gap-4">
                  <span className="w-16 text-xs font-bold text-slate-700">Grade {grade}</span>
                  <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", colors[grade])} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-16 text-right text-xs font-black text-slate-800">{count} PGs ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Property Ledger Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col">
         <div className="flex items-center justify-between mb-8 flex-col sm:flex-row gap-4">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Global Property Demand Mapping</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
               <div className="relative group flex-1 sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search properties, areas, owners..." 
                    className="w-full bg-[#F8FAFC] border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-xs font-bold shadow-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" 
                  />
               </div>
               <select 
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="bg-[#F8FAFC] border border-slate-100 rounded-xl py-2 px-4 text-xs font-bold shadow-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
               >
                 <option value="all">All Demands</option>
                 <option value="High">High Demand</option>
                 <option value="Stable">Stable</option>
                 <option value="Low">Low Demand</option>
                 <option value="Interest">High Interest</option>
               </select>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                     <th className="text-left py-4 font-bold w-8">
                       <input 
                         type="checkbox" 
                         checked={selectedPropertyIds.length === filteredProperties.length && filteredProperties.length > 0}
                         onChange={(e) => {
                           if (e.target.checked) {
                             setSelectedPropertyIds(filteredProperties.map(p => p.id));
                           } else {
                             setSelectedPropertyIds([]);
                           }
                         }}
                         className="rounded border-slate-300"
                       />
                     </th>
                     <th className="text-left py-4 font-bold">Property Details</th>
                     <th className="text-left py-4 font-bold">Owner Info</th>
                     <th className="text-center py-4 font-bold">Locality</th>
                     <th className="text-center py-4 font-bold">Views / Clicks / Inquiries</th>
                     <th className="text-center py-4 font-bold">Occupancy</th>
                     <th className="text-right py-4 font-bold">Demand Badge</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredProperties.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <div className="flex flex-col items-center gap-3 justify-center">
                          <AlertCircle className="text-slate-300" size={32} />
                          No Properties Registered under active filters
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProperties.map((p, i) => {
                      const isHighDemand = p.status.includes("High");
                      const isLowDemand = p.status.includes("Low") || p.status.includes("Visibility");

                      return (
                        <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="py-4 w-8">
                             <input 
                               type="checkbox" 
                               checked={selectedPropertyIds.includes(p.id)}
                               onChange={(e) => {
                                 if (e.target.checked) {
                                   setSelectedPropertyIds([...selectedPropertyIds, p.id]);
                                 } else {
                                   setSelectedPropertyIds(selectedPropertyIds.filter(id => id !== p.id));
                                 }
                               }}
                               className="rounded border-slate-300"
                             />
                           </td>
                           <td className="py-4">
                              <div>
                                 <span className="font-bold text-[13px] text-slate-900 group-hover:text-blue-600 transition-colors">{p.title}</span>
                                 <div className="flex items-center gap-2 mt-1">
                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Base Rent: ₹{p.monthlyRent.toLocaleString('en-IN')}</span>
                                   <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black ${
                                     p.healthGrade === 'A' ? 'bg-amber-100 text-amber-800' :
                                     p.healthGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                                     p.healthGrade === 'C' ? 'bg-slate-100 text-slate-800' :
                                     'bg-rose-100 text-rose-800'
                                   }`}>Grade {p.healthGrade}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 text-left">
                             <span className="text-[12px] text-slate-700 font-bold block">{p.ownerName || "N/A"}</span>
                             <span className="text-[10px] text-slate-400 font-medium block">{p.ownerPhone || ""}</span>
                           </td>
                           <td className="py-4 text-center text-[12px] text-slate-400 font-bold">{p.locality}, {p.city}</td>
                           <td className="py-4 text-center">
                             <div className="flex items-center justify-center gap-3">
                               <span className="text-[11px] text-slate-700 font-bold flex items-center gap-1"><Eye size={12} className="text-slate-400" />{p.views}</span>
                               <span className="text-[11px] text-slate-700 font-bold flex items-center gap-1"><MousePointerClick size={12} className="text-slate-400" />{p.clicks}</span>
                               <span className="text-[11px] text-slate-700 font-bold flex items-center gap-1"><MessageSquare size={12} className="text-slate-400" />{p.inquiryCount}</span>
                             </div>
                           </td>
                           <td className="py-4 text-center font-black text-[13px] text-slate-800">{p.occupancyPct}%</td>
                           <td className="py-4 text-right">
                             <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                               isHighDemand ? "bg-amber-100 text-amber-800 border border-amber-200" :
                               isLowDemand ? "bg-rose-100 text-rose-800 border border-rose-200" :
                               "bg-emerald-100 text-emerald-800 border border-emerald-200"
                             }`}>
                               {p.status}
                             </span>
                           </td>
                        </tr>
                      );
                    })
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Floating Bulk Operations Bar */}
      {selectedPropertyIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-6 z-50">
          <span className="text-xs font-black uppercase tracking-wider">{selectedPropertyIds.length} properties selected</span>
          
          <div className="flex items-center gap-2">
            <select
              value={bulkType}
              onChange={(e) => setBulkType(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl py-1 px-3 text-xs font-bold"
            >
              <option value="percentage">Change by %</option>
              <option value="fixed">Change by ₹</option>
            </select>
            
            <input
              type="number"
              placeholder={bulkType === 'percentage' ? "e.g. -5 or 8" : "e.g. -500 or 1000"}
              value={bulkAmount}
              onChange={(e) => setBulkAmount(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl py-1.5 px-3 text-xs font-bold w-24 text-center placeholder:text-slate-500 outline-none"
            />
          </div>

          <button
            onClick={handleBulkRentUpdate}
            disabled={bulkUpdating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:bg-slate-700 flex items-center gap-1.5"
          >
            {bulkUpdating ? <RefreshCw size={12} className="animate-spin" /> : "Apply Update"}
          </button>
          
          <button
            onClick={() => setSelectedPropertyIds([])}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function StatCardHorizontal({ label, value, trend, icon: Icon, color }) {
  const bgColors = { 
    blue: "bg-blue-50 text-blue-600 border-blue-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", 
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
         <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">{trend}</p>
      </div>
    </div>
  );
}
