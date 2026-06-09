import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession, fetchActiveOwnerTenants } from "../../utils/propertyowner";
import { MobileStatCard } from "../../components/propertyowner/MobileComponents";
import { 
  Users, Search, ShieldCheck, Mail, Phone, ExternalLink, 
  MapPin, CheckCircle, Clock, AlertTriangle, User, CalendarClock, BedDouble, FileText
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
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 hidden md:flex">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Active Tenants</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Comprehensive list of currently residing tenants, including contact info, KYC verification status, and move-in timelines.</p>
        </div>
      </div>

      {/* Stats Header — Desktop: 4-col grid, Mobile: horizontal scroll strip */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Mobile Stats: single row horizontal scroll (premium card style) */}
      <div className="flex overflow-x-auto gap-3 pb-2 mb-5 md:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {[
          { title: "Tenants",  value: loading ? "..." : tenants.length,                                                                                                   subtext: "Active",     icon: Users,       bg: "bg-blue-50",   ic: "text-blue-600" },
          { title: "KYC %",    value: loading ? "..." : `${tenants.length > 0 ? Math.round((tenants.filter(t => t.kycStatus === "verified").length / tenants.length) * 100) : 0}%`, subtext: "Verified",   icon: ShieldCheck, bg: "bg-emerald-50",ic: "text-emerald-600" },
          { title: "Rooms",    value: loading ? "..." : new Set(tenants.map(t => t.roomNo || t.room?.number).filter(Boolean)).size,                                         subtext: "Occupied",   icon: BedDouble,   bg: "bg-indigo-50", ic: "text-indigo-600" },
          { title: "Signed",   value: loading ? "..." : tenants.filter(t => t.agreementSigned).length,                                                                     subtext: "Agreement",  icon: FileText,    bg: "bg-purple-50", ic: "text-purple-600" },
        ].map(({ title, value, subtext, icon: Icon, bg, ic }) => (
          <div key={title} className="shrink-0 w-[130px] bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-transform">
            <div className="flex items-start justify-between mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                <Icon className={`w-5 h-5 ${ic}`} />
              </div>
            </div>
            <div>
              <h3 className="text-[22px] font-black text-slate-900 leading-tight">{value}</h3>
              <p className="text-[12px] font-semibold text-slate-500 mt-0.5">{title}</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1">{subtext}</p>
            </div>
          </div>
        ))}
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

      {/* Active Tenants List Table - Desktop */}
      <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
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
                  <th className="px-6 py-3.5 font-semibold">Room &amp; Bed</th>
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

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3 pb-12">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-[14px] font-bold text-slate-700">No active tenants</p>
            <p className="text-[12px] text-slate-400 mt-1">Add tenants to see them here.</p>
          </div>
        ) : filteredTenants.map((t) => (
          <div key={`mob-${t._id}`} className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm relative overflow-hidden">
            
            {/* Header: Avatar + Name + Room + Badges */}
            <div className="flex justify-between items-start mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[16px] font-bold shrink-0 border border-slate-200/50 shadow-inner">
                  {(t.name || "T")[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 leading-tight">{t.name}</h3>
                  <p className="text-[11.5px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    Room {t.roomNo || t.room?.number || "N/A"}{t.bedNo ? ` · Bed ${t.bedNo}` : ""}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-col items-end gap-1.5">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  t.kycStatus === "verified"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                    : t.kycStatus === "submitted"
                    ? "bg-blue-50 text-blue-600 border-blue-100/50"
                    : "bg-amber-50 text-amber-600 border-amber-100/50"
                }`}>
                  {getKycLabel(t.kycStatus)} KYC
                </span>
                <span className="text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                  Active
                </span>
              </div>
            </div>

            {/* Footer: Rent + Actions */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100/80">
              <div className="flex gap-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Rent</p>
                  <p className="text-[13.5px] font-black text-slate-800 leading-none">₹{(t.agreedRent || t.room?.rent || 0).toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Joined</p>
                  <p className="text-[12px] font-semibold text-slate-600 leading-none">{t.moveInDate ? new Date(t.moveInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "—"}</p>
                </div>
              </div>

              <div className="flex gap-1.5 items-center shrink-0">
                <a href={`tel:${t.phone}`} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                  <Phone size={13} />
                </a>
                {t.phone && (
                  <a href={`https://wa.me/${String(t.phone).replace(/\D/g, '')}?text=Hi%20${t.name}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors">
                    <Mail size={13} />
                  </a>
                )}
                <button
                  onClick={() => { setSelectedTenant(t); setModalOpen(true); }}
                  className="h-8 px-3.5 rounded-full bg-blue-50 border border-blue-100/50 text-blue-700 flex items-center gap-1.5 hover:bg-blue-100 transition-colors text-[11px] font-bold ml-1"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && filteredTenants.length > 0 && (
          <div className="text-center text-[12px] font-semibold text-slate-400 py-2">
            Showing {filteredTenants.length} active tenant{filteredTenants.length !== 1 ? "s" : ""}
          </div>
        )}
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
