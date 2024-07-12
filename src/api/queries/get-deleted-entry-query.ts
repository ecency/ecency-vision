import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { makeEntryPath } from "@/utils";
import { commentHistory } from "@/api/private-api";

export const getDeletedEntryQuery = (author: string, permlink: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.DELETED_ENTRY, makeEntryPath("", author, permlink)],
    queryFn: async () => {
      const history = await commentHistory(author, permlink);
      const { body, title, tags } = history.list[0];
      return {
        body,
        title,
        tags
      };
    }
  });
