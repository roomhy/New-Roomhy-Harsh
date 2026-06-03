import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { useNavigate } from "react-router-dom";
import { 
  UserPlus, Wallet, Receipt, FileText, Calendar, Clock,
  MessageSquare, Settings, Bell, Star, Users, ClipboardList
} from "lucide-react";

export default function QuickActionsPage() {
  const owner = getOwnerRuntimeSession();
  const navigate = useNavigate();

  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const actionCategories = [
    {
      title: "Tenants & Payments",
      actions: [
        { title: "Add New Tenant", desc: "Onboard tenant, set rent details and upload identity documents.", link: "/propertyowner/tenantrec", icon: UserPlus, color: "text-blue-600 bg-blue-50" },
        { title: "Record Rent Payment", desc: "Manually log rent payments, security deposits or other income.", link: "/propertyowner/payment", icon: Wallet, color: "text-emerald-600 bg-emerald-50" },
        { title: "Generate Invoice/Receipt", desc: "Generate a custom PDF payment receipt for printing.", link: "/propertyowner/receipts", icon: Receipt, color: "text-purple-600 bg-purple-50" },
        { title: "Review Agreements", desc: "Create, view or sign digital tenancy agreements online.", link: "/propertyowner/agreement", icon: FileText, color: "text-orange-600 bg-orange-50" }
      ]
    },
    {
      title: "Daily Operations",
      actions: [
        { title: "Daily Food Menu", desc: "Update breakfast, lunch, and dinner menus for the kitchen.", link: "/propertyowner/daily-menu", icon: Calendar, color: "text-amber-600 bg-amber-50" },
        { title: "Visitor Pass Request", desc: "Pre-approve entry passes for guests, delivery executives, or vendors.", link: "/propertyowner/visitor-passes", icon: Clock, color: "text-indigo-600 bg-indigo-50" },
        { title: "Broadcast Announcement", desc: "Send SMS or WhatsApp updates to all property residents.", link: "/propertyowner/announcements", icon: Bell, color: "text-rose-600 bg-rose-50" },
        { title: "Log Maintenance Complaint", desc: "Register tenant issues, assign staff and set priorities.", link: "/propertyowner/complaints", icon: MessageSquare, color: "text-teal-600 bg-teal-50" }
      ]
    },
    {
      title: "System & Management",
      actions: [
        { title: "Add Staff Member", desc: "Register guards, cooks, or cleaners and assign login permissions.", link: "/propertyowner/add-staff", icon: Users, color: "text-sky-600 bg-sky-50" },
        { title: "Log Attendance", desc: "Mark attendance records for staff or residents dynamically.", link: "/propertyowner/staff-attendance", icon: ClipboardList, color: "text-cyan-600 bg-cyan-50" },
        { title: "Property Preferences", desc: "Edit checkout timings, fine rates, and company settings.", link: "/propertyowner/property-settings", icon: Settings, color: "text-slate-600 bg-slate-50" }
      ]
    }
  ];

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Quick Actions" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Quick Actions</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Access immediate management actions, shortcut panels, and core task wizards.</p>
        </div>
      </div>

      <div className="space-y-8">
        {actionCategories.map((category, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              {category.title}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.actions.map((act, idx) => {
                const IconComponent = act.icon;
                return (
                  <div 
                    key={idx} 
                    onClick={() => navigate(act.link)}
                    className="border border-border rounded-2xl bg-card p-5 hover:border-primary/40 hover:shadow-soft cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${act.color}`}>
                        <IconComponent size={20} />
                      </div>
                      <h4 className="font-serif text-[18px] text-foreground mb-1.5">{act.title}</h4>
                      <p className="text-[12px] text-muted-foreground leading-normal">{act.desc}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/40 text-xs font-bold text-primary flex items-center gap-1.5">
                      Launch Wizard →
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
