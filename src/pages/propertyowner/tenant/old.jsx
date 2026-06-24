import React from 'react';
import PropertyOwnerLayout from '../../../components/propertyowner/PropertyOwnerLayout';
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from '../../../utils/propertyowner';
import { History, Search, Filter, Download, Plus } from 'lucide-react';
const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function TenantPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") {
    window.location.href = "/propertyowner/ownerlogin";
    return null;
  }
  return (
    <PropertyOwnerLayout
      owner={owner}
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <History className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">Old Tenants</h1>
              </div>
              <p className="text-blue-100 font-medium max-w-xl">Archive and manage records of tenants who have moved out.</p>
            </div>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg">
              <Plus className="w-5 h-5" /> Add New
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-sm transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-sm transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <History className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Records Found</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">Past tenant records and settlement data go here. Add your first record to get started with management.</p>
          <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            Get Started
          </button>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
