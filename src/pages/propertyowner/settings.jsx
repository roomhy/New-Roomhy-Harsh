import React, { useEffect, useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { 
  clearOwnerRuntimeSession, 
  getOwnerRuntimeSession,
  fetchOwnerProperties,
  fetchOwnerRooms,
  fetchOwnerTenants,
  downloadCsv
} from "../../utils/propertyowner";
import { Building, UserCog, Shield, Globe, Lock, Check, Database, Download } from "lucide-react";
import { fetchJson } from "../../utils/api";

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
  const [exporting, setExporting] = useState(false);

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      // 1. Fetch all data in parallel
      const [propertiesList, roomsResponse, tenantsList, rentsResponse, complaintsResponse] = await Promise.all([
        fetchOwnerProperties(owner.loginId, true),
        fetchOwnerRooms(owner.loginId).catch(() => ({ rooms: [] })),
        fetchOwnerTenants(owner.loginId),
        fetchJson(`/api/rents/owner/${encodeURIComponent(owner.loginId)}`).catch(() => []),
        fetchJson(`/api/complaints/owner/${encodeURIComponent(owner.loginId)}`).catch(() => [])
      ]);

      const roomsList = roomsResponse?.rooms || [];
      const rentsList = Array.isArray(rentsResponse) ? rentsResponse : rentsResponse?.rents || [];
      const complaintsList = Array.isArray(complaintsResponse) ? complaintsResponse : complaintsResponse?.complaints || [];

      // 2. Helper to trigger file download
      const downloadData = (filename, data, columnsToExtract) => {
        if (!data || data.length === 0) {
          console.warn(`No data to export for ${filename}`);
          return;
        }
        
        const rows = data.map(item => {
          const row = {};
          columnsToExtract.forEach(col => {
            const keys = col.split('.');
            let val = item;
            for (const k of keys) {
              val = val?.[k];
            }
            if (val && typeof val === 'object') {
              row[col.replace(/\./g, '_')] = JSON.stringify(val);
            } else {
              row[col.replace(/\./g, '_')] = val !== undefined && val !== null ? val : '';
            }
          });
          return row;
        });

        downloadCsv(filename, rows);
      };

      // 3. Export Properties
      if (propertiesList && propertiesList.length > 0) {
        downloadData(
          `properties_backup_${owner.loginId}.csv`, 
          propertiesList,
          ['_id', 'title', 'locationCode', 'address', 'locality', 'city', 'propertyType', 'gender', 'monthlyRent', 'isPublished', 'status', 'createdAt']
        );
      }

      // 4. Export Rooms
      if (roomsList && roomsList.length > 0) {
        downloadData(
          `rooms_backup_${owner.loginId}.csv`, 
          roomsList,
          ['_id', 'roomNo', 'type', 'beds', 'price', 'sharingType', 'isAvailable', 'status', 'createdAt']
        );
      }

      // 5. Export Tenants
      if (tenantsList && tenantsList.length > 0) {
        downloadData(
          `tenants_backup_${owner.loginId}.csv`, 
          tenantsList,
          ['_id', 'name', 'phone', 'email', 'loginId', 'roomNo', 'bedNo', 'agreedRent', 'status', 'kycStatus', 'moveInDate', 'createdAt']
        );
      }

      // 6. Export Rent Invoices
      if (rentsList && rentsList.length > 0) {
        downloadData(
          `rents_backup_${owner.loginId}.csv`, 
          rentsList,
          ['_id', 'tenantName', 'tenantLoginId', 'roomNumber', 'rentAmount', 'paidAmount', 'paymentStatus', 'paymentMethod', 'dueDate', 'createdAt']
        );
      }

      // 7. Export Complaints
      if (complaintsList && complaintsList.length > 0) {
        downloadData(
          `complaints_backup_${owner.loginId}.csv`, 
          complaintsList,
          ['_id', 'tenantName', 'tenantLoginId', 'category', 'status', 'urgency', 'description', 'createdAt']
        );
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Export backup failed:", err);
      alert("Failed to export backup data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const handleScrollAndExport = () => {
      if (window.location.hash === "#backup") {
        const element = document.getElementById("backup");
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 200);
          // Automatically trigger the data backup download files
          handleExportBackup();
        }
      }
    };
    handleScrollAndExport();
    window.addEventListener("hashchange", handleScrollAndExport);
    return () => window.removeEventListener("hashchange", handleScrollAndExport);
  }, []);

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

          {/* Data Backup & Export Card */}
          <div id="backup" className="border border-border bg-card rounded-2xl p-6 shadow-soft animate-in fade-in slide-in-from-bottom duration-200">
            <h3 className="text-[16px] font-bold text-foreground mb-4 flex items-center gap-2.5">
              <Database className="w-5 h-5 text-primary" />
              Data Backup &amp; Export
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-xl bg-muted/20 gap-4">
              <div>
                <p className="font-bold text-sm text-foreground">Complete Data Backup</p>
                <p className="text-xs text-muted-foreground mt-0.5">Download all your property details, rooms, tenant list, rent invoices, and complaints into separate CSV files.</p>
              </div>
              <button 
                type="button" 
                disabled={exporting}
                onClick={handleExportBackup}
                className="px-5 h-10 bg-primary/15 hover:bg-primary/25 text-primary rounded-xl font-semibold text-xs transition-all shrink-0 flex items-center gap-2 self-start sm:self-center disabled:opacity-50 active:scale-95 duration-200 cursor-pointer"
              >
                <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-bounce' : ''}`} />
                {exporting ? "Backing up..." : "Export Data Backup"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
