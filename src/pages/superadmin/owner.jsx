import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, RefreshCw,
  LayoutGrid, CreditCard, Wallet, Download, Loader2,
  ShieldCheck, Banknote, Map, X, CheckCircle2, AlertCircle,
  Calendar, Fingerprint, Landmark, CreditCard as CardIcon,
  Eye, FileText, UserPlus, FileCheck, ClipboardList,
  ShieldAlert, Sparkles, Send, Save, Lock
} from "lucide-react";
import { fetchJson, getAuthHeader } from "../../utils/api";
import * as XLSX from 'xlsx';

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function Owner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get("view") || "list";
  
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [isUpdatingKyc, setIsUpdatingKyc] = useState(false);

  // Add Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formArea, setFormArea] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formLoginId, setFormLoginId] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // Banking fields
  const [formBankName, setFormBankName] = useState("");
  const [formBranchName, setFormBranchName] = useState("");
  const [formBankAccountNumber, setFormBankAccountNumber] = useState("");
  const [formIfscCode, setFormIfscCode] = useState("");
  const [formAccountHolderName, setFormAccountHolderName] = useState("");
  const [formUpiId, setFormUpiId] = useState("");

  const loadOwners = async () => {
    try {
      setLoading(true);
      const [res, visitsRes] = await Promise.all([
        fetchJson("/api/owners"),
        fetchJson("/api/visits").catch(() => ({ visits: [] }))
      ]);
      
      const baseOwners = Array.isArray(res) ? res : (res.data || res.owners || []);
      const visits = visitsRes.visits || [];
      
      const visitMap = {};
      visits.forEach(v => {
        const id = v.generatedCredentials?.loginId || "";
        if (id) {
          visitMap[id] = {
            vacantRooms: v.vacantRooms || v.propertyInfo?.vacantRooms || 0,
            vacantBeds: v.vacantBeds || v.propertyInfo?.vacantBeds || 0,
            occupiedRooms: v.occupiedRooms || v.propertyInfo?.occupiedRooms || 0,
            occupiedBeds: v.occupiedBeds || v.propertyInfo?.occupiedBeds || 0,
            monthlyRent: v.monthlyRent || v.propertyInfo?.rent || 0,
            deposit: v.deposit || v.propertyInfo?.deposit || 0
          };
        }
      });

      setOwners(baseOwners.map(o => ({
        ...o,
        ...(visitMap[o.loginId] || {})
      })));
    } catch (err) { console.error("Failed to load owners:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadOwners(); }, []);

  useEffect(() => {
    if (currentView === "add") generateCreds();
  }, [currentView]);

  const generateCreds = () => {
    const genId = `ROOMHY${Math.floor(1000 + Math.random() * 9000)}`;
    const password = Math.random().toString(36).slice(-8).toUpperCase();
    setFormLoginId(genId);
    setFormPassword(password);
  };

  const handleAddOwner = async (e) => {
    e.preventDefault();
    if (!formName || !formPhone || !formEmail) return alert("Fill required fields");
    setSaving(true);
    try {
      await fetchJson("/api/owners", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({
          loginId: formLoginId,
          name: formName,
          email: formEmail,
          phone: formPhone,
          locationCode: formArea || formCity,
          credentials: { password: formPassword, firstTime: true },
          checkinPassword: formPassword,
          checkinBankName: formBankName,
          checkinBranchName: formBranchName,
          checkinBankAccountNumber: formBankAccountNumber,
          checkinIfscCode: formIfscCode,
          checkinAccountHolderName: formAccountHolderName,
          checkinUpiId: formUpiId
        })
      });
      alert("Property Owner added successfully! Digital KYC link has been sent to their email.");
      setSearchParams({ view: "list" });
      loadOwners();
    } catch (err) { alert(err.message || "Failed to add stakeholder"); }
    finally { setSaving(false); }
  };

  const filteredOwners = useMemo(() => {
    const query = search.trim().toLowerCase();
    let base = owners;
    
    if (currentView === "pending") {
      base = owners.filter(o => !o.isActive);
    } else if (currentView === "kyc") {
      base = owners.filter(o => (o.kycStatus || o.kyc?.status || "pending") === "pending");
    }

    return base.filter(o => {
      const id = (o.loginId || o._id || "").toString().toLowerCase();
      const name = (o.name || o.profile?.name || "").toLowerCase();
      const area = (o.locationCode || o.checkinArea || "").toLowerCase();
      const matchesSearch = id.includes(query) || name.includes(query);
      const matchesArea = areaFilter === "all" || area.includes(areaFilter.toLowerCase());
      return matchesSearch && matchesArea;
    });
  }, [owners, search, areaFilter, currentView]);

  const areas = useMemo(() => {
    const set = new Set(owners.map(o => (o.locationCode || o.checkinArea || "").toUpperCase()).filter(Boolean));
    return Array.from(set).sort();
  }, [owners]);

  const stats = useMemo(() => {
    const total = owners.length;
    const verified = owners.filter(o => (o.kycStatus === "verified" || o.kyc?.status === "verified")).length;
    const properties = owners.reduce((acc, o) => acc + (o.propertyCount || 0), 0);
    return { total, verified, pending: total - verified, properties };
  }, [owners]);

  const handleToggleDeactivate = async (owner) => {
    const id = owner.loginId || owner._id;
    if (!id) {
      alert("Owner ID not found");
      return;
    }
    const isCurrentlyActive = owner.isActive !== false;
    const action = isCurrentlyActive ? "deactivate" : "reactivate";
    if (!window.confirm(`Are you sure you want to ${action} owner ${owner.name || "this owner"}?`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetchJson(`/api/owners/${encodeURIComponent(id)}/${action}`, {
        method: "POST",
        headers: getAuthHeader()
      });
      alert(res.message || `Owner ${action}d successfully`);
      loadOwners();
    } catch (err) {
      alert(`Failed to ${action} owner: ` + (err.body || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete owner ${id}?`)) return;
    try {
      await fetchJson(`/api/owners/${encodeURIComponent(id)}`, { 
        method: "DELETE",
        headers: getAuthHeader()
      });
      loadOwners();
      if (selectedOwner?.loginId === id) setSelectedOwner(null);
    } catch (err) { alert("Failed to delete owner"); }
  };

  const handleKycUpdate = async (id, status, reason = "") => {
    try {
      setIsUpdatingKyc(true);
      await fetchJson(`/api/owners/${id}/kyc`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({ status, rejectionReason: reason })
      });
      loadOwners();
      setSelectedOwner(prev => prev ? { ...prev, kycStatus: status, kyc: { ...prev.kyc, status } } : null);
    } catch (err) { alert("Failed to update KYC status"); }
    finally { setIsUpdatingKyc(false); }
  };

  const handleApproveRequest = async (id) => {
    try {
      setIsUpdatingKyc(true);
      const password = Math.random().toString(36).slice(-8).toUpperCase();
      await fetchJson(`/api/owners/${id}/approve`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ password })
      });
      alert("Owner request approved and link sent successfully!");
      loadOwners();
      setSelectedOwner(prev => prev ? { ...prev, kycStatus: "sent", kyc: { ...prev.kyc, status: "sent" }, credentials: { password } } : null);
    } catch (err) { alert(err?.body?.message || err?.message || "Failed to approve owner request"); }
    finally { setIsUpdatingKyc(false); }
  };

  const exportToExcel = () => {
    const data = filteredOwners.map(o => ({
      "Owner ID": o.loginId,
      "Name": o.name,
      "Email": o.email,
      "Phone": o.phone,
      "Area": o.locationCode || o.checkinArea,
      "Bank": o.bankName || o.checkinBankName,
      "KYC": o.kycStatus || o.kyc?.status || "pending",
      "Properties": o.propertyCount || 0
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Owners");
    XLSX.writeFile(wb, `Roomhy_Owners_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">
              {currentView === "add" ? "Add Property Owner" : 
               currentView === "pending" ? "Approved / Pending" : 
               currentView === "kyc" ? "KYC / Documents" : 
               "Property Owners"}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
              {currentView === "add" ? "Initialize new asset partner credentials" : 
               currentView === "pending" ? "Manage requests from property listing funnel" : 
               currentView === "kyc" ? "Deep document verification & identity pulse" : 
               "Governance Matrix & Stakeholder Asset Network"}
            </p>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => setSearchParams({ view: currentView === "add" ? "list" : "add" })}
              className={cn(
                "px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 shadow-xl",
                currentView === "add" ? "bg-white text-slate-600 border border-slate-100 shadow-slate-200" : "bg-slate-900 text-white shadow-slate-900/20 hover:bg-black"
              )}
            >
               {currentView === "add" ? <RefreshCw className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
               {currentView === "add" ? "Back to Owners List" : "Add Property Owner"}
            </button>
            <button 
              onClick={exportToExcel}
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-3 active:scale-95"
            >
               <Sheet className="w-4 h-4" /> Export Ledger
            </button>
         </div>
      </div>

      {/* Metrics Row (Only on main lists) */}
      {currentView !== "add" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardHorizontal label="Total Partners" value={stats.total} trend="+14.2% Delta" up icon={Users} color="indigo" />
          <StatCardHorizontal label="Compliance Pass" value={stats.verified} trend="KYC Cleared" up icon={ShieldCheck} color="emerald" />
          <StatCardHorizontal label="Operational Units" value={`${stats.properties}`} trend="Supply Units" up icon={Building2} color="blue" />
          <StatCardHorizontal label="Audit Required" value={stats.pending} trend="Risk Buffer" up={false} icon={ShieldAlert} color="amber" />
        </div>
      )}

      {currentView === "add" ? (
        /* Add Form */
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
           <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center shadow-2xl">
                 <UserPlus size={28} />
              </div>
              <div>
                 <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Property Owner Identity</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Define primary attributes for the new partner</p>
              </div>
           </div>

           <form onSubmit={handleAddOwner} className="p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stakeholder Name</label>
                    <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Rahul Sharma" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input value={formEmail} onChange={e => setFormEmail(e.target.value)} type="email" placeholder="rahul@example.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pulse Contact</label>
                    <input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+91 XXXX" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operating Area</label>
                    <input value={formArea} onChange={e => setFormArea(e.target.value)} placeholder="e.g. Koramangala" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                 </div>
              </div>

              {/* Banking Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Banknote size={16} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Banking Details</p>
                    <p className="text-[10px] text-slate-300">Pre-filled in owner KYC form — editable by owner</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                    <input value={formBankName} onChange={e => setFormBankName(e.target.value)} placeholder="e.g. State Bank of India" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Name</label>
                    <input value={formBranchName} onChange={e => setFormBranchName(e.target.value)} placeholder="e.g. MG Road Branch" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Account Number</label>
                    <input value={formBankAccountNumber} onChange={e => setFormBankAccountNumber(e.target.value)} placeholder="e.g. 1234567890" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IFSC Code</label>
                    <input value={formIfscCode} onChange={e => setFormIfscCode(e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Holder Name</label>
                    <input value={formAccountHolderName} onChange={e => setFormAccountHolderName(e.target.value)} placeholder="e.g. Rahul Sharma" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UPI ID <span className="normal-case font-normal">(optional)</span></label>
                    <input value={formUpiId} onChange={e => setFormUpiId(e.target.value)} placeholder="e.g. rahul@upi" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10 shadow-inner">
                       <Lock size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Generated Credentials</p>
                       <div className="flex items-center gap-4">
                          <code className="text-xl font-black text-white tracking-widest">{formLoginId}</code>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <code className="text-base font-bold text-blue-400">{formPassword}</code>
                       </div>
                    </div>
                 </div>
                 <button type="button" onClick={generateCreds} className="px-6 py-3 bg-white/10 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">Re-generate</button>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                 <button type="button" onClick={() => setSearchParams({ view: "list" })} className="px-10 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancel Onboarding</button>
                 <button 
                   type="submit"
                   disabled={saving}
                   className="px-12 py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
                 >
                    {saving ? "Commiting Intelligence..." : "Authorize Stakeholder"}
                    <Send className="w-4 h-4" />
                 </button>
              </div>
           </form>
        </div>
      ) : (
        /* Ledger List View */
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                    {currentView === "pending" ? <ClipboardList size={20} /> : 
                     currentView === "kyc" ? <Fingerprint size={20} /> : 
                     <LayoutGrid size={20} />}
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      {currentView === "pending" ? "Approved / Pending Requests" : 
                       currentView === "kyc" ? "KYC / Documents Verification Hub" : 
                       "Property Owners Ledger"}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {currentView === "pending" ? "Review requests from independent asset listings" : 
                       currentView === "kyc" ? "Audit document integrity and compliance flags" : 
                       "Real-time database of all asset partners"}
                    </p>
                 </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-3 bg-slate-50 px-6 py-3.5 rounded-2xl border border-slate-100 shadow-inner">
                    <Filter size={14} className="text-slate-400" />
                    <select 
                      value={areaFilter}
                      onChange={e => setAreaFilter(e.target.value)}
                      className="bg-transparent text-[10px] font-bold text-slate-600 outline-none uppercase tracking-widest border-none p-0 focus:ring-0"
                    >
                       <option value="all">All Zones</option>
                       {areas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                 </div>
                 
                 <div className="relative w-72 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search Stakeholders..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" 
                    />
                 </div>
                 
                 <button onClick={loadOwners} className="p-4 rounded-2xl bg-white text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-md active:scale-95">
                    <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-slate-100">
                       <th className="px-10 py-8">Identity Hub</th>
                       <th className="px-6 py-8">Primary Asset</th>
                       <th className="px-6 py-8 text-center">{currentView === "kyc" ? "Document Status" : "Banking Intel"}</th>
                       <th className="px-6 py-8 text-center">{currentView === "pending" ? "System Status" : "Audit Status"}</th>
                       <th className="px-10 py-8 text-right">Operations</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan="5" className="py-40 text-center">
                         <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin mx-auto mb-8" />
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Accessing Distributed Ledger...</p>
                      </td></tr>
                    ) : filteredOwners.length === 0 ? (
                      <tr><td colSpan="5" className="py-40 text-center">
                         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                            {currentView === "pending" ? <FileCheck size={40} /> : <Users size={40} />}
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance Queue Clear</p>
                      </td></tr>
                    ) : filteredOwners.map((o, i) => {
                      const status = (o.kycStatus || o.kyc?.status || "pending").toLowerCase();
                      return (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-all duration-300 cursor-pointer" onClick={() => setSelectedOwner(o)}>
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 text-blue-600 flex items-center justify-center font-bold text-xl shadow-xl shadow-slate-200/40 transition-transform group-hover:scale-110 shrink-0">
                                    {(o.name || "U").charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                    <p className="text-base font-bold text-slate-800 tracking-tight">{o.name || "Unknown Partner"}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                       <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-lg uppercase tracking-widest">{o.loginId || "ID-GEN"}</span>
                                       <span className={cn(
                                          "text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ml-2",
                                          o.isActive === false ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                                       )}>
                                          {o.isActive === false ? "suspended" : "active"}
                                       </span>
                                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">{o.phone || "No Pulse"}</span>
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-8">
                              <div className="space-y-2">
                                 <p className="text-xs font-bold text-slate-700 leading-none truncate max-w-[200px]">{o.propertyTitle || "Global Portfolio"}</p>
                                 <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-slate-300" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{o.locationCode || o.checkinArea || "Core Zone"}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-8 text-center">
                              {currentView === "kyc" ? (() => {
                                 const hasDoc = o.checkinAadhaarImage || o.kyc?.documentImage || o.checkinAadhaarNumber;
                                 return (
                                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                    {hasDoc ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                                    <span className="text-[9px] font-bold uppercase text-slate-600">{hasDoc ? "Document Attached" : "Awaiting Upload"}</span>
                                 </div>
                                 );
                               })() : (
                                <div className="inline-flex flex-col items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 shadow-sm group-hover:bg-white transition-colors">
                                   <p className="text-[10px] font-bold text-slate-800 leading-none">{o.bankName || o.checkinBankName || "Not Linked"}</p>
                                   <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest opacity-60">Verified Settlement</span>
                                </div>
                              )}
                           </td>
                           <td className="px-6 py-8 text-center">
                              {currentView === "pending" ? (
                                <span className="text-[8px] font-bold px-4 py-1.5 rounded-xl border border-blue-100 bg-blue-50 text-blue-600 uppercase tracking-widest shadow-sm">Review Required</span>
                              ) : (
                                <span className={cn(
                                   "text-[8px] font-bold px-4 py-1.5 rounded-xl border uppercase tracking-[0.2em] shadow-sm",
                                   status === "verified" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                )}>
                                   {status}
                                </span>
                              )}
                           </td>
                           <td className="px-10 py-8 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-3">
                                 <button 
                                   onClick={() => handleToggleDeactivate(o)}
                                   title={o.isActive === false ? "Reactivate Account" : "Deactivate Account"}
                                   className={cn(
                                      "p-3.5 rounded-2xl border transition-all shadow-md active:scale-95",
                                      o.isActive === false 
                                         ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100" 
                                         : "bg-white text-slate-400 border-slate-100 hover:text-slate-600 hover:border-slate-300"
                                   )}
                                 >
                                    <Shield size={20} className={o.isActive === false ? "animate-pulse" : ""} />
                                 </button>
                                 <button 
                                    onClick={() => setSelectedOwner(o)}
                                    className="p-3.5 rounded-2xl bg-white text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all border border-slate-100 shadow-md active:scale-95"
                                 >
                                    <Eye className="w-5 h-5" />
                                 </button>
                                 <button 
                                    onClick={() => handleDelete(o.loginId || o._id)}
                                    className="p-3.5 rounded-2xl bg-white text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all border border-slate-100 shadow-md active:scale-95"
                                 >
                                    <Trash2 className="w-5 h-5" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Detail Slide-over Panel (Enhanced) */}
      {selectedOwner && (
        <div className="fixed inset-0 z-[120] flex items-center justify-end p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl h-full rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col animate-in slide-in-from-right duration-500">
              <div className="px-10 py-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-bold text-3xl shadow-2xl">
                       {selectedOwner.name?.[0].toUpperCase()}
                    </div>
                    <div>
                       <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{selectedOwner.name}</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">ID: {selectedOwner.loginId} | Compliance Hub</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedOwner(null)} className="p-4 rounded-3xl bg-white text-slate-400 hover:text-rose-600 transition-all shadow-xl border border-slate-100 active:scale-90">
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
                       <h4 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Stakeholder Identity</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <DetailItem icon={Mail} label="Official Email" value={selectedOwner.email || selectedOwner.checkinEmail} />
                       <DetailItem icon={Phone} label="Pulse Contact" value={selectedOwner.phone || selectedOwner.checkinPhone} />
                       <DetailItem icon={Calendar} label="Birth Index" value={selectedOwner.checkinDob || "Not Defined"} />
                       <DetailItem icon={MapPin} label="Home Base" value={selectedOwner.address || selectedOwner.checkinAddress} />
                    </div>
                 </section>

                 {/* Asset Pulse */}
                 <section className="bg-amber-50/30 p-8 rounded-[2.5rem] border border-amber-100">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-lg shadow-amber-200">
                          <Building2 size={20} />
                       </div>
                       <h4 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Asset Pulse</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <DetailItem icon={LayoutGrid} label="Vacant Rooms" value={selectedOwner.vacantRooms} />
                       <DetailItem icon={Users} label="Vacant Beds" value={selectedOwner.vacantBeds} />
                       <DetailItem icon={Banknote} label="Monthly Yield" value={selectedOwner.monthlyRent ? `₹${selectedOwner.monthlyRent}` : "Not Set"} highlight />
                       <DetailItem icon={Wallet} label="Security Reserve" value={selectedOwner.deposit ? `₹${selectedOwner.deposit}` : "Not Set"} />
                    </div>
                 </section>

                 {/* Compliance Matrix */}
                 <section className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-200">
                          <Fingerprint size={20} />
                       </div>
                       <h4 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Compliance Audit</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <DetailItem icon={FileText} label="Aadhaar ID" value={selectedOwner.aadharNumber || selectedOwner.checkinAadhaarNumber} />
                       <DetailItem icon={Phone} label="KYC Linked Phone" value={selectedOwner.checkinAadhaarLinkedPhone} />
                       <DetailItem icon={Shield} label="Audit Status" value={(selectedOwner.kycStatus || selectedOwner.kyc?.status || "PENDING").toUpperCase()} highlight />
                       
                       <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-400">
                             <FileText size={12} />
                             <span className="text-[9px] font-bold uppercase tracking-widest">KYC Document</span>
                          </div>
                          {(() => {
                             const singleDocUrl = selectedOwner.kyc?.documentImage || selectedOwner.checkinAadhaarImage || selectedOwner.tenantKyc?.documentImage || selectedOwner.kyc?.aadharImage;
                             const frontUrl = selectedOwner.kyc?.aadhaarFront || selectedOwner.checkinAadhaarFront;
                             const backUrl = selectedOwner.kyc?.aadhaarBack || selectedOwner.checkinAadhaarBack;
                             const ownerPhoto = selectedOwner.checkinOwnerPhoto;
                             const bankProof = selectedOwner.checkinBankProof;
                             
                             const hasAnyDoc = singleDocUrl || frontUrl || backUrl || ownerPhoto || bankProof;
                             
                             if (!hasAnyDoc) {
                                return <p className="text-sm font-bold text-slate-300 italic font-medium">No Document</p>;
                             }
                             
                             return (
                               <div className="flex flex-col gap-2">
                                 {ownerPhoto && (
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-medium text-slate-500 w-24">Profile Photo:</span>
                                      <button onClick={() => window.open(ownerPhoto, "_blank")} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"><Eye size={12} /> View</button>
                                      <button onClick={() => { const a = document.createElement("a"); a.href = ownerPhoto; a.download = `Profile_${selectedOwner.loginId || selectedOwner._id}.jpg`; a.target = "_blank"; a.click(); }} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"><Download size={12} /> Download</button>
                                    </div>
                                 )}
                                 {bankProof && (
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-medium text-slate-500 w-24">Bank Proof:</span>
                                      <button onClick={() => window.open(bankProof, "_blank")} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"><Eye size={12} /> View</button>
                                      <button onClick={() => { const a = document.createElement("a"); a.href = bankProof; a.download = `Bank_${selectedOwner.loginId || selectedOwner._id}.jpg`; a.target = "_blank"; a.click(); }} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"><Download size={12} /> Download</button>
                                    </div>
                                 )}
                                 {singleDocUrl && (
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-medium text-slate-500 w-24">Aadhaar Doc:</span>
                                      <button onClick={() => window.open(singleDocUrl, "_blank")} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"><Eye size={12} /> View</button>
                                      <button onClick={() => { const a = document.createElement("a"); a.href = singleDocUrl; a.download = `Aadhaar_${selectedOwner.loginId || selectedOwner._id}.jpg`; a.target = "_blank"; a.click(); }} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"><Download size={12} /> Download</button>
                                    </div>
                                 )}
                                 {frontUrl && (
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-medium text-slate-500 w-24">Aadhaar Front:</span>
                                      <button onClick={() => window.open(frontUrl, "_blank")} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"><Eye size={12} /> View</button>
                                      <button onClick={() => { const a = document.createElement("a"); a.href = frontUrl; a.download = `Aadhaar_Front_${selectedOwner.loginId || selectedOwner._id}.jpg`; a.target = "_blank"; a.click(); }} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"><Download size={12} /> Download</button>
                                    </div>
                                 )}
                                 {backUrl && (
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-medium text-slate-500 w-24">Aadhaar Back:</span>
                                      <button onClick={() => window.open(backUrl, "_blank")} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"><Eye size={12} /> View</button>
                                      <button onClick={() => { const a = document.createElement("a"); a.href = backUrl; a.download = `Aadhaar_Back_${selectedOwner.loginId || selectedOwner._id}.jpg`; a.target = "_blank"; a.click(); }} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"><Download size={12} /> Download</button>
                                    </div>
                                 )}
                               </div>
                             );
                          })()}
                       </div>
                    </div>
                 </section>

                 {/* Banking Hub */}
                 <section>
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-200">
                          <Landmark size={20} />
                       </div>
                       <h4 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Settlement Engine</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <DetailItem icon={Building2} label="Institution" value={selectedOwner.bankName || selectedOwner.checkinBankName} />
                       <DetailItem icon={CreditCard} label="Ledger Number" value={selectedOwner.accountNumber || selectedOwner.checkinBankAccountNumber} />
                       <DetailItem icon={Zap} label="Routing (IFSC)" value={selectedOwner.ifscCode || selectedOwner.checkinIfscCode} />
                       <DetailItem icon={Wallet} label="UPI Link" value={selectedOwner.checkinUpiId} />
                    </div>
                 </section>
              </div>

              <div className="px-10 py-10 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <button 
                       onClick={() => {
                          handleDelete(selectedOwner.loginId || selectedOwner._id);
                          setSelectedOwner(null);
                       }}
                       className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline"
                    >
                       Purge Stakeholder
                    </button>
                    <span className="text-slate-300">|</span>
                    <button 
                       onClick={() => {
                          handleToggleDeactivate(selectedOwner);
                          setSelectedOwner(null);
                       }}
                       className={cn(
                          "text-[10px] font-bold uppercase tracking-widest hover:underline",
                          selectedOwner.isActive === false ? "text-emerald-600" : "text-amber-600"
                       )}
                    >
                       {selectedOwner.isActive === false ? "Reactivate Account" : "Deactivate Account"}
                    </button>
                 </div>
                 <div className="flex gap-4">
                    <button 
                      onClick={() => handleKycUpdate(selectedOwner.loginId || selectedOwner._id, "rejected", "Documents unclear")}
                      disabled={isUpdatingKyc}
                      className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                       Reject Audit
                    </button>
                    {(selectedOwner.kycStatus === 'requested' || selectedOwner.kyc?.status === 'requested') ? (
                       <button 
                         onClick={() => handleApproveRequest(selectedOwner.loginId || selectedOwner._id)}
                         disabled={isUpdatingKyc}
                         className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-3 disabled:opacity-50"
                       >
                          {isUpdatingKyc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Approve Request
                       </button>
                    ) : (
                       <button 
                         onClick={() => handleKycUpdate(selectedOwner.loginId || selectedOwner._id, "verified")}
                         disabled={isUpdatingKyc}
                         className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                       >
                          {isUpdatingKyc ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                          Approve Compliance
                       </button>
                    )}
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
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    blue: "bg-blue-50 text-blue-600 border-blue-100", 
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
