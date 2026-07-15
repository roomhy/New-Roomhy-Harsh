// Visitors API — the ONLY place visitor endpoints are called.
import { apiFetch } from "../utils/api";

/** Visitor log for an owner (parentLoginId for staff). Returns an array. */
export async function getOwnerVisitors(ownerLoginId) {
  const data = await apiFetch(`/api/visitors/owner/${ownerLoginId}`);
  return data?.visitors || [];
}

/** Register a new visitor. */
export async function createVisitor(payload) {
  return apiFetch(`/api/visitors`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Change a visitor's status (e.g. check out → 'Exited'). */
export async function updateVisitorStatus(id, status) {
  return apiFetch(`/api/visitors/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
