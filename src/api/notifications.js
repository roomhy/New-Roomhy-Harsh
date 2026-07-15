// Notifications API. Endpoint unchanged from the current app (?toLoginId=).
// When the paginated backend endpoint (GET /api/notifications/me) is deployed,
// only this file changes — callers/hooks stay the same.
import { apiFetch } from "../utils/api";

/** Notification feed for a recipient. Returns an array. */
export async function getNotifications(loginId) {
  const data = await apiFetch(`/api/notifications?toLoginId=${encodeURIComponent(loginId)}`);
  return Array.isArray(data) ? data : (data?.data || []);
}

/** Mark all of a recipient's notifications as read. */
export async function markAllNotificationsRead(loginId) {
  return apiFetch(`/api/notifications/mark-all-read`, {
    method: "PUT",
    body: JSON.stringify({ toLoginId: loginId }),
  });
}
