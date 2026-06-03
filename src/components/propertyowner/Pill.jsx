import React from "react";

const tones = {
  success: "bg-success/15 text-success-foreground",
  warning: "bg-warning/25 text-warning-foreground",
  info: "bg-info/15 text-info-foreground",
  danger: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
  primary: "bg-primary/12 text-primary",
};

export function Pill({
  children, tone = "muted", className = "",
}) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11.5px] font-medium rounded-full px-2 py-0.5 ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
