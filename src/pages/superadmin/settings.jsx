import React from "react";
import { 
  Settings as SettingsIcon, UserCog, Bell, 
  ShieldCheck, Globe, Moon, Sun, Monitor,
  AlertTriangle, Trash2, ChevronRight, Save,
  RotateCcw, Lock, Eye, Mail, Smartphone,
  Database, Zap, ShieldAlert, Key, Fingerprint,
  Languages, Palette, Sparkles, Sliders
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function SuperadminSettings() {
  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">Governance Configuration Hub</h1>
         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-2">
            <span>Platform Governance</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">Global System Settings</span>
         </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <p className="text-sm font-bold text-slate-400 max-w-2xl">Configure platform-wide administrative protocols, manage security keys and calibrate system-wide operational preferences with high-fidelity control.</p>
         <div className="flex items-center gap-3">
            <button className="bg-white text-slate-400 border border-slate-100 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase hover:bg-slate-50 transition-all flex items-center gap-2">
               <RotateCcw className="w-4 h-4" /> Reset Defaults
            </button>
            <button className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase shadow-xl shadow-slate-800/20 hover:bg-slate-900 transition-all flex items-center gap-2">
               <Save className="w-4 h-4" /> Commit Changes
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Left Column: Settings Categories */}
         <div className="lg:col-span-8 space-y-8">
            {/* Account & Profile */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                     <UserCog className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Administrative Identity</h3>
               </div>
               
               <div className="space-y-6">
                  <SettingRow 
                    icon={Mail} 
                    label="Master Email Access" 
                    sub="Primary communication hub for platform alerts" 
                    action={<button className="text-blue-600 text-[10px] font-bold uppercase hover:underline">Update Hub</button>}
                  />
                  <SettingRow 
                    icon={Bell} 
                    label="Global Notifications" 
                    sub="Receive real-time system and security alerts" 
                    action={<Toggle active />}
                  />
                  <SettingRow 
                    icon={Smartphone} 
                    label="Mobile Synchronization" 
                    sub="Link mobile devices for administrative pulse" 
                    action={<button className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold uppercase text-slate-500 hover:bg-white hover:shadow-md transition-all">Provision Device</button>}
                  />
               </div>
            </div>

            {/* System Preferences */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                     <SettingsIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Platform Core Configuration</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Visual Theme Mode</label>
                     <div className="grid grid-cols-3 gap-3">
                        <ThemeOption icon={Sun} label="Light" active />
                        <ThemeOption icon={Moon} label="Dark" />
                        <ThemeOption icon={Monitor} label="System" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Interface Language</label>
                     <select className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer">
                        <option>English (Global Hub)</option>
                        <option>Hindi (Regional Matrix)</option>
                     </select>
                  </div>
               </div>

               <div className="mt-10 pt-10 border-t border-slate-50 space-y-6">
                  <SettingRow 
                    icon={Zap} 
                    label="Performance Velocity" 
                    sub="Optimize interface animations for high-speed audit" 
                    action={<Toggle active />}
                  />
                  <SettingRow 
                    icon={Database} 
                    label="Real-time Data Sync" 
                    sub="Keep all dashboard metrics synchronized in real-time" 
                    action={<Toggle active />}
                  />
               </div>
            </div>
         </div>

         {/* Right Column: Security & Danger Zone */}
         <div className="lg:col-span-4 space-y-8">
            {/* Security Hub */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Security Citadel</h3>
               </div>

               <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 group hover:bg-white hover:shadow-xl transition-all duration-500">
                     <div className="flex items-center gap-3">
                        <Fingerprint className="w-5 h-5 text-emerald-600" />
                        <p className="text-sm font-bold text-slate-800">2FA Biometric Access</p>
                     </div>
                     <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">Multi-layer security protocol for administrative identity verification.</p>
                     <button className="w-full py-3 rounded-xl bg-white text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase hover:bg-emerald-600 hover:text-white transition-all shadow-sm">Activate Pulse</button>
                  </div>

                  <div className="space-y-4 pt-4">
                     <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3">
                           <Key className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                           <span className="text-xs font-bold text-slate-700">Rotate Access Keys</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                     </button>
                     <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3">
                           <Lock className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                           <span className="text-xs font-bold text-slate-700">Audit Permissions</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                     </button>
                  </div>
               </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-rose-50 rounded-[2.5rem] p-10 border border-rose-100 shadow-xl shadow-rose-200/30">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
                     <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-rose-900 tracking-tight">Danger Zone</h3>
               </div>
               
               <p className="text-xs text-rose-700 font-bold leading-relaxed mb-10 opacity-70">Irreversible administrative actions. Proceed only with direct authorization.</p>
               
               <div className="space-y-4">
                  <button className="w-full py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-bold uppercase shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
                     <Trash2 className="w-4 h-4" /> Reset All System Settings
                  </button>
                  <button className="w-full py-4 bg-white text-rose-600 border border-rose-100 rounded-2xl text-[10px] font-bold uppercase hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
                     <ShieldAlert className="w-4 h-4" /> Purge Cache & Data Hub
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, sub, action }) {
  return (
    <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500 group">
       <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
             <Icon className="w-5 h-5" />
          </div>
          <div>
             <p className="text-base font-bold text-slate-800">{label}</p>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{sub}</p>
          </div>
       </div>
       <div>{action}</div>
    </div>
  );
}

function Toggle({ active }) {
  return (
    <div className={cn(
      "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300",
      active ? "bg-blue-600" : "bg-slate-200"
    )}>
       <div className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
          active ? "right-1 shadow-md" : "left-1"
       )} />
    </div>
  );
}

function ThemeOption({ icon: Icon, label, active }) {
  return (
    <button className={cn(
      "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all group",
      active ? "bg-white border-blue-100 shadow-md ring-2 ring-blue-50" : "bg-slate-50 border-transparent hover:bg-white hover:border-slate-100"
    )}>
       <Icon className={cn("w-5 h-5", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
       <span className={cn("text-[10px] font-bold uppercase tracking-widest", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")}>{label}</span>
    </button>
  );
}
