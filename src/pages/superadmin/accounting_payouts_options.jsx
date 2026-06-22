import React, { useState, useEffect } from "react";
import { Search, Save, Edit, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function PayoutsOptions() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingOwner, setEditingOwner] = useState(null);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const loadOwners = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/options");
      if (res.success) {
        setOwners(res.ownersOptions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (owner) => {
    setEditingOwner(owner);
    setBankName(owner.profile?.bankName || "");
    setAccountNumber(owner.profile?.accountNumber || "");
    setIfscCode(owner.profile?.ifscCode || "");
    setMessage("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage("");
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/options", {
        method: "POST",
        body: {
          loginId: editingOwner.loginId,
          bankName,
          accountNumber,
          ifscCode
        }
      });
      if (res.success) {
        setMessage("Bank details saved successfully!");
        setEditingOwner(null);
        loadOwners();
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to update bank details");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  const filtered = owners.filter(o => 
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.loginId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Owner Wallet & Bank Settings</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure Bank Profiles, Settlement Preferences and Live Wallets</p>
         </div>
         <button onClick={loadOwners} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Owner List Card */}
         <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Active Partner Profiles</h3>
               <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partners..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                        <th className="pb-4">Partner Identity</th>
                        <th className="pb-4 text-center">Wallet Balance</th>
                        <th className="pb-4 text-center">Withdrawn</th>
                        <th className="pb-4 text-center">Bank Account</th>
                        <th className="pb-4 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {loading ? (
                       <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">Loading accounts...</td></tr>
                     ) : filtered.length === 0 ? (
                       <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">No partner profiles found</td></tr>
                     ) : filtered.map((o, i) => (
                       <tr key={i} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-3">
                             <p className="font-bold text-slate-800 leading-tight">{o.profile?.name || o.name || "N/A"}</p>
                             <p className="text-[8px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">{o.loginId}</p>
                          </td>
                          <td className="py-3 text-center font-bold text-slate-800">₹{o.walletBalance?.toLocaleString('en-IN') || 0}</td>
                          <td className="py-3 text-center font-semibold text-slate-400">₹{o.withdrawnBalance?.toLocaleString('en-IN') || 0}</td>
                          <td className="py-3 text-center">
                             {o.profile?.accountNumber ? (
                               <p className="text-[9px] font-mono font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 shadow-sm inline-block">{o.profile.bankName} •••• {String(o.profile.accountNumber).slice(-4)}</p>
                             ) : (
                               <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg border bg-rose-50 text-rose-600 border-rose-100 uppercase">NO BANK PROFILE</span>
                             )}
                          </td>
                          <td className="py-3 text-right">
                             <button onClick={() => handleEditClick(o)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 border border-slate-100 shadow-sm" title="Edit Bank Info"><Edit className="w-3.5 h-3.5" /></button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Edit Banking Info Form */}
         <div className="lg:col-span-4">
            {editingOwner ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md space-y-4">
                 <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Update Financial Profile</h3>
                 <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Partner Name</label>
                       <p className="text-xs font-bold text-slate-700 bg-slate-50 rounded-lg p-2 leading-none border border-slate-100">{editingOwner.name}</p>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Bank Name</label>
                       <input value={bankName} onChange={e => setBankName(e.target.value)} required className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Account Number</label>
                       <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">IFSC Code</label>
                       <input value={ifscCode} onChange={e => setIfscCode(e.target.value)} required className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                    </div>

                    {message && <div className="text-[9px] font-bold text-blue-600 bg-blue-50 p-2 rounded-lg leading-snug">{message}</div>}

                    <div className="flex gap-2 pt-2">
                       <button type="button" onClick={() => setEditingOwner(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-[10px] font-bold uppercase hover:bg-slate-50 text-slate-500 transition-all">Cancel</button>
                       <button type="submit" disabled={updating} className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase transition-all">Save Info</button>
                    </div>
                 </form>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center border-dashed py-24 text-slate-400 font-bold text-xs">
                 Select a partner's edit icon to configure bank settings.
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
