import { Entry } from "../../store/entries/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "../react-query";
import { dataLimit, getPostsRanked } from "../../api/bridge";
import { pinPost } from "../../api/operations";
import { useMappedStore } from "../../store/use-mapped-store";
import { Community } from "../../store/communities/types";
import isCommunity from "../../helper/is-community";

export function useCommunityPinCache(entry: Entry) {
  const { data: rankedPosts } = useQuery(
    [QueryIdentifiers.COMMUNITY_RANKED_POSTS, entry.category],
    () =>
      isCommunity(entry.category)
        ? getPostsRanked("created", "", "", dataLimit, entry.category)
        : null,
    {
      initialData: null
    }
  );

  return useQuery(
    [QueryIdentifiers.ENTRY_PIN_TRACK, entry.post_id],
    async () =>
      rankedPosts?.find(
        (x) =>
          x.author === entry.author && x.permlink === entry.permlink && x.stats?.is_pinned === true
      ) !== undefined,
    {
      initialData: false
    }
  );
}

export function useCommunityPin(entry: Entry, community: Community | null) {
  const { activeUser } = useMappedStore();
  const queryClient = useQueryClient();

  return useMutation(
    ["PIN_COMMUNITY"],
    (pin: boolean) =>
      pinPost(activeUser!.username, community!.name, entry.author, entry.permlink, pin),
    {
      onSuccess: (data, pin) => {
        queryClient.setQueryData([QueryIdentifiers.ENTRY_PIN_TRACK, entry.post_id], pin);
      }
    }
  );
}
