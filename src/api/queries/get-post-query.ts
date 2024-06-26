import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getPost } from "@/api/bridge";
import { makeEntryPath } from "@/utils";

export const getPostQuery = (author: string, permlink?: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryFn: () => getPost(author, permlink),
    queryKey: [QueryIdentifiers.ENTRY, makeEntryPath("", author, permlink ?? "")],
    enabled: !!author && !!permlink
  });
