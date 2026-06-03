import React, { useEffect, useState } from "react";
import { fetchJson } from "../../utils/api";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import {
  Plus, Search, ArrowUpDown, Download, Users, ExternalLink,
  User, CalendarClock, CheckCircle, AlertTriangle, Phone,
  Shield, Building2, FileText, BadgeCheck, X, MapPin, Mail,
  CreditCard, Home
} from "lucide-react";
import {
  clearOwnerRuntimeSession,
  fetchOwnerTenants,
  getOwnerRuntimeSession
} from "../../utils/propertyowner";
import { API_URL } from "../../services/api";

const getFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

const Pill = ({ tone = "muted", children }) => {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success-foreground",
    warning: "bg-warning/20 text-foreground",
    info: "bg-info/15 text-foreground",
    danger: "bg-destructive/15 text-destructive",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11.5px] font-medium ${toneMap[tone] || toneMap.muted}`}>
      {children}
    </span>
  );
};

export default function Tenants() {
  const [owner, setOwner] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const session = getOwnerRuntimeSession();
    if (!session?.loginId) { window.location.href = "/propertyowner/ownerlogin"; return; }
    setOwner(session);
    const load = async () => {
      try {
        const data = await fetchOwnerTenants(session.loginId);
        setTenants(data || []);
      } catch (err) {
        setErrorMsg(err?.body || err?.message || "Failed to load tenants.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const counts = {
    all: tenants.length,
    active: tenants.filter(t => t.status === "active" || t.active).length,
    notice: tenants.filter(t => t.status === "notice" || t.status === "move-out").length,
    dues: tenants.filter(t => (t.dueAmount || t.dues || t.balance) > 0).length,
  };

  const filtered = tenants.filter(t => {
    const matchTab = tab === "all" || (tab === "active" && (t.status === "active" || t.active)) || (tab === "notice" && (t.status === "notice" || t.status === "move-out")) || (tab === "dues" && (t.dueAmount || t.dues || t.balance) > 0);
    const q = debouncedSearch.toLowerCase();
    const matchSearch = !debouncedSearch || (t.name || "").toLowerCase().includes(q) || (t.phone || "").includes(q) || (t.roomNo || "").toLowerCase().includes(q);
    return matchTab && matchSearch;
  }).sort((a, b) => {
    let valA = a[sortKey] || "";
    let valB = b[sortKey] || "";
    if (sortKey === "rent") {
      valA = Number(a.agreedRent || a.rent || 0);
      valB = Number(b.agreedRent || b.rent || 0);
    } else if (sortKey === "dues") {
      valA = Number(a.dueAmount || a.dues || a.balance || 0);
      valB = Number(b.dueAmount || b.dues || b.balance || 0);
    } else {
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleExportCSV = () => {
    const headers = ["Name,Phone,Room,Rent,Dues,Status,KYC"];
    const rows = filtered.map(t => {
      const roomStr = `Room ${t.roomNo || ""} / Bed ${t.bedNo || ""}`;
      const rentStr = t.agreedRent || t.rent || 0;
      const duesStr = t.dueAmount || t.dues || t.balance || 0;
      return `"${t.name || ""}","${t.phone || ""}","${roomStr}","${rentStr}","${duesStr}","${t.status || "active"}","${t.kycStatus || t.kyc || "pending"}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tenants_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitial = (name) => (name || "T").charAt(0).toUpperCase();
  const getKycTone = (kyc) => kyc === "verified" ? "success" : kyc === "pending" ? "warning" : "muted";
  const getStatusTone = (status) => status === "active" ? "success" : status === "notice" ? "warning" : "muted";

  return (
    <PropertyOwnerLayout
      owner={owner}
      title="Tenants"
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Tenants</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Every person living in your property — their rent, KYC and history in one place.</p>
        </div>
        <div className="flex items-center gap-2 md:mt-2">
          <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-border bg-card text-[13px] font-medium hover:border-primary/40 transition-colors">
            <Download className="size-3.5" /> Export
          </button>
          <a href="/propertyowner/tenantrec" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity">
            <Plus className="size-4" /> Add tenant
          </a>
        </div>
      </div>

      {errorMsg && <div className="text-sm text-destructive mb-4 bg-destructive/10 px-4 py-3 rounded-lg">{errorMsg}</div>}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 border-b border-border">
        {[
          { k: "all", label: "All", count: counts.all },
          { k: "active", label: "Active", count: counts.active },
          { k: "notice", label: "On notice", count: counts.notice },
          { k: "dues", label: "With dues", count: counts.dues },
        ].map((t, i) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={[
              "px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors",
              tab === t.k ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            ].join(" ")}
          >
            {t.label} <span className="text-muted-foreground/70 ml-0.5">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, room…"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
        <select value={tab} onChange={e => setTab(e.target.value)} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-border bg-card text-[13px] font-medium hover:border-primary/40 transition-colors outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="notice">On notice</option>
          <option value="dues">With dues</option>
        </select>
        <div className="relative">
          <select value={`${sortKey}-${sortOrder}`} onChange={e => {
            const [k, o] = e.target.value.split('-');
            setSortKey(k);
            setSortOrder(o);
          }} className="inline-flex items-center gap-1.5 h-10 pl-3 pr-8 rounded-lg border border-border bg-card text-[13px] font-medium hover:border-primary/40 transition-colors outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
            <option value="name-asc">Sort A-Z</option>
            <option value="name-desc">Sort Z-A</option>
            <option value="rent-desc">Rent (High-Low)</option>
            <option value="rent-asc">Rent (Low-High)</option>
            <option value="dues-desc">Dues (High-Low)</option>
          </select>
          <ArrowUpDown className="size-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            {[1,2,3].map(i => <div key={i} className="w-full h-12 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-muted/60 rounded-full flex items-center justify-center mb-3">
              <Users className="size-7 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-[20px] text-foreground mb-1">No tenants found</h3>
            <p className="text-[13px] text-muted-foreground">Add your first tenant to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                  <th className="px-4 py-3 font-semibold">Tenant</th>
                  <th className="px-4 py-3 font-semibold">Property · Room</th>
                  <th className="px-4 py-3 font-semibold">Rent</th>
                  <th className="px-4 py-3 font-semibold">Dues</th>
                  <th className="px-4 py-3 font-semibold">KYC</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => (
                  <tr key={t._id || t.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-[14px] shrink-0">
                          {getInitial(t.name)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{t.name || "—"}</div>
                          <div className="text-[11.5px] text-muted-foreground flex items-center gap-1">
                            <Phone className="size-3" /> {t.phone || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13px] text-foreground">
                        {t.propertyName || (t.property && typeof t.property === "object" ? t.property.title || t.property.name : t.property) || "—"}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground">Room {t.roomNo || "—"} / Bed {t.bedNo || "—"}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">₹{(t.agreedRent || t.rent || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      {(t.dueAmount || t.dues || t.balance) > 0
                        ? <span className="font-medium text-destructive">₹{((t.dueAmount || t.dues || t.balance) || 0).toLocaleString("en-IN")}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone={getKycTone(t.kycStatus || t.kyc)}>{t.kycStatus || t.kyc || "pending"}</Pill>
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone={getStatusTone(t.status)}>{t.status || "active"}</Pill>
                    </td>
                    <td className="px-4 py-3 text-right">
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
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-[12px] text-muted-foreground">
            <span>Showing {filtered.length} of {tenants.length}</span>
            <div className="flex gap-1">
              <button className="h-8 px-2.5 rounded-md border border-border hover:bg-muted transition-colors">Prev</button>
              <button className="h-8 px-2.5 rounded-md border border-border bg-muted">1</button>
              <button className="h-8 px-2.5 rounded-md border border-border hover:bg-muted transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Tenant Details Modal */}
      {modalOpen && selectedTenant && (() => {
        const t = selectedTenant;
        const kyc = t.kyc || {};
        const profile = t.digitalCheckin?.profile || {};
        const agr = t.digitalCheckin?.agreementDetails || {};

        const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
        const val = (...sources) => sources.find(v => v !== undefined && v !== null && v !== "") || "—";

        const tenantPhoto = getFileUrl(t.photo || kyc.idProofFile);
        const aadhaarFront = getFileUrl(kyc.aadhaarFront);
        const aadhaarBack  = getFileUrl(kyc.aadhaarBack);

        const InfoField = ({ label, value, mono, wide }) => (
          <div className={wide ? "col-span-2 sm:col-span-3" : ""}>
            <div className="text-[11px] text-muted-foreground mb-0.5 uppercase tracking-wide">{label}</div>
            <div className={`text-[13px] font-medium text-foreground break-words ${mono ? "font-mono" : ""}`}>{value || "—"}</div>
          </div>
        );

        const SectionHead = ({ icon: Icon, title, color = "text-primary" }) => (
          <h3 className={`text-[13.5px] font-semibold text-foreground mb-3 flex items-center gap-2`}>
            <Icon size={15} className={color} /> {title}
          </h3>
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">

              {/* ── Header ── */}
              <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-4">
                  {tenantPhoto ? (
                    <img src={tenantPhoto} alt={t.name} className="size-14 rounded-full object-cover border-2 border-border shrink-0" />
                  ) : (
                    <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[22px] shrink-0">
                      {getInitial(t.name)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-[20px] font-semibold text-foreground">{t.name || "—"}</h2>
                    <p className="text-[12px] text-muted-foreground font-mono mt-0.5">{t.loginId || "—"}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Pill tone={getStatusTone(t.status)}>{t.status || "active"}</Pill>
                      <Pill tone={getKycTone(t.kycStatus || t.kyc)}>{t.kycStatus || t.kyc || "pending"} KYC</Pill>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setModalOpen(false); setSelectedTenant(null); }}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ── Scrollable Body ── */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">

                {/* Room & Rent */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-muted/10">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Room Details</span>
                    <div className="font-medium text-foreground text-[14px]">
                      {val(t.propertyName, typeof t.property === "object" ? t.property?.title : null, "—")}
                    </div>
                    <div className="text-[12.5px] text-muted-foreground mt-0.5">
                      Room {t.roomNo || "—"}{t.bedNo ? ` / Bed ${t.bedNo}` : ""}
                      {agr.accommodationType || profile.accommodationType ? ` · ${agr.accommodationType || profile.accommodationType}` : ""}
                    </div>
                    {(agr.propertyAddress || profile.propertyAddress) && (
                      <div className="text-[12px] text-muted-foreground mt-1 flex items-start gap-1">
                        <MapPin size={11} className="mt-0.5 shrink-0" />
                        {agr.propertyAddress || profile.propertyAddress}
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-emerald-50/50">
                    <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block mb-1.5">Rent Information</span>
                    <div className="font-bold text-emerald-700 text-[18px]">
                      ₹{(t.agreedRent || t.rent || 0).toLocaleString("en-IN")}
                      <span className="text-[13px] font-normal text-emerald-600/70"> / month</span>
                    </div>
                    {(agr.securityDeposit || t.securityDepositTotal) && (
                      <div className="text-[12.5px] text-emerald-600 mt-0.5">
                        Security deposit: ₹{Number(agr.securityDeposit || t.securityDepositTotal || 0).toLocaleString("en-IN")}
                      </div>
                    )}
                    {(t.dueAmount || t.dues) > 0 && (
                      <span className="inline-block mt-1.5 text-[11px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                        Dues: ₹{(t.dueAmount || t.dues).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <SectionHead icon={User} title="Personal Information" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 p-4 rounded-xl border border-border">
                    <InfoField label="Phone Number" value={val(t.phone, profile.phone)} />
                    <InfoField label="Email Address" value={val(t.email, profile.email)} />
                    <InfoField label="Date of Birth" value={val(t.dob, profile.dob) !== "—" ? fmtDate(val(t.dob, profile.dob)) : "—"} />
                    <InfoField label="Gender" value={t.gender ? t.gender.charAt(0).toUpperCase() + t.gender.slice(1) : "—"} />
                    <InfoField label="Occupation" value={val(t.occupation, profile.occupation)} />
                    <InfoField label="Guardian / Emergency No." value={val(t.guardianNumber, profile.guardianNumber)} />
                    {(agr.permanentAddress || profile.permanentAddress) && (
                      <InfoField label="Permanent Address" value={agr.permanentAddress || profile.permanentAddress} wide />
                    )}
                    {(agr.backupEmail || profile.backupEmail) && (
                      <InfoField label="Backup Email" value={agr.backupEmail || profile.backupEmail} />
                    )}
                  </div>
                </div>

                {/* Agreement & Financial Details */}
                {(agr.licenseDuration || agr.licenseEndDate || agr.inclusions || agr.moveOutCharges || agr.gstCharges) && (
                  <div>
                    <SectionHead icon={FileText} title="Agreement & Financial Terms" color="text-amber-600" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 p-4 rounded-xl border border-border">
                      {t.moveInDate && <InfoField label="Move-in Date" value={fmtDate(t.moveInDate)} />}
                      {agr.licenseEndDate && <InfoField label="License End Date" value={fmtDate(agr.licenseEndDate)} />}
                      {agr.licenseDuration && <InfoField label="License Duration" value={agr.licenseDuration} />}
                      {agr.licenseFeeDueDate && <InfoField label="Rent Due Day" value={`${agr.licenseFeeDueDate}th of month`} />}
                      {agr.minimumStayDuration && <InfoField label="Minimum Stay" value={agr.minimumStayDuration} />}
                      {agr.moveOutCharges && <InfoField label="Move-out Charges" value={`₹${Number(agr.moveOutCharges).toLocaleString("en-IN")}`} />}
                      {agr.noticePeriodCharges && <InfoField label="Notice Period Charges" value={`₹${Number(agr.noticePeriodCharges).toLocaleString("en-IN")}`} />}
                      {agr.gstCharges && Number(agr.gstCharges) > 0 && <InfoField label="GST Charges" value={`₹${Number(agr.gstCharges).toLocaleString("en-IN")}`} />}
                      {agr.inclusions && <InfoField label="Inclusions" value={agr.inclusions} wide />}
                    </div>
                  </div>
                )}

                {/* KYC & Identity Documents */}
                <div>
                  <SectionHead icon={Shield} title="KYC & Identity Documents" color="text-indigo-500" />
                  <div className="p-4 rounded-xl border border-border space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                      {kyc.aadhaarNumber && <InfoField label="Aadhaar Number" value={kyc.aadhaarNumber} mono />}
                      {kyc.aadhaarLinkedPhone && <InfoField label="Aadhaar Linked Phone" value={kyc.aadhaarLinkedPhone} />}
                      <div>
                        <div className="text-[11px] text-muted-foreground mb-0.5 uppercase tracking-wide">Verification Status</div>
                        {kyc.digilockerVerified ? (
                          <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-emerald-600">
                            <BadgeCheck size={14} /> Verified {kyc.digilockerVerifiedAt ? `· ${fmtDate(kyc.digilockerVerifiedAt)}` : ""}
                          </span>
                        ) : (
                          <span className="text-[12.5px] text-muted-foreground">Not verified</span>
                        )}
                      </div>
                    </div>

                    {/* Aadhaar Images */}
                    {(aadhaarFront || aadhaarBack) && (
                      <div>
                        <div className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wide">Aadhaar Card Photos</div>
                        <div className="flex gap-4 flex-wrap">
                          {aadhaarFront && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] text-muted-foreground">Front Side</span>
                              <a href={aadhaarFront} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={aadhaarFront}
                                  alt="Aadhaar Front"
                                  className="h-32 w-52 object-cover rounded-lg border border-border hover:opacity-90 transition-opacity cursor-zoom-in"
                                />
                              </a>
                            </div>
                          )}
                          {aadhaarBack && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] text-muted-foreground">Back Side</span>
                              <a href={aadhaarBack} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={aadhaarBack}
                                  alt="Aadhaar Back"
                                  className="h-32 w-52 object-cover rounded-lg border border-border hover:opacity-90 transition-opacity cursor-zoom-in"
                                />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tenant Photo */}
                {tenantPhoto && (
                  <div>
                    <SectionHead icon={CreditCard} title="Tenant Photo" color="text-rose-400" />
                    <div className="p-4 rounded-xl border border-border">
                      <a href={tenantPhoto} target="_blank" rel="noopener noreferrer">
                        <img
                          src={tenantPhoto}
                          alt="Tenant Photo"
                          className="h-40 w-32 object-cover rounded-xl border border-border hover:opacity-90 transition-opacity cursor-zoom-in"
                        />
                      </a>
                      <p className="text-[11.5px] text-muted-foreground mt-2">Click to open full size</p>
                    </div>
                  </div>
                )}

                {/* Timeline & Status */}
                <div>
                  <SectionHead icon={CalendarClock} title="Timeline & Status" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border">
                      <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide">Move-in Date</div>
                      <div className="text-[13px] font-medium text-foreground">{t.moveInDate ? fmtDate(t.moveInDate) : "Not specified"}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-border">
                      <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide">Agreement Signed</div>
                      <div className="text-[13px] font-medium">
                        {t.agreementSigned ? (
                          <span className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle size={14} /> Yes {t.agreementSignedAt ? `· ${fmtDate(t.agreementSignedAt)}` : ""}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-rose-600"><AlertTriangle size={14} /> Pending</span>
                        )}
                      </div>
                    </div>
                    {kyc.digilockerVerifiedAt && (
                      <div className="p-4 rounded-xl border border-border">
                        <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide">KYC Verified On</div>
                        <div className="text-[13px] font-medium text-foreground">{fmtDate(kyc.digilockerVerifiedAt)}</div>
                      </div>
                    )}
                    <div className="p-4 rounded-xl border border-border">
                      <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide">Tenant Status</div>
                      <Pill tone={getStatusTone(t.status)}>{t.status || "active"}</Pill>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end">
                <button
                  onClick={() => { setModalOpen(false); setSelectedTenant(null); }}
                  className="px-6 py-2 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </PropertyOwnerLayout>
  );
}
