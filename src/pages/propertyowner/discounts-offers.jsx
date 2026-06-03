import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Percent, Search, Plus, Trash2, Edit3, 
  CheckCircle2, AlertCircle, ToggleLeft, ToggleRight
} from "lucide-react";

export default function DiscountsOffersPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [offers, setOffers] = useState([
    { id: 1, code: "EARLYBIRD10", discount: "10% Off First Month", validity: "Valid till 30 Jun 2026", active: true },
    { id: 2, code: "WELCOME500", discount: "₹500 Off Deposit", validity: "Valid till 31 Dec 2026", active: true },
    { id: 3, code: "STUDENTDEAL", discount: "5% Monthly Rent Off", validity: "Expired", active: false }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");

  const handleAddOffer = (e) => {
    e.preventDefault();
    if (!newCode || !newDiscount) return;
    const newOffer = {
      id: offers.length + 1,
      code: newCode.toUpperCase(),
      discount: newDiscount,
      validity: "Valid till 31 Dec 2026",
      active: true
    };
    setOffers([...offers, newOffer]);
    setNewCode("");
    setNewDiscount("");
    setShowAddModal(false);
  };

  const handleToggleActive = (id) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, active: !o.active } : o));
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Coupons & Discounts" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Discounts &amp; Offers</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Configure referral codes, check-in promo coupons, and monthly rent adjustments.</p>
        </div>
        <div className="flex items-center gap-2 md:mt-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-slate-900 text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" /> Create Coupon
          </button>
        </div>
      </div>

      {/* Grid of Offers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div 
            key={offer.id} 
            className={`rounded-2xl border bg-card p-6 shadow-soft transition-all ${
              offer.active ? "border-border" : "border-border/40 opacity-70"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Percent size={20} />
              </div>
              <button 
                onClick={() => handleToggleActive(offer.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                  offer.active 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-slate-100 text-slate-400 border-slate-200"
                }`}
              >
                {offer.active ? "Active" : "Inactive"}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-[22px] font-bold text-foreground tracking-wider">{offer.code}</h3>
                <p className="text-[13.5px] font-medium text-slate-700 mt-1">{offer.discount}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{offer.validity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-serif text-[22px] text-foreground mb-4">Create Promo Code</h3>
            <form onSubmit={handleAddOffer} className="space-y-4">
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Coupon Code</label>
                <input 
                  type="text" 
                  value={newCode} 
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. DIWALI2026"
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Discount Amount/Value</label>
                <input 
                  type="text" 
                  value={newDiscount} 
                  onChange={(e) => setNewDiscount(e.target.value)}
                  placeholder="e.g. 10% Off or ₹1000 Flat Off"
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 rounded-xl border border-border text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  Generate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
