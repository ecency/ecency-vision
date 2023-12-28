import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { getPostHeader } from "@/api/bridge";

export function useGetPostHeaderQuery(author: string, permlink: string) {
  return useQuery({
    queryKey: [QueryIdentifiers.POST_HEADER, author, permlink],
    queryFn: () => getPostHeader(author, permlink),
    initialData: null
  });
}
