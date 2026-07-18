import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { STALE } from "../lib/queryClient";
import { getNotifications, markAllNotificationsRead } from "../api/notifications";

/**
 * Recipient notification feed. Background-refetches on an interval because the
 * feed changes frequently (STEP 12), with a short 30s stale time (STEP 14).
 */
export function useNotifications(loginId, options = {}) {
  return useQuery({
    queryKey: queryKeys.notifications.list(loginId, {}),
    queryFn: () => getNotifications(loginId),
    enabled: !!loginId,
    staleTime: STALE.notifications,
    refetchInterval: STALE.notifications,
    ...options,
  });
}

export function useMarkAllNotificationsRead(loginId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(loginId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}
