"use client";

import { useDebounce } from "react-use";
import { LinearProgress, SearchBox } from "@/features/shared";
import i18next from "i18next";
import React, { useState } from "react";
import { getPostsFeedQueryData } from "@/api/queries";
import { Entry } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { useRouter } from "next/navigation";

interface Props {
  section: string;
  username: string;
}

export function ProfileSearch({ username, section }: Props) {
  const filter = useGlobalStore((s) => s.filter);
  const router = useRouter();

  const data = getPostsFeedQueryData(section, username);
  const entries =
    data?.pages?.reduce<Entry[]>((acc, page) => [...acc, ...(page as Entry[])], []) ?? [];

  const [search, setSearch] = useState("");
  const [typing, setTyping] = useState(false);

  const handleChangeSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearch(value);
    setTyping(value.length !== 0);
  };

  useDebounce(() => router.push(`?query=${encodeURIComponent(search)}`), 3000, [search]);

  return (
    <>
      {entries.length > 0 &&
        (filter === "blog" || filter === "posts" || filter === "comments") &&
        section === filter && (
          <div className="searchProfile">
            <SearchBox
              placeholder={i18next.t("search-comment.search-placeholder")}
              value={search}
              onChange={handleChangeSearch}
              autoComplete="off"
              showcopybutton={true}
              username={`@${username}`}
              filter={filter}
            />
          </div>
        )}
      {typing && (
        <div className="mt-3">
          <LinearProgress />
        </div>
      )}
    </>
  );
}
