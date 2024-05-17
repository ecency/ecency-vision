import { useMutation, useQueryClient } from "@tanstack/react-query";
import { broadcastPostingJSON, formatError } from "@/api/operations";
import { error } from "@/features/shared";
import { AccountRelationship } from "@/api/bridge";
import { QueryIdentifiers } from "@/core/react-query";
import * as ls from "@/utils/local-storage";

export function useFollow(follower: string, following: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["follow-account", follower, following],
    mutationFn: async ({ isFollow }: { isFollow: boolean }) =>
      [
        await broadcastPostingJSON(follower, "follow", [
          "follow",
          {
            follower,
            following,
            what: [...(isFollow ? ["blog"] : [""])]
          }
        ]),
        isFollow
      ] as const,
    onError: (err: Error) => {
      error(...formatError(err));
    },
    onSuccess: ([_, isFollow]) => {
      let mutedList = ls.get("muted-list");
      if (mutedList) {
        mutedList = mutedList.filter((item: string) => item !== following);
      }
      ls.set("muted-list", mutedList);

      queryClient.setQueryData<AccountRelationship | null>(
        [QueryIdentifiers.GET_RELATIONSHIP_BETWEEN_ACCOUNTS, follower, following],
        (data) => {
          if (!data) {
            return data;
          }

          return {
            follows: isFollow,
            ignores: false,
            is_blacklisted: data.is_blacklisted,
            follows_blacklists: data.follows_blacklists
          };
        }
      );
    }
  });
}

export function useIgnore(follower: string, following: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["follow-account", "ignore", follower, following],
    mutationFn: () =>
      broadcastPostingJSON(follower, "follow", [
        "follow",
        {
          follower,
          following,
          what: ["ignore"]
        }
      ]),
    onError: (err: Error) => {
      error(...formatError(err));
    },
    onSuccess: () => {
      const mutedList = ls.get("muted-list");
      if (mutedList) {
        ls.set("muted-list", mutedList.concat([following]));
      }

      queryClient.setQueryData<AccountRelationship | null>(
        [QueryIdentifiers.GET_RELATIONSHIP_BETWEEN_ACCOUNTS, follower, following],
        (data) => {
          if (!data) {
            return data;
          }

          return {
            follows: data.follows,
            ignores: true,
            is_blacklisted: data.is_blacklisted,
            follows_blacklists: data.follows_blacklists
          };
        }
      );
    }
  });
}
