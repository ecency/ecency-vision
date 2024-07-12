import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getPost } from "@/api/bridge";
import { makeEntryPath } from "@/utils";

export const getPostQuery = (author: string, permlink?: string, observer = "", num?: number) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryFn: () => getPost(author, permlink, observer, num),
    queryKey: [QueryIdentifiers.ENTRY, makeEntryPath("", author, permlink ?? "")],
    enabled: !!author && !!permlink
  });
