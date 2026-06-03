import React, { useEffect } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { FileText, Upload, Info } from "lucide-react";

export default function Documents() {
  const owner = getOwnerRuntimeSession();
  
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Documents"
      onLogout={() => { 
        clearOwnerRuntimeSession(); 
        window.location.href = "/propertyowner/ownerlogin"; 
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Legal & Agreements</h1>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">Legally signed tenant agreements and compliance documents.</p>
          </div>
        </div>

        <div className="border border-border bg-card rounded-2xl p-8 shadow-soft text-center text-muted-foreground">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Please select a documents category from the sidebar menu.</p>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
