import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Users, CheckCircle2, AlertCircle, ToggleLeft, 
  ToggleRight, Save, Shield
} from "lucide-react";

export default function RolePermissionsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [roles, setRoles] = useState([
    { id: 1, title: "Warden / Manager", permissions: "Full Tenant & Rents control, complaints assignment" },
    { id: 2, title: "Security Guard", permissions: "Access gate entry scans tracker, visitor logups" },
    { id: 3, title: "Accountant", permissions: "Expense audits ledger records, collections logs exporter" }
  ]);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="System Access Groups" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Role Permissions</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Define precise page limits and permissions flags for warden staff, security guards, and accountant profiles.</p>
        </div>
      </div>

      <div className="max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-soft space-y-6">
        <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">User Role Groups</h3>
        <div className="space-y-4">
          {roles.map((r) => (
            <div key={r.id} className="flex justify-between items-center border border-border p-4 rounded-xl bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-slate-800">{r.title}</h4>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">{r.permissions}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
