import { apiFetch } from "../utils/api";

/** All rooms for an owner (parentLoginId for staff). Returns an array. */
export async function getOwnerRooms(ownerLoginId) {
  const d = await apiFetch(`/api/rooms/owner/${ownerLoginId}`);
  return Array.isArray(d) ? d : (d?.rooms || d?.data || []);
}
