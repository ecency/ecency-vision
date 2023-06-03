import { TrendingTag } from "../../../../store/trending-tags/types";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { _t } from "../../../../i18n";

export interface HotListItemProps {
  index: number;
  entry: TrendingTag;
  onMounted: () => void;
}

export const HotListItem = ({ index, entry, onMounted }: HotListItemProps) => {
  useEffect(() => {
    onMounted();
  }, []);

  return (
    <div className="p-3 border-bottom d-flex align-items-center">
      <div className="hot-item-index">{index}</div>
      <div className="flex-grow-1 ml-3 hot-item-link">
        <Link to={`/trending/${entry.name}`}>#{entry.name}</Link>
      </div>
      <div className="hot-item-post-count">
        {entry.top_posts + entry.comments || 0} {_t("communities.n-posts")}
      </div>
    </div>
  );
};
