import React, { useMemo, useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  IndianRupee, Search, Download, CheckCircle2, 
  CreditCard, Calendar, User, ChevronRight
} from "lucide-react";
import { apiFetch } from "../../utils/api";
import { cacheGet, cacheSet } from "../../utils/cache";

export default function StaffSalariesPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const CACHE_KEY = `salaries:${owner.loginId}`;
    const cached = cacheGet(CACHE_KEY);
    if (cached) { setSalaries(cached); setLoading(false); return; }
    try {
      const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

      const empData = await apiFetch(`/api/employees?parentLoginId=${owner.loginId}`);
      const myStaff = empData.data || [];

      const salData = await apiFetch(`/api/hr/salaries/${owner.loginId}`);
      
      const currentMonthRecords = (salData.data || []).filter(s => s.month === month);
      const salMap = {};
      currentMonthRecords.forEach(s => {
        if (s.employeeId && s.employeeId._id) {
          salMap[s.employeeId._id] = s;
        } else {
          salMap[s.employeeId] = s;
        }
      });

      const merged = myStaff.map(s => {
        const record = salMap[s._id] || {};
        return {
          id: s._id,
          name: s.name,
          role: s.role,
          base: record.baseSalary || 0,
          deductions: record.deductions || 0,
          bonus: record.bonus || 0,
          net: record.netPay || 0,
          status: record.status || "Unpaid",
          month
        };
      });

      setSalaries(merged);
      cacheSet(CACHE_KEY, merged, 3 * 60 * 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaySalary = async (id, base, deductions, bonus) => {
    try {
      const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      await apiFetch('/api/hr/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: id,
          ownerLoginId: owner.loginId,
          month,
          baseSalary: base,
          deductions: deductions,
          bonus: bonus,
          status: 'Paid'
        })
      });
      setSalaries(prev => prev.map(s => s.id === id ? { ...s, status: "Paid" } : s));
    } catch (err) {
      console.error("Failed to pay salary", err);
    }
  };

  const filteredSalaries = useMemo(() => salaries.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  ), [salaries, search]);

  const totalPayroll = useMemo(() => salaries.reduce((acc, s) => acc + s.net, 0), [salaries]);
  const paidPayroll = useMemo(() => salaries.filter(s => s.status === "Paid").reduce((acc, s) => acc + s.net, 0), [salaries]);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Staff Payroll" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Staff Salaries</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage salary structures, deductions, bonuses, and release monthly staff payrolls.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Monthly Payroll</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">₹{totalPayroll.toLocaleString("en-IN")}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Disbursed Balance</span>
          <h3 className="text-[28px] font-bold text-emerald-600 mt-1">₹{paidPayroll.toLocaleString("en-IN")}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider font-bold text-rose-600">Pending Disbursal Balance</span>
          <h3 className="text-[28px] font-bold text-rose-600 mt-1">₹{(totalPayroll - paidPayroll).toLocaleString("en-IN")}</h3>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search salaries ledger by staff name or role..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Salaries Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Staff Name</th>
                <th className="px-6 py-3.5 font-semibold">Role</th>
                <th className="px-6 py-3.5 font-semibold">Base Salary</th>
                <th className="px-6 py-3.5 font-semibold">Deductions</th>
                <th className="px-6 py-3.5 font-semibold">Net Payable</th>
                <th className="px-6 py-3.5 font-semibold">Disbursal State</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500">Loading payroll...</td></tr>
              ) : filteredSalaries.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500">No active staff payroll records found.</td></tr>
              ) : (
                filteredSalaries.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">{s.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{s.role}</td>
                    <td className="px-6 py-4 text-muted-foreground">₹{s.base.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-rose-600 font-bold">₹{s.deductions.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">₹{s.net.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        s.status === "Paid" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-rose-50 text-rose-600 border-rose-100 animate-pulse"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {s.status === "Unpaid" || s.status === "Pending" ? (
                        <button 
                          onClick={() => handlePaySalary(s.id, s.base, s.deductions, s.bonus)}
                          className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                        >
                          Release Salary
                        </button>
                      ) : (
                        <button className="h-8 px-3 border border-border text-muted-foreground hover:text-foreground text-xs font-bold rounded-lg inline-flex items-center gap-1">
                          <Download size={12} /> Payslip
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
