"use client";

import i18next from "i18next";
import { ChangeEvent, useEffect, useState } from "react";
import { SearchBox } from "@/features/shared";
import { useDebounce } from "react-use";
import { useRouter } from "next/navigation";
import { getCommunitiesQuery } from "@/api/queries";

interface Props {
  sort: string;
  query: string;
}

export function CommunitiesListSearch({ sort, query: preQuery }: Props) {
  const router = useRouter();

  const [query, setQuery] = useState(preQuery);
  const [fetchingQuery, setFetchingQuery] = useState("");

  const { isLoading } = getCommunitiesQuery(sort, fetchingQuery).useClientQuery();

  useDebounce(() => setFetchingQuery(query), 1000, [query]);

  useEffect(() => {
    router.push(`?q=${fetchingQuery}`);
  }, [fetchingQuery, router]);

  return (
    <SearchBox
      placeholder={i18next.t("g.search")}
      value={query}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
      readOnly={isLoading}
    />
  );
}
