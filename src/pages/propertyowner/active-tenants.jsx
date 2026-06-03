import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession, fetchActiveOwnerTenants } from "../../utils/propertyowner";
import { 
  Users, Search, ShieldCheck, Mail, Phone, ExternalLink, 
  MapPin, CheckCircle, Clock, AlertTriangle, User, CalendarClock
} from "lucide-react";

export default function ActiveTenantsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  React.useEffect(() => {
    let active = true;
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const activeList = await fetchActiveOwnerTenants(owner.loginId);
        if (active) setTenants(activeList || []);
      } catch (err) {
        console.error("Error fetching active tenants:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchTenants();
    return () => { active = false; };
  }, [owner.loginId]);

  const filteredTenants = tenants.filter(t => 
    (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.roomNo || t.room?.number || "").includes(search) ||
    (t.phone || "").includes(search)
  );

  const getKycLabel = (status) => {
    if (status === "verified") return "Verified";
    if (status === "submitted") return "Submitted";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Active Tenants" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Active Tenants</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Comprehensive list of currently residing tenants, including contact info, KYC verification status, and move-in timelines.</p>
        </div>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Active Residents</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">
            {loading ? "..." : tenants.length} <span className="text-sm font-normal text-muted-foreground">Tenants</span>
          </h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">KYC Compliance</span>
          <h3 className="text-[28px] font-bold text-emerald-600 mt-1">
            {loading ? "..." : (tenants.length > 0 ? Math.round((tenants.filter(t => t.kycStatus === "verified").length / tenants.length) * 100) : 0)}% <span className="text-sm font-normal text-muted-foreground">Verified</span>
          </h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Occupied Rooms</span>
          <h3 className="text-[28px] font-bold text-blue-600 mt-1">
            {loading ? "..." : new Set(tenants.map(t => t.roomNo || t.room?.number).filter(Boolean)).size} <span className="text-sm font-normal text-muted-foreground">Rooms</span>
          </h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Agreement Signed</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">
            {loading ? "..." : tenants.filter(t => t.agreementSigned).length} <span className="text-sm font-normal text-muted-foreground">Signed</span>
          </h3>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name, Room Number or Mobile Number..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Active Tenants List Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading active tenants...</div>
          ) : filteredTenants.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No active tenants found.</div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                  <th className="px-6 py-3.5 font-semibold">Tenant Name</th>
                  <th className="px-6 py-3.5 font-semibold">Room & Bed</th>
                  <th className="px-6 py-3.5 font-semibold">Join Date</th>
                  <th className="px-6 py-3.5 font-semibold">Contact Info</th>
                  <th className="px-6 py-3.5 font-semibold">KYC Verification</th>
                  <th className="px-6 py-3.5 font-semibold">Rent Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTenants.map((t) => (
                  <tr key={t._id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {(t.name || "T").charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">{t.name}</span>
                          <div className="text-[11px] text-muted-foreground">{t.loginId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">Room {t.roomNo || t.room?.number || "N/A"}</div>
                      {t.bedNo && <div className="text-[11px] text-muted-foreground">Bed {t.bedNo}</div>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {t.moveInDate ? new Date(t.moveInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                    </td>
                    <td className="px-6 py-4 space-y-0.5">
                      <div className="text-[12px] font-medium text-foreground flex items-center gap-1">
                        <Phone size={12} className="text-muted-foreground/60" /> {t.phone}
                      </div>
                      {t.email && (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Mail size={12} className="text-muted-foreground/60" /> {t.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        t.kycStatus === "verified" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : t.kycStatus === "submitted"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : t.kycStatus === "rejected"
                          ? "bg-rose-50 text-rose-600 border-rose-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {getKycLabel(t.kycStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        INR {t.agreedRent || t.room?.rent || 0}/mo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedTenant(t); setModalOpen(true); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <ExternalLink size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Tenant Details Modal */}
      {modalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                  {(selectedTenant.name || "T").charAt(0)}
                </div>
                <div>
                  <h2 className="text-[20px] font-semibold text-foreground">{selectedTenant.name}</h2>
                  <p className="text-[13px] text-muted-foreground mt-0.5">ID: {selectedTenant.loginId}</p>
                </div>
              </div>
              <button 
                onClick={() => { setModalOpen(false); setSelectedTenant(null); }}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Room & Rent Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-muted/10">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Room Details</span>
                  <div className="font-medium text-foreground">Room {selectedTenant.roomNo || selectedTenant.room?.number || "N/A"}</div>
                  {selectedTenant.bedNo && <div className="text-[13px] text-muted-foreground">Bed: {selectedTenant.bedNo}</div>}
                  {selectedTenant.building && <div className="text-[13px] text-muted-foreground">Building: {selectedTenant.building}</div>}
                </div>
                <div className="p-4 rounded-xl border border-border bg-emerald-50/50">
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block mb-1">Rent Information</span>
                  <div className="font-bold text-emerald-700 text-[18px]">₹{selectedTenant.agreedRent || selectedTenant.room?.rent || 0} <span className="text-[13px] font-normal text-emerald-600/70">/ month</span></div>
                  <div className="text-[13px] text-emerald-600 mt-1">Due: {selectedTenant.paymentFrequency || "Monthly"}</div>
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <h3 className="text-[14px] font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User size={16} className="text-primary" /> Personal Information
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 p-4 rounded-xl border border-border">
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-0.5">Phone Number</div>
                    <div className="text-[13px] font-medium text-foreground">{selectedTenant.phone || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-0.5">Email Address</div>
                    <div className="text-[13px] font-medium text-foreground">{selectedTenant.email || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-0.5">Date of Birth</div>
                    <div className="text-[13px] font-medium text-foreground">{selectedTenant.dob || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-0.5">Gender</div>
                    <div className="text-[13px] font-medium text-foreground capitalize">{selectedTenant.gender || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-0.5">Guardian Number</div>
                    <div className="text-[13px] font-medium text-foreground">{selectedTenant.guardianNumber || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-0.5">Occupation</div>
                    <div className="text-[13px] font-medium text-foreground">{selectedTenant.occupation || "N/A"}</div>
                  </div>
                </div>
              </div>

              {/* Status & Dates */}
              <div>
                <h3 className="text-[14px] font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CalendarClock size={16} className="text-primary" /> Timeline & Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-muted-foreground mb-0.5">Move-in Date</div>
                      <div className="text-[13px] font-medium text-foreground">
                        {selectedTenant.moveInDate ? new Date(selectedTenant.moveInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : "Not specified"}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-muted-foreground mb-0.5">Agreement Signed</div>
                      <div className="text-[13px] font-medium text-foreground">
                        {selectedTenant.agreementSigned ? (
                           <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle size={14}/> Yes ({new Date(selectedTenant.agreementSignedAt).toLocaleDateString('en-IN')})</span>
                        ) : (
                           <span className="flex items-center gap-1.5 text-rose-600"><AlertTriangle size={14}/> Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
              <button 
                onClick={() => { setModalOpen(false); setSelectedTenant(null); }}
                className="px-6 py-2 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
