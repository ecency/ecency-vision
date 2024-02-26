import React, { useEffect, useMemo, useState } from "react";
import { History } from "history";
import numeral from "numeral";
import SearchBox from "../../search-box";

import SearchSuggester from "../../search-suggester";

import { _t } from "../../../i18n";
import { useMappedStore } from "../../../store/use-mapped-store";
import "./_index.scss";
import { useLocation } from "react-router";

interface Props {
  history: History;
  containerClassName?: string;
}

export function Searchbar({ history, containerClassName }: Props) {
  const [query, setQuery] = useState("");
  const { global, trendingTags } = useMappedStore();

  const location = useLocation();

  const params = useMemo(() => new URLSearchParams(location.search), [location]);
  const placeholder = useMemo(
    () =>
      global.searchIndexCount > 0
        ? _t("search.placeholder-count", {
            n: numeral(global.searchIndexCount).format("0,0")
          })
        : _t("search.placeholder"),
    [global]
  );

  useEffect(() => {
    if (location.pathname.startsWith("/search") && params.get("q")) {
      setQuery(params.get("q") ?? "");
    }
  }, [location, params]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) {
      if (["/search-more", "/search-more/"].includes(location.pathname)) {
        history.push(`/search-more/?q=${encodeURIComponent(query)}`);
      } else {
        history.push(`/search/?q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <SearchSuggester
      trendingTags={trendingTags}
      history={history}
      location={location}
      global={global}
      value={query}
      containerClassName={containerClassName}
      changed={true}
    >
      <SearchBox
        placeholder={placeholder}
        value={query}
        onChange={(e: { target: { value: string } }) => setQuery(e.target.value.toLowerCase())}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
    </SearchSuggester>
  );
}
