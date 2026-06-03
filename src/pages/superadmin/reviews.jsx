import React from "react";
import { Star, MessageSquare, Clock, ThumbsUp, ChevronRight, TrendingUp, Calendar, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { fetchJson } from "../../utils/api";

const cn = (...c) => c.filter(Boolean).join(" ");

const trendData = [
  { name: "May 22", reviews: 40, rating: 4.2 },
  { name: "May 23", reviews: 65, rating: 4.5 },
  { name: "May 24", reviews: 55, rating: 4.3 },
  { name: "May 25", reviews: 85, rating: 4.6 },
  { name: "May 26", reviews: 75, rating: 4.4 },
  { name: "May 27", reviews: 105, rating: 4.7 },
  { name: "May 28", reviews: 120, rating: 4.8 },
];

const ratingData = [
  { name: "5 Star", value: 5126, color: "#10B981", pct: "58.7%" },
  { name: "4 Star", value: 2201, color: "#3B82F6", pct: "25.2%" },
  { name: "3 Star", value: 879,  color: "#F59E0B", pct: "10.1%" },
  { name: "2 Star", value: 312,  color: "#EF4444", pct: "3.6%"  },
  { name: "1 Star", value: 224,  color: "#94A3B8", pct: "2.4%"  },
];

const platformData = [
  { name: "Website",    value: 4521, color: "#3B82F6", pct: "51.7%" },
  { name: "Mobile App", value: 2841, color: "#10B981", pct: "32.5%" },
  { name: "Google",     value: 1023, color: "#F59E0B", pct: "11.7%" },
  { name: "Others",     value: 357,  color: "#6366F1", pct: "4.1%"  },
];

const recentReviews = [
  { reviewer: "Rahul Sharma", property: "Sunrise Residency", loc: "Mumbai",    rating: 5, review: "Excellent property and amazing management. Highly recommend!", date: "May 28, 2024 10:30 AM", status: "Published"    },
  { reviewer: "Priya Mehta",  property: "Green Valley PG",   loc: "Bangalore", rating: 5, review: "Good location and clean rooms. Had a good experience.",        date: "May 28, 2024 09:15 AM", status: "Published"    },
  { reviewer: "Vikram Joshi", property: "Urban Nest",         loc: "Pune",      rating: 3, review: "Decent place but can improve maintenance.",                    date: "May 28, 2024 08:45 AM", status: "Under Review" },
  { reviewer: "Neha Singh",   property: "Lakeview Apartments",loc: "Hyderabad", rating: 5, review: "Beautiful view and great amenities! Loved my stay.",           date: "May 28, 2024 07:30 AM", status: "Published"    },
  { reviewer: "Amit Patel",   property: "Skyline PG",         loc: "Delhi",     rating: 2, review: "Not satisfied with the services. Need improvement.",           date: "May 28, 2024 06:00 AM", status: "Under Review" },
];

const topProperties = [
  { name: "Sunrise Residency",   loc: "Mumbai",    rating: 4.8, count: 842  },
  { name: "Lakeview Apartments", loc: "Hyderabad", rating: 4.6, count: 621  },
  { name: "Green Valley PG",     loc: "Bangalore", rating: 4.5, count: 1203 },
  { name: "Urban Nest",          loc: "Pune",      rating: 4.3, count: 532  },
  { name: "Skyline PG",          loc: "Delhi",     rating: 4.1, count: 317  },
];

const sentimentData = [
  { name: "Positive", value: 6128, color: "#10B981", pct: "70.1%" },
  { name: "Neutral",  value: 1659, color: "#3B82F6", pct: "19.0%" },
  { name: "Negative", value: 955,  color: "#EF4444", pct: "10.9%" },
];

const sparkData = [{v:40},{v:65},{v:55},{v:85},{v:75},{v:105},{v:120}];

function Stars({ count, size = 12 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} className={i <= count ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
      ))}
    </div>
  );
}

export default function ReviewOverview() {
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchJson("/api/reviews");
        setReviews(Array.isArray(res) ? res : (res.data || []));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const stats = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const month = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const countToday = reviews.filter(r => new Date(r.createdAt) >= today).length;
    const countWeek = reviews.filter(r => new Date(r.createdAt) >= week).length;
    const countMonth = reviews.filter(r => new Date(r.createdAt) >= month).length;
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : "0.0";
    const pending = reviews.filter(r => r.status === "Pending").length;

    return { countToday, countWeek, countMonth, total, avg, pending };
  }, [reviews]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Review Overview"
        subtitle="Track, manage and analyze all property reviews and ratings."
        actions={
          <div className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600">
            <Calendar size={14} className="text-slate-400" />
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        }
      />

      {/* 6 STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 mb-8">
        {[
          { icon: MessageSquare, label: "New Reviews (Today)",      val: stats.countToday,     trend: "+12%", sub: "live pulse",  extra: null },
          { icon: MessageSquare, label: "New Reviews (This Week)",   val: stats.countWeek,    trend: "+18%", sub: "growth",   extra: null },
          { icon: MessageSquare, label: "New Reviews (This Month)",  val: stats.countMonth,    trend: "+24%", sub: "volume",  extra: null },
          { icon: Star,          label: "Average Rating",            val: `${stats.avg} / 5`, trend: "Stable",   sub: "consensus",  extra: "stars" },
          { icon: ThumbsUp,      label: "Total Reviews",             val: stats.total.toLocaleString(),  trend: "+5%", sub: "total reach",  extra: null },
          { icon: Clock,         label: "Pending Moderation",        val: stats.pending,     trend: "Active",    sub: "queue",   extra: null },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><c.icon size={16} /></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{c.label}</p>
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-1">{loading ? "..." : c.val}</h4>
            {c.extra === "stars" && <div className="mb-1"><Stars count={Math.floor(Number(stats.avg))} size={10} /></div>}
            <div className="flex items-center gap-1 mb-3">
              <TrendingUp size={10} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500">{c.trend}</span>
              <span className="text-[10px] text-slate-300 font-medium ml-1">{c.sub}</span>
            </div>
            <button className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">View Details <ChevronRight size={10} /></button>
          </div>
        ))}
      </div>

      {/* MAIN ROW: Trend + Rating Donut + Platform Donut */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Review Trend (dual axis) */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col" style={{height:400}}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Review Trend</h3>
            <select className="bg-slate-50 rounded-xl px-3 py-1 text-[10px] font-bold text-slate-500 outline-none border-none"><option>This Week</option></select>
          </div>
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"/><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Reviews</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Rating</span></div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:9,fontWeight:600}} dy={8}/>
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:9,fontWeight:600}} dx={-8} domain={[0,200]}/>
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill:'#94A3B8',fontSize:9,fontWeight:600}} dx={8} domain={[1,6]}/>
                <Tooltip/>
                <Line yAxisId="left" type="monotone" dataKey="reviews" stroke="#3B82F6" strokeWidth={2.5} dot={{fill:'#3B82F6',r:3}} fill="#3B82F6" fillOpacity={0.1}/>
                <Line yAxisId="right" type="monotone" dataKey="rating" stroke="#10B981" strokeWidth={2.5} dot={{fill:'#10B981',r:3}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center" style={{height:400}}>
          <h3 className="text-base font-bold text-slate-900 mb-6 self-start">Rating Distribution</h3>
          <div className="relative flex items-center justify-center mb-6" style={{width:160,height:160}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ratingData} innerRadius={52} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                  {ratingData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xl font-black text-slate-900">8,742</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Reviews</p>
            </div>
          </div>
          <div className="w-full space-y-2.5 mt-auto">
            {ratingData.map(r=>(
              <div key={r.name} className="flex items-center justify-between text-[11px] font-bold">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor:r.color}}/><span className="text-slate-400">{r.name}</span></div>
                <span className="text-slate-900">{r.value.toLocaleString()} <span className="text-slate-300 font-medium">({r.pct})</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews by Platform */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center" style={{height:400}}>
          <h3 className="text-base font-bold text-slate-900 mb-6 self-start">Reviews by Platform</h3>
          <div className="relative flex items-center justify-center mb-6" style={{width:160,height:160}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={platformData} innerRadius={52} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                  {platformData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xl font-black text-slate-900">8,742</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Reviews</p>
            </div>
          </div>
          <div className="w-full space-y-2.5 mt-auto">
            {platformData.map(p=>(
              <div key={p.name} className="flex items-center justify-between text-[11px] font-bold">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor:p.color}}/><span className="text-slate-400">{p.name}</span></div>
                <span className="text-slate-900">{p.value.toLocaleString()} <span className="text-slate-300 font-medium">({p.pct})</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABLES ROW */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Recent Reviews */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Recent Reviews</h3>
            <button className="text-xs font-bold text-blue-600 flex items-center gap-1">View All Reviews <ChevronRight size={12}/></button>
          </div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-widest text-[9px] border-b border-slate-50">
                <th className="text-left py-3">Reviewer</th>
                <th className="text-left py-3">Property</th>
                <th className="text-left py-3">Rating</th>
                <th className="text-left py-3">Review</th>
                <th className="text-left py-3">Date</th>
                <th className="text-right py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentReviews.map((r,i)=>(
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[9px] shrink-0">{r.reviewer.split(' ').map(n=>n[0]).join('')}</div>
                      <span className="font-bold text-slate-900 whitespace-nowrap">{r.reviewer}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400"><div className="font-bold text-slate-700 text-[10px]">{r.property}</div><div className="text-slate-400 text-[9px]">{r.loc}</div></td>
                  <td className="py-3"><Stars count={r.rating} size={9}/></td>
                  <td className="py-3 text-slate-400 max-w-[150px] truncate">{r.review}</td>
                  <td className="py-3 text-slate-300 whitespace-nowrap text-[9px]">{r.date}</td>
                  <td className="py-3 text-right">
                    <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold", r.status === "Published" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-4 text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">View All Reviews <ChevronRight size={11}/></button>
        </div>

        {/* Top Rated Properties */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Top Rated Properties</h3>
            <button className="text-xs font-bold text-blue-600 flex items-center gap-1">View All <ChevronRight size={12}/></button>
          </div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest grid grid-cols-12 gap-2 mb-3">
            <span className="col-span-5">Property</span>
            <span className="col-span-2">Location</span>
            <span className="col-span-3 text-center">Avg. Rating</span>
            <span className="col-span-2 text-right">Reviews</span>
          </div>
          <div className="space-y-4 flex-1">
            {topProperties.map((p,i)=>(
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><Building2 size={14} className="text-slate-400"/></div>
                  <span className="text-[11px] font-bold text-slate-900 truncate">{p.name}</span>
                </div>
                <span className="col-span-2 text-[10px] text-slate-400 font-medium">{p.loc}</span>
                <div className="col-span-3 flex flex-col items-center gap-0.5">
                  <span className="text-[11px] font-black text-slate-900">{p.rating}</span>
                  <Stars count={Math.floor(p.rating)} size={8}/>
                </div>
                <span className="col-span-2 text-right text-[11px] font-black text-blue-600">{p.count}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">View All Properties <ChevronRight size={11}/></button>
        </div>
      </div>

      {/* FOOTER ROW: 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reviews by Sentiment */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h4 className="text-[11px] font-bold text-slate-900 mb-4">Reviews by Sentiment</h4>
          <div className="flex items-center gap-3">
            <div style={{width:80,height:80}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentData} innerRadius={24} outerRadius={36} paddingAngle={3} dataKey="value" stroke="none">
                    {sentimentData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {sentimentData.map(s=>(
                <div key={s.name} className="flex justify-between items-center text-[10px] font-bold">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:s.color}}/><span className="text-slate-400">{s.name}</span></div>
                  <div className="text-right"><div className="text-slate-900">{s.value.toLocaleString()}</div><div className="text-slate-300 text-[9px]">{s.pct}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* New Reviews Summary */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h4 className="text-[11px] font-bold text-slate-900 mb-4">New Reviews Summary</h4>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[{p:"Today",v:"24",t:"+20.5%"},{p:"This Week",v:"152",t:"+19.7%"},{p:"This Month",v:"612",t:"+15.4%"}].map(s=>(
              <div key={s.p} className="text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.p}</p>
                <p className="text-lg font-black text-slate-900 leading-none">{s.v}</p>
                <p className="text-[9px] font-bold text-emerald-500 mt-0.5">{s.t}</p>
              </div>
            ))}
          </div>
          <div style={{height:40}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}><Area type="monotone" dataKey="v" stroke="#3B82F6" fill="#DBEAFE" strokeWidth={1.5}/></AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Moderation Summary */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h4 className="text-[11px] font-bold text-slate-900 mb-4">Moderation Summary</h4>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[{l:"Pending",v:"37",c:"text-amber-500"},{l:"Approved",v:"12",c:"text-emerald-500"},{l:"Rejected",v:"5",c:"text-rose-500"}].map(s=>(
              <div key={s.l} className="flex flex-col items-center text-center">
                <span className={cn("text-2xl font-black mb-1", s.c)}>{s.v}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.l}</span>
              </div>
            ))}
          </div>
          <button className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">Go to Moderation <ChevronRight size={11}/></button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h4 className="text-[11px] font-bold text-slate-900 mb-4">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            {["View All Reviews","Moderation Queue","Review Analytics","Add New Review"].map(a=>(
              <button key={a} className="bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-500 rounded-xl py-2.5 px-2 text-[9px] font-bold transition-all text-center leading-tight">{a}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
