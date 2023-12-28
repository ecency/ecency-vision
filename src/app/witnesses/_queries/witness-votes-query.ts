import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { useSearchParams } from "next/navigation";
import { useGetAccountFullQuery } from "@/api/queries";
import { useGlobalStore } from "@/core/global-store";
import { useEffect } from "react";

export function useWitnessVotesQuery() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const activeUser = useGlobalStore((state) => state.activeUser);
  const { data: activeUserAccount } = useGetAccountFullQuery(activeUser?.username);
  const { data: urlParamAccount } = useGetAccountFullQuery(
    searchParams.get("username") ?? searchParams.get("account") ?? ""
  );

  useEffect(() => {
    queryClient.refetchQueries({ queryKey: [QueryIdentifiers.WITNESSES, "votes"] });
  }, [urlParamAccount, activeUserAccount, queryClient]);

  return useQuery({
    queryKey: [QueryIdentifiers.WITNESSES, "votes"],
    queryFn: () => urlParamAccount?.witness_votes ?? activeUserAccount?.witness_votes ?? [],
    initialData: []
  });
}
