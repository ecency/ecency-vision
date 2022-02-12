import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import {
  commentSvg,
  dotsHorizontal,
  peopleSvg,
  repeatSvg,
  upvote,
} from "../../img/svg";
import entryMenu from "../entry-menu";
import entryPayout from "../entry-payout";
import entryReblogBtn from "../entry-reblog-btn";
import entryVoteBtn from "../entry-vote-btn";
import entryVotes from "../entry-votes";

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
  body: string;
  created: string;
  votesPayment: string;
  likes: string;
  children: string;
  community: string;
  community_title: string;
  url: string;
  index: number;
  json_metadata: any;
  entry: any
}

export const SearchListItem = ({
  author,
  children,
  community,
  community_title,
  body,
  likes,
  json_metadata,
  created,
  title,
  votesPayment,
  index,
  url,
  entry,
  ...rest
}: SearchItemProps) => {
  debugger;
  return (
    <div className={`p${index===1 ? "b" : "y"}-${json_metadata && json_metadata.image?"5":"4"} d-flex flex-column border-bottom`}>
      <div className="d-flex">
        {author && <img
          src={`https://images.ecency.com/webp/u/${author}/avatar/medium`}
          alt={title}
          className="rounded-circle search-item-avatar"
        />}
        <div className="ml-3 deck-body">
          <Link to={url} className="pointer text-dark">
            <div className="d-flex align-items-start flex-grow-1 hot-item-link">
              {author && <div>
                <Link to={`/@${author}`}>{author}</Link>
              </div>}
              {community && (
                <div className="ml-2 flex-grow-1"> in <Link to={`/@${community}`}> {community_title} </Link></div>
              )}
            </div>
            {title && <div className="hot-item-link font-weight-bold my-3">{title}</div>}
            {json_metadata && json_metadata.image && <img src={json_metadata.image[0]} className="search-post-image" />}
            <div className="mt-3 hot-item-post-count deck-item-body text-secondary" dangerouslySetInnerHTML={{__html:body}} />
          </Link>
          <div className="item-controls mt-3 d-flex justify-content-between align-items-center">
            {entryVoteBtn({
                afterVote: () => {},
                entry,
                ...rest
            } as any)}

            {entryPayout({
                ...rest,
                entry
            } as any)}

            {entryVotes({
                ...rest,
                entry
            } as any)}
            <Link to={`${url}#discussion`} className="text-secondary">
              <div className="d-flex align-items-center comments">
                <div>{commentSvg}</div>
                <div>{children}</div>
              </div>
            </Link>

            {entryReblogBtn({
                ...rest,
            } as any)}

            {entryMenu({
                ...rest,
                alignBottom:false,
                entry,
            } as any)}
          </div>
        </div>

        <div>{`${moment(created).fromNow(true).split(" ")[0]}${moment(created).fromNow(true).split(" ")[1][0]}`}</div>
      </div>
    </div>
  );
};
