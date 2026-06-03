import React, { useEffect, useState, useMemo } from "react";
import { 
  Star, Clock, Calendar, MessageSquare, Building2, 
  RefreshCw, Loader2, User, ChevronRight, Zap
} from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function NewReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchJson("/api/reviews");
      setReviews(Array.isArray(res) ? res : (res.data || []));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const categorized = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      today: reviews.filter(r => new Date(r.createdAt) >= today),
      thisWeek: reviews.filter(r => new Date(r.createdAt) >= lastWeek && new Date(r.createdAt) < today),
      thisMonth: reviews.filter(r => new Date(r.createdAt) >= lastMonth && new Date(r.createdAt) < lastWeek)
    };
  }, [reviews]);

  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full font-inter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recent Feedback Feed</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Real-time Stream of New Resident Experiences & Rating Logs</p>
        </div>
        <button onClick={loadData} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-blue-600 transition-all active:scale-95">
           <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      <div className="space-y-12">
        <ReviewSection title="Today's Pulse" reviews={categorized.today} loading={loading} color="blue" />
        <ReviewSection title="This Week's Feedback" reviews={categorized.thisWeek} loading={loading} color="indigo" />
        <ReviewSection title="Monthly Archive" reviews={categorized.thisMonth} loading={loading} color="slate" />
      </div>
    </div>
  );
}

function ReviewSection({ title, reviews, loading, color }) {
  const colors = {
    blue: "bg-blue-600 shadow-blue-100",
    indigo: "bg-indigo-600 shadow-indigo-100",
    slate: "bg-slate-900 shadow-slate-200"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
         <div className={cn("w-1.5 h-6 rounded-full", colors[color])} />
         <h2 className="text-lg font-bold text-slate-800">{title}</h2>
         <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-widest">{reviews.length} Items</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-slate-100 shadow-sm" />)
        ) : reviews.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-50 shadow-sm">
             <MessageSquare size={32} className="mx-auto mb-4 text-slate-200" />
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No feedback records in this cycle</p>
          </div>
        ) : reviews.map(r => (
          <div key={r._id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs shadow-sm uppercase shrink-0">
                    {(r.name || "U").charAt(0)}
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{r.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                       {[1,2,3,4,5].map(s => <Star key={s} size={8} className={cn(s <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-100 fill-slate-100")} />)}
                    </div>
                 </div>
              </div>
              <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                 {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed italic mb-6 flex-1 line-clamp-3">"{r.review}"</p>

            <div className="flex items-center justify-between pt-5 border-t border-slate-50">
               <div className="flex items-center gap-2">
                  <Building2 size={12} className="text-slate-300" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{r.propertyName}</span>
               </div>
               <button className="text-blue-600 hover:text-blue-800 transition-colors">
                  <Zap size={14} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
