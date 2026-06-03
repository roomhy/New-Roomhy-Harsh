import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  ArrowUpRight, ArrowDownRight, Award, Percent
} from "lucide-react";

export default function ProfitLossPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const revenue = 85000;
  const expenses = 35000;
  const netProfit = revenue - expenses;
  const profitMargin = Math.round((netProfit / revenue) * 100);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Net Earnings Analytics" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Profit &amp; Loss Statement</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Detailed statement on operational revenue streams versus service and maintenance outflows.</p>
        </div>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Gross Revenue (Inflow)</span>
          <h3 className="text-[28px] font-bold text-emerald-600 mt-1">₹{revenue.toLocaleString("en-IN")}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Operating Expenses (Outflow)</span>
          <h3 className="text-[28px] font-bold text-rose-600 mt-1">₹{expenses.toLocaleString("en-IN")}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Net Profit</span>
          <h3 className="text-[28px] font-bold text-primary mt-1">₹{netProfit.toLocaleString("en-IN")} <span className="text-sm font-normal text-muted-foreground">({profitMargin}% Margin)</span></h3>
        </div>
      </div>

      {/* Breakdowns table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Revenue Streams</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Room Rent Collection</span>
              <strong className="text-foreground">₹72,000</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Mess &amp; Food Surcharges</span>
              <strong className="text-foreground">₹9,500</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Electricity &amp; Utilities</span>
              <strong className="text-foreground">₹3,500</strong>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Operating Expense Streams</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Maintenance &amp; Repiping charges</span>
              <strong className="text-rose-600">₹12,000</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Electricity Grid Utility Bills</span>
              <strong className="text-rose-600">₹15,000</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Staff Salaries &amp; Payroll</span>
              <strong className="text-rose-600">₹8,000</strong>
            </div>
          </div>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
