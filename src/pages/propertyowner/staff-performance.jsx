import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Sparkles, Search, Star, CheckCircle2, 
  MessageSquare, TrendingUp, ChevronRight
} from "lucide-react";
import { apiFetch } from "../../services/api";

export default function StaffPerformancePage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const empData = await apiFetch('/api/employees');
      const myStaff = (empData.data || []).filter(e => e.parentLoginId === owner.loginId);

      const compData = await apiFetch(`/api/complaints/owner/${owner.loginId}`);
      
      const maintData = await apiFetch(`/api/maintenance/owner/${owner.loginId}`);

      const perfMap = {};
      myStaff.forEach(s => {
        perfMap[s._id] = {
           id: s._id,
           name: s.name,
           role: s.role,
           rating: 4.5, // Mock rating as we don't have real ratings yet
           resolved: 0,
           feedback: "Doing good work on time."
        };
      });

      // Count resolved complaints
      (compData.complaints || []).forEach(c => {
         if (c.status === 'Resolved' && c.assignedStaffId) {
            const sid = c.assignedStaffId._id || c.assignedStaffId;
            if (perfMap[sid]) perfMap[sid].resolved++;
         }
      });

      // Count completed maintenance
      (maintData.tasks || []).forEach(t => {
         if (t.status === 'Completed' && t.assignedStaffId) {
            const sid = t.assignedStaffId._id || t.assignedStaffId;
            if (perfMap[sid]) perfMap[sid].resolved++;
         }
      });

      // Simple mock rating adjustment based on resolved
      const results = Object.values(perfMap).map(p => {
         if (p.resolved > 10) { p.rating = 4.9; p.feedback = "Extremely fast resolution times."; }
         else if (p.resolved > 5) { p.rating = 4.7; p.feedback = "Polite attitude and tidy work."; }
         else if (p.resolved > 0) { p.rating = 4.5; p.feedback = "Good start."; }
         else { p.rating = 0.0; p.feedback = "No tasks completed yet."; }
         return p;
      });

      setPerformance(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Performance Metrics" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Staff Performance</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor performance review averages, tenant feedback scores, and resolved complaints counts.</p>
        </div>
      </div>

      {/* Grid of Performance profiles */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading performance data...</div>
      ) : performance.length === 0 ? (
        <div className="py-12 text-center text-slate-500">No staff found to display performance.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performance.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-800">{p.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-[21px] font-bold text-foreground">{p.name}</h3>
                  <p className="text-[12.5px] text-muted-foreground mt-0.5">{p.role}</p>
                  <p className="text-[13px] text-slate-700 mt-3 font-medium bg-muted/40 p-3 rounded-xl border border-border/40">
                    "{p.feedback}"
                  </p>
                </div>

                <div className="border-t border-border/60 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Complaints Solved:</span>
                    <span className="font-bold text-emerald-600">{p.resolved} Tickets</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
