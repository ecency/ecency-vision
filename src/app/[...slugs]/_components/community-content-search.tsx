"use client";

import i18next from "i18next";
import { SearchBox } from "@/features/shared";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "react-use";
import { Community } from "@/entities";

interface Props {
  community: Community;
  filter: string;
}

export function CommunityContentSearch({ community, filter }: Props) {
  const [search, setSearch] = useState("");
  const [typing, setTyping] = useState(false);

  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setSearch(params.get("q") ?? "");
  }, [params]);

  const handleChangeSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearch(value);
    setTyping(value.length !== 0);
  }, []);

  useDebounce(
    () => {
      if (search) {
        router.push(`/${filter}/${community.name}?q=${encodeURIComponent(search)}`);
      } else if (params.has("q")) {
        router.push(`/${filter}/${community.name}`);
      }
    },
    2000,
    [search, params]
  );

  return (
    <SearchBox
      placeholder={i18next.t("search-comment.search-placeholder")}
      value={search}
      onChange={handleChangeSearch}
      autoComplete="off"
      showcopybutton={true}
      filter={`${community!!.name}`}
      username={filter}
    />
  );
}
