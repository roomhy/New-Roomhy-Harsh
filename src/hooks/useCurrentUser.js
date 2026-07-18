import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { STALE } from "../lib/queryClient";
import { getCurrentUser } from "../api/currentUser";

/**
 * Shared current-user query. Every component that needs the identity should call
 * this — React Query dedupes to a single request and caches it for 10 min.
 */
export function useCurrentUser(options = {}) {
  return useQuery({
    queryKey: queryKeys.currentUser.all,
    queryFn: getCurrentUser,
    staleTime: STALE.currentUser,
    retry: false,
    ...options,
  });
}
