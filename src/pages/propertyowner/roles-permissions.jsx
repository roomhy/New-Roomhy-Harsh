import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  ShieldCheck, Search, Plus, ToggleLeft, ToggleRight, 
  Settings, CheckCircle2
} from "lucide-react";
import { apiFetch } from "../../utils/api";
import { cacheGet, cacheSet } from "../../utils/cache";

export default function RolesPermissionsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const CACHE_KEY = `roles:${owner.loginId}`;
    const cached = cacheGet(CACHE_KEY);
    if (cached) { setRoles(cached); setLoading(false); return; }
    try {
      const data = await apiFetch(`/api/employees?parentLoginId=${owner.loginId}`);
      const myStaff = data.data || [];
      
      const roleMap = {};
      myStaff.forEach(emp => {
        if (!roleMap[emp.role]) {
          roleMap[emp.role] = {
            id: emp.role,
            name: emp.role,
            loginIds: [],
            tenants: emp.permissions?.includes("tenants") || false,
            rent: emp.permissions?.includes("rent") || false,
            complaints: emp.permissions?.includes("complaints") || false
          };
        }
        roleMap[emp.role].loginIds.push(emp.loginId);
      });
      
      const result = Object.values(roleMap);
      setRoles(result);
      cacheSet(CACHE_KEY, result, 2 * 60 * 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (roleId, field) => {
    const roleObj = roles.find(r => r.id === roleId);
    if (!roleObj) return;

    const newValue = !roleObj[field];
    
    // Optimistic UI update
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, [field]: newValue } : r));

    try {
      // Update all employees having this role
      for (const loginId of roleObj.loginIds) {
        // Fetch current employee to get current permissions
        const empData = await apiFetch(`/api/employees/${loginId}`);
        if (empData.success) {
           let currentPerms = empData.data.permissions || [];
           if (newValue && !currentPerms.includes(field)) currentPerms.push(field);
           if (!newValue && currentPerms.includes(field)) currentPerms = currentPerms.filter(p => p !== field);

           await apiFetch(`/api/employees/${loginId}`, {
             method: 'PATCH',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ permissions: currentPerms })
           });
        }
      }
    } catch (err) {
      console.error("Failed to update permissions", err);
      // Revert on error
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, [field]: !newValue } : r));
    }
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="System Access Control" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Roles &amp; Permissions</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage administrative access scopes, check-in permission toggles, and module restrictions.</p>
        </div>
      </div>

      {/* Grid of Roles */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading roles...</div>
      ) : roles.length === 0 ? (
        <div className="py-12 text-center text-slate-500">No staff roles found. Add some staff first.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-6">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {role.loginIds.length} Staff Member(s)
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[21px] font-bold text-foreground">{role.name}</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">Customize specific feature panels access permissions.</p>
              </div>

              <div className="border-t border-border/60 pt-4 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Read/Write Tenants List</span>
                  <button onClick={() => togglePermission(role.id, "tenants")}>
                    {role.tenants ? (
                      <ToggleRight size={38} className="text-emerald-600" />
                    ) : (
                      <ToggleLeft size={38} className="text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Record Rent Collection</span>
                  <button onClick={() => togglePermission(role.id, "rent")}>
                    {role.rent ? (
                      <ToggleRight size={38} className="text-emerald-600" />
                    ) : (
                      <ToggleLeft size={38} className="text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Resolve Complaints</span>
                  <button onClick={() => togglePermission(role.id, "complaints")}>
                    {role.complaints ? (
                      <ToggleRight size={38} className="text-emerald-600" />
                    ) : (
                      <ToggleLeft size={38} className="text-slate-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
