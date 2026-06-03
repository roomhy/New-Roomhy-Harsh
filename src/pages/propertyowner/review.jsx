import React, { useState, useEffect } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { apiFetch } from "../../services/api";
import { Star, MessageSquare, Calendar, Filter } from "lucide-react";

export default function Review() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let active = true;
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/api/tenants/feedback/owner/${encodeURIComponent(owner.loginId)}`);
        if (active && res?.success) {
          setFeedbacks(res.feedbacks || []);
        }
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchFeedbacks();
    return () => { active = false; };
  }, [owner.loginId]);

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbacks.length).toFixed(1)
    : "0.0";

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Food": return "bg-orange-50 text-orange-600 border border-orange-100";
      case "Cleanliness": return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "Amenities": return "bg-blue-50 text-blue-600 border border-blue-100";
      case "Staff": return "bg-purple-50 text-purple-600 border border-purple-100";
      default: return "bg-slate-50 text-slate-600 border border-slate-100";
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star 
            key={s} 
            size={16} 
            fill={s <= rating ? "currentColor" : "none"} 
            className={s <= rating ? "text-amber-400" : "text-slate-200"}
          />
        ))}
      </div>
    );
  };

  const filteredFeedbacks = selectedCategory === "All"
    ? feedbacks
    : feedbacks.filter(f => f.category === selectedCategory);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Reviews & Feedback" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Resident Reviews</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor service quality scores, cleanliness reviews, food ratings, and resident satisfaction levels.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading reviews and feedback...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft flex items-center justify-between">
              <div>
                <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Average Rating</span>
                <h3 className="text-[32px] font-bold text-foreground mt-1 flex items-baseline gap-1">
                  {avgRating} <span className="text-sm font-normal text-muted-foreground">/ 5.0</span>
                </h3>
              </div>
              <div className="size-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star fill="currentColor" size={24} />
              </div>
            </div>
            
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft flex items-center justify-between">
              <div>
                <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Reviews</span>
                <h3 className="text-[32px] font-bold text-foreground mt-1">{feedbacks.length}</h3>
              </div>
              <div className="size-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft flex items-center justify-between">
              <div>
                <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Top Compliant Area</span>
                <h3 className="text-[20px] font-bold text-emerald-600 mt-2">Amenities & Staff</h3>
              </div>
              <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1"><Filter size={14} /> Filter Category:</span>
            {["All", "Food", "Cleanliness", "Amenities", "Staff", "Other"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCategory === cat 
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Feedbacks List */}
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border bg-card rounded-2xl text-muted-foreground">
              No feedback submissions found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFeedbacks.map((f) => (
                <div key={f._id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      {renderStars(f.rating || 5)}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(f.category)}`}>
                        {f.category}
                      </span>
                    </div>

                    <div>
                      <p className="text-[14px] text-foreground font-medium italic bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        "{f.comments || "No comments written."}"
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border/60 mt-4 pt-3 flex justify-between items-center text-xs text-muted-foreground">
                    <div>
                      <span className="font-semibold text-foreground block">{f.tenantName || "Anonymous Resident"}</span>
                      <span>Room {f.roomNo || "Gen"} • {f.propertyName || "Roomhy PG"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={13} />
                      {f.createdAt ? new Date(f.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "Recent"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PropertyOwnerLayout>
  );
}
