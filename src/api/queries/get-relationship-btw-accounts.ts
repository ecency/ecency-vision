import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { AccountRelationship, bridgeApiCall } from "@/api/bridge";

export function useGetRelationshipBtwAccounts(follower?: string, following?: string) {
  return useQuery({
    queryKey: [QueryIdentifiers.GET_RELATIONSHIP_BETWEEN_ACCOUNTS, follower, following],
    queryFn: () =>
      bridgeApiCall<AccountRelationship | null>("get_relationship_between_accounts", [
        follower,
        following
      ]),
    enabled: !!follower && !!follower
  });
}
