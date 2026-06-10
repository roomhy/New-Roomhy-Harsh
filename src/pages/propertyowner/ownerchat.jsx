import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession, fetchOwnerTenants } from "../../utils/propertyowner";
import { apiFetch } from "../../services/api";
import { Search, Send, User, MoreVertical, Phone, Video, Loader2, MessageSquare } from "lucide-react";

export default function OwnerChat() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { window.location.href = "/propertyowner/ownerlogin"; return null; }

  const [activeChat, setActiveChat] = useState(null);
  const [inbox, setInbox] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingInbox, setLoadingInbox] = useState(true);
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = React.useRef(null);

  const fetchInbox = async () => {
    try {
      const [res, tenants] = await Promise.all([
        apiFetch(`/api/chat/inbox/${owner.loginId}?search=${search}`).catch(() => ({ conversations: [] })),
        fetchOwnerTenants(owner.loginId).catch(() => [])
      ]);
      
      let conversations = res?.conversations || [];
      
      if (tenants && Array.isArray(tenants)) {
        const existingLoginIds = new Set(conversations.map(c => c.participant_login_id));
        const newConversations = tenants
          .filter(t => {
            const tLoginId = t.loginId || t.tenantLoginId || t.email;
            if (!tLoginId || existingLoginIds.has(tLoginId)) return false;
            if (search) {
              const term = search.toLowerCase();
              const name = (t.name || t.fullName || "").toLowerCase();
              if (!name.includes(term)) return false;
            }
            return true;
          })
          .map(t => ({
            participant_login_id: t.loginId || t.tenantLoginId || t.email,
            participant_name: t.name || t.fullName || "Tenant",
            unread_count: 0,
            last_message: "Start a conversation"
          }));
        conversations = [...conversations, ...newConversations];
      }
      
      setInbox(conversations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInbox(false);
    }
  };

  const fetchMessages = async (targetUserId) => {
    try {
      if (!targetUserId) return;
      const res = await apiFetch(`/api/chat/conversation?user1=${owner.loginId}&user2=${targetUserId}`);
      if (res && Array.isArray(res)) {
        setMessages(res.map(msg => ({
          id: msg._id,
          sender: msg.sender_login_id === owner.loginId ? "Me" : msg.sender_name,
          text: msg.message,
          time: new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          isMe: msg.sender_login_id === owner.loginId
        })));
        scrollToBottom();
        // Mark these messages as read
        await apiFetch(`/api/chat/mark-read/${owner.loginId}?sender=${targetUserId}`, { method: "POST" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 5000);
    return () => clearInterval(interval);
  }, [owner.loginId, search]);

  React.useEffect(() => {
    if (activeChat) {
      setLoadingMessages(true);
      fetchMessages(activeChat.participant_login_id).finally(() => setLoadingMessages(false));
      
      const interval = setInterval(() => {
        fetchMessages(activeChat.participant_login_id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;
    setIsSending(true);
    
    // Optimistic UI update
    const optimisticMsg = {
      id: Date.now(),
      sender: "Me",
      text: message,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isMe: true
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setMessage("");
    scrollToBottom();

    try {
      await apiFetch("/api/chat/send", {
        method: "POST",
        body: JSON.stringify({
          from_login_id: owner.loginId,
          to_login_id: activeChat.participant_login_id,
          message: optimisticMsg.text
        })
      });
      fetchMessages(activeChat.participant_login_id);
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <PropertyOwnerLayout owner={owner} title="Messages" onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}>
      <div className="mb-6">
        <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Messages</h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">Chat with tenants and staff.</p>
      </div>
      
      <div className="flex h-[70vh] rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        {/* Sidebar / Contact List */}
        <div className="w-1/3 border-r border-border bg-muted/10 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chats..." 
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingInbox ? (
               <div className="p-8 text-center text-slate-500 flex flex-col items-center"><Loader2 size={24} className="animate-spin mb-2" />Loading...</div>
            ) : inbox.length === 0 ? (
               <div className="p-8 text-center text-slate-500 text-sm">No conversations found.</div>
            ) : inbox.map((chat, idx) => (
              <button 
                key={chat.participant_login_id || idx} 
                onClick={() => setActiveChat(chat)}
                className={`w-full text-left p-4 border-b border-border transition-colors hover:bg-muted/40 ${activeChat?.participant_login_id === chat.participant_login_id ? "bg-white border-l-4 border-l-blue-600" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <h4 className="text-sm font-bold text-slate-800 truncate pr-2">{chat.participant_name}</h4>
                       {chat.unread_count > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{chat.unread_count}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{chat.last_message || "Started a conversation"}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50/50">
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <MessageSquare size={48} className="mb-4 opacity-50" />
               <p>Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border bg-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{activeChat.participant_name}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500">Online</span>
                  </div>
                </div>
                <div className="flex gap-3 text-slate-400">
                  <Phone className="cursor-pointer hover:text-blue-600 transition" size={20} />
                  <Video className="cursor-pointer hover:text-blue-600 transition" size={20} />
                  <MoreVertical className="cursor-pointer hover:text-blue-600 transition" size={20} />
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages && messages.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">Loading messages...</div>
                ) : messages.map((msg, i) => (
                  <div key={msg.id || i} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${msg.isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"}`}>
                      <p className="text-[13px]">{msg.text}</p>
                      <span className={`text-[10px] block mt-1.5 text-right ${msg.isMe ? "text-blue-200" : "text-slate-400"}`}>{msg.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-border">
                <form onSubmit={handleSend} className="flex gap-3">
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..." 
                    disabled={isSending}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button type="submit" disabled={isSending} className="bg-blue-600 hover:bg-blue-700 text-white size-12 rounded-xl flex items-center justify-center transition-all shadow-md shadow-blue-500/20 disabled:opacity-50">
                    <Send size={20} className="ml-1" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
