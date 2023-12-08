import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import numeral from "numeral";
import { useRouter } from "next/router";
import { usePrevious } from "react-use";
import { SearchSuggester } from "../search-suggester";
import { SearchBox } from "../search-box";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";

interface Props {
  containerClassName?: string;
}

export function Search({ containerClassName }: Props) {
  const router = useRouter();
  const previousPathname = usePrevious(router.pathname);

  const searchIndexCount = useGlobalStore((state) => state.searchIndexCount);
  const [query, setQuery] = useState("");

  const placeholder = useMemo(
    () =>
      searchIndexCount > 0
        ? i18next.t("search.placeholder-count", {
            n: numeral(searchIndexCount).format("0,0")
          })
        : i18next.t("search.placeholder"),
    [searchIndexCount]
  );

  useEffect(() => {
    if (router.pathname !== previousPathname) {
      setQuery("");
    }
  }, [router.pathname, previousPathname]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) {
      if (["/search-more", "/search-more/"].includes(location.pathname)) {
        router.push(`/search-more/?q=${encodeURIComponent(query)}`);
      } else {
        router.push(`/search/?q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <SearchSuggester value={query} containerClassName={containerClassName} changed={true}>
      <SearchBox
        placeholder={placeholder}
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value.toLowerCase())}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
    </SearchSuggester>
  );
}
