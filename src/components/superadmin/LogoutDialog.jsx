import React from "react";
import { LogOut as LogoutIcon, X as CloseIcon } from "lucide-react";

export function LogoutDialog({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-sm p-10 text-center border border-slate-50 transform transition-all animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all"
          aria-label="Close"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
        
        {/* Exact SS Logout Icon Header */}
        <div className="mx-auto h-24 w-24 rounded-full bg-[#FFF1F2] flex items-center justify-center mb-8">
           <div className="h-16 w-16 rounded-full bg-[#FFF1F2] border-4 border-white flex items-center justify-center shadow-inner">
              <LogoutIcon className="h-8 w-8 text-[#F43F5E]" />
           </div>
        </div>
        
        {/* Exact SS Heading and Content */}
        <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">
          Logout
        </h3>
        <p className="text-sm font-bold text-slate-400 mb-10 leading-relaxed px-4">
          Are you sure you want to logout from your account?
        </p>
        
        {/* Exact SS Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 font-black text-slate-400 text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-14 rounded-2xl bg-[#F43F5E] text-white hover:bg-[#E11D48] font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-rose-500/30"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}
