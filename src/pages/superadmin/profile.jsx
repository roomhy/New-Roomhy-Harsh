import React from "react";
import { 
  User, Mail, Phone, ShieldCheck, 
  Calendar, Clock, Edit3, Camera, 
  MapPin, Globe, Activity, LogIn,
  UserPlus, Key, Fingerprint, Shield,
  ChevronRight, ArrowUpRight, Save,
  Zap, Bell, Target, Award
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function SuperadminProfile() {
  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">Administrative Identity Hub</h1>
         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-2">
            <span>Identity Governance</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">Sovereign Profile Portfolio</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Profile Master Card */}
         <div className="lg:col-span-8 space-y-10">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden group">
               {/* Banner Section */}
               <div className="h-64 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                  <div className="absolute top-8 right-8 flex gap-3">
                     <button className="bg-white/10 backdrop-blur-xl text-white p-3 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                        <Camera className="w-5 h-5" />
                     </button>
                  </div>
               </div>

               {/* Profile Info Overlay */}
               <div className="px-12 pb-12">
                  <div className="flex flex-col md:flex-row md:items-end gap-8 -mt-20 mb-12 relative z-10">
                     <div className="relative group/avatar">
                        <div className="w-44 h-44 rounded-[2.5rem] border-[6px] border-white bg-slate-50 flex items-center justify-center text-slate-800 text-6xl font-black shadow-2xl shadow-slate-300 transition-transform group-hover/avatar:scale-105 duration-500">
                           SA
                        </div>
                        <div className="absolute bottom-2 right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-2xl shadow-lg shadow-emerald-200 animate-pulse"></div>
                     </div>
                     <div className="flex-1 pb-4">
                        <div className="flex items-center gap-4">
                           <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Super Admin</h2>
                           <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-4 py-1.5 rounded-full border border-blue-100 uppercase tracking-widest shadow-sm">Verified Sovereign</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 opacity-60">Global Platform Controller • UID: 0001-A-Z</p>
                     </div>
                     <button className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase shadow-xl shadow-slate-800/20 hover:bg-slate-900 transition-all flex items-center gap-2 mb-4 group/edit">
                        <Edit3 className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" /> Modify Profile Hub
                     </button>
                  </div>

                  {/* Core Intelligence Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-slate-50">
                     <ProfileDetail icon={User} label="Primary Identity" value="Aman Kumar" />
                     <ProfileDetail icon={Mail} label="Master Email Flow" value="admin@roomhy.com" />
                     <ProfileDetail icon={Phone} label="Secure Hotline" value="+91 98765 43210" />
                     <ProfileDetail icon={Award} label="Authority Level" value="Level 10 Sovereign" />
                     <ProfileDetail icon={Calendar} label="Hub Creation" value="Jan 15, 2024" />
                     <ProfileDetail icon={Globe} label="Operational Hub" value="Bangalore Core" />
                  </div>
               </div>
            </div>

            {/* Platform Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <MetricCard icon={Zap} label="Session Velocity" value="1.2k" color="blue" trend="+ 12% Flux" />
               <MetricCard icon={Target} label="Audit Yield" value="98%" color="emerald" trend="Optimal" />
               <MetricCard icon={Bell} label="Alert Integrity" value="142" color="amber" trend="Actioned" />
            </div>
         </div>

         {/* Sidebar Area: Security & Timeline */}
         <div className="lg:col-span-4 space-y-10">
            {/* Security Citadel */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Security Citadel</h3>
               </div>

               <div className="space-y-6">
                  <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Fingerprint className="w-5 h-5 text-emerald-600" />
                           <p className="text-sm font-bold text-slate-800">Biometric Sync</p>
                        </div>
                        <span className="text-[8px] font-bold px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg uppercase">Active</span>
                     </div>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight opacity-70">Identity verification via master biometric pulse.</p>
                  </div>

                  <div className="space-y-3">
                     <SecurityAction icon={Key} label="Rotate Sovereign Keys" />
                     <SecurityAction icon={Shield} label="Audit Access Protocols" />
                     <SecurityAction icon={LogIn} label="Review Session Hub" />
                  </div>
               </div>
            </div>

            {/* Interaction Timeline */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Activity Pulse</h3>
                  <button className="text-[10px] font-bold text-blue-600 uppercase hover:underline">View All</button>
               </div>

               <div className="space-y-10 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
                  <TimelineItem 
                    icon={LogIn} 
                    color="bg-blue-600" 
                    title="Successful Infiltration" 
                    sub="IP: 192.168.1.45 (Bangalore)" 
                    time="10:30 AM" 
                  />
                  <TimelineItem 
                    icon={UserPlus} 
                    color="bg-indigo-600" 
                    title="Personnel Provisioned" 
                    sub="New Manager: Rohan S. (Level 2)" 
                    time="Yesterday" 
                  />
                  <TimelineItem 
                    icon={ShieldCheck} 
                    color="bg-emerald-600" 
                    title="Security Audit Success" 
                    sub="Monthly platform-wide scan complete" 
                    time="2 Days Ago" 
                  />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ProfileDetail({ icon: Icon, label, value }) {
  return (
    <div className="space-y-2 group">
       <div className="flex items-center gap-2 mb-1">
          <Icon className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</label>
       </div>
       <p className="text-base font-bold text-slate-800 leading-tight">{value}</p>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, trend }) {
  const colors = {
    blue: "bg-blue-600 shadow-blue-100 text-white",
    emerald: "bg-emerald-600 shadow-emerald-100 text-white",
    amber: "bg-amber-600 shadow-amber-100 text-white",
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 group hover:translate-y-[-5px] transition-all duration-500">
       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl", colors[color])}>
          <Icon className="w-6 h-6" />
       </div>
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 leading-none">{label}</p>
       <div className="flex items-end justify-between">
          <p className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{value}</p>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">{trend}</span>
       </div>
    </div>
  );
}

function SecurityAction({ icon: Icon, label }) {
  return (
    <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group text-left">
       <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <span className="text-xs font-bold text-slate-700">{label}</span>
       </div>
       <ChevronRight className="w-4 h-4 text-slate-300" />
    </button>
  );
}

function TimelineItem({ icon: Icon, color, title, sub, time }) {
  return (
    <div className="flex gap-6 relative z-10">
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0", color)}>
          <Icon className="w-5 h-5" />
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
             <p className="text-sm font-bold text-slate-800 truncate">{title}</p>
             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest shrink-0 ml-4">{time}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight opacity-70 leading-relaxed">{sub}</p>
       </div>
    </div>
  );
}
