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

export interface SearchItemProps {
  avatar: string;
  author: string;
  title: string;
  description: string;
  time: string;
  votesPayment: string;
  likes: string;
  comments: string;
  community: string;
  postImage: string;
}

export const SearchListItem = ({
  author,
  avatar,
  comments,
  community,
  description,
  likes,
  postImage,
  time,
  title,
  votesPayment,
}: SearchItemProps) => {
  return (
    <div className="pb-5 d-flex flex-column">
      <div className="d-flex">
        <img
          src={avatar}
          alt={title}
          className="rounded-circle search-item-avatar"
        />
        <div className="ml-3">
          <div className="d-flex align-items-start flex-grow-1">
            <div>
              <Link to={`/${author}`}>{author}</Link>
            </div>
            <div className="ml-2 flex-grow-1"> in {community}</div>
          </div>
          <div className="font-weight-bold my-3">{title}</div>
          <img src={postImage} className="search-post-image"/>
          <div className="mt-3">{description}</div>
        </div>

        <div>{time}</div>
      </div>
    </div>
  );
};
