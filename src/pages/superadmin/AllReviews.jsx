import React, { useState, useEffect, useMemo } from "react";
import { Star, Search, Download, CheckCircle, XCircle, EyeOff, BookOpen, ShieldCheck } from "lucide-react";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { fetchJson } from "../../utils/api";

const cn = (...c) => c.filter(Boolean).join(" ");

const MOD_CONFIG = {
  Approved: { cls: "bg-emerald-50 text-emerald-600", label: "Approved" },
  Pending: { cls: "bg-amber-50 text-amber-600", label: "Pending" },
  Flagged: { cls: "bg-red-50 text-red-600", label: "Flagged" },
  Hidden: { cls: "bg-slate-100 text-slate-500", label: "Hidden" },
  Rejected: { cls: "bg-rose-50 text-rose-600", label: "Rejected" },
};

function Stars({ rating, size = 12 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size} className={s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
      ))}
    </div>
  );
}

export default function AllReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingF, setRatingF] = useState("all");
  const [modF, setModF] = useState("all");
  const [verifiedF, setVerifiedF] = useState("all");

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/reviews/admin/all");
      if (res.success) {
        setReviews(res.data || []);
      }
    } catch (err) {
      console.error("Error loading admin reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => reviews.filter(r => {
    const s = search.toLowerCase();
    const reviewTextVal = r.review || r.reviewText || "";
    const matchSearch = !search || r.name.toLowerCase().includes(s) || r.propertyName.toLowerCase().includes(s) || reviewTextVal.toLowerCase().includes(s);
    const matchRating = ratingF === "all" || r.rating === Number(ratingF);
    const matchMod = modF === "all" || String(r.status).toLowerCase() === modF.toLowerCase();
    const matchVerified = verifiedF === "all" || (verifiedF === "verified" ? r.isVerifiedStay : !r.isVerifiedStay);
    return matchSearch && matchRating && matchMod && matchVerified;
  }), [reviews, search, ratingF, modF, verifiedF]);

  const counts = {
    total: reviews.length,
    avg: reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 0,
    verified: reviews.filter(r => r.isVerifiedStay).length,
    hidden: reviews.filter(r => r.status === "Hidden").length,
  };

  const handleAction = async (id, action) => {
    const statusMap = { approve: "Approved", reject: "Rejected", hide: "Hidden" };
    try {
      const res = await fetchJson(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusMap[action] })
      });
      if (res.success) {
        loadReviews();
      }
    } catch (err) {
      alert("Error moderating review: " + err.message);
    }
  };

  const handleExport = () => {
    const csv = [
      ["Review ID", "Tenant", "Property", "Owner", "Rating", "Date", "Verified Stay", "Status"],
      ...filtered.map(r => [r._id, r.name, r.propertyName, r.ownerId, r.rating, r.createdAt, r.isVerifiedStay, r.status])
    ].map(row => row.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "reviews.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="All Reviews"
          subtitle="Manage verified tenant reviews across all properties."
          breadcrumbs={[{ label: "Review Management" }, { label: "All Reviews", active: true }]}
        />
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm shrink-0">
            Source: Reviews
          </span>
          <button onClick={handleExport} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold">Loading reviews...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Reviews", val: counts.total || "No Data Available", icon: BookOpen, color: "blue" },
              { label: "Average Rating", val: counts.total > 0 ? `${counts.avg} ★` : "No Data Available", icon: Star, color: "amber" },
              { label: "Verified Stay", val: counts.verified || "No Data Available", icon: ShieldCheck, color: "emerald" },
              { label: "Hidden Reviews", val: counts.hidden || "No Data Available", icon: EyeOff, color: "slate" },
            ].map(c => (
              <div key={c.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-3", `bg-${c.color}-50 text-${c.color}-600`)}>
                    <c.icon size={16} />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{c.val}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{c.label}</p>
                </div>
                <div className="text-[9px] font-bold text-slate-400 mt-4 border-t border-slate-50 pt-2.5">
                  Source: Reviews
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, property, review text..." className="w-full bg-slate-50 border-none rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <select value={ratingF} onChange={e => setRatingF(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-100">
              <option value="all">All Ratings</option>
              {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} Stars</option>)}
            </select>
            <select value={modF} onChange={e => setModF(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-100">
              <option value="all">All Moderation</option>
              {Object.keys(MOD_CONFIG).map(k => <option key={k} value={k.toLowerCase()}>{MOD_CONFIG[k].label}</option>)}
            </select>
            <select value={verifiedF} onChange={e => setVerifiedF(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-100">
              <option value="all">All Verified</option>
              <option value="verified">Verified Stay</option>
              <option value="unverified">Non-Verified</option>
            </select>
            <span className="text-xs font-bold text-slate-400 ml-auto">{filtered.length} reviews found</span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Reviewer / Property</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Content</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">No Data Available</td></tr>
                  ) : filtered.map(r => {
                    const statusKey = Object.keys(MOD_CONFIG).find(k => k.toLowerCase() === String(r.status).toLowerCase()) || "Pending";
                    const statusInfo = MOD_CONFIG[statusKey];
                    return (
                      <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {r.name}
                            {r.isVerifiedStay && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <ShieldCheck size={8} /> Verified Stay
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Building2 size={10} /> {r.propertyName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Stars rating={r.rating} />
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-600 max-w-sm truncate" title={r.review || r.reviewText}>
                            {r.review || r.reviewText}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(r.createdAt || r.reviewDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold", statusInfo.cls)}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => handleAction(r._id, "approve")} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Approve"><CheckCircle size={14} /></button>
                            <button onClick={() => handleAction(r._id, "reject")} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Reject"><XCircle size={14} /></button>
                            <button onClick={() => handleAction(r._id, "hide")} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all" title="Hide"><EyeOff size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
