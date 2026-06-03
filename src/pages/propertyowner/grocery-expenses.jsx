import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  IndianRupee, Search, Download, CheckCircle2, 
  FileText, Plus, ShoppingBag
} from "lucide-react";

export default function GroceryExpensesPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [expenses, setExpenses] = useState([
    { id: "EXP-9801", items: "Fresh Vegetables & Milk supply", vendor: "Daily Fresh Farm", amount: 4800, date: "18 May 2026", paymentMode: "UPI" },
    { id: "EXP-9742", items: "Rice packets (5 bags), Pulses, Spices", vendor: "Aggarwal Wholesale Grocers", amount: 12500, date: "15 May 2026", paymentMode: "Net Banking" }
  ]);

  const filteredExpenses = expenses.filter(e => 
    e.items.toLowerCase().includes(search.toLowerCase()) ||
    e.vendor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Kitchen Audits Ledger" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Grocery Expenses</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Log and audit kitchen raw food materials purchases, gas cylinders invoices, and dairy vendor receipts.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groceries invoices by description or vendor..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Expense ID</th>
                <th className="px-6 py-3.5 font-semibold">Items Description</th>
                <th className="px-6 py-3.5 font-semibold">Vendor</th>
                <th className="px-6 py-3.5 font-semibold">Purchase Date</th>
                <th className="px-6 py-3.5 font-semibold">Payment Mode</th>
                <th className="px-6 py-3.5 font-semibold">Amount</th>
                <th className="px-6 py-3.5 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-foreground">{e.id}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">{e.items}</td>
                  <td className="px-6 py-4 text-muted-foreground">{e.vendor}</td>
                  <td className="px-6 py-4 text-muted-foreground">{e.date}</td>
                  <td className="px-6 py-4 text-muted-foreground">{e.paymentMode}</td>
                  <td className="px-6 py-4 font-bold text-rose-600">₹{e.amount.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors">
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
