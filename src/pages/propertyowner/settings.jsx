import React, { useEffect, useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { clearOwnerRuntimeSession, getOwnerRuntimeSession } from "../../utils/propertyowner";
import { Building, UserCog, Shield, Globe, Lock, Check } from "lucide-react";

export default function Settings() {
  const owner = getOwnerRuntimeSession();
  
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [settings, setSettings] = useState({
    automaticRentReminders: true,
    maintenanceNotifications: true,
    emailNotifications: "all",
    language: "en"
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <PropertyOwnerLayout
      owner={owner}
      title="Settings"
      onLogout={() => {
        clearOwnerRuntimeSession();
        window.location.href = "/propertyowner/ownerlogin";
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Settings</h1>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">App preferences and configuration parameters.</p>
          </div>
          <button 
            onClick={handleSave}
            className="px-5 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 text-xs self-start sm:self-center"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" /> Saved!
              </>
            ) : "Save Changes"}
          </button>
        </div>

        <div className="space-y-6">
          {/* Property Settings Card */}
          <div className="border border-border bg-card rounded-2xl p-6 shadow-soft">
            <h3 className="text-[16px] font-bold text-foreground mb-4 flex items-center gap-2.5">
              <Building className="w-5 h-5 text-primary" />
              Property Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
                <div>
                  <p className="font-bold text-sm text-foreground">Automatic Rent Reminders</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Send automatic reminders to tenants</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.automaticRentReminders} 
                  id="reminderCheck"
                  onChange={(event) => setSettings((prev) => ({ ...prev, automaticRentReminders: event.target.checked }))} 
                  className="size-5 rounded border-border text-primary focus:ring-0 cursor-pointer accent-primary" 
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
                <div>
                  <p className="font-bold text-sm text-foreground">Maintenance Notifications</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Receive alerts for maintenance requests</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.maintenanceNotifications} 
                  id="maintCheck"
                  onChange={(event) => setSettings((prev) => ({ ...prev, maintenanceNotifications: event.target.checked }))} 
                  className="size-5 rounded border-border text-primary focus:ring-0 cursor-pointer accent-primary" 
                />
              </div>
            </div>
          </div>

          {/* Account Settings Card */}
          <div className="border border-border bg-card rounded-2xl p-6 shadow-soft">
            <h3 className="text-[16px] font-bold text-foreground mb-4 flex items-center gap-2.5">
              <UserCog className="w-5 h-5 text-primary" />
              Account Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Notifications</label>
                <select 
                  className="w-full h-11 px-4 border border-border bg-card rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 outline-none transition" 
                  value={settings.emailNotifications} 
                  onChange={(event) => setSettings((prev) => ({ ...prev, emailNotifications: event.target.value }))}
                >
                  <option value="all">All Activities</option>
                  <option value="important">Important Only</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Language</label>
                <select 
                  className="w-full h-11 px-4 border border-border bg-card rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 outline-none transition" 
                  value={settings.language} 
                  onChange={(event) => setSettings((prev) => ({ ...prev, language: event.target.value }))}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy & Security Card */}
          <div className="border border-border bg-card rounded-2xl p-6 shadow-soft">
            <h3 className="text-[16px] font-bold text-foreground mb-4 flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-primary" />
              Privacy &amp; Security
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-xl bg-muted/20 gap-4">
              <div>
                <p className="font-bold text-sm text-foreground">Password Update</p>
                <p className="text-xs text-muted-foreground mt-0.5">Secure your account by updating your credentials regularly.</p>
              </div>
              <button 
                type="button" 
                className="px-4 h-10 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-semibold text-xs transition-colors shrink-0 flex items-center gap-2 self-start sm:self-center"
              >
                <Lock className="w-3.5 h-3.5" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
