import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Bell, Check, Trash2, IndianRupee, UserCheck, AlertTriangle, 
  Settings, Info, ShieldAlert
} from "lucide-react";

export default function NotificationsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!owner?.loginId) return;
    const fetchNotifs = async () => {
      try {
        const { fetchJson } = await import("../../utils/api");
        const res = await fetchJson(`/api/notifications?toLoginId=${encodeURIComponent(owner.loginId)}`);
        if (Array.isArray(res)) {
          const formatted = res.map(n => {
            const meta = typeof n.meta === 'string' ? JSON.parse(n.meta) : (n.meta || {});
            return {
              id: n._id,
              type: n.type || "system",
              title: meta.title || n.title || "Notification",
              msg: meta.message || n.message || "",
              time: new Date(n.createdAt).toLocaleString(),
              read: n.read
            };
          });
          setNotifications(formatted);
        }
      } catch (e) {
        console.error("Failed to load notifications", e);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [owner?.loginId]);

  const handleMarkAllRead = async () => {
    try {
      const { fetchJson } = await import("../../utils/api");
      await fetchJson('/api/notifications/mark-all-read', {
        method: 'PUT',
        body: JSON.stringify({ toLoginId: owner.loginId })
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      const { fetchJson } = await import("../../utils/api");
      await fetchJson(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      // Add delete logic here if the API exists, for now just remove from state
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = notifications.filter(n => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    return n.type === activeTab;
  });

  const getIcon = (type) => {
    switch (type) {
      case "payment": return <IndianRupee size={16} className="text-emerald-600" />;
      case "kyc": return <UserCheck size={16} className="text-blue-600" />;
      case "complaint": return <AlertTriangle size={16} className="text-rose-600" />;
      default: return <Info size={16} className="text-slate-600" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case "payment": return "bg-emerald-50";
      case "kyc": return "bg-blue-50";
      case "complaint": return "bg-rose-50";
      default: return "bg-slate-50";
    }
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Notifications" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Notifications Inbox</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Stay updated on payments, complaints, KYC compliance, and staff shifts.</p>
        </div>
        <div className="flex items-center gap-2 md:mt-2">
          <button 
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-border bg-card text-[12.5px] font-semibold hover:bg-muted transition-colors"
          >
            <Check size={16} /> Mark all as read
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-muted/20">
          {["all", "unread", "payment", "kyc", "complaint"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                activeTab === tab 
                  ? "bg-foreground text-background" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Bell className="size-10 text-muted-foreground/40 mx-auto mb-3" />
              <h4 className="font-serif text-[18px] text-foreground mb-1">Inbox Empty</h4>
              <p className="text-[12.5px] text-muted-foreground">You are all caught up! No notifications in this category.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div 
                key={item.id} 
                className={`p-6 flex items-start gap-4 transition-all hover:bg-muted/10 ${
                  !item.read ? "bg-blue-50/20" : ""
                }`}
              >
                {/* Visual Type Indicator */}
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${getIconBg(item.type)}`}>
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h4 className="text-[14px] font-bold text-foreground flex items-center gap-2">
                      {item.title}
                      {!item.read && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                    </h4>
                    <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{item.msg}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!item.read && (
                    <button 
                      onClick={() => handleMarkSingleRead(item.id)}
                      className="size-8 rounded-lg hover:bg-muted flex items-center justify-center text-emerald-600"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteNotification(item.id)}
                    className="size-8 rounded-lg hover:bg-rose-50 flex items-center justify-center text-rose-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
