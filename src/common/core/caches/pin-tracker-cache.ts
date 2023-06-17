import { Entry } from "../../store/entries/types";
import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "../react-query";
import { dataLimit, getPostsRanked } from "../../api/bridge";

export function useCommunityPinCache(entry: Entry) {
  return useQuery(
    [QueryIdentifiers.ENTRY_PIN_TRACK],
    async () => {
      const response = await getPostsRanked("created", "", "", dataLimit, entry.category);
      return (
        response?.find(
          (x) =>
            x.author === entry.author &&
            x.permlink === entry.permlink &&
            x.stats?.is_pinned === true
        ) !== undefined
      );
    },
    {
      initialData: false
    }
  );
}
