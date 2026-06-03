import React, { useState } from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, RefreshCw,
  LayoutGrid, ShieldCheck, Fingerprint, Check, X,
  Eye, ShieldAlert, Activity, CreditCard, Download,
  Smartphone, Monitor, AlertCircle, Sparkles,
  Lock, Key, ShieldQuestion, UserCheck, UserX,
  Plus, Save, Database, Trash, ExternalLink,
  ChevronLeft
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function Security() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">Security Intelligence Center</h1>
         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-2">
            <span>Operational Integrity</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">Threat & Policy Management</span>
         </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <p className="text-sm font-bold text-slate-400 max-w-2xl">Configure platform-wide authentication policies, manage active administrative sessions and audit network-level security protocols.</p>
         <button className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase shadow-xl shadow-slate-800/20 hover:bg-slate-900 transition-all flex items-center gap-2">
            <Save className="w-4 h-4" /> Commit Security Policy
         </button>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCardLarge label="Firewall Pulse" value="Secure" trend="Optimal Protection" up icon={ShieldCheck} color="green" />
        <StatCardLarge label="Active Sessions" value="142" trend="+ 12.4% Pulse" up icon={Activity} color="blue" />
        <StatCardLarge label="Failed Attempts" value="03" trend="Needs Immediate Audit" up={false} icon={UserX} color="orange" />
        <StatCardLarge label="Encryption Health" value="99.9%" trend="Elite Standard" up icon={Lock} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Password Policy */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
           <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                 <Key className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Authentication Policy</h3>
           </div>
           <div className="space-y-8">
              <PolicyItem label="Minimum Length" description="Characters required for administrative access" value="12 Characters" />
              <PolicyItem label="Complexity Hub" description="Require uppercase, numbers and special symbols" toggle active />
              <PolicyItem label="Password Rotation" description="Force reset after professional interval" value="90 Days" />
           </div>
        </div>

        {/* 2FA Command */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
           <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                 <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Multi-Factor Access</h3>
           </div>
           <div className="space-y-8">
              <PolicyItem label="Admin Enforce" description="Force 2FA for all Superadmin accounts" toggle active />
              <PolicyItem label="Owner Protocol" description="Optional but highly recommended for assets" toggle />
              <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 flex gap-4">
                 <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                 <p className="text-xs font-bold text-blue-700 leading-relaxed">Multi-factor codes are dispatched via secure SMS channels and secondary recovery emails for total redundancy.</p>
              </div>
           </div>
        </div>
      </div>

      {/* Active Sessions Hub */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
         <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                  <Monitor className="w-6 h-6" />
               </div>
               <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Active Administrative Sessions</h3>
            </div>
            <button className="px-6 py-3 rounded-2xl bg-rose-50 text-rose-600 text-[10px] font-bold uppercase hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100">Revoke Global Access</button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[10px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-6">User Identity</th>
                     <th className="pb-6">Role Hub</th>
                     <th className="pb-6 text-center">Network Signature</th>
                     <th className="pb-6 text-center">Device Fingerprint</th>
                     <th className="pb-6 text-center">Temporal Index</th>
                     <th className="pb-6 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  <tr className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                     <td className="py-6">
                        <p className="text-sm font-bold text-slate-800">Aman</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">admin@roomhy.com</p>
                     </td>
                     <td className="py-6">
                        <span className="text-[9px] font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 uppercase shadow-sm">Super Admin</span>
                     </td>
                     <td className="py-6 text-center">
                        <p className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100 shadow-sm inline-block">192.168.1.45</p>
                     </td>
                     <td className="py-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                           <Monitor className="w-4 h-4 opacity-30" /> Chrome / Windows
                        </div>
                     </td>
                     <td className="py-6 text-center">
                        <span className="text-[9px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">Active Now</span>
                     </td>
                     <td className="py-6 text-right">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Current Session</span>
                     </td>
                  </tr>
                  <tr className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                     <td className="py-6">
                        <p className="text-sm font-bold text-slate-800">Rajesh Kumar</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">PO-BLR-089</p>
                     </td>
                     <td className="py-6">
                        <span className="text-[9px] font-bold px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 uppercase">Property Owner</span>
                     </td>
                     <td className="py-6 text-center">
                        <p className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100 shadow-sm inline-block">10.0.0.12</p>
                     </td>
                     <td className="py-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                           <Smartphone className="w-4 h-4 opacity-30" /> Safari / iPhone
                        </div>
                     </td>
                     <td className="py-6 text-center text-[10px] font-bold text-slate-400 uppercase">5m ago</td>
                     <td className="py-6 text-right">
                        <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-md transition-all border border-slate-100">
                           <XCircle className="w-4 h-4" />
                        </button>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>

      {/* Whitelist Hub */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
         <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                  <Globe className="w-6 h-6" />
               </div>
               <h3 className="text-2xl font-bold text-slate-800 tracking-tight">IP Intelligence Whitelist</h3>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-[10px] font-bold uppercase shadow-xl shadow-blue-200 hover:scale-105 transition-transform flex items-center gap-2">
               <Plus className="w-4 h-4" /> Add Trusted Node
            </button>
         </div>
         <p className="text-sm font-bold text-slate-400 mb-8 max-w-2xl">Restrict Superadmin access to verified network nodes. This prevents unauthorized access even if credentials are compromised.</p>
         <div className="flex flex-wrap gap-4">
            <TrustedNode label="Office Primary" ip="192.168.1.0/24" />
            <TrustedNode label="Security VPN" ip="45.22.19.110" />
         </div>
      </div>

      {/* Add IP Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-lg" onClick={() => setIsModalOpen(false)}></div>
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-slate-200">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Verify Trusted Node</h3>
                 <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-10 space-y-8">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">IP Signature / CIDR</label>
                    <input type="text" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm text-slate-800" placeholder="e.g. 192.168.1.100" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Node Identity</label>
                    <input type="text" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-bold text-sm text-slate-800" placeholder="e.g. Home Office" />
                 </div>
              </div>
              <div className="px-10 py-8 bg-slate-50/50 flex gap-4">
                 <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 bg-white text-slate-600 rounded-2xl font-bold text-[10px] uppercase hover:bg-slate-50 transition-all">Cancel</button>
                 <button className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all">Commit Node</button>
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
    orange: "bg-amber-600 shadow-amber-200" 
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

function PolicyItem({ label, description, value, toggle, active }) {
  return (
    <div className="flex items-center justify-between group">
       <div>
          <p className="text-base font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{label}</p>
          <p className="text-xs font-bold text-slate-400 max-w-sm">{description}</p>
       </div>
       {toggle ? (
         <div className={cn(
            "w-14 h-8 rounded-full relative cursor-pointer transition-all duration-500",
            active ? "bg-emerald-500 shadow-lg shadow-emerald-100" : "bg-slate-200"
         )}>
            <div className={cn(
               "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-md",
               active ? "left-7" : "left-1"
            )} />
         </div>
       ) : (
         <div className="bg-slate-50 border border-slate-100 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-800 group-hover:bg-white group-hover:shadow-md transition-all">
            {value}
         </div>
       )}
    </div>
  );
}

function TrustedNode({ label, ip }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl px-6 py-4 flex items-center gap-5 hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
       <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
          <Globe2 className="w-5 h-5" />
       </div>
       <div>
          <p className="text-xs font-bold text-slate-800">{label}</p>
          <p className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase">{ip}</p>
       </div>
       <button className="ml-4 p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

function Info({ className }) {
  return <ShieldAlert className={className} />;
}
