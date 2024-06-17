import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { useSearchParams } from "next/navigation";
import { getAccountFullQuery } from "@/api/queries";
import { useGlobalStore } from "@/core/global-store";
import { useEffect } from "react";

export function useWitnessProxyQuery() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const activeUser = useGlobalStore((state) => state.activeUser);
  const { data: activeUserAccount } = getAccountFullQuery(activeUser?.username).useClientQuery();
  const { data: urlParamAccount } = getAccountFullQuery(
    searchParams.get("username") ?? searchParams.get("account") ?? ""
  ).useClientQuery();

  useEffect(() => {
    queryClient.refetchQueries({ queryKey: [QueryIdentifiers.WITNESSES, "proxy"] });
  }, [urlParamAccount, activeUserAccount]);

  return useQuery<string>({
    queryKey: [QueryIdentifiers.WITNESSES, "proxy"],
    queryFn: () => urlParamAccount?.proxy ?? activeUserAccount?.proxy ?? "",
    initialData: "",
    enabled: !!activeUserAccount || !!urlParamAccount
  });
}
