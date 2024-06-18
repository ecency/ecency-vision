import i18next from "i18next";
import { CommunityListItem } from "@/app/communities/_components/community-list-item";
import { getCommunitiesQuery } from "@/api/queries";
import { CommunitiesListSearch } from "@/app/communities/_components/communities-list-search";
import { CommunitiesListSortSelector } from "@/app/communities/_components/communities-list-sort-selector";

interface Props {
  sort: string;
  query: string;
}

export async function CommunitiesList({ sort, query }: Props) {
  const list = getCommunitiesQuery(sort, query).getData();

  return (
    <>
      <div className="list-form">
        <div className="search">
          <CommunitiesListSearch sort={sort} query={query} />
        </div>
        <div className="sort">
          <CommunitiesListSortSelector sort={sort} query={query} />
        </div>
      </div>
      <div className="list-items">
        {list?.length === 0 && (
          <div className="no-results">{i18next.t("communities.no-results")}</div>
        )}
        {list?.map((x, i) => <CommunityListItem community={x} key={x.name} />)}
      </div>
    </>
  );
}
