import React, { useState } from "react";
import { FormControl } from "@ui/input";
import { CommunitySelectorItem } from "@/app/submit/_components/community-selector/community-selector-item";
import i18next from "i18next";
import { getCommunitiesQuery, useGetSubscriptionsQuery } from "@/api/queries";
import { useDebounce } from "react-use";
import useMount from "react-use/lib/useMount";

interface BrowserProps {
  onSelect: (name: string | null) => void;
  onHide: () => void;
}

export function CommunitySelectorBrowser({ onSelect, onHide }: BrowserProps) {
  const { data: subscriptions, refetch } = useGetSubscriptionsQuery();

  const [query, setQuery] = useState("");
  const [fetchingQuery, setFetchingQuery] = useState("");

  const { data: results } = getCommunitiesQuery(
    "rank",
    fetchingQuery,
    14,
    fetchingQuery !== ""
  ).useClientQuery();

  useMount(() => {
    refetch();
    document.getElementById("search-communities-input")?.focus();
  });

  useDebounce(
    () => {
      setFetchingQuery(query);
    },
    300,
    [query]
  );

  const search = (
    <div className="search">
      <FormControl
        type="text"
        placeholder={i18next.t("community-selector.search-placeholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        id="search-communities-input"
        spellCheck={true}
      />
    </div>
  );

  if (query) {
    return (
      <div className="browser">
        {search}

        <div className="browser-list">
          <div className="flex flex-wrap py-3 gap-3">
            {results?.map((x) => (
              <CommunitySelectorItem
                key={x.id}
                name={x.name}
                title={x.title}
                onSelect={onSelect}
                onHide={onHide}
              />
            ))}
            {results?.length === 0 && <div className="empty-list">{i18next.t("g.empty-list")}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="browser">
      {search}

      <div className="browser-list">
        <div className="flex flex-wrap py-3 gap-3">
          <CommunitySelectorItem
            name={null}
            title={i18next.t("community-selector.my-blog")}
            onSelect={onSelect}
            onHide={onHide}
          />

          {subscriptions?.map((x) => (
            <CommunitySelectorItem
              key={x[0]}
              name={x[0]}
              title={x[1]}
              onSelect={onSelect}
              onHide={onHide}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
