import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { STALE } from "../lib/queryClient";
import { getOwnerTenants } from "../api/tenants";

/** All tenants for an owner (parentLoginId for staff). */
export function useOwnerTenants(ownerLoginId, options = {}) {
  return useQuery({
    queryKey: queryKeys.tenants.byOwner(ownerLoginId),
    queryFn: () => getOwnerTenants(ownerLoginId),
    enabled: !!ownerLoginId,
    staleTime: STALE.properties,
    ...options,
  });
}
