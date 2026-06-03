import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { apiFetch } from "../../services/api";
import { 
  Inbox, Search, MessageSquare, Phone, Calendar, 
  CheckCircle2, XCircle, Clock, CreditCard, ArrowRight
} from "lucide-react";

export default function BookingRequestPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let active = true;
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`/api/booking?owner_id=${owner.loginId}&status=pending`);
        if (active && response?.data) {
          setRequests(response.data);
        }
      } catch (err) {
        console.error("Error fetching booking requests:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchRequests();
    return () => { active = false; };
  }, [owner.loginId]);

  const handleAction = async (id, action) => {
    try {
      if (action === "approve") {
        await apiFetch(`/api/booking/requests/${id}/approve`, { method: "PUT" });
      } else if (action === "reject") {
        await apiFetch(`/api/booking/requests/${id}/reject`, { method: "PUT" });
      }
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error(`Error performing booking action ${action}:`, err);
      alert(`Action failed: ${err.message}`);
    }
  };

  const filteredRequests = requests.filter(r => 
    (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.property_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Booking Requests" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Booking Requests</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Approve incoming reservation requests, verify online token receipts, and allocate rooms.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking requests by name or property..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading booking requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
          <Clock size={40} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-serif text-[20px] font-bold text-foreground">No Pending Requests</h3>
          <p className="text-[13px] text-muted-foreground mt-1">There are no new booking requests at the moment.</p>
        </div>
      ) : (
        /* Grid of Booking Requests */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((item) => (
            <div key={item._id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    Token Paid: ₹{(item.payment_amount || item.rent_amount || item.total_amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-[21px] font-bold text-foreground">{item.name}</h3>
                  <p className="text-[12.5px] text-muted-foreground mt-1">Property: <strong className="text-foreground">{item.property_name}</strong></p>
                  {item.request_type && (
                    <p className="text-[11.5px] text-muted-foreground mt-0.5">Type: <span className="uppercase text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">{item.request_type}</span></p>
                  )}
                  <p className="text-[12px] text-muted-foreground font-mono mt-1">{item.phone || "No phone"} • {item.email}</p>
                </div>

                <div className="border-t border-border/60 pt-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground font-medium block">Proposed Move-In</span>
                    <strong className="text-foreground">
                      {item.check_in_date ? new Date(item.check_in_date).toLocaleDateString("en-IN") : "Not specified"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium block">Received On</span>
                    <strong className="text-foreground">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString("en-IN") : "Today"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 mt-6 pt-4 flex gap-2">
                <button 
                  onClick={() => handleAction(item._id, "approve")}
                  className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Approve &amp; Assign Bed
                </button>
                <button 
                  onClick={() => handleAction(item._id, "reject")}
                  className="px-4 h-11 border border-border rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
                >
                  Reject Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
