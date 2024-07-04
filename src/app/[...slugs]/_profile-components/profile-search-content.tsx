"use client";
import { SearchListItem } from "@/features/shared";
import i18next from "i18next";
import React from "react";
import { SearchResult } from "@/entities";

interface Props {
  items: SearchResult[];
}

export function ProfileSearchContent({ items }: Props) {
  return items.length > 0 ? (
    <div className="search-list">
      {items.map((res) => (
        <SearchListItem key={`${res.author}-${res.permlink}-${res.id}`} res={res} />
      ))}
    </div>
  ) : (
    <>{i18next.t("g.no-matches")}</>
  );
}
