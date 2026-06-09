import React, { useState, useEffect } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { MobileTabs, MobileEmptyState } from "../../components/propertyowner/MobileComponents";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession, fetchOwnerProperties } from "../../utils/propertyowner";
import { apiFetch } from "../../services/api";
import { Search, Plus, Phone, MessageCircle, MoreHorizontal, X, Mail, MapPin, Loader2, Trash2 } from "lucide-react";

const Pill = ({ tone="muted", children }) => {
  const t = { 
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30", 
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30", 
    muted: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/30", 
    info: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30" 
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${t[tone] || t.muted}`}>{children}</span>;
};

export default function Enquiry() {
  const owner = getOwnerRuntimeSession();
  
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [enquiries, setEnquiries] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  
  // Add Lead Modal State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studentName: "",
    studentPhone: "",
    studentEmail: "",
    propertyId: "",
    propertyName: "",
    source: "Website",
    interest: "Single AC Room",
    budget: "",
    status: "new",
    notes: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [enqRes, propRes] = await Promise.all([
        apiFetch(`/api/owners/${owner.loginId}/enquiries`),
        fetchOwnerProperties(owner.loginId).catch(() => [])
      ]);
      
      if (enqRes) {
        setEnquiries(enqRes);
      }
      if (propRes) {
        setProperties(propRes);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [owner.loginId]);

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Resolve selected property name
      let selectedPropName = "";
      if (form.propertyId) {
        const found = properties.find(p => p._id === form.propertyId);
        if (found) selectedPropName = found.title || found.name || "";
      }

      const bodyData = {
        ...form,
        ownerLoginId: owner.loginId,
        propertyName: selectedPropName
      };

      await apiFetch(`/api/owners/${owner.loginId}/enquiries`, {
        method: "POST",
        body: JSON.stringify(bodyData)
      });

      // Reset Form & reload
      setForm({
        studentName: "",
        studentPhone: "",
        studentEmail: "",
        propertyId: "",
        propertyName: "",
        source: "Website",
        interest: "Single AC Room",
        budget: "",
        status: "new",
        notes: ""
      });
      setShowModal(false);
      await loadData();
    } catch (err) {
      console.error("Error creating enquiry:", err);
      alert(`Failed to add lead: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      // We will PATCH status to 'rejected' / 'deleted', or call DELETE.
      // Since Enquiry schema doesn't have deleted status specifically, let's update status to 'rejected'
      await apiFetch(`/api/owners/enquiries/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "rejected" })
      });
      await loadData();
    } catch (err) {
      console.error("Error deleting lead:", err);
      alert(`Action failed: ${err.message}`);
    }
  };

  // Status checks for mapping tabs
  const getEnquiryStatusGroup = (status = "") => {
    const s = status.toLowerCase();
    if (s === "new" || s === "pending" || s === "request to connect") return "new";
    if (s === "follow-up") return "follow-up";
    if (s === "site-visit" || s === "visit" || s === "scheduled") return "site-visit";
    if (s === "booking" || s === "confirmed" || s === "closed") return "bookings";
    return s;
  };

  const filtered = enquiries.filter(l => {
    const matchesTab = tab === "all" || getEnquiryStatusGroup(l.status) === tab;
    const matchesSearch = !search || 
      (l.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.studentPhone || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.propertyName || "").toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Calculate counts dynamically
  const totalCount = enquiries.length;
  const newCount = enquiries.filter(x => getEnquiryStatusGroup(x.status) === "new").length;
  const followupCount = enquiries.filter(x => getEnquiryStatusGroup(x.status) === "follow-up").length;
  const visitCount = enquiries.filter(x => getEnquiryStatusGroup(x.status) === "site-visit").length;
  const bookingsCount = enquiries.filter(x => getEnquiryStatusGroup(x.status) === "bookings").length;

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Leads & Enquiries" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 hidden md:flex">
        <div>
          <h1 className="text-[20px] md:text-[44px] font-bold md:font-serif leading-[1.05] text-foreground">Leads & Enquiries</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Track every lead and convert them to tenants.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition md:mt-2"
        >
          <Plus className="size-4"/> Add Lead
        </button>
      </div>

      <div className="block md:hidden">
        <MobileTabs 
          tabs={[
            { id: "all", label: `All (${totalCount})` },
            { id: "new", label: `New (${newCount})` },
            { id: "follow-up", label: `Follow-up (${followupCount})` },
            { id: "site-visit", label: `Site Visit (${visitCount})` },
            { id: "bookings", label: `Bookings (${bookingsCount})` }
          ]} 
          activeTab={tab} 
          onTabChange={setTab} 
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { l: "Total", v: totalCount },
          { l: "New", v: newCount },
          { l: "Follow-up", v: followupCount },
          { l: "Site Visit", v: visitCount },
          { l: "Bookings", v: bookingsCount }
        ].map(({ l, v }) => (
          <div key={l} className="rounded-2xl border border-border bg-card p-5 shadow-soft text-center hover:border-primary/20 transition-all">
            <div className="font-serif text-[32px] font-bold text-foreground leading-none">{v}</div>
            <div className="text-[12px] text-muted-foreground mt-1.5 font-medium">{l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="hidden md:flex flex-wrap items-center gap-1.5 mb-5 border-b border-border">
        {[
          { k: "all", l: "All" },
          { k: "new", l: "New" },
          { k: "follow-up", l: "Follow-up" },
          { k: "site-visit", l: "Site Visit" },
          { k: "bookings", l: "Bookings" }
        ].map(({ k, l }) => (
          <button 
            key={k} 
            onClick={() => setTab(k)} 
            className={`px-4 py-2 text-[13px] font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === k ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-5">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search leads by name, phone or property..." 
          className="w-full h-10 pl-9 pr-3 rounded-lg bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
        />
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="size-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading leads...</p>
        </div>
      ) : filtered.length === 0 ? (
        <>
          <div className="hidden md:flex rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
            <p className="text-[13.5px] text-muted-foreground">No leads found matching current filters.</p>
          </div>
          <div className="block md:hidden">
            <MobileEmptyState
              icon={Users}
              title="No Leads Found"
              description="You have no leads in this category or matching your search."
              actionText="Add New Lead"
              onAction={() => setShowModal(true)}
            />
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border">
                  <th className="px-5 py-3.5 font-bold">Name</th>
                  <th className="px-5 py-3.5 font-bold">Contact</th>
                  <th className="px-5 py-3.5 font-bold">Property</th>
                  <th className="px-5 py-3.5 font-bold">Interest</th>
                  <th className="px-5 py-3.5 font-bold">Source</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold">Date</th>
                  <th className="px-5 py-3.5 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(l => {
                  const mappedStatus = getEnquiryStatusGroup(l.status);
                  const phoneClean = (l.studentPhone || "").replace(/[^0-9]/g, "");
                  
                  return (
                    <tr key={l._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-foreground">{l.studentName || "N/A"}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 text-muted-foreground text-[12px]">
                            <Phone className="size-3 shrink-0" /> {l.studentPhone || "—"}
                          </span>
                          {l.studentEmail && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Mail className="size-2.5 shrink-0" /> {l.studentEmail}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground font-medium">
                        {l.propertyName ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3 text-slate-400" />
                            {l.propertyName}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{l.interest || "—"}</td>
                      <td className="px-5 py-3.5">
                        <Pill tone="info">{l.source || "Website"}</Pill>
                      </td>
                      <td className="px-5 py-3.5">
                        <Pill tone={mappedStatus === "new" ? "info" : mappedStatus === "site-visit" ? "success" : "warning"}>
                          {l.status}
                        </Pill>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {l.ts ? new Date(l.ts).toLocaleDateString("en-IN") : "Recent"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {phoneClean && (
                            <a 
                              href={`https://wa.me/${phoneClean}`}
                              target="_blank"
                              rel="noreferrer"
                              className="size-8 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 grid place-items-center transition"
                            >
                              <MessageCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                            </a>
                          )}
                          <button 
                            onClick={() => handleDelete(l._id)}
                            className="size-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 grid place-items-center transition text-rose-600 dark:text-rose-400"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (CRM Style) */}
          <div className="block md:hidden space-y-3 pb-8 mt-4">
            {filtered.map(l => {
              const mappedStatus = getEnquiryStatusGroup(l.status);
              const phoneClean = (l.studentPhone || "").replace(/[^0-9]/g, "");

              return (
                <div key={`mob-${l._id}`} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm relative overflow-hidden">
                  {/* Status Badges Row */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                      mappedStatus === "new" ? "bg-blue-50 text-blue-600 border-blue-100" :
                      mappedStatus === "site-visit" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      mappedStatus === "bookings" ? "bg-purple-50 text-purple-600 border-purple-100" :
                      "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                      {l.status || "New"}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {l.ts ? new Date(l.ts).toLocaleDateString("en-IN") : "Recent"}
                    </span>
                  </div>

                  {/* Profile Row */}
                  <div className="flex items-center gap-3 border-b border-slate-50 pb-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[18px] font-black shrink-0 border border-blue-100 uppercase">
                      {(l.studentName || "N")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-black text-slate-900 truncate">{l.studentName || "N/A"}</h3>
                      <p className="text-[11.5px] font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                        <MapPin className="w-3.5 h-3.5" /> {l.propertyName || "Any"}
                      </p>
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Budget</p>
                       <p className="text-[14px] font-black text-slate-800 leading-none">₹{(l.budget || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Interest</p>
                       <p className="text-[12px] font-bold text-indigo-600 mt-0.5">{l.interest || "PG"}</p>
                    </div>
                  </div>

                  {/* CRM Action Buttons */}
                  <div className="flex gap-2">
                    <a href={`tel:${l.studentPhone}`} className="flex-1 py-3 rounded-xl bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-wider flex flex-col items-center justify-center gap-1 hover:bg-slate-100 transition-colors border border-slate-100 shadow-sm">
                      <Phone className="w-4 h-4 text-blue-500 mb-0.5" />
                      Call
                    </a>
                    {phoneClean && (
                      <a href={`https://wa.me/${phoneClean}?text=Hi%20${l.studentName}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 rounded-xl bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-wider flex flex-col items-center justify-center gap-1 hover:bg-slate-100 transition-colors border border-slate-100 shadow-sm">
                        <MessageCircle className="w-4 h-4 text-emerald-500 mb-0.5" />
                        WhatsApp
                      </a>
                    )}
                    <button onClick={() => handleDelete(l._id)} className="w-12 py-3 rounded-xl bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-wider flex flex-col items-center justify-center gap-1 hover:bg-rose-100 transition-colors border border-rose-100 shadow-sm shrink-0">
                      <Trash2 className="w-4 h-4 text-rose-500 mb-0.5" />
                      Drop
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition p-1 hover:bg-muted rounded-full"
            >
              <X className="size-5" />
            </button>

            <h3 className="font-serif text-[24px] font-bold text-foreground mb-4">Add Manual Lead</h3>
            
            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-muted-foreground uppercase mb-1">Lead Name *</label>
                  <input 
                    required
                    value={form.studentName}
                    onChange={e => setForm(prev => ({ ...prev, studentName: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full h-10 px-3 rounded-lg bg-muted/40 border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-muted-foreground uppercase mb-1">Phone Number *</label>
                  <input 
                    required
                    type="tel"
                    value={form.studentPhone}
                    onChange={e => setForm(prev => ({ ...prev, studentPhone: e.target.value }))}
                    placeholder="e.g. +91 9999999999"
                    className="w-full h-10 px-3 rounded-lg bg-muted/40 border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-muted-foreground uppercase mb-1">Email Address</label>
                <input 
                  type="email"
                  value={form.studentEmail}
                  onChange={e => setForm(prev => ({ ...prev, studentEmail: e.target.value }))}
                  placeholder="e.g. name@domain.com"
                  className="w-full h-10 px-3 rounded-lg bg-muted/40 border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-muted-foreground uppercase mb-1">Target Property</label>
                  <select 
                    value={form.propertyId}
                    onChange={e => setForm(prev => ({ ...prev, propertyId: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg bg-muted/40 border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select Property...</option>
                    {properties.map(p => (
                      <option key={p._id} value={p._id}>{p.title || p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-muted-foreground uppercase mb-1">Lead Source</label>
                  <select 
                    value={form.source}
                    onChange={e => setForm(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg bg-muted/40 border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Website">Website</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Referral">Referral</option>
                    <option value="Instagram Ad">Instagram Ad</option>
                    <option value="Google Maps">Google Maps</option>
                    <option value="Cold Call">Cold Call</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-muted-foreground uppercase mb-1">Room Interest</label>
                  <input 
                    value={form.interest}
                    onChange={e => setForm(prev => ({ ...prev, interest: e.target.value }))}
                    placeholder="e.g. Double Sharing AC"
                    className="w-full h-10 px-3 rounded-lg bg-muted/40 border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-muted-foreground uppercase mb-1">Target Budget</label>
                  <input 
                    value={form.budget}
                    onChange={e => setForm(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="e.g. ₹9,000/mo"
                    className="w-full h-10 px-3 rounded-lg bg-muted/40 border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-muted-foreground uppercase mb-1">Initial Status</label>
                  <select 
                    value={form.status}
                    onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg bg-muted/40 border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="new">New Lead</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="site-visit">Site Visit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-muted-foreground uppercase mb-1">Conversation Notes</label>
                <textarea 
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Summarize customer call or chat..."
                  className="w-full p-3 rounded-lg bg-muted/40 border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3 border-t border-border mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-10 border border-border rounded-lg text-[13px] font-bold text-muted-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 h-10 bg-foreground text-background rounded-lg text-[13px] font-bold hover:opacity-90 transition flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Lead"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PropertyOwnerLayout>
  );
}

