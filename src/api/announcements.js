import { apiFetch } from "../utils/api";

/** Announcements for an owner (parentLoginId for staff). Returns an array. */
export async function getOwnerAnnouncements(ownerLoginId) {
  const d = await apiFetch(`/api/announcements/owner/${ownerLoginId}`);
  return Array.isArray(d) ? d : (d?.announcements || d?.data || []);
}
