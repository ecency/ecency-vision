"use client";

import { ChangeEvent, useEffect, useState } from "react";
import i18next from "i18next";
import { FormControl } from "@ui/input";
import { getCommunitiesQuery } from "@/api/queries";
import { useRouter } from "next/navigation";

interface Props {
  sort: string;
  query: string;
}

export function CommunitiesListSortSelector({ sort: preSort, query }: Props) {
  const router = useRouter();

  const [sort, setSort] = useState(preSort);

  const { isLoading } = getCommunitiesQuery(sort, query).useClientQuery();

  useEffect(() => {
    router.push(`?sort=${sort}`);
  }, [router, sort]);

  return (
    <FormControl
      type="select"
      value={sort}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value)}
      disabled={isLoading}
    >
      <option value="hot">{i18next.t("communities.sort-hot")}</option>
      <option value="rank">{i18next.t("communities.sort-rank")}</option>
      <option value="subs">{i18next.t("communities.sort-subs")}</option>
      <option value="new">{i18next.t("communities.sort-new")}</option>
    </FormControl>
  );
}
