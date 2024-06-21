import React, { useEffect } from "react";
import { TrendingTag } from "@/entities";
import i18next from "i18next";

export interface HotListItemProps {
  index: number;
  entry: TrendingTag;
  onMounted: () => void;
  onClick: () => void;
}

export const HotListItem = ({ index, entry, onMounted, onClick }: HotListItemProps) => {
  useEffect(() => {
    onMounted();
  }, []);

  return (
    <div className="p-3 border-b border-[--border-color] flex items-center">
      <div className="hot-item-index">{index}</div>
      <div className="grow ml-3 hot-item-link">
        <a role="button" href="#" onClick={onClick}>
          #{entry.name}
        </a>
      </div>
      <div className="hot-item-post-count">
        {entry.top_posts + entry.comments || 0} {i18next.t("communities.n-posts")}
      </div>
    </div>
  );
};
