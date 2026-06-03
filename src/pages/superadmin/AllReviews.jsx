import React, { useEffect, useState, useMemo } from "react";
import { 
  Star, Search, Filter, MoreVertical, Trash2, 
  CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, 
  MessageSquare, User, Building2, MapPin, Calendar, 
  Download, RefreshCw, Loader2 
} from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function AllReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetchJson("/api/reviews");
      setReviews(Array.isArray(res) ? res : (res.data || []));
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesSearch = 
        (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.propertyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.review || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating = filterRating === "all" || Math.floor(r.rating) === parseInt(filterRating);
      const matchesStatus = filterStatus === "all" || r.status === filterStatus;

      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [reviews, searchTerm, filterRating, filterStatus]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await fetchJson(`/api/reviews/admin/${id}`, { method: "DELETE" });
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#F8FAFC] min-h-full font-inter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Review Ledger</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Comprehensive Audit of Resident Feedback & Experience Ratings</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadReviews} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-blue-600 transition-all active:scale-95">
             <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-3 active:scale-95">
             <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
             <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                <MessageSquare size={20} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-800">Verified Feedback</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Found {filteredReviews.length} total reviews</p>
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                <Filter size={14} className="text-slate-400" />
                <select 
                  value={filterRating} onChange={e => setFilterRating(e.target.value)}
                  className="bg-transparent text-[10px] font-bold text-slate-600 outline-none uppercase tracking-widest border-none p-0 focus:ring-0"
                >
                  <option value="all">All Ratings</option>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
             </div>

             <div className="relative w-64 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search reviews..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" 
                />
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-10 py-8">Reviewer</th>
                <th className="px-6 py-8">Property</th>
                <th className="px-6 py-8">Rating</th>
                <th className="px-6 py-8">Message</th>
                <th className="px-10 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="py-40 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-4" /><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compiling Feedback Records...</p></td></tr>
              ) : filteredReviews.length === 0 ? (
                <tr><td colSpan="5" className="py-40 text-center text-slate-300"><MessageSquare size={40} className="mx-auto mb-4 opacity-20" /><p className="text-[10px] font-bold uppercase tracking-widest">No reviews match your filters</p></td></tr>
              ) : filteredReviews.map((r) => (
                <tr key={r._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm uppercase shrink-0">
                        {(r.name || "U").charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{r.name || "Anonymous User"}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <p className="text-xs font-bold text-slate-700">{r.propertyName || "Unknown Property"}</p>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} size={10} className={cn(star <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-100 fill-slate-100")} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-[300px] leading-relaxed">"{r.review}"</p>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => handleDelete(r._id)}
                      className="p-3 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-600 transition-all active:scale-90"
                    >
                      <Trash2 size={16} />
                    </button>
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
