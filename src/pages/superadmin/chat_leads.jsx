import React, { useState, useEffect } from "react";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { fetchJson } from "../../utils/api";
import { Link2, MessageSquare, User, Building } from "lucide-react";

export default function ChatLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  
  // For mapping form
  const [selectedEnquiry, setSelectedEnquiry] = useState("");
  const [selectedChat, setSelectedChat] = useState("");
  const [mapping, setMapping] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsRes, chatsRes] = await Promise.all([
        fetchJson("/api/chat/admin/leads"),
        fetchJson("/api/chat/all-chats")
      ]);
      if (leadsRes && leadsRes.success) setLeads(leadsRes.leads || []);
      if (chatsRes && chatsRes.conversations) setChats(chatsRes.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMap = async () => {
    if (!selectedEnquiry || !selectedChat) return alert("Select both an Enquiry and a Chat to map.");
    setMapping(true);
    try {
      const res = await fetchJson("/api/chat/admin/leads/map", {
        method: "POST",
        body: JSON.stringify({ enquiryId: selectedEnquiry, chatLoginId: selectedChat })
      });
      if (res.success) {
        alert("Mapped successfully!");
        setSelectedEnquiry("");
        setSelectedChat("");
        loadData();
      }
    } catch (err) {
      alert("Error mapping chat");
    } finally {
      setMapping(false);
    }
  };

  const leadsList = Array.isArray(leads) ? leads : [];
  const chatsList = Array.isArray(chats) ? chats : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Lead to Chat Mapping"
          subtitle="Associate anonymous website chats with structured Enquiry Leads."
          breadcrumbs={[
            { label: "Chat Management" },
            { label: "Lead Mapping", active: true }
          ]}
        />
        <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm shrink-0">
          Data Source: Leads + Chats
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Link2 className="text-blue-500" size={18} /> Map New Lead</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Select Active Chat</label>
              <select value={selectedChat} onChange={e => setSelectedChat(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100">
                <option value="">-- Choose Chat --</option>
                {chatsList.map(c => (
                  <option key={c.participant_login_id} value={c.participant_login_id}>
                    {c.participant_name || c.participant_login_id}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center text-slate-300">
              <Link2 size={24} className="mx-auto" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Select Enquiry Lead</label>
              <select value={selectedEnquiry} onChange={e => setSelectedEnquiry(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100">
                <option value="">-- Choose Enquiry --</option>
                {leadsList.filter(l => !l.chatLoginId).map(l => (
                  <option key={l._id} value={l._id}>
                    {l.name} - {l.phone}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleMap} disabled={mapping} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-100 hover:bg-blue-700 transition-colors mt-4">
              {mapping ? "Mapping..." : "Link Chat to Lead"}
            </button>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-sm font-bold text-slate-900">Mapped Leads</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Lead Name</th>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Linked Chat ID</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading leads...</td></tr>
                ) : leadsList.filter(l => l.chatLoginId).length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No Data Available</td></tr>
                ) : leadsList.filter(l => l.chatLoginId).map(l => (
                  <tr key={l._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2"><User size={14} className="text-slate-400"/> {l.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">{l.email} | {l.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-slate-700 flex items-center gap-2"><Building size={14} className="text-slate-400"/> {l.property || "Unknown"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                        <MessageSquare size={12} /> {l.chatLoginId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Mapped</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
