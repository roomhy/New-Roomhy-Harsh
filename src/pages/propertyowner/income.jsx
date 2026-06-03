import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  TrendingUp, Search, Plus, DollarSign, Wallet, 
  ArrowUpRight, ArrowDownRight, Layers, Percent, Check
} from "lucide-react";

export default function IncomePage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [incomes, setIncomes] = useState([
    { id: 1, source: "Room Rent (Room 101)", category: "Rent", amount: 17300, date: "18 May 2026", method: "UPI" },
    { id: 2, source: "Mess Charge (Room 104)", category: "Food & Mess", amount: 4500, date: "15 May 2026", method: "Cash" },
    { id: 3, source: "Electricity Bill (Room 102)", category: "Utilities", amount: 1200, date: "14 May 2026", method: "Razorpay" },
    { id: 4, source: "Late Fee Penalty (Room 105)", category: "Penalties", amount: 500, date: "12 May 2026", method: "UPI" }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSource, setNewSource] = useState("");
  const [newCategory, setNewCategory] = useState("Rent");
  const [newAmount, setNewAmount] = useState("");
  const [newMethod, setNewMethod] = useState("UPI");

  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!newSource || !newAmount) return;
    const newInc = {
      id: incomes.length + 1,
      source: newSource,
      category: newCategory,
      amount: parseFloat(newAmount),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      method: newMethod
    };
    setIncomes([newInc, ...incomes]);
    setNewSource("");
    setNewAmount("");
    setShowAddModal(false);
  };

  const filteredIncomes = incomes.filter(i => 
    i.source.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalIncome = incomes.reduce((acc, i) => acc + i.amount, 0);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Accounting Ledger" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Income Management</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Track property rent, utility surcharges, and other miscellaneous income streams.</p>
        </div>
        <div className="flex items-center gap-2 md:mt-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-slate-900 text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" /> Record Income
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue Generated</span>
          <h3 className="text-[28px] font-bold text-emerald-600 mt-1">₹{totalIncome.toLocaleString("en-IN")}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider font-bold text-primary">Rent Income Share</span>
          <h3 className="text-[28px] font-bold text-primary mt-1">₹17,300 <span className="text-sm font-normal text-muted-foreground">73%</span></h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Other Surcharges</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">₹6,200 <span className="text-sm font-normal text-muted-foreground">27%</span></h3>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search income records by source or category..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Income Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Source Description</th>
                <th className="px-6 py-3.5 font-semibold">Category</th>
                <th className="px-6 py-3.5 font-semibold">Received Date</th>
                <th className="px-6 py-3.5 font-semibold">Payment Channel</th>
                <th className="px-6 py-3.5 font-semibold">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredIncomes.map((i) => (
                <tr key={i.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{i.source}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      {i.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{i.date}</td>
                  <td className="px-6 py-4 text-muted-foreground">{i.method}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">₹{i.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Income Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-serif text-[22px] text-foreground mb-4">Record New Income</h3>
            <form onSubmit={handleAddIncome} className="space-y-4">
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Source / Description</label>
                <input 
                  type="text" 
                  value={newSource} 
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="e.g. Laundry Surcharge Room 201"
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Category</label>
                <select 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Rent">Rent</option>
                  <option value="Food & Mess">Food &amp; Mess</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Penalties">Penalties</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  value={newAmount} 
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Payment Method</label>
                <select 
                  value={newMethod} 
                  onChange={(e) => setNewMethod(e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
