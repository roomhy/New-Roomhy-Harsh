import { apiFetch } from "../utils/api";

/** All complaints for an owner (parentLoginId for staff). Returns an array. */
export async function getOwnerComplaints(ownerLoginId) {
  const d = await apiFetch(`/api/complaints/owner/${ownerLoginId}`);
  return Array.isArray(d) ? d : (d?.complaints || d?.data || []);
}
