import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  UserPlus, ShieldCheck, Mail, Phone, 
  Briefcase, IndianRupee, FileText, CheckCircle2, AlertCircle
} from "lucide-react";
import { apiFetch } from "../../services/api";

export default function AddStaffPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [formData, setFormData] = useState({
    name: "",
    role: "Warden",
    phone: "",
    email: "",
    salary: "",
    shift: "Day Shift (09:00 AM - 06:00 PM)",
    aadhaar: ""
  });
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // 1. Generate loginId
      const loginId = `${formData.name.replace(/\s+/g, '').toLowerCase()}_${Date.now().toString().slice(-4)}`;
      
      // Generate a secure 8-character random password
      const password = Math.random().toString(36).slice(-8).toUpperCase();

      // 2. Create Employee
      const empData = await apiFetch('/api/employees', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          loginId: loginId,
          phone: formData.phone,
          email: formData.email,
          password: password,
          role: formData.role,
          parentLoginId: owner.loginId
        })
      });
      if (!empData || !empData.data) throw new Error(empData?.error || 'Failed to create staff');
      
      const employeeId = empData.data._id;

      // 3. Setup Salary
      await apiFetch('/api/hr/salaries', {
        method: 'POST',
        body: JSON.stringify({
          employeeId,
          ownerLoginId: owner.loginId,
          month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          baseSalary: Number(formData.salary) || 0,
          status: 'Pending'
        })
      });

      // 4. Setup Shift
      let startTime = "09:00 AM";
      let endTime = "06:00 PM";
      if (formData.shift.includes("Night")) {
        startTime = "08:00 PM";
        endTime = "08:00 AM";
      }
      await apiFetch('/api/hr/shifts', {
        method: 'POST',
        body: JSON.stringify({
          employeeId,
          ownerLoginId: owner.loginId,
          shiftName: formData.shift.split(" ")[0] + " Shift",
          startTime,
          endTime,
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        })
      });

      setSuccessData({ loginId, password });
      setTimeout(() => {
        setSuccessData(null);
        setFormData({ name: "", role: "Warden", phone: "", email: "", salary: "", shift: "Day Shift (09:00 AM - 06:00 PM)", aadhaar: "" });
      }, 10000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Add New Staff" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Add New Staff</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Register a new team member, assign job roles, shift timings, and monthly salary.</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-soft space-y-6">
        <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Staff Profile Information</h3>
        
        {successData && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
              <CheckCircle2 size={18} className="text-emerald-600 animate-bounce" /> Staff registered successfully & Credentials Email sent!
            </div>
            <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-emerald-100 text-xs">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Login ID</span>
                <code className="text-sm font-black text-blue-600 tracking-wider">{successData.loginId}</code>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Access Password</span>
                <code className="text-sm font-black text-slate-800 tracking-wider">{successData.password}</code>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Please note down these credentials. An email containing these details has also been dispatched to the employee's inbox.</p>
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Full Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Job Designation / Role</label>
              <select 
                value={formData.role} 
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all cursor-pointer"
              >
                <option value="Warden">Property Warden</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Security Guard">Security Guard</option>
                <option value="Housekeeping">Housekeeping Supervisor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Email Address</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. ramesh@roomhy.com"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Phone Number</label>
              <input 
                type="tel" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 99887 76655"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Monthly Salary (₹)</label>
              <input 
                type="number" 
                value={formData.salary} 
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g. 15000"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Aadhaar Card Number</label>
              <input 
                type="text" 
                value={formData.aadhaar} 
                onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                placeholder="12-digit Aadhaar"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Duty Shift Schedule</label>
              <select 
                value={formData.shift} 
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all cursor-pointer"
              >
                <option value="Day Shift (09:00 AM - 06:00 PM)">Day Shift (09:00 AM - 06:00 PM)</option>
                <option value="Night Shift (08:00 PM - 08:00 AM)">Night Shift (08:00 PM - 08:00 AM)</option>
                <option value="Flexible Shift">Flexible Hours</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/60">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Add Staff Member"} <UserPlus className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </PropertyOwnerLayout>
  );
}
