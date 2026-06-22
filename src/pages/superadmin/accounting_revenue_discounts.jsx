import React, { useState, useEffect } from "react";
import { Search, Plus, Save, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function RevenueDiscounts() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [validity, setValidity] = useState("Unlimited validity");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/revenue/discounts");
      if (res.success) {
        setCoupons(res.discounts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage("");
    try {
      const res = await fetchJson("/api/superadmin/finance/revenue/discounts", {
        method: "POST",
        body: {
          code,
          discount,
          validity,
          ownerLoginId: "global"
        }
      });
      if (res.success) {
        setMessage("Coupon created successfully!");
        setCode("");
        setDiscount("");
        setValidity("Unlimited validity");
        setShowAddForm(false);
        loadCoupons();
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to create coupon code");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const filtered = coupons.filter(c => 
    c.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Promo Codes & Discounts</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform promotional coupons and partner marketing codes</p>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2">
               <Plus className="w-3.5 h-3.5" /> {showAddForm ? "Close Form" : "Create Coupon"}
            </button>
            <button onClick={loadCoupons} className="p-2 rounded-xl bg-white text-slate-400 border border-slate-100 hover:text-blue-600 transition-all">
               <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Coupons List */}
         <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Active Coupon Codes</h3>
               <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search code..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                        <th className="pb-4">Promo Code</th>
                        <th className="pb-4 text-center">Discount Value</th>
                        <th className="pb-4 text-center">Usage Count</th>
                        <th className="pb-4 text-center">Validity Range</th>
                        <th className="pb-4 text-center">Audit Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {loading ? (
                       <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">Loading coupons...</td></tr>
                     ) : filtered.length === 0 ? (
                       <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">No coupons found</td></tr>
                     ) : filtered.map((c, i) => (
                       <tr key={i} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-3 font-mono font-bold text-blue-600 uppercase">{c.code}</td>
                          <td className="py-3 text-center font-bold text-slate-800">{c.discount}</td>
                          <td className="py-3 text-center text-slate-500 font-medium">{c.usage}</td>
                          <td className="py-3 text-center text-slate-400 font-semibold">{c.validity}</td>
                          <td className="py-3 text-center">
                             <span className={cn(
                               "text-[8px] font-bold px-2 py-0.5 rounded-lg border uppercase",
                               c.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                             )}>{c.status}</span>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Create Form */}
         <div className="lg:col-span-4">
            {showAddForm ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md space-y-4">
                 <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">New Coupon Definition</h3>
                 <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Coupon Code</label>
                       <input value={code} onChange={e => setCode(e.target.value)} required placeholder="e.g. MONSOON500" className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Discount Amount/Percent</label>
                       <input value={discount} onChange={e => setDiscount(e.target.value)} required placeholder="e.g. ₹500 Off or 10% Off" className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Validity Period</label>
                       <input value={validity} onChange={e => setValidity(e.target.value)} placeholder="e.g. Valid till July 2026" className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                    </div>

                    {message && <div className="text-[9px] font-bold text-blue-600 bg-blue-50 p-2 rounded-lg">{message}</div>}

                    <button type="submit" disabled={creating} className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1">
                       <Save size={12} />
                       {creating ? "Creating..." : "Save Coupon"}
                    </button>
                 </form>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center border-dashed py-24 text-slate-400 font-bold text-xs">
                 Click the "Create Coupon" button above to register promotional discount codes.
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
