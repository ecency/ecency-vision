import React from "react";
import { Link } from "react-router-dom";

export interface HotListItemProps {
  index: number;
  link: string;
  linkText: string;
  postCount: string;
}

export const HotListItem = ({
  index,
  link,
  linkText,
  postCount,
}: HotListItemProps) => {
  return (
    <div className="pb-5 d-flex align-items-center">
      <div className="hot-item-index">{index}</div>
      <div className="flex-grow-1 ml-3 hot-item-link">
        <Link to={link}>{linkText}</Link>
      </div>
      <div className="hot-item-post-count">Posts: {postCount}</div>
    </div>
  );
};
