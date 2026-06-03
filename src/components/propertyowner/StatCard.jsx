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
    <div className={["rounded-2xl border border-border p-5 shadow-soft", tones[tone]].join(" ")}>
      <div className="flex items-start justify-between">
        <div className="text-[12.5px] font-medium text-muted-foreground">{label}</div>
        {Icon && (
          <div className={["size-8 w-8 h-8 rounded-lg flex items-center justify-center", iconTones[tone]].join(" ")}>
            <Icon className="size-4 w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-2.5 font-serif text-[30px] leading-none text-foreground">{value}</div>
      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <span className={[
            "inline-flex items-center gap-0.5 text-[11.5px] font-medium rounded-full px-1.5 py-0.5",
            trend.up ? "bg-success/15 text-success-foreground" : "bg-destructive/10 text-destructive"
          ].join(" ")}>
            {trend.up ? <ArrowUpRight className="size-3 w-3 h-3" /> : <ArrowDownRight className="size-3 w-3 h-3" />}
            {trend.value}
          </span>
        )}
        {hint && <span className="text-[11.5px] text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
