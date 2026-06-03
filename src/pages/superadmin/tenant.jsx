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
  Home, Hash, Banknote, Wallet
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
      moveInDate: tenant?.moveInDate || profile?.moveInDate || "",
      roomNo: tenant?.roomNo || profile?.roomNo || tenant?.room?.number || "N/A",
      bedNo: tenant?.bedNo || "N/A",
      agreedRent: tenant?.agreedRent || profile?.agreedRent || 0,
      propertyText: getPropertyText(tenant, profile),
      guardianNumber: tenant?.guardianNumber || profile?.guardianNumber || "N/A"
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
      "Rent": t.profile.agreedRent,
      "Move-In": formatDate(t.profile.moveInDate),
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

  const handleDeleteTenant = async (tenant) => {
    const id = tenant._id || tenant.id;
    if (!id) {
      alert("Tenant ID not found");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete resident ${tenant.profile?.name || "this resident"}? This action cannot be undone.`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetchJson(`/api/tenants/${id}`, {
        method: "DELETE",
        headers: getAuthHeader()
      });
      alert(res.message || "Resident deleted successfully");
      loadTenants();
    } catch (err) {
      alert("Failed to delete resident: " + (err.body || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="View All Tenants"
        subtitle="Resident lifecycle governance & occupancy intelligence matrix."
        actions={
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/superadmin/add-tenant")}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all flex items-center gap-2 active:scale-95"
            >
               <Plus size={14} /> Deploy Resident
            </button>
            <button 
              onClick={exportToExcel}
              className="bg-white text-slate-600 border border-slate-100 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-200 transition-all flex items-center gap-2 active:scale-95"
            >
               <Sheet className="w-4 h-4" /> Export Registry
            </button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Active Residents" value={stats.total} trend="+12.5% Delta" up icon={Users} color="blue" />
        <StatCardHorizontal label="KYC Verified" value={stats.verified} trend="Compliant" up icon={ShieldCheck} color="emerald" />
        <StatCardHorizontal label="Monthly Yield" value={`₹${stats.revenue.toLocaleString()}`} trend="Contractual" up icon={Banknote} color="indigo" />
        <StatCardHorizontal label="Awaiting Audit" value={stats.submitted} trend="Manual Review" up icon={Clock} color="amber" />
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                  <LayoutGrid size={20} />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-slate-800">Resident Registry</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time database of all active and pending residents</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="relative w-72 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search residents, assets, IDs..." 
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
                     <th className="px-10 py-8">Resident Identity</th>
                     <th className="px-6 py-8">Asset Allocation</th>
                     <th className="px-6 py-8 text-center">Contact Pulse</th>
                     <th className="px-6 py-8 text-center">Compliance Index</th>
                     <th className="px-10 py-8 text-right">Operations</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan="5" className="py-40 text-center">
                       <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin mx-auto mb-8" />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Accessing Resident Intelligence...</p>
                    </td></tr>
                  ) : filteredTenants.length === 0 ? (
                    <tr><td colSpan="5" className="py-40 text-center">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                          <Users size={40} />
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No matching residents found</p>
                    </td></tr>
                  ) : filteredTenants.map((t, i) => (
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
                              <button onClick={() => setSelectedTenant(t)} className="p-3.5 rounded-2xl bg-white text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all border border-slate-100 shadow-md active:scale-95"><Eye className="w-5 h-5" /></button>
                              <button onClick={() => handleDeleteTenant(t)} className="p-3.5 rounded-2xl bg-white text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all border border-slate-100 shadow-md active:scale-95"><Trash2 className="w-5 h-5" /></button>
                           </div>
                        </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Detail Slide-over Panel */}
      {selectedTenant && (
        <div className="fixed inset-0 z-[120] flex items-center justify-end p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl h-full rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col animate-in slide-in-from-right duration-500">
              <div className="px-10 py-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-bold text-3xl shadow-2xl">
                       {selectedTenant.profile.name[0].toUpperCase()}
                    </div>
                    <div>
                       <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{selectedTenant.profile.name}</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">ID: {selectedTenant.loginId} | Resident Portal</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTenant(null)} className="p-4 rounded-3xl bg-white text-slate-400 hover:text-rose-600 transition-all shadow-xl border border-slate-100 active:scale-90">
                    <X size={24} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-12">
                 {/* Identity Pulse */}
                 <section>
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-200">
                          <User size={20} />
                       </div>
                       <h4 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Resident Identity</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <DetailItem icon={Mail} label="Official Email" value={selectedTenant.profile.email} />
                       <DetailItem icon={Phone} label="Pulse Contact" value={selectedTenant.profile.phone} />
                       <DetailItem icon={Calendar} label="Birth Index" value={selectedTenant.profile.dob || "Not Defined"} />
                       <DetailItem icon={Shield} label="Guardian Contact" value={selectedTenant.profile.guardianNumber} />
                    </div>
                 </section>

                 {/* Asset Link */}
                 <section className="bg-indigo-50/30 p-8 rounded-[2.5rem] border border-indigo-100">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-200">
                          <Home size={20} />
                       </div>
                       <h4 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Asset Allocation</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <DetailItem icon={Building2} label="Allocated Asset" value={selectedTenant.profile.propertyText} />
                       <DetailItem icon={Hash} label="Unit / Bed" value={`${selectedTenant.profile.roomNo} / ${selectedTenant.profile.bedNo}`} />
                       <DetailItem icon={Clock} label="Move-In Index" value={formatDate(selectedTenant.profile.moveInDate)} />
                       <DetailItem icon={Banknote} label="Contractual Rent" value={`₹${selectedTenant.profile.agreedRent}`} highlight />
                    </div>
                 </section>

                 {/* KYC Documents */}
                 <section>
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-200">
                          <Fingerprint size={20} />
                       </div>
                       <h4 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Compliance Vault</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <DetailItem icon={FileText} label="Aadhaar ID" value={selectedTenant.kyc.aadhaarNumber} />
                       <DetailItem icon={ShieldCheck} label="Audit Status" value={selectedTenant.kyc.status.toUpperCase()} highlight />
                    </div>
                    <div className="mt-10 grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                             {selectedTenant.kyc.idProofType || "ID Proof"} Front
                          </p>
                          {selectedTenant.kyc.idProofFile ? (
                             <img src={selectedTenant.kyc.idProofFile} className="w-full h-40 object-cover rounded-2xl border border-slate-100 shadow-sm" alt="ID Proof Front" />
                          ) : (
                             <div className="w-full h-40 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">No Digital Proof</div>
                          )}
                       </div>
                       {selectedTenant.kyc.aadhaarBack && (
                         <div className="space-y-3">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Aadhaar Back</p>
                            <img src={selectedTenant.kyc.aadhaarBack} className="w-full h-40 object-cover rounded-2xl border border-slate-100 shadow-sm" alt="Aadhaar Back" />
                         </div>
                       )}
                    </div>
                 </section>
              </div>

              <div className="px-10 py-10 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <button 
                     onClick={() => {
                        handleDeleteTenant(selectedTenant);
                        setSelectedTenant(null);
                     }}
                     className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline"
                  >
                     Delete Resident
                  </button>
                 <div className="flex gap-4">
                    <button 
                       onClick={() => handleKycUpdate(selectedTenant.loginId, "rejected")}
                       disabled={isUpdatingKyc}
                       className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                       Reject Audit
                    </button>
                    <button 
                       onClick={() => handleKycUpdate(selectedTenant.loginId, "verified")}
                       disabled={isUpdatingKyc}
                       className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                    >
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

function DetailItem({ icon: Icon, label, value, highlight }) {
  return (
    <div className="space-y-2">
       <div className="flex items-center gap-2 text-slate-400">
          <Icon size={12} />
          <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
       </div>
       <p className={cn(
         "text-sm font-bold tracking-tight",
         highlight ? "text-blue-600" : "text-slate-700",
         !value && "text-slate-300 italic font-medium"
       )}>
          {value || "Field Null"}
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
         <div className={cn(
           "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider",
           up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
         )}>
            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
         </div>
      </div>
    </div>
  );
}
