import React, { useState, useEffect } from "react";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { fetchJson, getApiBase } from "../../utils/api";
import { Save, Bot, Clock, Shield, UploadCloud } from "lucide-react";

export default function ChatSettings() {
  const [settings, setSettings] = useState({
    enableAutoWelcome: true,
    autoWelcomeMessage: "Welcome! How can we help you today?",
    enableAutoAway: false,
    autoAwayMessage: "We are currently away. Please leave a message.",
    businessHoursStart: "09:00",
    businessHoursEnd: "18:00",
    strictModeration: true,
    blockContactSharing: true,
    maxFileSizeMB: 5
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJson("/api/chat/admin/settings")
      .then(res => {
        if (res.success && res.settings) {
          setSettings(res.settings);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchJson("/api/chat/admin/settings", {
        method: "POST",
        body: JSON.stringify(settings)
      });
      if (res.success) {
        alert("Settings saved successfully!");
      }
    } catch (err) {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Chat Settings"
        subtitle="Global configurations for the chat system."
        breadcrumbs={[
          { label: "Chat Management" },
          { label: "Settings", active: true }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
            <Bot className="text-blue-500" />
            <h3 className="text-sm font-bold">Auto Messages</h3>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <input type="checkbox" checked={settings.enableAutoWelcome} onChange={e => setSettings({...settings, enableAutoWelcome: e.target.checked})} className="rounded text-blue-600" />
              Enable Welcome Message
            </label>
            <textarea 
              value={settings.autoWelcomeMessage}
              onChange={e => setSettings({...settings, autoWelcomeMessage: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100"
              rows={3}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <input type="checkbox" checked={settings.enableAutoAway} onChange={e => setSettings({...settings, enableAutoAway: e.target.checked})} className="rounded text-blue-600" />
              Enable Away Message
            </label>
            <textarea 
              value={settings.autoAwayMessage}
              onChange={e => setSettings({...settings, autoAwayMessage: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
              <Shield className="text-red-500" />
              <h3 className="text-sm font-bold">Moderation & Security</h3>
            </div>
            
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={settings.strictModeration} onChange={e => setSettings({...settings, strictModeration: e.target.checked})} className="rounded text-blue-600" />
              Strict Moderation (Auto-flag profanity)
            </label>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={settings.blockContactSharing} onChange={e => setSettings({...settings, blockContactSharing: e.target.checked})} className="rounded text-blue-600" />
              Block Phone/Email sharing by users
            </label>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
              <Clock className="text-emerald-500" />
              <h3 className="text-sm font-bold">Business Hours</h3>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Start Time</label>
                <input type="time" value={settings.businessHoursStart} onChange={e => setSettings({...settings, businessHoursStart: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">End Time</label>
                <input type="time" value={settings.businessHoursEnd} onChange={e => setSettings({...settings, businessHoursEnd: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
          <Save size={16} /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
