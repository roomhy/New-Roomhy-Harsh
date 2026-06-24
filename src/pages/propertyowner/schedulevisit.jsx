import React, { useState, useEffect } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { apiFetch } from "../../utils/api";
import { 
  Calendar, Search, Eye, CheckCircle2, XCircle, 
  Clock, MapPin, User, Phone, Edit3, Loader2
} from "lucide-react";

export default function ScheduleVisit() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/owners/${owner.loginId}/enquiries`);
      if (data) {
        // filter for status site-visit, scheduled, or visit
        const isSiteVisit = (status = "") => {
          const s = status.toLowerCase();
          return s === "site-visit" || s === "scheduled" || s === "visit";
        };
        setVisits(data.filter(e => isSiteVisit(e.status)));
      }
    } catch (err) {
      console.error("Error fetching scheduled visits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [owner.loginId]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiFetch(`/api/owners/enquiries/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });
      // Update local state by removing from active visits
      setVisits(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      console.error(`Error updating visit status to ${newStatus}:`, err);
      alert(`Action failed: ${err.message}`);
    }
  };

  const filteredVisits = visits.filter(v => 
    (v.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
    (v.interest || "").toLowerCase().includes(search.toLowerCase()) ||
    (v.propertyName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Scheduled Visits" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Scheduled Property Visits</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage prospective tenant walk-through schedules and assign greeting staff members.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scheduled visits by prospect name or room preference..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="size-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading scheduled visits...</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
          <Calendar size={40} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-serif text-[20px] font-bold text-foreground">No Visits Scheduled</h3>
          <p className="text-[13px] text-muted-foreground mt-1">There are no property visit sessions scheduled currently.</p>
        </div>
      ) : (
        /* Grid of Visits */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVisits.map((item) => {
            const formattedVisitSlot = item.visitTime ? (
              // If it's a valid date string, format it, otherwise display literally
              Number.isNaN(Date.parse(item.visitTime)) 
                ? item.visitTime 
                : new Date(item.visitTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
            ) : "Not scheduled";
            
            return (
              <div key={item._id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <Calendar size={20} />
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100`}>
                      Scheduled
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-[21px] font-bold text-foreground">{item.studentName || "Prospect"}</h3>
                    <p className="text-[12px] font-mono text-muted-foreground mt-0.5">{item.studentPhone || "—"}</p>
                    {item.propertyName && (
                      <p className="text-[12px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                        Property: {item.propertyName}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-border/60 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Visit Slot:</span>
                      <span className="font-bold text-slate-900">{formattedVisitSlot}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Showing Interest:</span>
                      <span className="font-medium text-foreground">{item.interest || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Assigned Rep:</span>
                      <span className="font-bold text-primary">{item.assignedStaff || "Unassigned"}</span>
                    </div>
                    {item.notes && (
                      <div className="pt-2 text-[11px] text-slate-500 bg-muted/30 p-2 rounded border border-border/30">
                        <strong>Notes:</strong> {item.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-border/60 mt-6 pt-4 flex gap-2">
                  <button 
                    onClick={() => handleStatusChange(item._id, "visited")}
                    className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Mark Visited
                  </button>
                  <button 
                    onClick={() => handleStatusChange(item._id, "no-show")}
                    className="px-3 h-10 border border-border rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                  >
                    No Show
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PropertyOwnerLayout>
  );
}

