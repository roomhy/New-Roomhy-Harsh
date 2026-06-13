import React, { useState, useEffect } from "react";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { fetchJson } from "../../utils/api";
import { AlertTriangle, ShieldAlert, CheckCircle2, UserX } from "lucide-react";

export default function ChatAlerts() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadViolations();
  }, []);

  const loadViolations = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/chat/admin/violations");
      if (res.success) setViolations(res.violations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, actionTaken) => {
    try {
      const res = await fetchJson(`/api/chat/admin/violations/${id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ actionTaken })
      });
      if (res.success) {
        loadViolations();
      }
    } catch (err) {
      alert("Error resolving violation");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Moderation & Alerts"
          subtitle="Review chat violations, spam attempts, and abusive language."
          breadcrumbs={[
            { label: "Chat Management" },
            { label: "Alerts & Moderation", active: true }
          ]}
        />
        <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm shrink-0">
          Data Source: Chats
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Violation Type</th>
                <th className="px-6 py-4">Message Snippet</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading alerts...</td></tr>
              ) : violations.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 flex flex-col items-center gap-2"><ShieldAlert className="text-slate-400 w-8 h-8" /> No Data Available</td></tr>
              ) : violations.map(v => (
                <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{v.participantName || v.participantLoginId}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{v.participantLoginId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                      <AlertTriangle size={12} /> {v.violationType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="bg-slate-100 p-2 rounded-lg text-xs italic text-slate-600 max-w-xs truncate" title={v.messageSnippet}>
                      "{v.messageSnippet}"
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">
                    {new Date(v.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {v.actionTaken === 'none' ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleResolve(v._id, 'warned')} className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-[11px] font-bold transition-colors">Warn User</button>
                        <button onClick={() => handleResolve(v._id, 'blocked')} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"><UserX size={12}/> Block</button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 size={14} /> Resolved ({v.actionTaken})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
