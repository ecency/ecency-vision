import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { Entry } from "@/entities";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";

export function useGetCommentHistoryQuery(entry: Entry, onlyMeta = false) {
  return useQuery({
    queryKey: [QueryIdentifiers.COMMENT_HISTORY, entry.author, entry.permlink, onlyMeta],
    queryFn: async () => {
      const data = {
        author: entry.author,
        permlink: entry.permlink,
        onlyMeta: onlyMeta ? "1" : ""
      };
      const resp = await appAxios.post(apiBase(`/private-api/comment-history`), data);
      return resp.data;
    }
  });
}
