import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Clock, Landmark, User, ShieldAlert, CheckCircle, 
  IndianRupee, MessageSquare, PlusCircle
} from "lucide-react";

export default function ActivityTimelinePage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [filterType, setFilterType] = useState("all");

  const timelineEvents = [
    { id: 1, type: "payment", title: "UPI payment received", desc: "Rent payment of ₹8,500 successfully collected from Vijay Kumar (Room 101).", time: "Today, 10:14 AM", actor: "System Automator" },
    { id: 2, type: "tenant", title: "New tenant check-in complete", desc: "Amit Sharma successfully checked in and completed digital KYC validation.", time: "Today, 09:30 AM", actor: "Manager Amit" },
    { id: 3, type: "complaint", title: "Geyser complaint resolved", desc: "Geyser heating element replaced in 1st Floor washroom.", time: "Yesterday, 04:45 PM", actor: "Electrician Harish" },
    { id: 4, type: "staff", title: "Meal roster updated", desc: "Cook updated weekly menu for breakfast & dinner.", time: "Yesterday, 11:00 AM", actor: "Cook Chef Prem" },
    { id: 5, type: "payment", title: "Security deposit refunded", desc: "Refunded ₹10,000 security deposit to ex-tenant Rohan Mehra.", time: "18 May, 02:15 PM", actor: "Owner (You)" },
    { id: 6, type: "system", title: "Property configuration changed", desc: "Fine rate rule set to ₹50 per late day after the 5th of each month.", time: "15 May, 10:00 AM", actor: "Owner (You)" }
  ];

  const getIcon = (type) => {
    switch (type) {
      case "payment": return <IndianRupee size={14} />;
      case "tenant": return <User size={14} />;
      case "complaint": return <MessageSquare size={14} />;
      case "staff": return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "payment": return "bg-emerald-500 text-white";
      case "tenant": return "bg-blue-600 text-white";
      case "complaint": return "bg-rose-500 text-white";
      case "staff": return "bg-amber-500 text-white";
      default: return "bg-slate-600 text-white";
    }
  };

  const filteredEvents = timelineEvents.filter(e => {
    if (filterType === "all") return true;
    return e.type === filterType;
  });

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Activity Timeline" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Activity Timeline</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Detailed audit trail of payments, staff shifts, maintenance status changes, and settings updates.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
          {["all", "payment", "tenant", "complaint", "staff"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                filterType === type 
                  ? "bg-slate-900 text-white" 
                  : "text-muted-foreground hover:text-slate-900"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Vertical Timeline */}
        <div className="relative border-l border-border ml-4 pl-8 space-y-8 py-2">
          {filteredEvents.map((event) => (
            <div key={event.id} className="relative group">
              {/* Event Circle Anchor */}
              <span className={`absolute -left-[45px] top-1.5 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-md ${getBadgeColor(event.type)}`}>
                {getIcon(event.type)}
              </span>

              {/* Event Content Box */}
              <div className="border border-border/80 rounded-2xl p-5 hover:border-primary/40 hover:shadow-soft transition-all bg-muted/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h4 className="text-[15px] font-bold text-foreground">{event.title}</h4>
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <Clock size={12} /> {event.time}
                  </span>
                </div>
                
                <p className="text-[13px] text-muted-foreground leading-relaxed">{event.desc}</p>
                
                <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Action taken by: <strong className="text-foreground">{event.actor}</strong></span>
                  <span className="capitalize font-bold text-[10px] tracking-wider bg-muted px-2 py-0.5 rounded">
                    {event.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
