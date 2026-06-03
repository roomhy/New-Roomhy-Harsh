import React, { useState } from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, RefreshCw,
  LayoutGrid, ShieldCheck, Fingerprint, Check, X,
  Eye, ShieldAlert, Activity, CreditCard, Download,
  Smartphone, Monitor, AlertCircle, Sparkles,
  IndianRupee, Scale, AlertOctagon, CheckCircle2,
  XCircle, Inbox, FileText, ImageIcon, Plus, Save
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function PaymentDisputes() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">Financial Integrity Hub</h1>
         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-2">
            <span>Commercial Operations</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">Dispute Resolution Command</span>
         </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <p className="text-sm font-bold text-slate-400 max-w-2xl">Handle platform-wide chargebacks, audit incorrect payments and manage resident transaction disputes with audit-ready precision.</p>
         <button className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase shadow-xl shadow-slate-800/20 hover:bg-slate-900 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Resolution Report
         </button>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCardLarge label="Active Disputes" value="03" trend="Needs Immediate Audit" up icon={AlertOctagon} color="orange" />
        <StatCardLarge label="Resolution Velocity" value="2.4 Days" trend="High Performance" up icon={Activity} color="green" />
        <StatCardLarge label="Disputed Capital" value="₹18.5k" trend="Pending Review" up icon={IndianRupee} color="blue" />
        <StatCardLarge label="Success Index" value="98.2%" trend="Elite Standard" up icon={ShieldCheck} color="indigo" />
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col lg:flex-row justify-between items-center gap-6">
         <div className="relative group w-full lg:w-[450px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input placeholder="Search Dispute ID, Transaction Ref..." className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-11 pr-4 text-xs font-bold shadow-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" />
         </div>
         
         <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
               <button className="px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase bg-white text-slate-800 shadow-sm border border-slate-100">All Hubs</button>
               <button className="px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-slate-600">Open</button>
               <button className="px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-slate-600">Resolved</button>
            </div>
            <button className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:shadow-md transition-all">
               <Filter className="w-5 h-5" />
            </button>
         </div>
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Commercial Resolution Ledger</h3>
            <button className="p-3.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all border border-slate-100">
               <RefreshCw className="w-5 h-5" />
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1200px]">
               <thead>
                  <tr className="text-slate-400 text-[10px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-6">Dispute Identity</th>
                     <th className="pb-6">Raised By Profile</th>
                     <th className="pb-6">Transaction Ref Hub</th>
                     <th className="pb-6 text-center">Issue Categorization</th>
                     <th className="pb-6 text-center">Amount Index</th>
                     <th className="pb-6 text-center">Status Hub</th>
                     <th className="pb-6 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  <tr className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                     <td className="py-6">
                        <p className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 shadow-sm inline-block">#DSP-2024-12</p>
                     </td>
                     <td className="py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xl shadow-indigo-100 group-hover:scale-105 transition-transform">AK</div>
                           <div>
                              <p className="text-base font-bold text-slate-800">Arjun Kapoor</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Verified Resident</p>
                           </div>
                        </div>
                     </td>
                     <td className="py-6 text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group-hover:bg-white transition-all shadow-sm">TXN-88299102</td>
                     <td className="py-6 text-center">
                        <span className="text-[9px] font-bold bg-rose-50 px-3 py-1.5 rounded-xl text-rose-600 uppercase tracking-widest border border-rose-100 shadow-sm">Double Deduction</span>
                     </td>
                     <td className="py-6 text-center">
                        <p className="text-base font-bold text-slate-800 tracking-tighter">₹6,500</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Disputed Value</p>
                     </td>
                     <td className="py-6 text-center">
                        <span className="text-[9px] font-bold px-3.5 py-1.5 rounded-full border shadow-sm uppercase tracking-widest bg-rose-50 text-rose-600 border-rose-100">Open Case</span>
                     </td>
                     <td className="py-6 text-right">
                        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase shadow-xl shadow-blue-200 hover:scale-105 transition-transform">Resolve Hub</button>
                     </td>
                  </tr>
                  <tr className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                     <td className="py-6">
                        <p className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100 shadow-sm inline-block">#DSP-2024-08</p>
                     </td>
                     <td className="py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-slate-800 group-hover:text-white transition-all">NS</div>
                           <div>
                              <p className="text-base font-bold text-slate-800">Neha Sharma</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Verified Resident</p>
                           </div>
                        </div>
                     </td>
                     <td className="py-6 text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group-hover:bg-white transition-all shadow-sm">TXN-77665544</td>
                     <td className="py-6 text-center">
                        <span className="text-[9px] font-bold bg-slate-50 px-3 py-1.5 rounded-xl text-slate-400 uppercase tracking-widest border border-slate-100">Payment Lag</span>
                     </td>
                     <td className="py-6 text-center">
                        <p className="text-base font-bold text-slate-800 tracking-tighter">₹8,000</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Disputed Value</p>
                     </td>
                     <td className="py-6 text-center">
                        <span className="text-[9px] font-bold px-3.5 py-1.5 rounded-full border shadow-sm uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-100">Resolved</span>
                     </td>
                     <td className="py-6 text-right">
                        <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Details Audit</button>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>

      {/* View Dispute Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-lg" onClick={() => setIsModalOpen(false)}></div>
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden border border-slate-200">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm border border-rose-100">
                       <Scale className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Resolve Case #DSP-2024-12</h3>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100">
                    <div className="flex justify-between items-center mb-5">
                       <div>
                          <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest">Issue Identification</p>
                          <p className="text-xl font-bold text-slate-900 mt-1">Double Deduction Reported</p>
                       </div>
                       <span className="text-[9px] font-bold bg-white px-4 py-1.5 rounded-full text-rose-600 border border-rose-200 uppercase tracking-widest shadow-sm">High Priority Flow</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic opacity-80">
                       "I paid rent on Oct 24th via UPI, but the amount was deducted twice from my bank account. Please refund the excess amount immediately."
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-8 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Resident Identity</p>
                       <p className="text-base font-bold text-slate-800">Arjun Kapoor</p>
                       <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight mt-1">Sai Residency • Room 204</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Transaction Ref Hub</p>
                       <p className="text-[11px] font-mono font-bold text-slate-800 uppercase tracking-widest">TXN-88299102</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Date: 24 Oct 2025</p>
                    </div>
                 </div>

                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Evidence Portfolio</p>
                    <div className="flex gap-4">
                       <div className="flex items-center px-6 py-4 bg-white rounded-2xl border border-slate-100 text-xs font-bold text-slate-600 cursor-pointer hover:shadow-md transition-all shadow-sm">
                          <ImageIcon className="w-5 h-5 mr-3 text-indigo-600" /> Receipt_Internal_01.png
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Resolution Strategic Note</label>
                    <textarea rows={4} className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 resize-none" placeholder="Enter resolution intelligence details..."></textarea>
                 </div>
              </div>

              <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                 <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 bg-white text-slate-600 rounded-2xl font-bold text-[10px] uppercase hover:bg-slate-50 transition-all">Cancel</button>
                 <button className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold text-[10px] uppercase hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all">Reject Dispute</button>
                 <button className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-[10px] uppercase hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all">Mark Resolved</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function StatCardLarge({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { 
    green: "bg-emerald-600 shadow-emerald-200", 
    blue: "bg-blue-600 shadow-blue-200", 
    indigo: "bg-indigo-600 shadow-indigo-200", 
    orange: "bg-rose-600 shadow-rose-200" 
  };
  
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-8 group hover:translate-y-[-8px] transition-all duration-500">
      <div className={cn("w-20 h-20 rounded-[1.75rem] flex items-center justify-center text-white shadow-2xl transition-transform group-hover:rotate-6", bgColors[color])}>
         <Icon className="w-10 h-10" />
      </div>
      <div>
         <p className="text-[11px] font-bold text-slate-400 uppercase mb-4 leading-none truncate tracking-widest">{label}</p>
         <p className="text-5xl font-bold text-slate-800 tracking-tighter leading-none">{value}</p>
      </div>
      <div className={cn(
        "flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-2xl w-fit shadow-sm border",
        up ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-rose-600 bg-rose-50 border-rose-100"
      )}>
         {up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
         {trend}
      </div>
    </div>
  );
}
