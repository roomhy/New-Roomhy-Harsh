import React, { useState } from "react";
import { 
  LayoutDashboard, Building2, Users, IndianRupee, 
  BarChart3, Settings, Bell, Search, Menu, 
  LogOut, Wallet, Calendar, FileText, TrendingUp,
  AlertCircle, Star, Crown, ChevronRight, Sparkles,
  Lock, X, Check, ShieldCheck, Zap
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function OwnerLayout({ children, title, subtitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dynamic Tier Sandbox State
  const [subscriptionTier, setSubscriptionTier] = useState(() => {
    return localStorage.getItem("owner_subscription_tier") || "gold";
  });

  // Collapsible submenus state
  const [expandedMenus, setExpandedMenus] = useState({});

  // Upsell Modal State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [targetUpgradeFeature, setTargetUpgradeFeature] = useState("");

  const toggleSubmenu = (label) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  // Silver Plan Menu Structure
  const SILVER_NAV = [
    {
      label: "Dashboard",
      icon: BarChart3,
      path: "/hostelowner",
      goldOnly: false
    },
    {
      label: "My Properties",
      icon: Building2,
      goldOnly: false,
      submenus: [
        { label: "Room Lists & Facilities", path: "/hostelowner/properties", goldOnly: false },
        { label: "Active Availability Status", path: "/hostelowner/properties", goldOnly: false }
      ]
    },
    {
      label: "Tenant Directory",
      icon: Users,
      goldOnly: false,
      submenus: [
        { label: "Add Tenant Form", path: "/hostelowner/staff", goldOnly: false },
        { label: "Tenant KYC Docs", path: "/hostelowner/staff", goldOnly: false },
        { label: "Passbook & Ledgers", path: "/hostelowner/staff", goldOnly: false }
      ]
    },
    {
      label: "Rent Collections",
      icon: IndianRupee,
      goldOnly: false,
      submenus: [
        { label: "Monthly Rent Ledger", path: "/hostelowner/rent", goldOnly: false },
        { label: "Record Cash Payments", path: "/hostelowner/rent", goldOnly: false },
        { label: "Standard PDF Receipts", path: "/hostelowner/rent", goldOnly: false }
      ]
    },
    {
      label: "Daily Operations",
      icon: AlertCircle,
      goldOnly: false,
      submenus: [
        { label: "Log Complaints", path: "/hostelowner/complaints", goldOnly: false }
      ]
    },
    {
      label: "Basic SEO & Brand",
      icon: Star,
      goldOnly: false,
      submenus: [
        { label: "Basic Reviews Check", path: "/hostelowner/reviews", goldOnly: false }
      ]
    },
    {
      label: "Settings",
      icon: Settings,
      goldOnly: false,
      submenus: [
        { label: "Profile & Security", path: "/hostelowner/reports", goldOnly: false }
      ]
    }
  ];

  // Gold Plan Menu Structure
  const GOLD_NAV = [
    {
      label: "Dashboard (AI Pro)",
      icon: BarChart3,
      path: "/hostelowner",
      goldOnly: false,
      submenus: [
        { label: "Performance Charts", path: "/hostelowner", goldOnly: false },
        { label: "AI Financial Insights", path: "/hostelowner", goldOnly: false },
        { label: "AI NL Chat Assistant", path: "/hostelowner", goldOnly: false }
      ]
    },
    {
      label: "My Properties (OTA)",
      icon: Building2,
      goldOnly: false,
      submenus: [
        { label: "Listing Portfolios", path: "/hostelowner/properties", goldOnly: false },
        { label: "OTA Multi-Channel Sync", path: "/hostelowner/properties", goldOnly: true },
        { label: "Interactive Floor Maps", path: "/hostelowner/properties", goldOnly: true }
      ]
    },
    {
      label: "AI Bookings & CRM",
      icon: Calendar,
      goldOnly: true,
      submenus: [
        { label: "Lead Funnels & Call Logs", path: "/hostelowner/bookings", goldOnly: true },
        { label: "AI Booking Bot WhatsApp", path: "/hostelowner/bookings", goldOnly: true },
        { label: "Guest Visit Requests", path: "/hostelowner/bookings", goldOnly: true },
        { label: "Custom Booking Links", path: "/hostelowner/bookings", goldOnly: true }
      ]
    },
    {
      label: "Smart Tenant Hub",
      icon: Users,
      goldOnly: false,
      submenus: [
        { label: "Staff Profiles & Shifts", path: "/hostelowner/staff", goldOnly: false },
        { label: "Digital Rent Agreements", path: "/hostelowner/staff", goldOnly: true },
        { label: "Tenant Vault (Background)", path: "/hostelowner/staff", goldOnly: true },
        { label: "Tenancy Trust Score", path: "/hostelowner/staff", goldOnly: true }
      ]
    },
    {
      label: "Automated Billing",
      icon: IndianRupee,
      goldOnly: false,
      submenus: [
        { label: "Rent Ledger", path: "/hostelowner/rent", goldOnly: false },
        { label: "E-NACH Auto-Debit", path: "/hostelowner/rent", goldOnly: true },
        { label: "Split Settlement Accounts", path: "/hostelowner/rent", goldOnly: true },
        { label: "Auto Late Fine Scheduler", path: "/hostelowner/rent", goldOnly: true },
        { label: "HRA & GST Tax Invoices", path: "/hostelowner/rent", goldOnly: true }
      ]
    },
    {
      label: "AI Daily Operations",
      icon: AlertCircle,
      goldOnly: false,
      submenus: [
        { label: "Active Support Complaints", path: "/hostelowner/complaints", goldOnly: false },
        { label: "24/7 AI Helpline", path: "/hostelowner/complaints", goldOnly: true },
        { label: "Digital Food Menu & Plates", path: "/hostelowner/complaints", goldOnly: true },
        { label: "Visitor entry guest passes", path: "/hostelowner/complaints", goldOnly: true }
      ]
    },
    {
      label: "Team Management",
      icon: Wallet,
      goldOnly: true,
      submenus: [
        { label: "Staff Salary Ledgers", path: "/hostelowner/expenses", goldOnly: true },
        { label: "Staff Attendance (AI)", path: "/hostelowner/expenses", goldOnly: true },
        { label: "Employment Contracts", path: "/hostelowner/expenses", goldOnly: true }
      ]
    },
    {
      label: "Reports & Analytics",
      icon: FileText,
      goldOnly: true,
      submenus: [
        { label: "Profit & Loss Statements", path: "/hostelowner/reports", goldOnly: true },
        { label: "Vacancy & Move-Out Reports", path: "/hostelowner/reports", goldOnly: true },
        { label: "Custom CSV/PDF Exports", path: "/hostelowner/reports", goldOnly: true }
      ]
    },
    {
      label: "Brand Marketing & SEO",
      icon: Star,
      goldOnly: true,
      submenus: [
        { label: "Admission QR Code Links", path: "/hostelowner/reviews", goldOnly: true },
        { label: "Google My Business", path: "/hostelowner/reviews", goldOnly: true },
        { label: "Automated Social Posts", path: "/hostelowner/reviews", goldOnly: true }
      ]
    }
  ];

  const CURRENT_NAV = subscriptionTier === "gold" ? GOLD_NAV : SILVER_NAV;

  const handleParentClick = (e, item) => {
    if (subscriptionTier === "silver" && item.goldOnly) {
      e.preventDefault();
      setTargetUpgradeFeature(item.label);
      setUpgradeModalOpen(true);
      return;
    }

    if (item.submenus) {
      e.preventDefault();
      toggleSubmenu(item.label);
    }
  };

  const handleSubLinkClick = (e, sub) => {
    if (subscriptionTier === "silver" && sub.goldOnly) {
      e.preventDefault();
      setTargetUpgradeFeature(sub.label);
      setUpgradeModalOpen(true);
    }
  };

  const handleUpgrade = () => {
    setSubscriptionTier("gold");
    localStorage.setItem("owner_subscription_tier", "gold");
    setUpgradeModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-white font-['Plus_Jakarta_Sans'] overflow-hidden relative">
      
      {/* Premium Dark Sidebar */}
      <aside className={cn(
        "bg-[#0F172A] border-r border-white/5 text-slate-400 flex flex-col z-50 shrink-0 transition-all duration-700 ease-in-out fixed lg:relative h-screen",
        sidebarOpen ? "w-80" : "w-0 lg:w-28 -translate-x-full lg:translate-x-0"
      )}>
        
        {/* Brand Area */}
        <div className="p-8 pb-4 flex items-center gap-4 shrink-0 overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 relative group cursor-pointer hover:rotate-6 transition-transform">
             <Crown size={24} className="drop-shadow-sm animate-pulse" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <h1 className="text-xl font-black text-white tracking-tighter leading-none italic">ROOHMY</h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] italic">
                   {subscriptionTier === "gold" ? "Owner Pro Elite" : "Owner Budget"}
                 </p>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Plan Switcher */}
        {sidebarOpen && (
          <div className="px-6 mb-6">
            <div className="bg-white/5 rounded-2xl p-1.5 border border-white/5 flex items-center justify-between gap-1">
              <button 
                onClick={() => {
                  setSubscriptionTier("silver");
                  localStorage.setItem("owner_subscription_tier", "silver");
                }}
                className={cn(
                  "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all italic text-center",
                  subscriptionTier === "silver" 
                    ? "bg-slate-700 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                Silver Plan
              </button>
              <button 
                onClick={() => {
                  setSubscriptionTier("gold");
                  localStorage.setItem("owner_subscription_tier", "gold");
                }}
                className={cn(
                  "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all italic text-center flex items-center justify-center gap-1",
                  subscriptionTier === "gold" 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 animate-pulse" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Sparkles size={10} className="text-yellow-400 fill-yellow-400" /> Gold Plan
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Nested Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-2 custom-scrollbar">
          {CURRENT_NAV.map((item) => {
            const Icon = item.icon;
            const isParentActive = location.pathname === item.path || 
              (item.submenus && item.submenus.some(sub => location.pathname === sub.path));
            const isParentLocked = subscriptionTier === "silver" && item.goldOnly;
            const isExpanded = expandedMenus[item.label];

            return (
              <div key={item.label} className="space-y-1">
                {/* Parent Menu Item */}
                <Link
                  to={item.path || "#"}
                  onClick={(e) => handleParentClick(e, item)}
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-500 group relative",
                    isParentActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                      : "text-slate-400 hover:text-white hover:bg-white/5",
                    isParentLocked && "opacity-60 hover:opacity-100"
                  )}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Icon size={18} className={cn("transition-all duration-500", isParentActive ? "scale-110" : "text-slate-500 group-hover:text-slate-300")} />
                    {sidebarOpen && (
                      <span className={cn("text-[11px] font-black uppercase tracking-widest transition-all duration-500 italic truncate", isParentActive ? "translate-x-1" : "group-hover:translate-x-1")}>
                        {item.label}
                      </span>
                    )}
                  </div>
                  
                  {sidebarOpen && (
                    <div className="flex items-center gap-2">
                      {isParentLocked && <Lock size={12} className="text-yellow-500 shrink-0" />}
                      {!isParentLocked && item.submenus && (
                        <ChevronRight 
                          size={14} 
                          className={cn("text-slate-500 transition-transform duration-300", isExpanded && "rotate-90 text-white")} 
                        />
                      )}
                    </div>
                  )}
                </Link>

                {/* Submenu Children Container */}
                {isExpanded && sidebarOpen && item.submenus && (
                  <div className="pl-6 space-y-1.5 mt-1 border-l-2 border-white/5 ml-7 animate-in slide-in-from-top-3 duration-300">
                    {item.submenus.map((sub) => {
                      const isSubActive = location.pathname === sub.path;
                      const isSubLocked = subscriptionTier === "silver" && sub.goldOnly;

                      return (
                        <Link
                          key={sub.label}
                          to={sub.path}
                          onClick={(e) => handleSubLinkClick(e, sub)}
                          className={cn(
                            "flex items-center justify-between py-2.5 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all italic",
                            isSubActive 
                              ? "bg-white/10 text-white" 
                              : "text-slate-500 hover:text-slate-300 hover:bg-white/5",
                            isSubLocked && "opacity-60 hover:opacity-100"
                          )}
                        >
                          <span className="truncate">{sub.label}</span>
                          {isSubLocked && <Lock size={10} className="text-yellow-500 shrink-0" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Profile Card Bottom */}
        <div className="p-6 mt-auto shrink-0 overflow-hidden">
          <div className="bg-white/5 rounded-[2rem] p-4 border border-white/5 relative group cursor-pointer hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm italic">
                HO
              </div>
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black text-white truncate italic leading-none mb-1.5">Hostel Owner</p>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-black truncate uppercase tracking-widest italic leading-none">owner@roomhy.com</p>
                    <p className="text-[9px] text-slate-500 font-black truncate uppercase tracking-widest italic leading-none opacity-60">
                      Tier: {subscriptionTier.toUpperCase()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Experience */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* High-End Header - Compact */}
        <header className="h-16 bg-white/80 backdrop-blur-3xl border-b border-slate-50 flex items-center justify-between px-8 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 flex items-center justify-center rounded-xl transition-all border border-slate-100 group">
              <Menu size={18} className="text-slate-900 group-hover:rotate-90 transition-transform" />
            </button>
            <div className="relative hidden lg:block group ml-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="Search portfolio..." 
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500/20 transition-all w-80 shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <HeaderAction icon={Bell} dot />
             <HeaderAction icon={Settings} />
             <div className="w-10 h-10 rounded-xl bg-indigo-50 p-0.5 border border-indigo-100 shadow-sm cursor-pointer hover:scale-105 transition-transform active:scale-95 ml-2">
                <div className="w-full h-full rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm italic">
                   HO
                </div>
             </div>
          </div>
        </header>

        {/* Content Flow - Compact Padding */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
          <div className="max-w-[1500px] mx-auto animate-in fade-in duration-1000 slide-in-from-bottom-2">
            {/* Page Title & Subtitle Section */}
            {title && (
              <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic mb-2">{title}</h1>
                {subtitle && <p className="text-sm font-bold text-slate-400 italic uppercase tracking-wider">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      {/* High-Fidelity Glassmorphism Gold Plan Upgrade Upsell Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Gradient Top Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-8 text-white relative">
              <button 
                onClick={() => setUpgradeModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X size={16} />
              </button>
              
              <div className="flex items-center gap-2 mb-3">
                 <div className="p-1.5 bg-yellow-400/20 text-yellow-300 rounded border border-yellow-400/30">
                    <Sparkles size={14} className="fill-yellow-300" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-yellow-300">Premium Upgrade</span>
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter">Unlock {targetUpgradeFeature}</h3>
              <p className="text-[11px] text-indigo-100 font-semibold mt-1">Upgrade to the Gold Plan to automate collections, analytics, and operational tasks.</p>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Gold Plan Exclusive Privileges:</p>
                
                <div className="grid grid-cols-1 gap-3">
                  <UpgradeFeature label="AI Smart Analytics & NL Report Assistant" />
                  <UpgradeFeature label="E-NACH Auto-Debit & Split Bank Settlements" />
                  <UpgradeFeature label="Unified Multi-Platform OTA Calendar Sync" />
                  <UpgradeFeature label="24/7 AI Tenant Helpline & Food Menu tracker" />
                  <UpgradeFeature label="Move-In/Move-Out damaged checklists" />
                </div>
              </div>

              {/* Pricing Info Card */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic block leading-none mb-1">Difference</span>
                  <span className="text-lg font-black text-slate-900 italic tracking-tighter">Just +₹20 / bed / month</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic block leading-none mb-1">Total Fee</span>
                  <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 inline-block tracking-tighter">₹59 / bed</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button 
                  onClick={() => setUpgradeModalOpen(false)}
                  className="flex-1 py-3.5 border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all italic text-center"
                >
                  Maybe Later
                </button>
                <button 
                  onClick={handleUpgrade}
                  className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition-all italic text-center flex items-center justify-center gap-2"
                >
                  <Zap size={14} className="fill-white" /> Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HeaderAction({ icon: Icon, dot }) {
  return (
    <button className="w-10 h-10 bg-slate-50 hover:bg-white hover:shadow-md hover:shadow-indigo-50 flex items-center justify-center rounded-xl transition-all border border-slate-100 relative group active:scale-90">
      <Icon size={18} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
      {dot && (
        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white"></span>
      )}
    </button>
  );
}

function UpgradeFeature({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
        <Check size={12} className="stroke-[2.5]" />
      </div>
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </div>
  );
}
