import { CommunitySubscribers } from "@/app/[filterOrCategory]/[entryOrCommunity]/_components/community-subscribers";
import { CommunityActivities } from "@/app/[filterOrCategory]/[entryOrCommunity]/_components/community-activities";
import { CommunityRoles } from "@/app/[filterOrCategory]/[entryOrCommunity]/_components/community-roles";
import { EntryListContent, LinearProgress, SearchListItem } from "@/features/shared";
import i18next from "i18next";
import { Fragment } from "react";
import { classNameObject } from "@ui/util";
import { ListStyle } from "@/enums";
import { Community, Entry, SearchResult } from "@/entities";
import { getPostsFeedQueryData } from "@/api/queries/get-account-posts-feed-query";
import { CommunityContentSearch } from "@/app/[filterOrCategory]/[entryOrCommunity]/_components/community-content-search";
import { getSearchApiQuery } from "@/api/queries";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  filter: string;
  tag: string;
  community: Community;
  query?: string;
  section: string;
}

export async function CommunityContent({ filter, community, tag, query, section }: Props) {
  const listStyle = useGlobalStore((s) => s.listStyle);

  if (filter === "subscribers") {
    return <CommunitySubscribers community={community} />;
  }

  if (filter === "activities") {
    return <CommunityActivities community={community} />;
  }

  if (filter === "roles") {
    return <CommunityRoles community={community} />;
  }

  const data = getPostsFeedQueryData(filter, tag);

  if (!data || !data.pages || data.pages.length === 0) {
    return <></>;
  }

  const searchData =
    getSearchApiQuery(query ?? "", "newest", false)
      .getData()
      ?.pages.reduce<SearchResult[]>(
        (acc, page) =>
          [...acc, ...page.results].sort(
            (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
          ),
        []
      ) ?? [];

  return (
    <>
      {data.pages.length === 0 ? <LinearProgress /> : ""}

      {["hot", "created", "trending"].includes(filter) && data.pages.length > 0 && (
        <div className="searchProfile">
          <CommunityContentSearch community={community} filter={filter} />
        </div>
      )}
      {searchData.length > 0 ? (
        <div className="search-list">
          {searchData.map((res) => (
            <Fragment key={`${res.author}-${res.permlink}-${res.id}`}>
              <SearchListItem res={res} />
            </Fragment>
          ))}
        </div>
      ) : searchData.length === 0 && query ? (
        i18next.t("g.no-matches")
      ) : (
        <></>
      )}

      {(!query || query?.length === 0) && (
        <div className="entry-list">
          <div
            className={classNameObject({
              "entry-list-body": true,
              "grid-view": ListStyle.grid === listStyle
            })}
          >
            {/*{loading && entryList.length === 0 && <EntryListLoadingItem />}*/}
            <EntryListContent
              isPromoted={filter === "promoted"}
              entries={data.pages.reduce<Entry[]>(
                (acc, page) => [...acc, ...(page as Entry[])],
                []
              )}
              loading={false}
              sectionParam={section}
            />
          </div>
        </div>
      )}
      {/*{search.length === 0 && loading && entryList.length > 0 ? <LinearProgress /> : ""}*/}
      {/*<DetectBottom onBottom={bottomReached} />*/}
    </>
  );
}
