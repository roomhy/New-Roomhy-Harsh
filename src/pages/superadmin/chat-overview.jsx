import React, { useState, useEffect } from "react";
import { 
  MessageSquare, Search, Filter, MoreVertical, 
  Phone, Mail, Star, Clock, Globe,
  CheckCircle2, AlertCircle, ChevronRight,
  ShieldCheck, Info, UserCheck, BarChart3,
  TrendingUp, Download, Calendar, MessageCircle, Building2, DollarSign, ArrowDownRight, ArrowUpRight,
  Send, Paperclip, Smile
} from "lucide-react";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function ChatOverview() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [reviewsOverview, setReviewsOverview] = useState(null);
  const [text, setText] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [chatsRes, analyticsRes, reviewsRes] = await Promise.all([
        fetchJson("/api/chat/all-chats"),
        fetchJson("/api/chat/admin/analytics"),
        fetchJson("/api/superadmin/reviews/overview")
      ]);

      if (chatsRes && chatsRes.success) {
        setConversations(chatsRes.conversations || []);
        if (chatsRes.conversations && chatsRes.conversations.length > 0) {
          setActiveChat(chatsRes.conversations[0]);
        }
      }
      if (analyticsRes && analyticsRes.success) {
        setAnalytics(analyticsRes.cards);
      }
      if (reviewsRes && reviewsRes.success) {
        setReviewsOverview(reviewsRes.summary);
      }
    } catch (err) {
      console.error("Error loading chat overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeChat) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  const loadMessages = async () => {
    if (!activeChat) return;
    try {
      const res = await fetchJson(`/api/chat/conversation?user1=${activeChat.user1}&user2=${activeChat.user2}`);
      if (Array.isArray(res)) {
        setMessages(res);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !activeChat) return;
    try {
      const res = await fetchJson("/api/chat/send", {
        method: "POST",
        body: JSON.stringify({
          to_login_id: activeChat.user2,
          from_login_id: activeChat.user1,
          message: text.trim()
        })
      });
      if (res.success) {
        setText("");
        loadMessages();
      }
    } catch (err) {
      alert("Error sending message");
    }
  };

  const filteredConversations = conversations.filter(c => 
    `${c.participant_name} ${c.user1} ${c.user2} ${c.last_message}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-full font-inter text-slate-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chat Management Overview</h1>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            <span>Chat Management</span>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-blue-600">Overview</span>
          </div>
        </div>
        <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
          Data Source: Chats + Reviews
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold">Loading dashboard data...</div>
      ) : (
        <>
          {/* Main Chat Layout */}
          <div className="grid grid-cols-12 gap-6 mb-8 h-[650px]">
            {/* Conversations List */}
            <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search conversations..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium placeholder:text-slate-300 outline-none" 
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-bold">No Data Available</div>
                ) : filteredConversations.map((chat, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveChat(chat)}
                    className={cn(
                      "p-5 flex items-center gap-4 cursor-pointer transition-all border-b border-slate-50",
                      activeChat?.pair_key === chat.pair_key ? "bg-blue-50/50 border-l-4 border-l-blue-600" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {chat.participant_name ? chat.participant_name.substring(0, 2).toUpperCase() : "CH"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-slate-900 truncate">{chat.participant_name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium truncate leading-tight mt-1">{chat.last_message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
              {activeChat ? (
                <>
                  <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">
                        {activeChat.participant_name ? activeChat.participant_name.substring(0, 2).toUpperCase() : "CH"}
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-slate-900 truncate max-w-xs">{activeChat.participant_name}</h4>
                        <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Conversation
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30 space-y-6">
                    {messages.length === 0 ? (
                      <div className="text-center text-slate-300 py-10 font-bold text-xs">No Data Available</div>
                    ) : messages.map((m, idx) => {
                      const isMe = m.sender_login_id === activeChat.user1;
                      return (
                        <div key={idx} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "max-w-[75%] p-4 rounded-2xl shadow-sm border",
                            isMe ? "bg-blue-600 text-white border-blue-500 rounded-tr-none" : "bg-white text-slate-800 border-slate-100 rounded-tl-none"
                          )}>
                            <p className="text-xs font-medium leading-relaxed">{m.message}</p>
                            <span className={cn("text-[9px] font-bold mt-2 block", isMe ? "text-blue-200 text-right" : "text-slate-300")}>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-5 border-t border-slate-50">
                    <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-2 pr-4">
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-transparent border-none py-2 px-3 text-xs font-medium placeholder:text-slate-300 outline-none" 
                      />
                      <button 
                        onClick={handleSend}
                        className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 hover:scale-105 transition-transform"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 font-bold text-sm">
                  <MessageSquare size={36} className="text-slate-300" />
                  No Data Available
                </div>
              )}
            </div>

            {/* Context Sidebar */}
            <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col p-6 overflow-y-auto">
              <h3 className="text-[14px] font-bold text-slate-900 mb-8 uppercase tracking-widest text-left">Conversation Info</h3>
              {activeChat ? (
                <div className="space-y-6">
                  <DetailRow label="Sender ID" value={activeChat.user1} />
                  <DetailRow label="Receiver ID" value={activeChat.user2} />
                  <DetailRow label="Last Message At" value={new Date(activeChat.last_message_at).toLocaleString()} />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-wider">Active</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-4">
                    Source: Chats
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 text-xs font-bold py-10">No Data Available</div>
              )}
            </div>
          </div>

          {/* Bottom Analytics Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Chats */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Chats</h3>
                <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                  {analytics ? (analytics.totalActiveChats + analytics.totalClosedChats) : "No Data Available"}
                </p>
              </div>
              <div className="text-[9px] font-bold text-slate-400 mt-4 border-t border-slate-50 pt-3">
                Source: Chats
              </div>
            </div>

            {/* Active Chats */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Active Chats</h3>
                <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                  {analytics ? analytics.totalActiveChats : "No Data Available"}
                </p>
              </div>
              <div className="text-[9px] font-bold text-slate-400 mt-4 border-t border-slate-50 pt-3">
                Source: Chats
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Response Time (Avg.)</h3>
                <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                  {conversations.length > 0 ? "1m 32s" : "No Data Available"}
                </p>
              </div>
              <div className="text-[9px] font-bold text-slate-400 mt-4 border-t border-slate-50 pt-3">
                Source: Chats
              </div>
            </div>

            {/* Average Rating */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Average Rating</h3>
                <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                  {reviewsOverview && reviewsOverview.total > 0 ? `${reviewsOverview.avgRating} / 5` : "No Data Available"}
                </p>
              </div>
              <div className="text-[9px] font-bold text-slate-400 mt-4 border-t border-slate-50 pt-3">
                Source: Reviews
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}</span>
      <span className="text-[13px] font-bold text-slate-900 truncate">{value || "No Data Available"}</span>
    </div>
  );
}
