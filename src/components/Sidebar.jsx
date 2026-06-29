import React, { useState } from "react";
import { 
  LayoutDashboard, Users, Building2, Wallet, 
  MessageSquare, BarChart3, Calendar, Star, 
  ShieldCheck, Headphones, Settings, LogOut,
  ChevronDown, ChevronRight, Menu, X, Bell,
  Search, User, Globe, Target, Home, 
  UserPlus, ClipboardList, Briefcase, FileText,
  CreditCard, IndianRupee, RotateCcw, AlertCircle,
  BarChart, PieChart, Activity, Shield, LayoutGrid,
  FileSearch, CheckCircle2, History, MessageCircle,
  Headset, ShieldAlert, Zap, ClipboardCheck
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogoutDialog } from "./superadmin/LogoutDialog";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/superadmin/superadmin" },
  { 
    label: "Home", 
    icon: Home, 
    path: "/superadmin/home-overview",
    children: [
      { label: "Overview", path: "/superadmin/home-overview" },
      { label: "Total Properties", path: "/superadmin/properties" },
      { label: "Total Tenants", path: "/superadmin/tenant" },
      { label: "Revenue Overview", path: "/superadmin/accounting" },
      { label: "Alerts (Pending Rent)", path: "/superadmin/rentcollection" },
    ]
  },
  { 
    label: "User Management", 
    icon: Users, 
    path: "/superadmin/user-overview", 
    children: [
        { label: "Overview", path: "/superadmin/user-overview" },
        { 
          label: "Team Management", 
          children: [
            { 
              label: "All Staff", 
              children: [
                { label: "Profile", path: "/superadmin/manager" },
                { label: "Documents", path: "/superadmin/profile" },
              ]
            }
          ]
        },
        { label: "Roles & Permission", path: "/superadmin/roles-permissions" },
        { 
          label: "Attendance", 
          children: [
            { label: "Daily Logs", path: "/superadmin/log" },
            { label: "Leave", path: "/superadmin/log" },
            { label: "Shifts", path: "/superadmin/log" },
          ]
        },
        { 
          label: "Property Owners", 
          children: [
            { label: "View All Property Owners", path: "/superadmin/owner" },
            { label: "Add", path: "/superadmin/owner?view=add" },
            { label: "Approved / Pending", path: "/superadmin/owner?view=pending" },
            { label: "KYC / Documents", path: "/superadmin/owner?view=kyc" },
            { label: "Agreements", path: "/superadmin/owner?view=agreements" },
          ]
        },
        { 
          label: "Tenants", 
          children: [
            { label: "View All Tenants", path: "/superadmin/tenant" },
            { label: "Add Tenant", path: "/superadmin/add-tenant" },
            { label: "KYC / Documents", path: "/superadmin/kyc_verification" },
            { label: "Rent History", path: "/superadmin/rentcollection" },
            { label: "Agreements", path: "/superadmin/tenant" },
          ]
        },
    ]
  },
  { 
    label: "Property Management", 
    icon: Building2, 
    path: "/superadmin/property-overview", 
    children: [
        { label: "Overview", path: "/superadmin/property-overview" },
        { label: "Total Properties", path: "/superadmin/total-properties" },
        { label: "Add Property", path: "/superadmin/add-property" },
        { label: "Approve / Reject Properties", path: "/superadmin/property/approvals" },
        { label: "Employee Property Approvals", path: "/superadmin/employee-properties" },
        { label: "Pending Properties", path: "/superadmin/property/pending" },
        { label: "All Properties List", path: "/superadmin/properties?view=list" },
        { label: "Rooms Management", path: "/superadmin/rooms" },
        { label: "Online Leads", path: "/superadmin/enquiry" },
        { label: "Web Enquiries", path: "/superadmin/websiteenq" },
        { label: "Property Categories", path: "/superadmin/property/categories" },
    ]
  },
  { 
    label: "Accounting", 
    icon: Wallet, 
    path: "/superadmin/accounting", 
    children: [
        { label: "Overview", path: "/superadmin/accounting" },
        { 
          label: "Transaction Management (Tenants)", 
          children: [
            { label: "Monthly Payment Receipt", path: "/superadmin/accounting/invoices" },
            { label: "Payment History", path: "/superadmin/accounting/transactions" },
            { label: "Other Charges", path: "/superadmin/accounting/transactions" },
            { label: "Payment Tracking", path: "/superadmin/accounting/transactions" },
          ]
        },
        { 
          label: "Transaction Management (Owners)", 
          children: [
            { label: "Monthly Payment Receipt", path: "/superadmin/accounting/invoices" },
            { label: "Payment History", path: "/superadmin/accounting/transactions" },
            { label: "Service Fees Details", path: "/superadmin/accounting/commission" },
          ]
        },
        { 
          label: "Owner Payout", 
          children: [
            { label: "Payout Cycle", path: "/superadmin/accounting/payouts" },
            { label: "Manual + Auto Payout Option", path: "/superadmin/accounting/payouts" },
            { label: "Pending Payouts", path: "/superadmin/accounting/payouts" },
            { label: "Bank Transfer Tracking", path: "/superadmin/accounting/payouts" },
            { label: "Cash Received Details", path: "/superadmin/accounting/payouts" },
            { label: "Failed Payout Alerts", path: "/superadmin/accounting/payouts" },
          ]
        },
        { 
          label: "Roomhy Overview", 
          children: [
            { label: "Fixed Fees", path: "/superadmin/accounting/commission" },
            { label: "Per Bed Fees", path: "/superadmin/accounting/commission" },
            { label: "Commission Management", path: "/superadmin/accounting/commission" },
            { label: "Discount Management", path: "/superadmin/accounting/commission" },
            { label: "Revenue Tracking", path: "/superadmin/accounting/transactions" },
          ]
        },
        { 
          label: "Invoice System", 
          children: [
            { label: "Auto Invoice Generation", path: "/superadmin/accounting/invoices" },
            { label: "GST", path: "/superadmin/accounting/taxes" },
            { label: "Download PDF", path: "/superadmin/accounting/invoices" },
            { label: "Invoice Numbering System", path: "/superadmin/accounting/invoices" },
          ]
        },
        { 
          label: "Refund Management", 
          children: [
            { label: "Booking Amount Refund", path: "/superadmin/refund" },
            { label: "Partial Refund", path: "/superadmin/refund" },
            { label: "Refund Approval System", path: "/superadmin/refund" },
            { label: "Refund History", path: "/superadmin/refund" },
          ]
        },
        { 
          label: "Alert & Automation", 
          children: [
            { label: "Rent Due Reminder", path: "/superadmin/accounting/settings" },
            { label: "Payment Success/Failure Alerts", path: "/superadmin/accounting/settings" },
            { label: "Payout Processed Notification", path: "/superadmin/accounting/settings" },
          ]
        },
        { 
          label: "Analytics", 
          children: [
            { label: "Roomhy Monthly Revenue", path: "/superadmin/accounting/reports" },
            { label: "Owners Monthly Revenue", path: "/superadmin/accounting/reports" },
            { label: "Due Rents", path: "/superadmin/accounting/reports" },
            { label: "Profit / Loss Report", path: "/superadmin/accounting/reports" },
            { label: "Cashflow Dashboard", path: "/superadmin/accounting-overview" },
            { label: "Transaction Reports", path: "/superadmin/accounting/reports" },
          ]
        },
    ]
  },
  { 
    label: "Chat Management", 
    icon: MessageSquare, 
    path: "/superadmin/superchat",
    children: [
        { label: "Live Conversations", path: "/superadmin/superchat" },
        { label: "Moderation & Filters", path: "/superadmin/chat/moderation" },
        { label: "Alerts & Violations", path: "/superadmin/chat/alerts" },
        { label: "Templates / Auto Messages", path: "/superadmin/chat/templates" },
        { label: "Lead -> Chat Mapping", path: "/superadmin/chat/leads" },
        { label: "Settings", path: "/superadmin/chat/settings" },
    ]
  },
  { 
    label: "Visit Reports", 
    id: "visits",
    icon: ClipboardCheck, 
    path: "/superadmin/visit",
  },
  { 
    label: "Report & Analytics", 
    icon: BarChart3, 
    path: "/superadmin/reports",
    children: [
        { label: "Overview", path: "/superadmin/reports" },
        { label: "Property Performance", path: "/superadmin/reports/performance" },
        { label: "Location Wise Data", path: "/superadmin/reports/locations" },
        { label: "Occupancy Rate", path: "/superadmin/reports/occupancy" },
        { label: "Growth Analytics", path: "/superadmin/reports/growth" },
        { label: "Staff Performance Reports", path: "/superadmin/reports/staff" },
        { label: "Revenue Report", path: "/superadmin/reports/revenue" },
    ]
  },
  { 
    label: "Booking & Leads", 
    icon: Calendar, 
    path: "/superadmin/booking",
    children: [
        { label: "Overview", path: "/superadmin/booking" },
        { label: "Total Leads", path: "/superadmin/booking/leads" },
        { label: "Bookings", path: "/superadmin/direct-bookings" },
        { label: "Conversion Rate", path: "/superadmin/booking/conversion" },
        { label: "Top Performing Locations", path: "/superadmin/booking/locations" },
    ]
  },
  { 
    label: "Review", 
    icon: Star, 
    path: "/superadmin/reviews",
    children: [
        { label: "Overview", path: "/superadmin/reviews" },
        { label: "All Reviews", path: "/superadmin/reviews/all" },
        { label: "Moderation", path: "/superadmin/reviews/moderation" },
        { label: "Analytics", path: "/superadmin/reviews/analytics" },
        { label: "New Review Feed", path: "/superadmin/reviews/new" },
    ]
  },
  { 
    label: "Support", 
    icon: Headphones, 
    path: "/superadmin/complaint-history",
    children: [
        { label: "Overview", path: "/superadmin/complaint-history" },
        { label: "Tenants Complaints", path: "/superadmin/complaints/tenants" },
        { label: "Owners Complaints", path: "/superadmin/complaints/owners" },
        { label: "Tickets System", path: "/superadmin/support/tickets" },
        { label: "Website Queries", path: "/superadmin/support/website-queries" },
        { label: "Issues Resolution Tracking", path: "/superadmin/support/resolution" },
    ]
  },
  { label: "CRM", id: "crm", icon: Target, path: "/superadmin/enquiry" },
  { label: "Subscription Control", id: "subscription_control", icon: ShieldCheck, path: "/superadmin/pricing" },
  { label: "Settings", id: "settings", icon: Settings, path: "/superadmin/settings" },
];

const getFilteredNav = () => {
  try {
    let rawUser = null;
    try {
      rawUser = sessionStorage.getItem("manager_user") ||
                sessionStorage.getItem("user") ||
                localStorage.getItem("staff_user") ||
                localStorage.getItem("manager_user") ||
                localStorage.getItem("user") ||
                "null";
    } catch (e) {}
    const user = JSON.parse(rawUser);
    const role = String(user?.role || "").toLowerCase();
    if (role === "employee" || role === "areamanager" || role === "manager") {
      let perms = user.permissions || [];
      // Normalize permissions to an array of strings
      if (typeof perms === "string") {
        perms = perms.split(",").map(p => p.trim());
      } else if (Array.isArray(perms)) {
        perms = perms.map(p => (typeof p === "object" ? p.id || p.value || p.key : p));
      }
      
      const allowedNav = NAV.filter(item => {
        // Find the id from allPermissions mapping
        let id = item.id;
        if (!id) {
          id = item.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
        }
        return id === "visits" || perms.includes(id);
      });

      // Rewrite paths to /employee/ for employees
      const rewritePaths = (items) => items.map(item => {
        let newPath = item.path;
        if (newPath) {
          if (newPath === "/superadmin/superadmin") {
            newPath = "/employee/areaadmin";
          } else if (newPath === "/superadmin/index") {
            newPath = "/employee/index";
          } else {
            newPath = newPath.replace("/superadmin/", "/employee/");
          }
        }
        return {
          ...item,
          path: newPath,
          children: item.children ? rewritePaths(item.children) : undefined
        };
      });

      return rewritePaths(allowedNav);
    }
  } catch (e) {
    console.error("Failed to parse user for sidebar filtering", e);
  }
  return NAV;
};

export function Sidebar({ open, isMobile, onClose, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [openMenus, setOpenMenus] = useState({ "Review": true, "Support": true });

  const resolveUser = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("manager_user") ||
        sessionStorage.getItem("user") ||
        localStorage.getItem("staff_user") ||
        localStorage.getItem("manager_user") ||
        localStorage.getItem("user") ||
        "{}"
      );
    } catch {
      return {};
    }
  };
  const user = resolveUser();
  const userName = user?.name || "User";
  const roleLower = String(user?.role || "").toLowerCase();
  const userRole = (roleLower === "employee" || roleLower === "areamanager" || roleLower === "manager") 
    ? (user?.team || "Area Admin") 
    : (user?.role || "Superadmin");
  const initial = userName.charAt(0).toUpperCase();

  const toggleMenu = (e, label) => {
    e.stopPropagation();
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.clear();
      localStorage.clear();
      navigate("/superadmin/index");
    }
  };

  const isPathActive = (item) => {
    if (item.path && location.pathname === item.path) return true;
    if (item.children) return item.children.some(c => isPathActive(c));
    return false;
  };

  const renderNavItems = (items, level = 0) => {
    return items.map((item) => {
      const Icon = item.icon;
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = openMenus[item.label];
      const isActive = isPathActive(item);

      return (
        <div key={item.label} className="space-y-1">
          <div
            onClick={(e) => hasChildren ? toggleMenu(e, item.label) : navigate(item.path)}
            className={cn(
              "w-full flex items-center justify-between transition-all group cursor-pointer",
              level === 0 ? "px-4 py-3 rounded-xl mb-0.5" : "px-4 py-1.5 rounded-lg ml-2",
              isActive && !hasChildren && level === 0
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : isActive && !hasChildren && level > 0
                  ? "text-blue-400 font-bold"
                  : isActive && hasChildren
                    ? "text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              {Icon && <Icon size={18} className={cn(isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />}
              <span className={cn(
                "font-bold truncate",
                level === 0 ? "text-sm" : level === 1 ? "text-[11px] opacity-90" : "text-[10px] opacity-70"
              )} title={item.label}>{item.label}</span>
            </div>
            {hasChildren && (
              isOpen ? <ChevronDown size={12} className="opacity-40" /> : <ChevronRight size={12} className="opacity-40" />
            )}
          </div>

          {/* Nested Children with Vertical Connector Line */}
          {hasChildren && isOpen && (
            <div className={cn(
              "ml-6 border-l border-slate-800/80 space-y-0.5", 
              level === 0 ? "pb-2 mt-1" : "pb-1"
            )}>
              {renderNavItems(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const sidebarClasses = cn(
    "w-72 h-screen bg-[#0F172A] text-slate-300 flex flex-col z-50 shrink-0 transition-transform duration-300",
    isMobile ? "fixed left-0 top-0" : "relative",
    isMobile && !open ? "-translate-x-full" : "translate-x-0"
  );

  return (
    <>
      <aside className={sidebarClasses}>
        {/* Header - Profile from Screenshot */}
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-white/10 shadow-lg shadow-blue-600/20">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-none truncate">{userName}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-widest truncate">{userRole}</p>
          </div>
        </div>

        {/* Navigation - No Numbers, Extreme Left Alignment */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-0.5 custom-scrollbar pb-6">
          {renderNavItems(getFilteredNav())}

          <div className="pt-4 mt-4 border-t border-slate-800/50">
             <button 
               onClick={() => setShowLogoutDialog(true)}
               className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all group"
             >
                <LogOut size={18} />
                <span className="text-sm font-semibold">Logout</span>
             </button>
          </div>
        </nav>

        {/* Sidebar Footer Card */}
        <div className="p-4 mt-auto shrink-0">
           <div className="bg-[#1E293B] rounded-2xl p-5 border border-slate-800 shadow-xl">
              <h4 className="text-xs font-bold text-white mb-1">Need Help?</h4>
              <p className="text-[10px] text-slate-500 mb-4 leading-tight">Contact our support team for specialized assistance</p>
              <button className="w-full py-2.5 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                Contact Support
              </button>
           </div>
        </div>
      </aside>

      {/* Logout Dialog */}
      <LogoutDialog 
        open={showLogoutDialog} 
        onClose={() => setShowLogoutDialog(false)} 
        onConfirm={handleLogout} 
      />
    </>
  );
}

export default Sidebar;
