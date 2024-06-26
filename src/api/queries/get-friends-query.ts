import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client, getAccounts } from "@/api/hive";
import { Follow, FriendSearchResult } from "@/entities";
import moment from "moment";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";

export const getFriendsQuery = (
  following: string,
  mode: string,
  {
    followType = "blog",
    limit = 100,
    enabled = true
  }: { enabled?: boolean; followType?: string; limit?: number }
) =>
  EcencyQueriesManager.generateClientServerInfiniteQuery({
    queryKey: [QueryIdentifiers.GET_FRIENDS, mode, following, followType, limit],
    queryFn: async ({ pageParam: { startFollowing } }) => {
      const response = (await client.database.call(
        mode === "following" ? "get_following" : "get_followers",
        [following, startFollowing === "" ? null : startFollowing, followType, limit]
      )) as Follow[];
      const accountNames = response.map((e) => e.follower);
      const accounts = await getAccounts(accountNames);
      return accounts.map((a) => {
        const lastActive = moment.max(
          moment(a?.last_vote_time),
          moment(a?.last_post),
          moment(a?.created)
        );
        return {
          name: a.name,
          reputation: a.reputation!,
          lastSeen: lastActive.fromNow()
        };
      });
    },
    initialData: { pages: [], pageParams: [] },
    initialPageParam: { startFollowing: "" },
    getNextPageParam: (lastPage) => ({
      startFollowing: lastPage[lastPage.length - 1].name
    }),
    enabled
  });

export const getSearchFriendsQuery = (username: string, mode: string, query: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.GET_SEARCH_FRIENDS, username, mode, query],
    refetchOnMount: false,
    queryFn: async () => {
      let request = appAxios.post<FriendSearchResult[]>(apiBase(`/search-api/search-follower`), {
        following: username,
        q: query
      });
      if (mode === "following") {
        request = appAxios.post<FriendSearchResult[]>(apiBase(`/search-api/search-following`), {
          follower: username,
          q: query
        });
      }

      const { data } = await request;

      const followingAccountNames = data.map((friend) => friend.name);
      const accounts = await getAccounts(followingAccountNames);

      return data.map((friend) => {
        const isMatch = accounts.find((account) => account.name === friend.name);
        if (!isMatch) {
          return friend;
        }

        const lastActive = moment.max(
          moment(isMatch.last_vote_time),
          moment(isMatch.last_post),
          moment(isMatch.created)
        );

        return {
          ...friend,
          lastSeen: lastActive.fromNow()
        };
      });
    }
  });
