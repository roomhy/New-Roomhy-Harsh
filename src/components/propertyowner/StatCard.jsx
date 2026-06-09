import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatCard({
  label, value, hint, icon: Icon, trend, tone = "default",
}) {
  const tones = {
    default: "bg-card",
    success: "bg-success/10",
    warning: "bg-warning/15",
    info: "bg-info/10",
    primary: "bg-primary/8",
  };
  const iconTones = {
    default: "bg-muted text-foreground",
    success: "bg-success/20 text-success-foreground",
    warning: "bg-warning/30 text-warning-foreground",
    info: "bg-info/20 text-info-foreground",
    primary: "bg-primary/15 text-primary",
  };
  return (
    <div className={["w-[38%] md:w-auto shrink-0 snap-start rounded-[20px] border p-3.5 md:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[90px] md:min-h-auto", tones[tone], tone === "default" ? "border-slate-100 bg-white" : "border-transparent"].join(" ")}>
      <div className="flex items-center justify-between mb-2 md:mb-0">
        {Icon && (
          <div className={["w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0", iconTones[tone]].join(" ")}>
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
        )}
        {trend && (
          <span className={[
            "inline-flex items-center gap-0.5 text-[10px] md:text-[11.5px] font-black rounded-full px-1.5 py-0.5",
            trend.up ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          ].join(" ")}>
            {trend.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-auto">
        <h3 className="text-[20px] md:text-[28px] font-black text-slate-900 leading-tight">{value}</h3>
        <p className="text-[11px] md:text-[12.5px] font-bold text-slate-500 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{label}</p>
        {hint && <span className="text-[10px] text-slate-400 mt-1 block">{hint}</span>}
      </div>
    </div>
  );
}
