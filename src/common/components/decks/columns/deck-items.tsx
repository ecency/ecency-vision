import { postBodySummary, proxifyImageSrc } from "@ecency/render-helper";
import React, { Fragment, useEffect } from "react";
import { Link } from "react-router-dom";
import _ from "lodash";
import { dateToRelative } from "../../../helper/parse-date";
import { _t } from "../../../i18n";
import { commentSvg, pinSvg } from "../../../img/svg";
import EntryPayout from "../../entry-payout";
import EntryVoteBtn from "../../entry-vote-btn";
import EntryVotes from "../../entry-votes";
import EntryReblogBtn from "../../entry-reblog-btn";
import EntryMenu from "../../entry-menu";
import Tooltip from "../../tooltip";
import entryLink from "../../entry-link";
import profileLink from "../../profile-link";
import { history } from "../../../store";
import { useMappedStore } from "../../../store/use-mapped-store";

export interface HotListItemProps {
  index: number;
  entry: any;
}

export const HotListItem = ({ index, entry }: HotListItemProps) => {
  return (
    <div className="pb-5 d-flex align-items-center">
      <div className="hot-item-index">{index}</div>
      <div
        className="flex-grow-1 ml-3 hot-item-link"
        // onClick={() => toggleListStyle && toggleListStyle(ListStyle.row)}
      >
        <Link to={`/trending/${entry.name}`}>#{entry.name}</Link>
      </div>
      <div className="hot-item-post-count">
        {entry.top_posts + entry.comments || 0} {_t("communities.n-posts")}
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
  category: string;
  community_title: string;
  url: string;
  index: number;
  json_metadata: any;
  entry: any;
  onMounted: () => void;
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
  category,
  entry,
  onMounted
}: SearchItemProps) => {
  const { global } = useMappedStore();

  useEffect(() => {
    onMounted();
  }, []);

  let isPinned = community && entry && entry.stats?.is_pinned;

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
                      permlink: s[1]
                    },
                    children: <>{part}</>
                  } as any)}
                </Fragment>
              );
            }

            // user link
            return (
              <div key={i} className="mr-1">
                {profileLink({
                  username: part.replace("@", ""),
                  children: <>{part}</>
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
                global.canUseWebp ? "webp/" : ""
              }u/${username}/avatar/medium`}
              alt={username}
              className="rounded-circle search-item-avatar"
            />
          )}
          <div className="ml-3 deck-body">
            <div onClick={() => history && history.push(url)} className="pointer text-dark">
              <div className="d-flex align-items-start flex-grow-1 hot-item-link">{msg}</div>
            </div>
          </div>

          <div className="ml-auto">{dateToRelative(entry.date)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column border-bottom p-3">
      <div className="deck-body d-flex flex-column w-100">
        <div className="text-dark d-flex flex-column">
          <div className="d-flex align-items-center flex-grow-1 hot-item-link">
            {author && (
              <img
                src={`https://images.ecency.com/${
                  global.canUseWebp ? "webp/" : ""
                }u/${author}/avatar/medium`}
                alt={title}
                className="rounded-circle search-item-avatar mr-3"
              />
            )}
            {author && (
              <div>
                <Link to={`/@${author}`}>{author}</Link>
              </div>
            )}
            {community && (
              <div className="ml-1 flex-grow-1">
                {" "}
                {_t("entry.community-in")}{" "}
                <Link to={`/created/${community}`}> {community_title} </Link>
              </div>
            )}
            {!community && (
              <div className="ml-2 flex-grow-1">
                {" "}
                {_t("entry.community-in")} <Link to={`/created/${category}`}> #{category} </Link>
              </div>
            )}
            {isPinned && (
              <Tooltip content={_t("entry-list-item.pinned")}>
                <span className="deck-pinned">{pinSvg}</span>
              </Tooltip>
            )}
            <div className="mb-3">
              <small>{`${dateToRelative(created)}`}</small>
            </div>
          </div>
          <div onClick={() => history && history.push(url)} className="pointer">
            {title && (
              <div className="d-flex">
                <div className="hot-item-link font-weight-bold mt-3">{title}</div>
              </div>
            )}

            {json_metadata &&
              json_metadata.image &&
              _.isArray(json_metadata.image) &&
              json_metadata.image.length > 0 && (
                <div
                  className="search-post-image d-flex align-self-center mt-3"
                  style={{
                    backgroundImage: `url(${proxifyImageSrc(
                      json_metadata.image[0],
                      undefined,
                      undefined,
                      global.canUseWebp ? "webp" : "match"
                    )})`
                  }}
                />
              )}
            <div
              className="mt-3 hot-item-post-count deck-item-body text-secondary"
              dangerouslySetInnerHTML={{ __html: postBodySummary(body) }}
            />
          </div>
        </div>
        <div className="item-controls mt-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <EntryVoteBtn entry={entry} afterVote={() => {}} isPostSlider={false} />
            <div className="pl-2">
              <EntryPayout entry={entry} />
            </div>
          </div>

          <EntryVotes history={history!!} entry={entry} />
          <Link to={`${url}#discussion`} className="text-secondary">
            <div className="d-flex align-items-center comments">
              <div style={{ paddingRight: 4 }}>{commentSvg}</div>
              <div>{children}</div>
            </div>
          </Link>

          <EntryReblogBtn entry={entry} />
          <EntryMenu history={history!!} alignBottom={false} entry={entry} />
        </div>
      </div>
    </div>
  );
};

export const ListItemSkeleton = () => {
  return (
    <div className="list-item-skeleton border-bottom p-3">
      <div className="avatar" />
      <div className="username" />
      <div className="date" />
      <div className="title" />
      <div className="media-image" />
      <div className="description" />
      <div className="actions" />
    </div>
  );
};
