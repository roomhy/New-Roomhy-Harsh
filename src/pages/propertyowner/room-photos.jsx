import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
export default function RoomPhotos() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { window.location.href = "/propertyowner/ownerlogin"; return null; }
  return (
    <PropertyOwnerLayout owner={owner} title="Room Photos" onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}>
      <div className="mb-8"><h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Room Photos</h1>
      <p className="mt-1.5 text-[13.5px] text-muted-foreground">Upload and manage photos.</p></div>
      <div className="rounded-2xl border border-border bg-card p-12 shadow-soft flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-muted/60 rounded-full flex items-center justify-center mb-3"><span className="text-2xl">📋</span></div>
        <h3 className="font-serif text-[22px] text-foreground mb-1">Coming Soon</h3>
        <p className="text-[13.5px] text-muted-foreground">This module is under development.</p>
      </div>
    </PropertyOwnerLayout>);
}
