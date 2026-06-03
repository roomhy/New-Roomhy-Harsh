import React, { useState, useEffect } from "react";
import { 
  MessageSquare, Search, Filter, MoreVertical, 
  User, Send, Paperclip, Smile, Phone, Mail,
  Star, Clock, Activity, Globe, Smartphone,
  CheckCircle2, AlertCircle, ChevronRight,
  ShieldCheck, Info, UserCheck, BarChart3,
  TrendingUp, Download, Calendar, MessageCircle
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, AreaChart, Area
} from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- DATA FROM SCREENSHOT (CHAT OVERVIEW) ---

const conversationsStatusData = [
  { name: "Open", value: 128, color: "#3B82F6", percent: "32%" },
  { name: "Closed", value: 235, color: "#10B981", percent: "59%" },
  { name: "Pending", value: 32, color: "#F59E0B", percent: "9%" },
];

const conversationsChannelData = [
  { name: "Website", value: 210, color: "#3B82F6", percent: "53%" },
  { name: "Mobile App", value: 120, color: "#10B981", percent: "30%" },
  { name: "WhatsApp", value: 45, color: "#F59E0B", percent: "11%" },
  { name: "Others", value: 20, color: "#6366F1", percent: "6%" },
];

const responseTimeTrend = [
  { name: "M", val: 100 }, { name: "T", val: 120 }, { name: "W", val: 90 },
  { name: "T", val: 110 }, { name: "F", val: 80 }, { name: "S", val: 70 }, { name: "S", val: 92 },
];

const topAgents = [
  { name: "Neha Verma", count: 128, initial: "NV", color: "bg-blue-50 text-blue-600" },
  { name: "Rahul Singh", count: 104, initial: "RS", color: "bg-emerald-50 text-emerald-600" },
  { name: "Priya Nair", count: 87, initial: "PN", color: "bg-purple-50 text-purple-600" },
];

const conversationList = [
  { name: "Rohit Sharma", msg: "Hi, I'm interested in 2BHK in Andheri West.", time: "10:30 AM", unread: 2, initial: "RS" },
  { name: "Priya Mehta", msg: "Is the property available for rent?", time: "10:28 AM", unread: 1, initial: "PM" },
  { name: "Amit Patel", msg: "What is the deposit amount?", time: "10:25 AM", unread: 0, initial: "AP" },
  { name: "Neha Singh", msg: "Can I schedule a visit tomorrow?", time: "10:21 AM", unread: 3, initial: "NS" },
  { name: "Vikram Joshi", msg: "Do you have fully furnished options?", time: "10:18 AM", unread: 0, initial: "VJ" },
  { name: "Sneha Reddy", msg: "I need a property for my family.", time: "10:15 AM", unread: 0, initial: "SR" },
  { name: "Karan Malhotra", msg: "What are the charges?", time: "10:12 AM", unread: 0, initial: "KM" },
];

export default function ChatOverview() {
  const [activeChat, setActiveChat] = useState(conversationList[0]);

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-full font-inter text-slate-900">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chat Management Overview</h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
               <span>Chat Management</span>
               <ChevronRight size={12} className="opacity-50" />
               <span className="text-blue-600">Overview</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-400 hover:text-blue-600 transition-colors">
               <Download size={18} />
            </button>
            <div className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600">
               <Calendar className="w-4 h-4 text-slate-400" />
               <span>May 22 - May 28, 2024</span>
            </div>
         </div>
      </div>

      {/* Main Chat Layout Area */}
      <div className="grid grid-cols-12 gap-6 mb-8 h-[650px]">
         {/* Conversations List Sidebar */}
         <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-50">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" placeholder="Search conversations..." className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium placeholder:text-slate-300 outline-none" />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               {conversationList.map((chat, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveChat(chat)}
                    className={cn(
                      "p-5 flex items-center gap-4 cursor-pointer transition-all border-b border-slate-50",
                      activeChat.name === chat.name ? "bg-blue-50/50 border-l-4 border-l-blue-600" : "hover:bg-slate-50"
                    )}
                  >
                     <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {chat.initial}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                           <h4 className="text-[13px] font-bold text-slate-900 truncate">{chat.name}</h4>
                           <span className="text-[10px] text-slate-400 font-bold">{chat.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate leading-tight">{chat.msg}</p>
                     </div>
                     {chat.unread > 0 && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                           {chat.unread}
                        </div>
                     )}
                  </div>
               ))}
               <button className="w-full py-4 text-[11px] font-bold text-blue-600 hover:bg-slate-50 transition-colors uppercase tracking-widest border-t border-slate-50 mt-auto">
                  Load More Conversations
               </button>
            </div>
         </div>

         {/* Chat Window Middle */}
         <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">
                     {activeChat.initial}
                  </div>
                  <div>
                     <h4 className="text-[14px] font-bold text-slate-900">{activeChat.name}</h4>
                     <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><Phone size={18} /></button>
                  <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={18} /></button>
               </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30 space-y-6">
               {/* Sample Chat Messages */}
               <div className="flex justify-start">
                  <div className="max-w-[70%] bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                     <p className="text-xs font-medium text-slate-600">Hi, I'm interested in 2BHK in Andheri West.</p>
                     <span className="text-[9px] text-slate-300 font-bold mt-2 block">10:30 AM</span>
                  </div>
               </div>
               <div className="flex justify-end">
                  <div className="max-w-[70%] bg-blue-600 p-4 rounded-2xl rounded-tr-none shadow-lg shadow-blue-100">
                     <p className="text-xs font-medium text-white">Hello Rohit! 👋 We have several 2BHK options available in Andheri West. What is your preferred budget range?</p>
                     <span className="text-[9px] text-blue-200 font-bold mt-2 block text-right">10:31 AM</span>
                  </div>
               </div>
               <div className="flex justify-start">
                  <div className="max-w-[70%] bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                     <p className="text-xs font-medium text-slate-600">Budget is around 45K - 50K.</p>
                     <span className="text-[9px] text-slate-300 font-bold mt-2 block">10:32 AM</span>
                  </div>
               </div>
               <div className="flex justify-end">
                  <div className="max-w-[70%] bg-blue-600 p-4 rounded-2xl rounded-tr-none shadow-lg shadow-blue-100">
                     <p className="text-xs font-medium text-white">Great! I'll share some best matching properties with you.</p>
                     <span className="text-[9px] text-blue-200 font-bold mt-2 block text-right">10:33 AM</span>
                  </div>
               </div>
               {/* Property Card in Chat */}
               <div className="flex justify-end">
                  <div className="max-w-[80%] bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-lg group">
                     <div className="h-32 bg-slate-200 relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop" alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold text-blue-600">2BHK Apartment</div>
                     </div>
                     <div className="p-4">
                        <h5 className="text-[13px] font-bold text-slate-900 mb-1">2 BHK Apartment</h5>
                        <p className="text-[10px] text-slate-400 font-medium mb-3">Andheri West, Mumbai</p>
                        <div className="flex items-center justify-between">
                           <span className="text-sm font-black text-slate-900">₹48,000 <span className="text-[10px] text-slate-400 font-bold">/ month</span></span>
                           <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all">View Details</button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-5 border-t border-slate-50">
               <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-2 pr-4">
                  <div className="flex items-center gap-1">
                     <button className="p-2 text-slate-400 hover:bg-white rounded-xl transition-all"><Paperclip size={18} /></button>
                     <button className="p-2 text-slate-400 hover:bg-white rounded-xl transition-all"><Smile size={18} /></button>
                  </div>
                  <input type="text" placeholder="Type a message..." className="flex-1 bg-transparent border-none py-2 text-xs font-medium placeholder:text-slate-300 outline-none" />
                  <button className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 hover:scale-105 transition-transform">
                     <Send size={18} />
                  </button>
               </div>
            </div>
         </div>

         {/* User Details / Context Right Sidebar */}
         <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col p-6 overflow-y-auto">
            <h3 className="text-[14px] font-bold text-slate-900 mb-8 uppercase tracking-widest text-left">User Details</h3>
            <div className="space-y-6">
               <DetailRow label="Phone" value="+91 98765 43210" icon={Phone} />
               <DetailRow label="Email" value="rohit.sharma@email.com" icon={Mail} />
               <DetailRow label="Source" value="Website" icon={Globe} />
               <DetailRow label="Interested In" value="2 BHK Apartment" icon={Building2} />
               <DetailRow label="Budget" value="₹45,000 - ₹50,000" icon={DollarSign} />
               <div className="flex items-center justify-between py-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-wider">Active</span>
               </div>
               <DetailRow label="Assigned To" value="Neha Verma" icon={UserCheck} />
            </div>

            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-10 mb-6 text-left">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3 mb-10">
               <ActionButton label="Mark as Closed" color="emerald" />
               <ActionButton label="Add Note" color="blue" />
               <ActionButton label="Transfer Chat" color="purple" />
               <ActionButton label="Report User" color="rose" />
            </div>

            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 text-left">Lead → Chat Mapping</h3>
            <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">Lead ID</span>
                  <span className="text-[10px] font-bold text-slate-900">#LD-2024-5562</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">Created On</span>
                  <span className="text-[10px] font-bold text-slate-900 text-right">May 27, 2024, 04:25 PM</span>
               </div>
               <button className="w-full py-2 text-[10px] font-black text-blue-600 flex items-center justify-center gap-1 hover:underline mt-2">
                  View Lead Details <ChevronRight size={12} />
               </button>
            </div>
         </div>
      </div>

      {/* Bottom Analytics Row - AS REQUESTED (SAME LINE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
         {/* Conversations by Status */}
         <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-900 mb-6">Conversations by Status</h3>
            <div className="flex items-center gap-6">
               <div className="relative h-24 w-24 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={conversationsStatusData} innerRadius={32} outerRadius={44} paddingAngle={4} dataKey="value" stroke="none">
                           {conversationsStatusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <p className="text-sm font-black text-slate-900">395</p>
                     <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Total</p>
                  </div>
               </div>
               <div className="flex-1 space-y-1.5">
                  {conversationsStatusData.map((item) => (
                     <div key={item.name} className="flex items-center justify-between text-[9px] font-bold">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: item.color}} />
                           <span className="text-slate-400">{item.name}</span>
                        </div>
                        <span className="text-slate-900">{item.value} <span className="text-slate-300">({item.percent})</span></span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Conversations by Channel */}
         <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-900 mb-6">Conversations by Channel</h3>
            <div className="flex items-center gap-6">
               <div className="relative h-24 w-24 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={conversationsChannelData} innerRadius={32} outerRadius={44} paddingAngle={4} dataKey="value" stroke="none">
                           {conversationsChannelData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <p className="text-sm font-black text-slate-900">395</p>
                     <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Total</p>
                  </div>
               </div>
               <div className="flex-1 space-y-1.5">
                  {conversationsChannelData.map((item) => (
                     <div key={item.name} className="flex items-center justify-between text-[9px] font-bold">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: item.color}} />
                           <span className="text-slate-400">{item.name}</span>
                        </div>
                        <span className="text-slate-900">{item.value} <span className="text-slate-300">({item.percent})</span></span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Response Time (Avg.) */}
         <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4">Response Time (Avg.)</h3>
            <div className="mb-auto">
               <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">1m 32s</p>
               <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <ArrowDownRight size={12} /> 18% faster
               </span>
            </div>
            <div className="h-12 mt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={responseTimeTrend}>
                     <Area type="monotone" dataKey="val" stroke="#10B981" fill="#D1FAE5" strokeWidth={2} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Satisfaction Score */}
         <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4">Satisfaction Score</h3>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Star size={24} fill="currentColor" />
               </div>
               <div>
                  <p className="text-2xl font-black text-slate-900 leading-none mb-1">4.6 / 5</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">This Week</p>
               </div>
            </div>
            <div className="mt-auto">
               <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <ArrowUpRight size={12} /> 12% from last week
               </span>
            </div>
         </div>

         {/* Top Agents */}
         <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-900 mb-6 uppercase tracking-widest">Top Agents (This Week)</h3>
            <div className="space-y-4">
               {topAgents.map((agent, i) => (
                  <div key={i} className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px]", agent.color)}>
                           {agent.initial}
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">{agent.name}</span>
                     </div>
                     <span className="text-[11px] font-black text-slate-900">{agent.count}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

// --- UTILITY COMPONENTS ---

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1">
       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}</span>
       <div className="flex items-center gap-2">
          <Icon size={14} className="text-slate-400" />
          <span className="text-[13px] font-bold text-slate-900 truncate">{value}</span>
       </div>
    </div>
  );
}

function ActionButton({ label, color }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white",
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white",
    rose: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white",
  };
  return (
    <button className={cn("py-2.5 rounded-xl text-[10px] font-bold transition-all text-center", colors[color])}>
       {label}
    </button>
  );
}
