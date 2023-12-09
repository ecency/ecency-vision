import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "../react-query";
import { dataLimit, getPostsRanked } from "@/api/bridge";
import { pinPost } from "@/api/operations";
import { Community, Entry } from "@/entities";
import { isCommunity } from "@/utils";
import { useGlobalStore } from "@/core/global-store";

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
  const activeUser = useGlobalStore((state) => state.activeUser);
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
