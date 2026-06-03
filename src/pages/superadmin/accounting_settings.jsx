import React, { useState } from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, CreditCard, RefreshCw, Calculator,
  Receipt, FileText, Scale, LayoutGrid, Settings,
  ShieldCheck, AlertCircle, Bell
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function Toggle({ on = false, onChange }) {
  return (
    <button 
      onClick={onChange}
      className={cn(
        "relative w-9 h-5 rounded-full transition-all duration-300 shadow-inner",
        on ? "bg-blue-600" : "bg-slate-200"
      )}
    >
      <div className={cn(
        "absolute top-1 h-3 w-3 bg-white rounded-full shadow-sm transition-all duration-300",
        on ? "right-1" : "left-1"
      )} />
    </button>
  );
}

export default function AccountingSettings() {
  const [switches, setSwitches] = useState({ autoPayouts: true, autoInvoices: true, overdueReminders: true, enableTaxes: true, inclusivePricing: true });

  const toggle = (key) => setSwitches(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Fiscal Governance</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure Global Accounting Rules & Financial Settlement Protocols</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-slate-800 text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-slate-800/10 hover:bg-slate-900 transition-all">Save Configuration</button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Settlement Cycle" value="Weekly" trend="Automated" up icon={Clock} color="blue" />
        <StatCardHorizontal label="Tax Compliance" value="Active" trend="GST Enabled" up icon={ShieldCheck} color="emerald" />
        <StatCardHorizontal label="Fee Tiers" value="03 Levels" trend="Dynamic" up icon={Scale} color="indigo" />
        <StatCardHorizontal label="Currency Hub" value="INR (₹)" trend="Default" up icon={Wallet} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency & Format */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm"><Globe className="w-4 h-4" /></div>
              <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Currency & Regional Format</h3>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Default Currency" value="INR (₹)" icon={IndianRupee} />
              <InputGroup label="Decimal Precision" value="2 Points" />
              <InputGroup label="Currency Position" value="Prefix (₹100)" />
              <InputGroup label="Thousand Separator" value="Indian (1,00,000)" />
           </div>
        </div>

        {/* Payout Rules */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm"><Send className="w-4 h-4" /></div>
              <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Settlement Protocols</h3>
           </div>
           <div className="space-y-4">
              <ToggleRow label="Auto Payouts" sub="Process disbursements on schedule" on={switches.autoPayouts} onToggle={() => toggle('autoPayouts')} />
              <div className="grid grid-cols-2 gap-4">
                 <InputGroup label="Frequency" value="Weekly (Mon)" />
                 <InputGroup label="Min Amount" value="₹500" />
                 <InputGroup label="Hold Period" value="3 Days" />
                 <InputGroup label="Method" value="Direct Bank" />
              </div>
           </div>
        </div>

        {/* Invoice Settings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm"><FileText className="w-4 h-4" /></div>
              <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Invoicing Preferences</h3>
           </div>
           <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <InputGroup label="Document Prefix" value="INV-2025-" />
                 <InputGroup label="Payment Terms" value="15 Days" />
              </div>
              <ToggleRow label="Auto-send Invoices" sub="Email document on generation" on={switches.autoInvoices} onToggle={() => toggle('autoInvoices')} />
              <ToggleRow label="Overdue Reminders" sub="Notify customers of liability" on={switches.overdueReminders} onToggle={() => toggle('overdueReminders')} />
           </div>
        </div>

        {/* Tax Settings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-sm"><Scale className="w-4 h-4" /></div>
              <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Tax & Compliance Hub</h3>
           </div>
           <div className="space-y-4">
              <div className="flex gap-4">
                 <ToggleRow label="Enable Taxes" on={switches.enableTaxes} onToggle={() => toggle('enableTaxes')} />
                 <ToggleRow label="Inclusive Pricing" on={switches.inclusivePricing} onToggle={() => toggle('inclusivePricing')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <InputGroup label="GSTIN Registry" value="29ABCDE1234F1Z5" />
                 <InputGroup label="PAN Identity" value="ABCDE1234F" />
              </div>
           </div>
        </div>
      </div>
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
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md flex items-start gap-3 group hover:translate-y-[-2px] transition-all">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105", bgColors[color])}>
         <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none truncate">{label}</p>
         <p className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">{value}</p>
         <div className={cn(
           "flex items-center gap-1 text-[7px] font-bold uppercase",
           up ? "text-emerald-600" : "text-rose-600"
         )}>
            {up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {trend}
         </div>
      </div>
    </div>
  );
}

function InputGroup({ label, value, icon: Icon }) {
  return (
    <div className="space-y-1.5">
       <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none pl-1">{label}</label>
       <div className="relative group">
          {Icon && <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />}
          <div className={cn(
            "w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pr-3 text-[10px] font-bold text-slate-800 shadow-sm cursor-pointer hover:bg-white hover:border-blue-100 transition-all",
            Icon ? "pl-8" : "pl-3"
          )}>
             {value}
          </div>
       </div>
    </div>
  );
}

function ToggleRow({ label, sub, on, onToggle }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-sm hover:border-slate-100 transition-all group shrink-0">
       <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-800 leading-none">{label}</p>
          {sub && <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">{sub}</p>}
       </div>
       <Toggle on={on} onChange={onToggle} />
    </div>
  );
}

function IndianRupee(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="m6 13 8.5 8" />
      <path d="M6 13h3" />
      <path d="M9 13c6.667 0 6.667-10 0-10" />
    </svg>
  );
}
