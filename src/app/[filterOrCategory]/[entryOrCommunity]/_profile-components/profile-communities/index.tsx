import React, { useMemo, useState } from "react";
import "./_index.scss";
import { LinearProgress } from "@/features/shared";
import Link from "next/link";
import i18next from "i18next";
import { TagLink } from "@/features/shared/tag";
import { SortCommunities } from "../sort-profile-communities";
import { useGetSubscriptionsQuery } from "@/api/queries";
import { useGlobalStore } from "@/core/global-store";
import { Account } from "@/entities";

interface Props {
  account: Account;
}

export function ProfileCommunities({ account }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const [sort, setSort] = useState<"asc" | "desc">("asc");

  const { data, isLoading } = useGetSubscriptionsQuery();

  const showCreateLink = activeUser && activeUser.username === account.name;
  const items = useMemo(
    () =>
      data?.sort((a, b) => {
        if (a[1] > b[1]) return sort === "asc" ? 1 : -1;
        if (a[1] < b[1]) return sort === "asc" ? -1 : 1;
        return 0;
      }),
    [data, sort]
  );

  return (
    <div className="profile-communities">
      {isLoading && <LinearProgress />}
      {!isLoading && items?.length === 0 && (
        <>
          <h2>{i18next.t("profile.communities-title")}</h2>
          <p className="text-gray-600">{i18next.t("g.empty-list")}</p>
          {showCreateLink && (
            <p>
              <Link href="/communities/create" className="create-link">
                {i18next.t("profile.create-community")}
              </Link>
            </p>
          )}
        </>
      )}
      {items && items.length > 0 && (
        <>
          <h2>{i18next.t("profile.communities-title")}</h2>

          {items.length >= 3 && (
            <SortCommunities
              sortCommunitiesInAsc={() => setSort("asc")}
              sortCommunitiesInDsc={() => setSort("desc")}
            />
          )}

          <ul className="community-list">
            {items.map((i, k) => {
              return (
                <li key={k}>
                  <TagLink tag={i[0]} type="link">
                    <span>{i[1]}</span>
                  </TagLink>{" "}
                  <span className="user-role">{i[2]}</span>
                </li>
              );
            })}
          </ul>
          {showCreateLink && (
            <p>
              <Link href="/communities/create" className="create-link">
                {i18next.t("profile.create-community")}
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  );
}
