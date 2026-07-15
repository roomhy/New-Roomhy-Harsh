import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";
import { apiFetch } from "../../utils/api";
import { cacheGet, cacheSet } from "../../utils/cache";
import { STAFF_ACCESS_MODULES } from "../../utils/staffAccess";

// Roles & Permissions for owner-managed staff. Staff are owner-scoped employee
// records; their access is driven by the same `permissions` array used across the
// employee model and the same canonical permission catalog the staff shell and
// add-staff picker use — one vocabulary, one permission engine.
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
          roleMap[emp.role] = { id: emp.role, name: emp.role, loginIds: [], permissions: new Set() };
        }
        roleMap[emp.role].loginIds.push(emp.loginId);
        (emp.permissions || []).forEach(p => roleMap[emp.role].permissions.add(p));
      });

      // Sets can't be cached as JSON — store permission arrays.
      const result = Object.values(roleMap).map(r => ({ ...r, permissions: Array.from(r.permissions) }));
      setRoles(result);
      cacheSet(CACHE_KEY, result, 2 * 60 * 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (roleId, permKey) => {
    const roleObj = roles.find(r => r.id === roleId);
    if (!roleObj) return;

    const isOn = roleObj.permissions.includes(permKey);
    const newValue = !isOn;

    // Optimistic UI update
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r;
      const next = newValue
        ? [...r.permissions, permKey]
        : r.permissions.filter(p => p !== permKey);
      return { ...r, permissions: next };
    }));

    try {
      // Apply to every staff member holding this role.
      for (const loginId of roleObj.loginIds) {
        const empData = await apiFetch(`/api/employees/${loginId}`);
        if (empData.success) {
          let currentPerms = empData.data.permissions || [];
          if (newValue && !currentPerms.includes(permKey)) currentPerms.push(permKey);
          if (!newValue) currentPerms = currentPerms.filter(p => p !== permKey);
          await apiFetch(`/api/employees/${loginId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ permissions: currentPerms }),
          });
        }
      }
      cacheSet(`roles:${owner.loginId}`, roles, 2 * 60 * 1000);
    } catch (err) {
      console.error("Failed to update permissions", err);
      // Revert on error
      setRoles(prev => prev.map(r => {
        if (r.id !== roleId) return r;
        const next = isOn
          ? [...r.permissions, permKey]
          : r.permissions.filter(p => p !== permKey);
        return { ...r, permissions: next };
      }));
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
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Grant each staff role access to Staff Panel screens and Owner Panel features. Changes apply to every staff member with that role.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading roles...</div>
      ) : roles.length === 0 ? (
        <div className="py-12 text-center text-slate-500">No staff roles found. Add some staff first.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-5">
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
                <p className="text-[12px] text-muted-foreground mt-0.5">Toggle the modules this role can access.</p>
              </div>

              <div className="border-t border-border/60 pt-4 space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                {STAFF_ACCESS_MODULES.map((mod) => {
                  const on = mod.always || role.permissions.includes(mod.key);
                  return (
                    <div key={mod.key} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">{mod.label}</span>
                      <button
                        disabled={mod.always}
                        onClick={() => togglePermission(role.id, mod.key)}
                        className={mod.always ? "opacity-40 cursor-not-allowed" : ""}
                        title={mod.always ? "Always available" : ""}
                      >
                        {on ? (
                          <ToggleRight size={34} className="text-emerald-600" />
                        ) : (
                          <ToggleLeft size={34} className="text-slate-300" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
