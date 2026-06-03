import React, { useEffect, useState, useMemo } from "react";
import { 
  Star, Check, X, ShieldAlert, AlertTriangle, 
  MessageSquare, User, Building2, RefreshCw, Loader2,
  Trash2, Eye, ShieldCheck, Filter
} from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function ReviewModeration() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetchJson("/api/reviews");
      const list = Array.isArray(res) ? res : (res.data || []);
      setReviews(list);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => r.status === filter);
  }, [reviews, filter]);

  const updateStatus = async (id, newStatus) => {
    try {
      await fetchJson(`/api/reviews/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#F8FAFC] min-h-full font-inter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Content Moderation</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Quality Control & Community Guidelines Enforcement Matrix</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            {["Pending", "Active", "Inactive"].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  filter === s ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={loadReviews} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-blue-600 transition-all">
             <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-40 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Content Repository...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="col-span-full py-40 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <ShieldCheck size={40} className="mx-auto mb-4 text-emerald-500" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inbox is Clean. No {filter} items found.</p>
          </div>
        ) : filteredReviews.map((r) => (
          <div key={r._id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-6 group hover:border-blue-100 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold uppercase shadow-sm">
                  {(r.name || "U").charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{r.name}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{r.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                 <Star size={10} className="text-amber-400 fill-amber-400" />
                 <span className="text-xs font-black text-slate-700">{r.rating}</span>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative">
               <p className="text-xs text-slate-600 leading-relaxed italic">"{r.review}"</p>
               <div className="absolute -top-3 left-4 bg-white px-2 text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Message Body</div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2">
                 <Building2 size={12} className="text-slate-300" />
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{r.propertyName}</span>
              </div>
              
              <div className="flex items-center gap-3">
                {filter === "Pending" ? (
                  <>
                    <button 
                      onClick={() => updateStatus(r._id, "Inactive")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-[9px] font-bold uppercase tracking-widest hover:bg-rose-100 transition-all"
                    >
                      <X size={12} /> Reject
                    </button>
                    <button 
                      onClick={() => updateStatus(r._id, "Active")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-lg shadow-emerald-100"
                    >
                      <Check size={12} /> Approve
                    </button>
                  </>
                ) : filter === "Active" ? (
                  <button 
                    onClick={() => updateStatus(r._id, "Inactive")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <ShieldAlert size={12} /> Deactivate
                  </button>
                ) : (
                  <button 
                    onClick={() => updateStatus(r._id, "Active")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all"
                  >
                    <RefreshCw size={12} /> Restore
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
