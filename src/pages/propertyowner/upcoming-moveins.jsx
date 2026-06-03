import React, { useState, useEffect } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession, fetchOwnerTenants } from "../../utils/propertyowner";
import { apiFetch } from "../../services/api";
import { 
  CalendarClock, Search, UserPlus, Phone, Mail, 
  ArrowRight, CheckCircle, Clock, AlertTriangle
} from "lucide-react";

export default function UpcomingMoveinsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [moveins, setMoveins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchMoveins = async () => {
      try {
        setLoading(true);
        const all = await fetchOwnerTenants(owner.loginId);
        if (active) setMoveins((all || []).filter(t => t.status === "pending"));
      } catch (err) {
        console.error("Error fetching upcoming move-ins:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchMoveins();
    return () => { active = false; };
  }, [owner.loginId]);

  const handleCheckIn = async (tenantId) => {
    try {
      await apiFetch("/api/tenants/checkin/approve", {
        method: "POST",
        body: JSON.stringify({ tenantId })
      });
      setMoveins(prev => prev.filter(m => m._id !== tenantId));
    } catch (err) {
      alert("Error approving check-in: " + err.message);
    }
  };

  const handleReschedule = async (tenantId) => {
    const newDate = prompt("Enter new move-in date (YYYY-MM-DD):");
    if (!newDate) return;
    try {
      await apiFetch(`/api/tenants/${tenantId}`, {
        method: "PATCH",
        body: JSON.stringify({ moveInDate: new Date(newDate) })
      });
      setMoveins(prev => prev.map(m => m._id === tenantId ? { ...m, moveInDate: newDate } : m));
    } catch (err) {
      alert("Error rescheduling check-in: " + err.message);
    }
  };

  const filteredMoveins = moveins.filter(m => 
    (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.roomNo || m.room?.number || "").includes(search)
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Upcoming Move-ins" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Upcoming Move-ins</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage future check-in dates, security deposits, and document upload statuses.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Tenant Name or Room..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Moveins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">Loading upcoming move-ins...</div>
        ) : filteredMoveins.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">No upcoming move-ins found.</div>
        ) : (
          filteredMoveins.map((item) => {
            const depositPaid = item.securityDepositPaid || 0;
            const depositTotal = item.securityDepositTotal || 0;
            const isDepositPaid = depositPaid >= depositTotal;
            const depositLabel = isDepositPaid ? "Paid" : `Pending ₹${(depositTotal - depositPaid).toLocaleString()}`;
            const dateLabel = item.moveInDate 
              ? new Date(item.moveInDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) 
              : "N/A";
            const processStatus = item.kycStatus === "verified" ? "Ready to Check-in" : "KYC Pending";

            return (
              <div key={item._id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <CalendarClock size={20} />
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      isDepositPaid 
                        ? "bg-emerald-50 text-emerald-600" 
                        : "bg-amber-50 text-amber-600 animate-pulse"
                    }`}>
                      Deposit: {depositLabel}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-[21px] font-bold text-foreground">{item.name}</h3>
                    <p className="text-[12.5px] text-muted-foreground mt-1">Assigned Bed: <strong className="text-foreground">Room {item.roomNo || item.room?.number || "N/A"} • Bed {item.bedNo || "A"}</strong></p>
                    <p className="text-[12.5px] text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone size={12} /> {item.phone}
                    </p>
                  </div>

                  <div className="border-t border-border/60 pt-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Check-in Date:</span>
                      <span className="font-bold text-foreground">{dateLabel}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Process Status:</span>
                      <span className="font-bold text-primary">{processStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/60 mt-4 pt-4 flex gap-2">
                  <button 
                    onClick={() => handleCheckIn(item._id)}
                    className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Approve Check-in
                  </button>
                  <button 
                    onClick={() => handleReschedule(item._id)}
                    className="px-3 h-10 border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </PropertyOwnerLayout>
  );
}
