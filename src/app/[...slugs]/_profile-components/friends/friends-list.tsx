import { useMemo, useState } from "react";
import { getFriendsQuery, getSearchFriendsQuery } from "@/api/queries";
import { Account } from "@/entities";
import { Button } from "@ui/button";
import i18next from "i18next";
import { FormControl, InputGroup } from "@ui/input";
import { Spinner } from "@ui/spinner";
import { accountReputation, formatTimeDIfference } from "@/utils";
import { ProfileLink, UserAvatar } from "@/features/shared";
import { FilterFriendsType } from "@/enums";
import { FilterFriends } from "./filter-friends";
import { useDebounce } from "react-use";

const loadLimit = 30;

interface Props {
  account: Account;
  mode: string;
}

export const FriendsList = ({ account, mode }: Props) => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<FilterFriendsType>();

  const {
    data,
    isLoading: isFriendsLoading,
    fetchNextPage
  } = getFriendsQuery(account.name, mode, {
    limit: loadLimit
  }).useClientQuery();
  const {
    data: searchData,
    isLoading: isSearchLoading,
    refetch: fetchSearchResults
  } = getSearchFriendsQuery(account.name, mode, query).useClientQuery();

  const isLoading = useMemo(
    () => isFriendsLoading || isSearchLoading,
    [isFriendsLoading, isSearchLoading]
  );
  const dataFlow = useMemo(
    () =>
      query
        ? searchData ?? []
        : data?.pages
            ?.reduce((acc, page) => [...acc, ...page], [])
            ?.filter((item) => {
              if (!type) {
                return true;
              }

              const lastSeenTime = new Date(formatTimeDIfference(item.lastSeen));
              const timeDifference = new Date().getTime() - lastSeenTime.getTime();
              const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
              const yearsDifference = Math.ceil(daysDifference / 365);

              return (
                (type === FilterFriendsType.Recently && daysDifference < 7) ||
                (type === FilterFriendsType.ThisMonth &&
                  daysDifference > 7 &&
                  daysDifference < 30) ||
                (type === FilterFriendsType.ThisYear &&
                  daysDifference >= 30 &&
                  daysDifference < 360) ||
                (type === FilterFriendsType.OneYear && daysDifference === 365) ||
                (type === FilterFriendsType.MoreThanOneYear && yearsDifference > 1)
              );
            }) ?? [],
    [data?.pages, query, searchData, type]
  );
  const hasMore = useMemo(
    () => (data?.pages?.[data?.pages.length - 1]?.length ?? 0) >= loadLimit,
    [data?.pages]
  );

  useDebounce(
    () => {
      if (query) {
        fetchSearchResults();
      }
    },
    500,
    [query]
  );

  return (
    <div className="friends-content">
      <div>
        <FilterFriends updateFilterType={(v) => setType(v)} />
      </div>

      <div className="friends-list">
        <div className="friend-search-box">
          <InputGroup prepend={isLoading ? <Spinner className="w-3.5 h-3.5" /> : "@"}>
            <FormControl
              type="text"
              value={query}
              placeholder={i18next.t("friends.search-placeholder")}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  fetchSearchResults();
                }
              }}
            />
          </InputGroup>
        </div>

        <div className="list-body">
          {!isLoading && dataFlow?.length === 0 && (
            <div className="empty-list"> {i18next.t("g.empty-list")}</div>
          )}

          {dataFlow?.map((item) => (
            <div className="list-item" key={item.name}>
              <div className="item-main">
                <ProfileLink username={item.name}>
                  <UserAvatar username={item.name} size="small" />
                </ProfileLink>
                <div className="item-info">
                  <ProfileLink username={item.name}>
                    <span className="item-name notranslate">{item.name}</span>
                  </ProfileLink>
                  {item?.reputation !== undefined && (
                    <span className="item-reputation">{accountReputation(item.reputation)}</span>
                  )}
                </div>
              </div>
              <div className="last-seen mt-1">
                <a href="#">{`${i18next.t("friends.active")} ${item.lastSeen}`}</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!!query && dataFlow.length > 1 && (
        <div className="load-more">
          <Button disabled={isLoading || !hasMore} onClick={() => fetchNextPage()}>
            {i18next.t("g.load-more")}
          </Button>
        </div>
      )}
    </div>
  );
};
