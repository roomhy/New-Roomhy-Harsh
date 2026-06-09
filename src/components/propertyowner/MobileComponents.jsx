import React from "react";
import { ChevronRight, X, ChevronDown } from "lucide-react";

export const cn = (...classes) => classes.filter(Boolean).join(" ");

/**
 * MobileStatCard
 * Used for top-level dashboard metrics (e.g., Pending Rent, Vacant Beds)
 */
export function MobileStatCard({ title, value, subtext, icon: Icon, iconBgClass, iconTextClass, onClick, children }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden",
        onClick ? "active:scale-[0.98] transition-transform cursor-pointer" : ""
      )}
    >
      <div className="flex items-start justify-between mb-2">
        {Icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconBgClass, iconTextClass)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-[22px] font-black text-slate-900 leading-tight">{value}</h3>
        <p className="text-[12px] font-semibold text-slate-500 mt-0.5">{title}</p>
        {subtext && <p className="text-[10px] font-medium text-slate-400 mt-1">{subtext}</p>}
      </div>
      {children}
    </div>
  );
}

/**
 * MobileSectionCard
 * Used to group related content inside a white card wrapper
 */
export function MobileSectionCard({ title, actionText, onAction, children, className = "" }) {
  return (
    <div className={cn("bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden", className)}>
      {(title || actionText) && (
        <div className="flex items-center justify-between p-4 border-b border-slate-50">
          <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
          {actionText && (
            <button onClick={onAction} className="text-[12px] font-semibold text-blue-600 hover:underline">
              {actionText}
            </button>
          )}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

/**
 * MobileBottomSheet
 * Slide-up drawer for mobile actions and filters
 */
export function MobileBottomSheet({ isOpen, onClose, title, children }) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sheet */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[70] p-6 transition-transform duration-300 ease-out transform max-h-[85vh] flex flex-col",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 cursor-pointer shrink-0" onClick={onClose} />
        
        {title && (
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="text-[16px] font-black text-slate-900">{title}</h3>
            <button onClick={onClose} className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-safe">
          {children}
        </div>
      </div>
    </>
  );
}

/**
 * MobileAccordion
 * Used for expandable sections (e.g., Reports, FAQs)
 */
export function MobileAccordion({ title, children, defaultOpen = false, icon: Icon, badge }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  return (
    <div className="border border-slate-100 rounded-[16px] bg-white overflow-hidden shadow-sm mb-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-[14px] font-bold text-slate-800">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-black">{badge}</span>
          )}
        </div>
        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-200", isOpen ? "rotate-180" : "")} />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * MobileTabs
 * Horizontal scrollable pill-style tabs (Swiggy/Cred style)
 */
export function MobileTabs({ tabs, activeTab, onTabChange, className = "" }) {
  return (
    <div className={cn("w-full overflow-x-auto hide-scrollbar -mx-4 px-4 pb-3 mb-3 sticky top-0 z-30 bg-slate-50 pt-2", className)}>
      <div className="flex items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const commonClasses = cn(
            "whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm border",
            isActive 
              ? "bg-blue-600 text-white border-blue-600" 
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          );

          if (tab.href) {
            return (
              <a key={tab.id} href={tab.href} className={commonClasses}>
                {tab.label}
              </a>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={commonClasses}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * MobileEmptyState
 * Illustrated empty state for missing data
 */
export function MobileEmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5 shadow-sm border border-blue-100">
        {Icon ? <Icon className="w-8 h-8 text-blue-500" /> : <div className="w-8 h-8 text-blue-500 font-black">!</div>}
      </div>
      <h3 className="text-[18px] font-black text-slate-900 mb-2">{title}</h3>
      <p className="text-[13px] font-medium text-slate-500 mb-6 max-w-[250px] mx-auto">{description}</p>
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[13px] font-black uppercase tracking-wider shadow-md hover:bg-indigo-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
