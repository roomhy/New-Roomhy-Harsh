import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Calendar, Search, CheckCircle2, XCircle, 
  Clock, Sparkles, MessageSquare
} from "lucide-react";
import { apiFetch } from "../../utils/api";

export default function LeaveRequestsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchRequests();
  }, [owner.loginId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/leaves/owner/${owner.loginId}`);
      if (data.success && data.requests) {
        setRequests(data.requests.map(r => ({
           id: r._id,
           name: r.tenantName,
           room: r.roomNo,
           from: new Date(r.fromDate).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}),
           to: new Date(r.toDate).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}),
           reason: r.reason,
           status: r.status
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const data = await apiFetch(`/api/leaves/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (data.success) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.room.includes(search)
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Leave Approvals" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Leave Requests</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Approve resident night-out applications, holiday declarations, and emergency parent calls.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leave requests by tenant name or room..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Grid of Leave requests */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading leave requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="py-12 text-center text-slate-500">No leave requests found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                  r.status === "Approved" 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : r.status === "Rejected"
                    ? "bg-rose-50 text-rose-600 border-rose-100"
                    : "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                }`}>
                  {r.status}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[21px] font-bold text-foreground">{r.name}</h3>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">Room {r.room}</p>
                <p className="text-[13px] text-slate-700 mt-3 font-medium bg-muted/40 p-3 rounded-xl border border-border/40">
                  "{r.reason}"
                </p>
              </div>

              <div className="border-t border-border/60 pt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between items-center">
                  <span>Start Date:</span>
                  <span className="font-bold text-slate-800">{r.from}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>End Date:</span>
                  <span className="font-bold text-slate-800">{r.to}</span>
                </div>
              </div>
            </div>

            {r.status === "Pending" && (
              <div className="border-t border-border/60 mt-6 pt-4 flex gap-2">
                <button 
                  onClick={() => handleUpdateStatus(r.id, "Approved")}
                  className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Approve Leave
                </button>
                <button 
                  onClick={() => handleUpdateStatus(r.id, "Rejected")}
                  className="flex-1 h-10 border border-border hover:bg-muted text-muted-foreground rounded-xl text-xs font-bold transition-all"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
