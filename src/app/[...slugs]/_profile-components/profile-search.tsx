"use client";

import { useDebounce } from "react-use";
import { LinearProgress, SearchBox } from "@/features/shared";
import i18next from "i18next";
import React, { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useMount from "react-use/lib/useMount";

interface Props {
  section: string;
  username: string;
}

export function ProfileSearch({ username, section }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState("");
  const [typing, setTyping] = useState(false);

  useMount(() => {
    setSearch(params.get("query") ?? "");
  });

  const handleChangeSearch = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearch(value);
    setTyping(value.length !== 0);
  }, []);

  useDebounce(
    () => {
      if (search) {
        router.push(`/@${username}/?query=${encodeURIComponent(search)}`);
      } else if (params.has("q")) {
        router.push(`/@${username}`);
      }
    },
    3000,
    [search, params]
  );

  return (
    <>
      {["blog", "", "posts", "comments"].includes(section) && (
        <div className="searchProfile">
          <SearchBox
            placeholder={i18next.t("search-comment.search-placeholder")}
            value={search}
            onChange={handleChangeSearch}
            autoComplete="off"
            showcopybutton={true}
            username={`@${username}`}
            filter={section}
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
