import React, { useState, useEffect } from "react";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { fetchJson } from "../../utils/api";
import { Plus, Trash2, MessageSquare, Clock } from "lucide-react";

export default function ChatTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTmpl, setNewTmpl] = useState({ title: "", message: "", type: "quick_reply" });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/chat/admin/templates");
      if (res.success) setTemplates(res.templates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTmpl.title || !newTmpl.message) return alert("Title and Message required");
    try {
      const res = await fetchJson("/api/chat/admin/templates", {
        method: "POST",
        body: JSON.stringify(newTmpl)
      });
      if (res.success) {
        setIsModalOpen(false);
        setNewTmpl({ title: "", message: "", type: "quick_reply" });
        loadTemplates();
      }
    } catch (err) {
      alert("Error creating template");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      const res = await fetchJson(`/api/chat/admin/templates/${id}`, { method: "DELETE" });
      if (res.success) loadTemplates();
    } catch (err) {
      alert("Error deleting template");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Chat Templates"
        subtitle="Manage quick replies and automated messages."
        breadcrumbs={[
          { label: "Chat Management" },
          { label: "Templates", active: true }
        ]}
        actions={
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <Plus size={16} /> New Template
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <div className="p-8">Loading...</div> : templates.length === 0 ? <div className="p-8 text-slate-400">No templates found.</div> : null}
        
        {templates.map(t => (
          <div key={t._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MessageSquare size={14} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t.type.replace('_', ' ')}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(t._id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
            </div>
            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">"{t.message}"</p>
            <div className="mt-auto flex justify-between items-center text-[10px] text-slate-400 font-bold">
              <span className="flex items-center gap-1"><Clock size={12}/> {new Date(t.createdAt).toLocaleDateString()}</span>
              {t.ownerLoginId === 'SUPER_ADMIN' ? <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Global</span> : null}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-4">Create Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                <input value={newTmpl.title} onChange={e => setNewTmpl({...newTmpl, title: e.target.value})} className="w-full border-slate-200 rounded-xl text-sm" placeholder="e.g. Greeting" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                <select value={newTmpl.type} onChange={e => setNewTmpl({...newTmpl, type: e.target.value})} className="w-full border-slate-200 rounded-xl text-sm">
                  <option value="quick_reply">Quick Reply</option>
                  <option value="welcome">Welcome</option>
                  <option value="away">Away</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Message</label>
                <textarea value={newTmpl.message} onChange={e => setNewTmpl({...newTmpl, message: e.target.value})} className="w-full border-slate-200 rounded-xl text-sm" rows={4} placeholder="Type the automated response..."></textarea>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700">Save Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
