import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { Plus, Search, TrendingDown, IndianRupee, ArrowDownRight, Tag } from "lucide-react";

export default function ExpenseTracking() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [expenses, setExpenses] = useState([
    { id: 1, category: "Maintenance", desc: "Plumber charges for toilet leakage", amount: 2500, date: "15 May 2026", paid: "Cash" },
    { id: 2, category: "Electricity", desc: "Main building May electricity bill", amount: 8200, date: "14 May 2026", paid: "UPI" },
    { id: 3, category: "Cleaning", desc: "Monthly housekeeping contractor payment", amount: 3500, date: "12 May 2026", paid: "Bank" },
    { id: 4, category: "Internet", desc: "Broadband office monthly plan", amount: 1800, date: "10 May 2026", paid: "Auto-debit" },
    { id: 5, category: "Repairs", desc: "Water lift motor rewinding", amount: 4500, date: "08 May 2026", paid: "Cash" }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Maintenance");
  const [newAmount, setNewAmount] = useState("");
  const [newPaid, setNewPaid] = useState("Cash");

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newDesc || !newAmount) return;
    const newExp = {
      id: expenses.length + 1,
      category: newCategory,
      desc: newDesc,
      amount: parseFloat(newAmount),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      paid: newPaid
    };
    setExpenses([newExp, ...expenses]);
    setNewDesc("");
    setNewAmount("");
    setShowAddModal(false);
  };

  const filtered = expenses.filter(e => 
    !search || 
    e.desc.toLowerCase().includes(search.toLowerCase()) || 
    e.category.toLowerCase().includes(search.toLowerCase())
  );
  
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Expense Ledger" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Expenses</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Track all property repairs, staff payrolls, utilities, and daily operations costs.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-slate-900 text-white text-[13px] font-medium hover:opacity-90 md:mt-2"
        >
          <Plus className="size-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-rose-50/50 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12.5px] text-muted-foreground font-medium">This Month Outflow</span>
            <TrendingDown className="size-4 text-rose-500" />
          </div>
          <div className="font-serif text-[28px] font-bold text-rose-600">₹{total.toLocaleString("en-IN")}</div>
          <div className="text-[11.5px] text-muted-foreground mt-1">{expenses.length} transaction entries</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12.5px] text-muted-foreground font-medium">Daily Outflow Avg</span>
            <IndianRupee className="size-4 text-muted-foreground" />
          </div>
          <div className="font-serif text-[28px] font-bold text-foreground">₹{Math.round(total/30).toLocaleString("en-IN")}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12.5px] text-muted-foreground font-medium">Largest Billing Outflow</span>
            <IndianRupee className="size-4 text-muted-foreground" />
          </div>
          <div className="font-serif text-[28px] font-bold text-foreground">
            ₹{expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)).toLocaleString("en-IN") : "0"}
          </div>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search expenses by category or description..." 
          className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Category</th>
                <th className="px-6 py-3.5 font-semibold">Description</th>
                <th className="px-6 py-3.5 font-semibold">Paid Method</th>
                <th className="px-6 py-3.5 font-semibold">Transaction Date</th>
                <th className="px-6 py-3.5 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                      {e.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">{e.desc}</td>
                  <td className="px-6 py-4 text-muted-foreground">{e.paid}</td>
                  <td className="px-6 py-4 text-muted-foreground">{e.date}</td>
                  <td className="px-6 py-4 font-bold text-rose-600">-₹{e.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-serif text-[22px] text-foreground mb-4">Add Property Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Description / Details</label>
                <input 
                  type="text" 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Electrician replacement of LED bulbs"
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
                  <option value="Maintenance">Maintenance</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Internet">Internet</option>
                  <option value="Repairs">Repairs</option>
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
                  value={newPaid} 
                  onChange={(e) => setNewPaid(e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
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
                  Save Outflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
