import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "../react-query";
import { dataLimit, getPostsRanked } from "@/api/bridge";
import { formatError, pinPost } from "@/api/operations";
import { Community, Entry } from "@/entities";
import { isCommunity } from "@/utils";
import { useGlobalStore } from "@/core/global-store";
import { clone } from "remeda";
import { error, success } from "@/features/shared";
import i18next from "i18next";

export function useCommunityPinCache(entry: Entry) {
  const { data: rankedPosts } = useQuery({
    queryKey: [QueryIdentifiers.COMMUNITY_RANKED_POSTS, entry.category],
    queryFn: () =>
      isCommunity(entry.category)
        ? getPostsRanked("created", "", "", dataLimit, entry.category)
        : null,
    initialData: null
  });

  return useQuery({
    queryKey: [QueryIdentifiers.ENTRY_PIN_TRACK, entry.post_id],
    queryFn: async () =>
      rankedPosts?.find(
        (x) =>
          x.author === entry.author && x.permlink === entry.permlink && x.stats?.is_pinned === true
      ) !== undefined,
    initialData: false
  });
}

export function useCommunityPin(entry: Entry, community: Community | null) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["PIN_COMMUNITY"],
    mutationFn: (pin: boolean) =>
      pinPost(activeUser!.username, community!.name, entry.author, entry.permlink, pin),
    onError: (e) => error(...formatError(e)),
    onSuccess: (data, pin) => {
      if (pin) {
        success(i18next.t("entry-menu.pin-success"));
      } else {
        success(i18next.t("entry-menu.unpin-success"));
      }

      queryClient.setQueryData([QueryIdentifiers.ENTRY_PIN_TRACK, entry.post_id], pin);

      queryClient.setQueryData<Entry>(
        [QueryIdentifiers.ENTRY, entry.author, entry.permlink],
        (data) => {
          if (!data) {
            return data;
          }

          return { ...clone(data), stats: { ...clone(data.stats), is_pinned: pin } };
        }
      );
    }
  });
}
