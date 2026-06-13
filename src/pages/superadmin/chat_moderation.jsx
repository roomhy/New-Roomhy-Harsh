import React, { useState } from "react";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { Filter, Shield, Plus, Trash2, Save } from "lucide-react";

export default function ChatModeration() {
  const [blockedWords, setBlockedWords] = useState(["spam", "scam", "idiot", "stupid", "paytm", "gpay"]);
  const [newWord, setNewWord] = useState("");
  const [filters, setFilters] = useState({
    blockLinks: true,
    blockPhoneNumbers: true,
    blockEmails: false,
    autoBanRepeatedOffenders: true
  });

  const handleAddWord = () => {
    if (newWord.trim() && !blockedWords.includes(newWord.trim().toLowerCase())) {
      setBlockedWords([...blockedWords, newWord.trim().toLowerCase()]);
      setNewWord("");
    }
  };

  const handleRemoveWord = (word) => {
    setBlockedWords(blockedWords.filter(w => w !== word));
  };

  const handleSave = () => {
    alert("Moderation filters saved successfully!");
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Moderation & Filters"
        subtitle="Manage blocked words, auto-filters, and chat safety rules."
        breadcrumbs={[
          { label: "Chat Management" },
          { label: "Moderation & Filters", active: true }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blocked Words Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-50">
            <Shield className="text-red-500" size={20} />
            <h3 className="text-sm font-bold text-slate-900">Blocked Keywords</h3>
          </div>
          
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
              placeholder="Enter a word to block..." 
              className="flex-1 bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <button 
              onClick={handleAddWord}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {blockedWords.map(word => (
              <span key={word} className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold">
                {word}
                <button onClick={() => handleRemoveWord(word)} className="hover:text-red-800 transition-colors">
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
            {blockedWords.length === 0 && (
              <p className="text-sm text-slate-400">No blocked words added yet.</p>
            )}
          </div>
        </div>

        {/* Auto-Filters Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-50">
            <Filter className="text-blue-500" size={20} />
            <h3 className="text-sm font-bold text-slate-900">Auto-Moderation Rules</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all">
              <input 
                type="checkbox" 
                checked={filters.blockLinks} 
                onChange={(e) => setFilters({...filters, blockLinks: e.target.checked})} 
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-bold text-slate-800">Block External Links</p>
                <p className="text-xs text-slate-500 mt-0.5">Automatically mask URLs sent by users.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all">
              <input 
                type="checkbox" 
                checked={filters.blockPhoneNumbers} 
                onChange={(e) => setFilters({...filters, blockPhoneNumbers: e.target.checked})} 
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-bold text-slate-800">Block Phone Numbers</p>
                <p className="text-xs text-slate-500 mt-0.5">Prevent users from sharing 10-digit numbers.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all">
              <input 
                type="checkbox" 
                checked={filters.blockEmails} 
                onChange={(e) => setFilters({...filters, blockEmails: e.target.checked})} 
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-bold text-slate-800">Block Email Addresses</p>
                <p className="text-xs text-slate-500 mt-0.5">Hide email addresses in messages.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all">
              <input 
                type="checkbox" 
                checked={filters.autoBanRepeatedOffenders} 
                onChange={(e) => setFilters({...filters, autoBanRepeatedOffenders: e.target.checked})} 
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-bold text-slate-800">Auto-Ban Repeated Offenders</p>
                <p className="text-xs text-slate-500 mt-0.5">Ban users after 3 moderation strikes.</p>
              </div>
            </label>
          </div>

          <div className="mt-auto pt-6 flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-slate-900/10"
            >
              <Save size={16} /> Save Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
