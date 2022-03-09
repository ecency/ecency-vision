import { postBodySummary } from "@ecency/render-helper";
import moment from "moment";
import React, { Fragment } from "react";
import { history } from "../../../common/store";
import { Link } from "react-router-dom";
import parseDate from "../../helper/parse-date";
import { commentSvg, pinSvg } from "../../img/svg";
import { ListStyle } from "../../store/global/types";
import entryLink from "../entry-link";
import entryMenu from "../entry-menu";
import entryPayout from "../entry-payout";
import entryReblogBtn from "../entry-reblog-btn";
import entryVoteBtn from "../entry-vote-btn";
import entryVotes from "../entry-votes";
import profileLink from "../profile-link";
import { _t } from "../../i18n";
import Tooltip from "../tooltip";

export interface HotListItemProps {
  index: number;
  entry: any;
  toggleListStyle?: (listStyle: ListStyle) => void;
}

export const HotListItem = ({
  index,
  entry,
  toggleListStyle,
}: HotListItemProps) => {
  return (
    <div className="pb-5 d-flex align-items-center">
      <div className="hot-item-index">{index}</div>
      <div
        className="flex-grow-1 ml-3 hot-item-link"
        onClick={() => toggleListStyle && toggleListStyle(ListStyle.row)}
      >
        <Link to={`/trending/${entry.name}`}>#{entry.name}</Link>
      </div>
      <div className="hot-item-post-count">
        Posts: {entry.top_posts || "Not available"}
      </div>
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
  entry: any;
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
  let isPinned = community && entry && entry.stats?.is_pinned
  const formatMessage = (patterns: string[]): JSX.Element => {
    const { msg } = entry;

    const parts = msg.split(new RegExp(`(${patterns.join("|")})`, "gi"));

    return (
      <>
        {parts.map((part: any, i: number) => {
          if (part.trim() === "") {
            return null;
          }

          if (patterns.includes(part.toLowerCase())) {
            // post link
            if (part.includes("/")) {
              const s = part.split("/");
              return (
                <Fragment key={i}>
                  {entryLink({
                    entry: {
                      category: "post",
                      author: s[0].replace("@", ""),
                      permlink: s[1],
                    },
                    children: <>{part}</>,
                  } as any)}
                </Fragment>
              );
            }

            // user link
            return (
              <div key={i} className="mr-1">
                {profileLink({
                  username: part.replace("@", ""),
                  children: <>{part}</>,
                } as any)}
              </div>
            );
          }

          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  if (entry.msg) {
    let mentions = entry.msg.match(/@[\w.\d-]+/gi);
    if (!mentions) {
      return null;
    }

    let formatPatterns = [];

    // @username/permlink
    if (entry.url.startsWith("@")) {
      formatPatterns.push(entry.url);
    }

    // @usernames
    formatPatterns = [...formatPatterns, ...mentions];

    const username = mentions[0].replace("@", "");
    const msg = formatMessage(formatPatterns);
    const date = moment(parseDate(entry.date));
    return (
      <div
        className={`p${index === 1 ? "b" : "y"}-${
          json_metadata && json_metadata.image ? "5" : "4"
        } d-flex flex-column border-bottom`}
      >
        <div className="d-flex">
          {username && (
            <img
              src={`https://images.ecency.com/${
                (rest as any).global.canUseWebp ? "webp/" : ""
              }u/${username}/avatar/medium`}
              alt={username}
              className="rounded-circle search-item-avatar"
            />
          )}
          <div className="ml-3 deck-body">
            <div
              onClick={() => history && history.push(url)}
              className="pointer text-dark"
            >
              <div className="d-flex align-items-start flex-grow-1 hot-item-link">
                {msg}
              </div>
            </div>
          </div>

          <div className="ml-auto">{`${
            moment(date).fromNow(true).split(" ")[0]
          }${moment(date).fromNow(true).split(" ")[1][0]}`}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p${index === 1 ? "b" : "y"}-${
        json_metadata && json_metadata.image ? "5" : "4"
      } d-flex flex-column border-bottom`}
    >
      <div className="d-flex">
        {author && (
          <img
            src={`https://images.ecency.com/${
              (rest as any).global.canUseWebp ? "webp/" : ""
            }u/${author}/avatar/medium`}
            alt={title}
            className="rounded-circle search-item-avatar"
          />
        )}
        <div className="ml-3 deck-body">
          <div
            onClick={() => history && history.push(url)}
            className="pointer text-dark d-flex flex-column"
          >
            <div className="d-flex align-items-start flex-grow-1 hot-item-link">
              {author && (
                <div>
                  <Link to={`/@${author}`}>{author}</Link>
                </div>
              )}
              {community && (
                <div className="ml-2 flex-grow-1">
                  {" "}
                  in <Link to={`/@${community}`}> {community_title} </Link>
                </div>
              )}
              {isPinned && <Tooltip content={_t("entry-list-item.pinned")}>
                  <span className="pinned">{pinSvg}</span>
              </Tooltip>}
            </div>
            {title && (
              <div className="d-flex">
                <div className="hot-item-link font-weight-bold mt-3">
                  {title}
                </div>
              </div>
            )}

            <div className="mb-3">
              <small>{`${moment(created).fromNow(true)}`}</small>
            </div>
            {json_metadata && json_metadata.image && (
              <div
                className="search-post-image d-flex align-self-center"
                style={{ backgroundImage: `url(${json_metadata.image[0]})` }}
              />
            )}
            <div
              className="mt-3 hot-item-post-count deck-item-body text-secondary"
              dangerouslySetInnerHTML={{ __html: postBodySummary(body) }}
            />
          </div>
          <div className="item-controls mt-3 d-flex justify-content-between align-items-center">
            {entryVoteBtn({
              afterVote: () => {},
              entry,
              ...rest,
            } as any)}

            {entryPayout({
              ...rest,
              entry,
            } as any)}

            {entryVotes({
              ...rest,
              entry,
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
              alignBottom: false,
              entry,
            } as any)}
          </div>
        </div>
      </div>
    </div>
  );
};
