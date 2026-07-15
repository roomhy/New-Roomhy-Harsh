// Tenants API.
import { apiFetch } from "../utils/api";

/** All tenants for an owner (parentLoginId for staff). Returns an array. */
export async function getOwnerTenants(ownerLoginId) {
  const data = await apiFetch(`/api/tenants/owner/${ownerLoginId}`);
  return Array.isArray(data) ? data : (data?.tenants || data?.data || []);
}
