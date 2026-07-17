import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, UserCheck, Shield, Clock, MoreVertical, 
  ArrowUpRight, ArrowDownRight, Building2, Search,
  CheckCircle2, AlertCircle, XCircle, Globe,
  Phone, Mail, Calendar, MapPin, Zap, Filter,
  ChevronRight, RefreshCw, LayoutGrid, Plus,
  Loader2, Save, Sparkles, Layers, Box, Globe2,
  IndianRupee, Inbox, CreditCard, Tag, ShieldCheck,
  Smartphone, Monitor, Info, X, Eye, Trash2, 
  Download, Sheet, FileText, User, Fingerprint,
  Home, Hash, Banknote, Wallet, Briefcase, AlertTriangle,
  CheckCircle, Circle, UserCheck2, Key
} from "lucide-react";
import { fetchJson, getAuthHeader } from "../../utils/api";
import { PageHeader } from "../../components/superadmin/PageHeader";
import * as XLSX from 'xlsx';

const cn = (...classes) => classes.filter(Boolean).join(" ");

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getPropertyText(tenant, profile = {}) {
  const propertyObj = tenant?.property && typeof tenant.property === "object" ? tenant.property : null;
  const profileName = profile.propertyName || tenant?.tenantProfile?.propertyName || tenant?.digitalCheckin?.profile?.propertyName;
  const propertyTitle = profileName || tenant?.propertyTitle || tenant?.propertyName || propertyObj?.title || propertyObj?.name || "";
  const location = propertyObj?.locationCode || "";
  if (propertyTitle && location && !propertyTitle.includes(location)) return `${propertyTitle} (${location})`;
  return propertyTitle || location || "Global Inventory";
}

function normalizeTenant(tenant, record) {
  const profile = record?.tenantProfile || tenant?.digitalCheckin?.profile || {};
  const tenantKyc = record?.tenantKyc || tenant?.digitalCheckin?.kyc || {};
  const modelKyc = tenant?.kyc || {};
  const aadhaarNumber = modelKyc.aadhaarNumber || modelKyc.aadhar || tenantKyc.aadhaarNumber || "";
  const kycStatus = tenant?.kycStatus || tenantKyc?.digilockerStatus || (modelKyc.digilockerVerified || modelKyc.otpVerified ? "verified" : "") || (aadhaarNumber ? "submitted" : "") || "pending";

  return {
    ...tenant,
    profile: {
      name: tenant?.name || profile?.name || "Resident",
      email: tenant?.email || profile?.email || "No Email",
      phone: tenant?.phone || profile?.phone || "No Contact",
      dob: tenant?.dob || profile?.dob || "",
      gender: tenant?.gender || "",
      moveInDate: tenant?.moveInDate || profile?.moveInDate || "",
      roomNo: tenant?.roomNo || profile?.roomNo || tenant?.room?.number || "N/A",
      bedNo: tenant?.bedNo || "N/A",
      floor: tenant?.floor || "",
      building: tenant?.building || "",
      agreedRent: tenant?.agreedRent || profile?.agreedRent || 0,
      baseRoomRent: tenant?.baseRoomRent || 0,
      securityDepositTotal: tenant?.securityDepositTotal || 0,
      securityDepositPaid: tenant?.securityDepositPaid || 0,
      securityDepositBalance: tenant?.securityDepositBalance || 0,
      paymentFrequency: tenant?.paymentFrequency || "",
      rentAgreementType: tenant?.rentAgreementType || "",
      electricityCharge: tenant?.electricityCharge || 0,
      maintenanceCharge: tenant?.maintenanceCharge || 0,
      occupation: tenant?.occupation || "",
      company: tenant?.company || "",
      remarks: tenant?.remarks || "",
      guardianNumber: tenant?.guardianNumber || profile?.guardianNumber || "N/A",
      propertyText: getPropertyText(tenant, profile),
      emergencyName: tenant?.emergencyContact?.name || "",
      emergencyPhone: tenant?.emergencyContact?.phone || "",
      emergencyRelationship: tenant?.emergencyContact?.relationship || "",
      agreementDetails: tenant?.digitalCheckin?.agreementDetails || {},
    },
    kyc: {
      status: String(kycStatus || "pending").toLowerCase(),
      aadhaarNumber,
      idProofType: modelKyc.idProof || "",
      idProofFile: modelKyc.idProofFile || modelKyc.aadhaarFront || tenantKyc.aadhaarFront || "",
      aadhaarFront: modelKyc.aadhaarFront || tenantKyc.aadhaarFront || "",
      aadhaarBack: modelKyc.aadhaarBack || tenantKyc.aadhaarBack || "",
      otpVerified: modelKyc.otpVerified || tenantKyc.otpVerified || false,
      digilockerVerified: modelKyc.digilockerVerified || tenantKyc.digilockerVerified || false
    }
  };
}

export default function Tenant() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isUpdatingKyc, setIsUpdatingKyc] = useState(false);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await fetchJson("/api/tenants");
      const baseTenants = Array.isArray(data) ? data : Array.isArray(data?.tenants) ? data.tenants : [];
      const merged = await Promise.all(baseTenants.map(async (t) => {
        if (!t?.loginId) return normalizeTenant(t, null);
        try {
          const checkin = await fetchJson(`/api/checkin/tenant/${encodeURIComponent(t.loginId)}`);
          return normalizeTenant(t, checkin?.record || null);
        } catch (_) { return normalizeTenant(t, null); }
      }));
      setTenants(merged);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTenants(); }, []);

  const filteredTenants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tenants;
    return tenants.filter(t => {
      const haystack = [t.profile.name, t.profile.phone, t.profile.propertyText, t.loginId].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [tenants, search]);

  const LIMIT = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalRecords = filteredTenants.length;
  const totalPages = Math.ceil(totalRecords / LIMIT) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * LIMIT;
    return filteredTenants.slice(start, start + LIMIT);
  }, [filteredTenants, currentPage]);

  const stats = useMemo(() => {
    const total = tenants.length;
    const verified = tenants.filter(t => t.kyc.status === "verified").length;
    const submitted = tenants.filter(t => t.kyc.status === "submitted").length;
    const revenue = tenants.reduce((acc, t) => acc + (Number(t.profile.agreedRent) || 0), 0);
    return { total, verified, submitted, pending: total - verified - submitted, revenue };
  }, [tenants]);

  const exportToExcel = () => {
    const data = filteredTenants.map(t => ({
      "Tenant ID": t.loginId,
      "Name": t.profile.name,
      "Phone": t.profile.phone,
      "Email": t.profile.email,
      "Property": t.profile.propertyText,
      "Room": t.profile.roomNo,
      "Bed": t.profile.bedNo,
      "Floor": t.profile.floor,
      "Agreed Rent": t.profile.agreedRent,
      "Security Deposit": t.profile.securityDepositTotal,
      "Move-In": formatDate(t.profile.moveInDate),
      "Payment Frequency": t.profile.paymentFrequency,
      "Occupation": t.profile.occupation,
      "Emergency Contact": t.profile.emergencyName,
      "Emergency Phone": t.profile.emergencyPhone,
      "KYC Status": t.kyc.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tenants");
    XLSX.writeFile(wb, `Roomhy_Tenants_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleKycUpdate = async (id, status) => {
    try {
      setIsUpdatingKyc(true);
      await fetchJson(`/api/tenants/${id}/kyc`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({ status })
      });
      loadTenants();
      setSelectedTenant(prev => prev ? { ...prev, kyc: { ...prev.kyc, status } } : null);
    } catch (err) { alert("Failed to update KYC status"); }
    finally { setIsUpdatingKyc(false); }
  };

  const handleToggleDeactivate = async (tenant) => {
    const id = tenant._id || tenant.id;
    if (!id) { alert("Tenant ID not found"); return; }
    const isCurrentlyActive = tenant.status !== "suspended";
    const action = isCurrentlyActive ? "deactivate" : "reactivate";
    if (!window.confirm(`Are you sure you want to ${action} resident ${tenant.profile?.name || "this resident"}?`)) return;
    try {
      setLoading(true);
      const res = await fetchJson(`/api/tenants/${id}/${action}`, { method: "POST", headers: getAuthHeader() });
      alert(res.message || `Resident ${action}d successfully`);
      loadTenants();
    } catch (err) {
      alert(`Failed to ${action} resident: ` + (err.body || err.message));
    } finally { setLoading(false); }
  };

  const handleDeleteTenant = async (tenant) => {
    const id = tenant._id || tenant.id;
    if (!id) { alert("Tenant ID not found"); return; }
    if (!window.confirm(`Are you sure you want to permanently delete resident ${tenant.profile?.name || "this resident"}? This action cannot be undone.`)) return;
    try {
      setLoading(true);
      const res = await fetchJson(`/api/tenants/${id}`, { method: "DELETE", headers: getAuthHeader() });
      alert(res.message || "Resident deleted successfully");
      loadTenants();
    } catch (err) {
      alert("Failed to delete resident: " + (err.body || err.message));
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="View All Tenants"
        subtitle="Manage and view all tenant records and occupancy."
        actions={
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/superadmin/add-tenant")}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all flex items-center gap-2 active:scale-95"
            >
               <Plus size={14} /> Add Tenant
            </button>
            <button 
              onClick={exportToExcel}
              className="bg-white text-slate-600 border border-slate-100 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-200 transition-all flex items-center gap-2 active:scale-95"
            >
               <Sheet className="w-4 h-4" /> Export Excel
            </button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Active Tenants" value={stats.total} trend="Active" up icon={Users} color="blue" />
        <StatCardHorizontal label="KYC Verified" value={stats.verified} trend="Verified" up icon={ShieldCheck} color="emerald" />
        <StatCardHorizontal label="Total Rent" value={`₹${stats.revenue.toLocaleString()}`} trend="Monthly" up icon={Banknote} color="indigo" />
        <StatCardHorizontal label="Pending KYC" value={stats.submitted} trend="Pending" up icon={Clock} color="amber" />
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                  <LayoutGrid size={20} />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-slate-800">Tenant Registry</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">View active and pending tenants</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="relative w-72 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search tenants..." 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" 
                  />
               </div>
               
               <button onClick={loadTenants} className="p-4 rounded-2xl bg-white text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-md active:scale-95">
                  <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-slate-100">
                     <th className="px-10 py-8">Tenant Name</th>
                     <th className="px-6 py-8">Property Name</th>
                     <th className="px-6 py-8 text-center">Contact Details</th>
                     <th className="px-6 py-8 text-center">KYC Status</th>
                     <th className="px-10 py-8 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan="5" className="py-40 text-center">
                       <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin mx-auto mb-8" />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Loading tenant data...</p>
                    </td></tr>
                  ) : filteredTenants.length === 0 ? (
                    <tr><td colSpan="5" className="py-40 text-center">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                          <Users size={40} />
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No tenants found</p>
                    </td></tr>
                  ) : paginatedTenants.map((t, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-all duration-300 cursor-pointer" onClick={() => setSelectedTenant(t)}>
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-6">
                             <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 text-blue-600 flex items-center justify-center font-bold text-xl shadow-xl shadow-slate-200/40 transition-transform group-hover:scale-110 shrink-0">
                                {t.profile.name.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                <p className="text-base font-bold text-slate-800 tracking-tight">{t.profile.name}</p>
                                <div className="flex items-center gap-2 mt-2">
                                   <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-lg uppercase tracking-widest">{t.loginId || "ID-GEN"}</span>
                                   <span className={cn(
                                       "text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ml-2",
                                       t.status === "suspended" ? "bg-rose-100 text-rose-700" :
                                       t.status === "active" ? "bg-emerald-100 text-emerald-700" :
                                       "bg-slate-100 text-slate-600"
                                    )}>
                                       {t.status || "pending"}
                                    </span>
                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Moved in: {formatDate(t.profile.moveInDate)}</span>
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-8">
                          <div className="space-y-2">
                             <p className="text-xs font-bold text-slate-700 leading-none truncate max-w-[200px]">{t.profile.propertyText}</p>
                             <div className="flex items-center gap-2">
                                <Building2 className="w-3 h-3 text-slate-300" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unit {t.profile.roomNo} • {t.profile.bedNo} Bed</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-8 text-center">
                          <div className="inline-flex flex-col items-center gap-1.5">
                             <p className="text-xs font-bold text-slate-800 leading-none">{t.profile.phone}</p>
                             <span className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[120px]">{t.profile.email}</span>
                          </div>
                       </td>
                       <td className="px-6 py-8 text-center">
                          <span className={cn(
                             "text-[8px] font-bold px-4 py-1.5 rounded-xl border uppercase tracking-[0.2em] shadow-sm",
                             t.kyc.status === "verified" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                             t.kyc.status === "submitted" ? "bg-amber-50 text-amber-600 border-amber-100" :
                             "bg-slate-50 text-slate-400 border-slate-100"
                          )}>
                             {t.kyc.status}
                          </span>
                       </td>
                        <td className="px-10 py-8 text-right" onClick={(e) => e.stopPropagation()}>
                           <div className="flex items-center justify-end gap-3">
                              <button 
                                 onClick={() => handleToggleDeactivate(t)} 
                                 title={t.status === "suspended" ? "Reactivate Account" : "Deactivate Account"} 
                                 className={cn(
                                    "p-3.5 rounded-2xl border transition-all shadow-md active:scale-95",
                                    t.status === "suspended" 
                                       ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100" 
                                       : "bg-white text-slate-400 border-slate-100 hover:text-slate-600 hover:border-slate-300"
                                 )}
                               >
                                 <Shield size={20} className={t.status === "suspended" ? "animate-pulse" : ""} />
                               </button>
                              <button onClick={() => setSelectedTenant(t)} className="p-3.5 rounded-2xl bg-white text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all border border-slate-100 shadow-md active:scale-95"><Eye className="w-5 h-5" /></button>
                              <button onClick={() => handleDeleteTenant(t)} className="p-3.5 rounded-2xl bg-white text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all border border-slate-100 shadow-md active:scale-95"><Trash2 className="w-5 h-5" /></button>
                           </div>
                        </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         {totalPages > 1 && (
           <div className="px-10 py-6 border-t border-slate-50 flex items-center justify-between">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               Showing {(currentPage-1)*LIMIT+1}–{Math.min(currentPage*LIMIT, totalRecords)} of {totalRecords}
             </p>
             <div className="flex items-center gap-2">
               <button onClick={() => setCurrentPage(p => Math.max(1,p-1))} disabled={currentPage===1}
                 className="px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all">Prev</button>
               {Array.from({length: Math.min(5,totalPages)}, (_,i) => i+1).map(n => (
                 <button key={n} onClick={() => setCurrentPage(n)}
                   className={cn("w-9 h-9 rounded-xl text-[10px] font-bold transition-all", n===currentPage ? "bg-slate-900 text-white shadow-lg" : "border border-slate-100 text-slate-500 hover:bg-slate-50")}>
                   {n}
                 </button>
               ))}
               <button onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} disabled={currentPage===totalPages}
                 className="px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all">Next</button>
             </div>
           </div>
         )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          FULL DETAIL SLIDE-OVER — Complete Onboarding Details View
          ═══════════════════════════════════════════════════════════ */}
      {selectedTenant && (
        <div className="fixed inset-0 z-[120] flex items-center justify-end p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-3xl h-full rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col animate-in slide-in-from-right duration-500">
              
              {/* Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold text-2xl border border-white/20">
                       {selectedTenant.profile.name[0].toUpperCase()}
                    </div>
                    <div>
                       <h3 className="text-xl font-bold tracking-tight">{selectedTenant.profile.name}</h3>
                       <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {selectedTenant.loginId}</span>
                         <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-md",
                           selectedTenant.status === "active" ? "bg-emerald-500/20 text-emerald-300" :
                           selectedTenant.status === "suspended" ? "bg-rose-500/20 text-rose-300" :
                           "bg-amber-500/20 text-amber-300"
                         )}>{(selectedTenant.status || "pending").toUpperCase()}</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTenant(null)} className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 active:scale-90">
                    <X size={20} />
                 </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* 1. Personal Profile */}
                <SectionCard icon={User} title="1. Resident Personal Profile" color="blue">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={Mail} label="Email Address" value={selectedTenant.profile.email} />
                    <DetailItem icon={Phone} label="Phone Number" value={selectedTenant.profile.phone} />
                    <DetailItem icon={Calendar} label="Date of Birth" value={selectedTenant.profile.dob ? formatDate(selectedTenant.profile.dob) : "—"} />
                    <DetailItem icon={User} label="Gender" value={selectedTenant.profile.gender || "—"} />
                    <DetailItem icon={Shield} label="Guardian / Emergency No." value={selectedTenant.profile.guardianNumber} />
                    <DetailItem icon={Key} label="Login ID" value={selectedTenant.loginId || "—"} mono />
                  </div>
                </SectionCard>

                {/* 2. Room & Bed Allocation */}
                <SectionCard icon={Building2} title="2. Room & Bed Allocation" color="indigo">
                  <div className="grid grid-cols-3 gap-4">
                    <DetailItem icon={Building2} label="Property Name" value={selectedTenant.profile.propertyText} />
                    <DetailItem icon={Hash} label="Room Number" value={selectedTenant.profile.roomNo} />
                    <DetailItem icon={Home} label="Bed No." value={selectedTenant.profile.bedNo} />
                    <DetailItem icon={Layers} label="Floor" value={selectedTenant.profile.floor || "—"} />
                    <DetailItem icon={Globe2} label="Building" value={selectedTenant.profile.building || "—"} />
                    <DetailItem icon={FileText} label="Rent Agreement Type" value={selectedTenant.profile.rentAgreementType || "Standard"} />
                  </div>
                </SectionCard>

                {/* 3. Stay & Billing Details */}
                <SectionCard icon={Banknote} title="3. Stay & Billing Details" color="emerald">
                  <div className="grid grid-cols-3 gap-4">
                    <DetailItem icon={Banknote} label="Base Room Price" value={selectedTenant.profile.baseRoomRent ? `₹${Number(selectedTenant.profile.baseRoomRent).toLocaleString('en-IN')}` : "—"} />
                    <DetailItem icon={IndianRupee} label="Agreed Rent" value={`₹${Number(selectedTenant.profile.agreedRent||0).toLocaleString('en-IN')}`} highlight />
                    <DetailItem icon={Wallet} label="Total Deposit" value={`₹${Number(selectedTenant.profile.securityDepositTotal||0).toLocaleString('en-IN')}`} />
                    <DetailItem icon={CreditCard} label="Deposit Paid" value={`₹${Number(selectedTenant.profile.securityDepositPaid||0).toLocaleString('en-IN')}`} />
                    <DetailItem icon={AlertTriangle} label="Deposit Balance" value={`₹${Number(selectedTenant.profile.securityDepositBalance||0).toLocaleString('en-IN')}`} />
                    <DetailItem icon={Calendar} label="Move-In Date" value={formatDate(selectedTenant.profile.moveInDate)} />
                    <DetailItem icon={Clock} label="Minimum Stay" value={selectedTenant.profile.agreementDetails?.minimumStayDuration || selectedTenant.digitalCheckin?.agreementDetails?.minimumStayDuration || "—"} />
                    <DetailItem icon={Clock} label="Notice Period" value={
                      (selectedTenant.profile.agreementDetails?.noticePeriodDays || selectedTenant.digitalCheckin?.agreementDetails?.noticePeriodDays)
                        ? `${selectedTenant.profile.agreementDetails?.noticePeriodDays || selectedTenant.digitalCheckin?.agreementDetails?.noticePeriodDays} days`
                        : "—"
                    } />
                    <DetailItem icon={Calendar} label="Rent Due Date (Day)" value={selectedTenant.profile.agreementDetails?.licenseFeeDueDate || selectedTenant.digitalCheckin?.agreementDetails?.licenseFeeDueDate || "—"} />
                    <DetailItem icon={RefreshCw} label="Payment Frequency" value={selectedTenant.profile.paymentFrequency || "Monthly"} />
                    <DetailItem icon={Zap} label="Electricity Charge" value={selectedTenant.profile.electricityCharge ? `₹${selectedTenant.profile.electricityCharge}` : "—"} />
                    <DetailItem icon={Tag} label="Maintenance Charge" value={selectedTenant.profile.maintenanceCharge ? `₹${selectedTenant.profile.maintenanceCharge}` : "—"} />
                  </div>
                  {(selectedTenant.profile.agreementDetails?.inclusions || selectedTenant.digitalCheckin?.agreementDetails?.inclusions) && (
                    <div className="mt-4 pt-4 border-t border-emerald-100">
                      <DetailItem icon={CheckCircle} label="Inclusions (WiFi, Meals, etc.)" value={selectedTenant.profile.agreementDetails?.inclusions || selectedTenant.digitalCheckin?.agreementDetails?.inclusions} />
                    </div>
                  )}
                </SectionCard>

                {/* 4. Occupation & Emergencies */}
                <SectionCard icon={Briefcase} title="4. Occupation & Emergencies" color="amber">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={Briefcase} label="Occupation" value={selectedTenant.profile.occupation || "—"} />
                    <DetailItem icon={Building2} label="Company / Organization" value={selectedTenant.profile.company || "—"} />
                    <DetailItem icon={User} label="Emergency Contact Name" value={selectedTenant.profile.emergencyName || "—"} />
                    <DetailItem icon={Phone} label="Emergency Contact Number" value={selectedTenant.profile.emergencyPhone || "—"} />
                    <DetailItem icon={Tag} label="Relationship" value={selectedTenant.profile.emergencyRelationship || "—"} />
                    <DetailItem icon={MapPin} label="Permanent Address" value={selectedTenant.permanentAddress || "—"} />
                  </div>
                  {selectedTenant.profile.remarks && (
                    <div className="mt-4 pt-4 border-t border-amber-100">
                      <DetailItem icon={FileText} label="Remarks" value={selectedTenant.profile.remarks} />
                    </div>
                  )}
                </SectionCard>

                {/* 5. KYC & Identity */}
                <SectionCard icon={Fingerprint} title="5. KYC & Identity Verification" color="violet">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <DetailItem icon={FileText} label="Aadhaar Number" value={selectedTenant.kyc.aadhaarNumber || "—"} mono />
                    <DetailItem icon={ShieldCheck} label="KYC Status" value={selectedTenant.kyc.status.toUpperCase()} highlight />
                    <DetailItem icon={CheckCircle} label="OTP Verified" value={selectedTenant.kyc.otpVerified ? "✅ Yes" : "❌ No"} />
                    <DetailItem icon={ShieldCheck} label="DigiLocker Verified" value={selectedTenant.kyc.digilockerVerified ? "✅ Yes" : "❌ No"} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selectedTenant.kyc.idProofType || "ID Proof"} Front</p>
                      {selectedTenant.kyc.idProofFile ? (
                        <img src={selectedTenant.kyc.idProofFile} className="w-full h-32 object-cover rounded-xl border border-slate-100 shadow-sm" alt="ID Proof" />
                      ) : (
                        <div className="w-full h-32 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">No Document</div>
                      )}
                    </div>
                    {selectedTenant.kyc.aadhaarBack && (
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aadhaar Back</p>
                        <img src={selectedTenant.kyc.aadhaarBack} className="w-full h-32 object-cover rounded-xl border border-slate-100 shadow-sm" alt="Aadhaar Back" />
                      </div>
                    )}
                  </div>
                </SectionCard>

                {/* 6. Rental Agreement */}
                <SectionCard icon={FileText} title="6. Rental Agreement" color="rose">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={ShieldCheck} label="Agreement Status" value={selectedTenant.agreementStatus || (selectedTenant.agreementSigned ? "✅ Signed" : "❌ Not Signed")} highlight />
                    <DetailItem icon={User} label="e-Signature Name" value={selectedTenant.agreementESignName || selectedTenant.digitalCheckin?.agreement?.eSignName || "—"} />
                    <DetailItem icon={Calendar} label="Signed At" value={formatDate(selectedTenant.agreementSignedAt || selectedTenant.digitalCheckin?.agreement?.acceptedAt)} />
                    <DetailItem icon={Hash} label="Agreement Request ID" value={selectedTenant.agreementRequestId || "—"} mono />
                  </div>
                  {selectedTenant.digitalCheckin?.agreement?.signatureDataUrl && (
                    <div className="mt-4 space-y-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Signature Preview</p>
                      <img src={selectedTenant.digitalCheckin.agreement.signatureDataUrl} className="h-14 object-contain rounded-xl bg-white border p-2" alt="Signature" />
                    </div>
                  )}
                </SectionCard>

                {/* 7. Onboarding Timeline */}
                <SectionCard icon={CheckCircle2} title="Onboarding Timeline" color="teal">
                  <div className="space-y-3">
                    {[
                      {
                        step: 1,
                        title: "Personal Details & Room",
                        desc: "Add tenant details, assign room and tenancy information.",
                        done: !!(selectedTenant.profile.name && selectedTenant.profile.roomNo && selectedTenant.profile.roomNo !== "N/A"),
                      },
                      {
                        step: 2,
                        title: "E-KYC Verification",
                        desc: "An E-KYC link is sent to the tenant's email and phone.",
                        done: ["submitted","verified"].includes(selectedTenant.kyc.status),
                      },
                      {
                        step: 3,
                        title: "E-Sign Agreement",
                        desc: "After successful KYC, rental agreement link is sent for e-sign.",
                        done: !!(selectedTenant.agreementSigned || selectedTenant.agreementSignedAt || selectedTenant.digitalCheckin?.agreement?.acceptedAt),
                      },
                      {
                        step: 4,
                        title: "Tenant Added",
                        desc: "Tenant is fully active after agreement is signed successfully.",
                        done: selectedTenant.status === "active",
                      }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0",
                          item.done ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-400"
                        )}>
                          {item.done ? <CheckCircle size={14} /> : item.step}
                        </div>
                        <div className="pt-0.5">
                          <p className={cn("text-sm font-bold", item.done ? "text-slate-800" : "text-slate-400")}>{item.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

              </div>

              {/* Footer Actions */}
              <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-4">
                    <button onClick={() => { handleDeleteTenant(selectedTenant); setSelectedTenant(null); }}
                       className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline">
                       Delete Resident
                    </button>
                    <span className="text-slate-300">|</span>
                    <button onClick={() => { handleToggleDeactivate(selectedTenant); setSelectedTenant(null); }}
                       className={cn("text-[10px] font-bold uppercase tracking-widest hover:underline",
                          selectedTenant.status === "suspended" ? "text-emerald-600" : "text-amber-600")}>
                       {selectedTenant.status === "suspended" ? "Reactivate Account" : "Deactivate Account"}
                    </button>
                 </div>
                <div className="flex gap-3">
                   <button onClick={() => handleKycUpdate(selectedTenant.loginId, "rejected")} disabled={isUpdatingKyc}
                      className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50">
                      Reject Audit
                   </button>
                   <button onClick={() => handleKycUpdate(selectedTenant.loginId, "verified")} disabled={isUpdatingKyc}
                      className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50">
                      {isUpdatingKyc ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Approve Compliance
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function SectionCard({ icon: Icon, title, color, children }) {
  const styles = {
    blue:   { icon: "bg-blue-600 shadow-blue-200",     border: "border-blue-100 bg-blue-50/20" },
    indigo: { icon: "bg-indigo-600 shadow-indigo-200", border: "border-indigo-100 bg-indigo-50/20" },
    emerald:{ icon: "bg-emerald-600 shadow-emerald-200",border: "border-emerald-100 bg-emerald-50/20" },
    amber:  { icon: "bg-amber-500 shadow-amber-200",   border: "border-amber-100 bg-amber-50/20" },
    violet: { icon: "bg-violet-600 shadow-violet-200", border: "border-violet-100 bg-violet-50/20" },
    rose:   { icon: "bg-rose-600 shadow-rose-200",     border: "border-rose-100 bg-rose-50/20" },
    teal:   { icon: "bg-teal-600 shadow-teal-200",     border: "border-teal-100 bg-teal-50/20" },
  };
  const s = styles[color] || { icon: "bg-slate-700 shadow-slate-200", border: "border-slate-100 bg-slate-50/20" };
  return (
    <div className={cn("p-5 rounded-2xl border", s.border)}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-md", s.icon)}>
          <Icon size={15} />
        </div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, highlight, mono }) {
  const isEmpty = !value || value === "—" || value === "-";
  return (
    <div className="space-y-1">
       <div className="flex items-center gap-1.5 text-slate-400">
          <Icon size={10} />
          <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
       </div>
       <p className={cn(
         "text-sm font-bold tracking-tight break-words leading-snug",
         highlight ? "text-blue-600" : "text-slate-700",
         mono && "font-mono text-xs",
         isEmpty && "text-slate-300 italic font-normal text-xs"
       )}>
          {value || "—"}
       </p>
    </div>
  );
}

function StatCardHorizontal({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { 
    blue: "bg-blue-50 text-blue-600 border-blue-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", 
    amber: "bg-amber-50 text-amber-600 border-amber-100" 
  };
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex items-start gap-5 group hover:translate-y-[-5px] transition-all duration-500">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm transition-transform group-hover:rotate-6", bgColors[color])}>
         <Icon className="w-7 h-7" />
      </div>
      <div className="min-w-0">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none truncate">{label}</p>
         <p className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-3">{value}</p>
         <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider",
           up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
         </div>
      </div>
    </div>
  );
}
