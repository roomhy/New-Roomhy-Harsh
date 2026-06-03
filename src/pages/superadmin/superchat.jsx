import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Search, MoreVertical, User, Send, Paperclip, Smile, Phone, Mail,
  Star, Globe, ChevronRight, UserCheck, Calendar, ArrowUpRight, ArrowDownRight, Building2, DollarSign, RefreshCw
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from "recharts";
import { fetchJson, getApiBase } from "../../utils/api";
import { PageHeader } from "../../components/superadmin/PageHeader";
import EmojiPicker from 'emoji-picker-react';

const cn = (...classes) => classes.filter(Boolean).join(" ");
const SUPERADMIN_LOGIN_ID = "SUPER_ADMIN";

const conversationsStatusData = [
  { name: "Open", value: 128, color: "#3B82F6", percent: "32.4%" },
  { name: "Closed", value: 235, color: "#10B981", percent: "59.5%" },
  { name: "Pending", value: 32, color: "#F59E0B", percent: "8.1%" }
];

const conversationsChannelData = [
  { name: "Website", value: 210, color: "#3B82F6", percent: "53%" },
  { name: "Mobile App", value: 120, color: "#10B981", percent: "30%" },
  { name: "WhatsApp", value: 45, color: "#F59E0B", percent: "11%" },
  { name: "Others", value: 20, color: "#6366F1", percent: "6%" }
];

const responseTimeTrend = [
  { name: "M", val: 100 }, { name: "T", val: 120 }, { name: "W", val: 90 },
  { name: "T", val: 110 }, { name: "F", val: 80 }, { name: "S", val: 70 }, { name: "S", val: 92 }
];

const topAgents = [
  { name: "Neha Verma", count: 128, img: "https://i.pravatar.cc/150?u=neha" },
  { name: "Rahul Singh", count: 104, img: "https://i.pravatar.cc/150?u=rahul" },
  { name: "Priya Nair", count: 87, img: "https://i.pravatar.cc/150?u=priya" }
];

const getCurrentSuperadmin = () => {
  try {
    const staff = JSON.parse(localStorage.getItem("staff_user") || localStorage.getItem("user") || "{}");
    if (staff?.loginId) return String(staff.loginId).trim().toUpperCase();
  } catch (_) {}
  return SUPERADMIN_LOGIN_ID;
};

const normalizeMessage = (message) => ({
  ...message,
  key: message?._id || `${message?.sender_login_id || "msg"}-${message?.created_at || Date.now()}`,
  text: String(message?.message || ""),
  createdAt: message?.created_at || new Date().toISOString()
});

const formatClock = (value) => {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const resolveChatError = (err, fallback) => {
  const status = Number(err?.status || 0);
  if (status === 404) return "Chat API not found. Please start/update backend server.";
  if (status >= 500) return "Backend error while loading chat. Please check server logs.";
  return err?.message || fallback;
};

export default function SuperChat() {
  const [search, setSearch] = useState("");
  const [inbox, setInbox] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState("my"); // "my" or "all"
  const socketRef = useRef(null);
  const activeChatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const superadminLoginId = useMemo(() => getCurrentSuperadmin(), []);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadInbox = async () => {
    setLoadingInbox(true);
    setError("");
    try {
      const endpoint = viewMode === "all" 
        ? `/api/chat/all-chats?search=${encodeURIComponent(search)}`
        : `/api/chat/inbox/${encodeURIComponent(superadminLoginId)}?search=${encodeURIComponent(search)}`;
      
      const data = await fetchJson(endpoint);
      const conversations = Array.isArray(data?.conversations) ? data.conversations : [];
      
      let filtered = conversations;
      if (viewMode === "my") {
        // Only show website users for "My Chats" to match previous behavior
        filtered = conversations.filter((item) => /^roomhyweb\d{6}$/i.test(String(item?.participant_login_id || "")));
      }
      
      setInbox(filtered);
      setActiveChat((prev) => {
        if (prev) return filtered.find((x) => (x.participant_login_id === prev.participant_login_id || x.pair_key === prev.pair_key)) || filtered[0] || null;
        return filtered[0] || null;
      });
    } catch (err) {
      setError(resolveChatError(err, "Failed to load chat inbox."));
      setInbox([]);
      setActiveChat(null);
    } finally {
      setLoadingInbox(false);
    }
  };

  useEffect(() => { loadInbox(); }, [superadminLoginId, search, viewMode]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!activeChat) return setMessages([]);
      const u1 = activeChat.user1 || superadminLoginId;
      const u2 = activeChat.user2 || activeChat.participant_login_id;
      if (!u2) return setMessages([]);

      setLoadingMessages(true);
      try {
        const list = await fetchJson(`/api/chat/conversation?user1=${encodeURIComponent(u1)}&user2=${encodeURIComponent(u2)}`);
        setMessages((Array.isArray(list) ? list : []).map(normalizeMessage));
        if (viewMode === "my") {
            await fetchJson(`/api/chat/mark-read/${encodeURIComponent(superadminLoginId)}`, { method: "POST" });
        }
      } catch (err) {
        setError(resolveChatError(err, "Failed to load messages."));
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    loadConversation();
  }, [activeChat, superadminLoginId, viewMode]);

  useEffect(() => {
    const socket = io(getApiBase(), { transports: ["websocket"], upgrade: false, reconnection: true });
    socketRef.current = socket;
    const join = () => socket.emit("join_room", { login_id: superadminLoginId, role: "superadmin", name: "Super Admin" });
    socket.on("connect", join);
    socket.on("reconnect", join);
    socket.on("receive_message", async (incoming) => {
      const current = activeChatRef.current;
      const sender = String(incoming?.sender_login_id || "").trim().toLowerCase();
      if (current?.participant_login_id && sender === String(current.participant_login_id).trim().toLowerCase()) {
        const list = await fetchJson(`/api/chat/conversation?user1=${encodeURIComponent(superadminLoginId)}&user2=${encodeURIComponent(current.participant_login_id)}`);
        setMessages((Array.isArray(list) ? list : []).map(normalizeMessage));
      }
      await loadInbox();
    });
    return () => socket.disconnect();
  }, [superadminLoginId]);

  const sendMessage = () => {
    if (!draft.trim() || !activeChat?.participant_login_id || !socketRef.current) return;
    const text = draft.trim();
    socketRef.current.emit("send_message", { to_login_id: activeChat.participant_login_id, message: text });
    setMessages((prev) => [...prev, normalizeMessage({
      sender_login_id: superadminLoginId,
      sender_name: "Super Admin",
      message: text,
      created_at: new Date().toISOString()
    })]);
    setDraft("");
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiData) => {
    setDraft(prev => prev + emojiData.emoji);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat?.participant_login_id) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${getApiBase()}/api/upload-file`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      
      if (data.url) {
        const isImg = file.type.startsWith('image/');
        const fileMsg = {
          to_login_id: activeChat.participant_login_id,
          message: `Sent a ${isImg ? 'photo' : 'file'}: ${file.name}`,
          message_type: isImg ? 'image' : 'file',
          file_url: data.url
        };
        socketRef.current.emit("send_message", fileMsg);
        
        setMessages(prev => [...prev, normalizeMessage({
          sender_login_id: superadminLoginId,
          sender_name: "Super Admin",
          message: fileMsg.message,
          message_type: fileMsg.message_type,
          file_url: data.url,
          created_at: new Date().toISOString()
        })]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("File upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Chat Management Overview"
        subtitle="Monitor and respond to customer conversations across all channels."
        breadcrumbs={[
          { label: "Chat Management" },
          { label: "Overview", active: true }
        ]}
        actions={
          <div className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>May 22 - May 28, 2024</span>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-6 mb-8 h-[650px]">
        <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 space-y-4">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode("my")}
                className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all", viewMode === "my" ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600")}
              >
                My Inbox
              </button>
              <button 
                onClick={() => setViewMode("all")}
                className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all", viewMode === "all" ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600")}
              >
                All Chats
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search conversations..." className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium placeholder:text-slate-300 outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingInbox && inbox.length === 0 ? <div className="p-4 text-xs text-slate-400">Loading conversations...</div> : null}
            {inbox.map((chat) => (
              <div key={chat.participant_login_id} onClick={() => setActiveChat(chat)} className={cn("p-5 flex items-center gap-4 cursor-pointer transition-all border-b border-slate-50", activeChat?.participant_login_id === chat.participant_login_id ? "bg-blue-50/50 border-l-4 border-l-blue-600" : "hover:bg-slate-50")}>
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {String(chat.participant_name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[13px] font-bold text-slate-900 truncate">{chat.participant_name || chat.participant_login_id}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">{formatClock(chat.last_message_at)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium truncate leading-tight">{chat.last_message || "No messages yet"}</p>
                </div>
                {chat.unread_count > 0 ? <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{chat.unread_count}</div> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">
                {String(activeChat?.participant_name || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-slate-900">{activeChat?.participant_name || "Select conversation"}</h4>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><Phone size={18} /></button>
              <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={18} /></button>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30 space-y-6">
            {error ? <p className="text-xs text-red-500 text-center py-4 bg-red-50 rounded-xl border border-red-100">{error}</p> : null}
            {loadingMessages ? <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 text-blue-600 animate-spin" /></div> : null}
            {!loadingMessages && messages.map((msg) => {
              const role = String(msg.sender_role || "").toLowerCase();
              const isOwner = role === "property_owner";
              const isAdmin = role === "superadmin";
              
              // Define side: 
              // In monitor mode: Owner Left, User Right
              // In my mode: Admin Right, Others Left
              let isRightSide = false;
              if (viewMode === "all") {
                isRightSide = !isOwner; // Owner Left, Tenant Right
              } else {
                isRightSide = isAdmin; // Admin Right, User Left
              }

              const isImage = msg.message_type === 'image';
              const isFile = msg.message_type === 'file';

              const isWhiteText = isRightSide || viewMode === "all";

              return (
                <div key={msg.key} className={cn("flex flex-col", isRightSide ? "items-end" : "items-start")}>
                  {viewMode === "all" && (
                    <span className={cn("text-[9px] font-bold mb-1 px-1 uppercase tracking-wider", isOwner ? "text-blue-500" : "text-emerald-500")}>
                        {msg.sender_name || msg.sender_login_id} ({isOwner ? "Owner" : "User"})
                    </span>
                  )}
                  <div className={cn(
                    "max-w-[75%] p-4 rounded-2xl shadow-sm", 
                    isRightSide 
                      ? (viewMode === "all" ? "bg-emerald-600 text-white rounded-tr-none" : "bg-blue-600 text-white rounded-tr-none")
                      : (viewMode === "all" ? "bg-blue-600 text-white rounded-tl-none" : "bg-white border border-slate-100 rounded-tl-none")
                  )}>
                    {isImage ? (
                      <div className="space-y-2">
                        <img src={msg.file_url} alt="uploaded" className="max-w-full rounded-xl border border-white/20 shadow-sm cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.file_url, '_blank')} />
                        <p className={cn("text-[10px] font-medium opacity-80", isWhiteText ? "text-white" : "text-slate-500")}>{msg.text}</p>
                      </div>
                    ) : isFile ? (
                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all", isWhiteText ? "bg-white/10 border-white/20 hover:bg-white/20" : "bg-slate-50 border-slate-100 hover:bg-slate-100")}>
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", isWhiteText ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600")}>
                           <Paperclip size={20} />
                        </div>
                        <div className="min-w-0">
                           <p className={cn("text-[11px] font-bold truncate", isWhiteText ? "text-white" : "text-slate-800")}>{msg.text.replace('Sent a file: ', '')}</p>
                           <p className={cn("text-[9px] font-medium opacity-60", isWhiteText ? "text-white" : "text-slate-500")}>Click to download</p>
                        </div>
                      </a>
                    ) : (
                      <p className={cn("text-xs font-medium leading-relaxed", isWhiteText ? "text-white" : "text-slate-600")}>{msg.text}</p>
                    )}
                    <span className={cn("text-[9px] font-bold mt-2 block", isWhiteText ? "text-blue-100 text-right" : "text-slate-300")}>{formatClock(msg.createdAt)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          {viewMode === "my" ? (
            <div className="p-5 border-t border-slate-50 relative">
              {showEmojiPicker && (
                 <div className="absolute bottom-full left-5 z-50 mb-4 shadow-2xl rounded-2xl overflow-hidden border border-slate-100">
                    <EmojiPicker onEmojiClick={onEmojiClick} width={320} height={400} />
                 </div>
              )}
              
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" />

              <div className={cn("flex items-center gap-4 bg-slate-50 rounded-2xl p-2 pr-4", isUploading && "opacity-50 pointer-events-none")}>
                <div className="flex items-center gap-1">
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:bg-white rounded-xl transition-all"><Paperclip size={18} /></button>
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={cn("p-2 rounded-xl transition-all", showEmojiPicker ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:bg-white")}><Smile size={18} /></button>
                </div>
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} type="text" placeholder={isUploading ? "Uploading..." : "Type a message..."} className="flex-1 bg-transparent border-none py-2 text-xs font-medium placeholder:text-slate-300 outline-none" />
                <button onClick={sendMessage} className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all"><Send size={18} /></button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border-t border-blue-100 text-center">
               <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Read-Only Monitor Mode</p>
               <p className="text-[9px] text-blue-400 mt-1">You are viewing a conversation between two other users.</p>
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col p-8 overflow-y-auto">
          <h3 className="text-[14px] font-bold text-slate-900 mb-8 uppercase tracking-widest text-left border-b border-slate-50 pb-4">User Details</h3>
          <div className="space-y-8">
            <DetailRow label="Phone" value={activeChat?.participant_phone || "N/A"} icon={Phone} />
            <DetailRow label="Email" value={activeChat?.participant_email || `${activeChat?.participant_login_id || "N/A"}@roomhy.user`} icon={Mail} />
            <DetailRow label="Interested Property" value={activeChat?.participant_property || "Property Enquiry"} icon={Building2} />
            <DetailRow label="Location" value={activeChat?.participant_city || "Website Source"} icon={Globe} />
            
            <div className="pt-4 border-t border-slate-50">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chat ID</span>
                  <span className="text-[10px] font-mono font-bold text-slate-900 opacity-60">{activeChat?.participant_login_id}</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-wider">Active</span>
               </div>
            </div>
          </div>
          
          <div className="mt-auto pt-8">
             <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2">
                <UserCheck size={14} /> Assign to Manager
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard title="Conversations by Status" data={conversationsStatusData} />
        <StatsCard title="Conversations by Channel" data={conversationsChannelData} />
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-[13px] font-bold text-slate-900 mb-4">Response Time (Avg.)</h3>
          <div className="mb-auto">
             <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">1m 32s</p>
             <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><ArrowDownRight size={12} />18% faster</span>
          </div>
          <div className="h-16 mt-4 border border-slate-100 rounded-lg overflow-hidden">
             <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={responseTimeTrend}>
                   <Area type="monotone" dataKey="val" stroke="#10B981" fill="#D1FAE5" strokeWidth={2} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
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
             <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><ArrowUpRight size={12} />12% from last week</span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-[13px] font-bold text-slate-900 mb-6 uppercase tracking-widest">Top Agents (This Week)</h3>
          <div className="space-y-4">
             {topAgents.map((agent) => (
                <div key={agent.name} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm">
                         <img src={agent.img} alt={agent.name} className="w-full h-full object-cover" />
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

function StatsCard({ title, data }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-[13px] font-bold text-slate-900 mb-6">{title}</h3>
      <div className="flex items-center gap-6">
        <div className="relative h-24 w-24 shrink-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
             <PieChart>
                <Pie data={data} innerRadius={32} outerRadius={44} paddingAngle={4} dataKey="value" stroke="none">
                   {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
             </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <p className="text-sm font-black text-slate-900">{data.reduce((a, b) => a + b.value, 0)}</p>
             <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Total</p>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
           {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[9px] font-bold">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-400">{item.name}</span>
                 </div>
                 <span className="text-slate-900">{item.value} <span className="text-slate-300">({item.percent})</span></span>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</span>
      <div className="flex items-center gap-3">
         <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
            <Icon size={14} />
         </div>
         <span className="text-[13px] font-bold text-slate-800 truncate">{value}</span>
      </div>
    </div>
  );
}
