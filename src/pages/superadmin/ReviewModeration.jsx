import React, { useEffect, useState, useMemo } from "react";
import { 
  Star, Check, X, ShieldAlert, AlertTriangle, 
  MessageSquare, User, Building2, RefreshCw, Loader2,
  Trash2, Eye, ShieldCheck, Filter
} from "lucide-react";
import { fetchJson } from "../../utils/api";
import { toast } from "react-hot-toast";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function ReviewModeration() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [filter]);

  const handleBulkUpdate = async (newStatus) => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    const toastId = toast.loading(`Updating status for ${selectedIds.size} reviews...`);
    try {
      let successCount = 0;
      for (const id of selectedIds) {
        await fetchJson(`/api/reviews/${id}`, {
          method: "PUT",
          body: JSON.stringify({ status: newStatus })
        });
        successCount++;
      }
      setReviews(prev => prev.map(r => selectedIds.has(r._id) ? { ...r, status: newStatus } : r));
      toast.success(`Successfully updated ${successCount} reviews to ${newStatus}!`, { id: toastId });
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      toast.error("Failed to update some reviews", { id: toastId });
    } finally {
      setIsBulkProcessing(false);
    }
  };

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

      {filteredReviews.length > 0 && (
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in duration-300">
          <input
            type="checkbox"
            disabled={isBulkProcessing}
            className="rounded border-slate-300 cursor-pointer w-4 h-4"
            checked={filteredReviews.every(r => selectedIds.has(r._id))}
            onChange={() => {
              const allSelected = filteredReviews.every(r => selectedIds.has(r._id));
              const next = new Set(selectedIds);
              if (allSelected) {
                filteredReviews.forEach(r => next.delete(r._id));
              } else {
                filteredReviews.forEach(r => next.add(r._id));
              }
              setSelectedIds(next);
            }}
          />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select All Reviews ({filteredReviews.length})</span>
        </div>
      )}

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
                <input
                  type="checkbox"
                  disabled={isBulkProcessing}
                  className="rounded border-slate-300 cursor-pointer w-4 h-4 mr-1 shrink-0"
                  checked={selectedIds.has(r._id)}
                  onChange={() => {
                    const next = new Set(selectedIds);
                    if (next.has(r._id)) next.delete(r._id);
                    else next.add(r._id);
                    setSelectedIds(next);
                  }}
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold uppercase shadow-sm shrink-0">
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
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-8 py-4 rounded-3xl border border-slate-800 shadow-2xl flex items-center gap-6 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 border-r border-slate-850 pr-6">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shadow-lg animate-pulse">
              {selectedIds.size}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selected</span>
          </div>
          <div className="flex items-center gap-3">
            {filter === "Pending" ? (
              <>
                <button
                  disabled={isBulkProcessing}
                  onClick={() => handleBulkUpdate("Active")}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isBulkProcessing ? "Processing..." : <><Check size={14} /> Approve Selected</>}
                </button>
                <button
                  disabled={isBulkProcessing}
                  onClick={() => handleBulkUpdate("Inactive")}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isBulkProcessing ? "Processing..." : <><X size={14} /> Reject Selected</>}
                </button>
              </>
            ) : filter === "Active" ? (
              <button
                disabled={isBulkProcessing}
                onClick={() => handleBulkUpdate("Inactive")}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                {isBulkProcessing ? "Processing..." : <><ShieldAlert size={14} /> Deactivate Selected</>}
              </button>
            ) : (
              <button
                disabled={isBulkProcessing}
                onClick={() => handleBulkUpdate("Active")}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                {isBulkProcessing ? "Processing..." : <><RefreshCw size={14} /> Restore Selected</>}
              </button>
            )}
            <button
              disabled={isBulkProcessing}
              onClick={() => setSelectedIds(new Set())}
              className="text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors pl-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
