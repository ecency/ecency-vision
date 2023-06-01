import { useMappedStore } from "../../../../store/use-mapped-store";
import React, { Fragment, useEffect, useState } from "react";
import profileLink from "../../../profile-link";
import { history } from "../../../../store";
import { dateToRelative } from "../../../../helper/parse-date";
import { Link } from "react-router-dom";
import { _t } from "../../../../i18n";
import Tooltip from "../../../tooltip";
import { commentSvg, pinSvg } from "../../../../img/svg";
import { catchPostImage, postBodySummary, proxifyImageSrc } from "@ecency/render-helper";
import EntryVoteBtn from "../../../entry-vote-btn";
import EntryPayout from "../../../entry-payout";
import EntryVotes from "../../../entry-votes";
import EntryReblogBtn from "../../../entry-reblog-btn";
import EntryMenu from "../../../entry-menu";
import { transformMarkedContent } from "../../../../util/transform-marked-content";
import { EntryLink } from "../../../entry-link";

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
  onEntryView: () => void;
  marked?: boolean;
}

export const SearchListItem = ({
  author,
  community,
  community_title,
  json_metadata,
  created,
  index,
  url,
  category,
  entry,
  onMounted,
  onEntryView,
  marked
}: SearchItemProps) => {
  const { global } = useMappedStore();

  const [title, setTitle] = useState(entry.title);
  const [body, setBody] = useState(entry.b);
  const [image, setImage] = useState(
    global.canUseWebp
      ? catchPostImage(entry.body, 600, 500, "webp")
      : catchPostImage(entry.body, 600, 500)
  );

  useEffect(() => {
    setTitle(entry.title_marked ? transformMarkedContent(entry.title_marked) : entry.title);
    setBody(
      entry.body_marked
        ? transformMarkedContent(entry.body_marked)
        : postBodySummary(entry.body, 200)
    );
  }, [entry]);

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
              return <Fragment key={i}>{part}</Fragment>;
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
                <Link target="_blank" to={`/@${author}`}>
                  {author}
                </Link>
              </div>
            )}
            {community && (
              <div className="ml-1 flex-grow-1 text-truncate">
                {" "}
                {_t("entry.community-in")}{" "}
                <Link target="_blank" to={`/created/${community}`}>
                  {" "}
                  {community_title}{" "}
                </Link>
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
            <div className="date mb-3">
              <EntryLink target="_blank" entry={entry}>
                <small>{`${dateToRelative(created)}`}</small>
              </EntryLink>
            </div>
          </div>
          <div onClick={() => onEntryView()} className="pointer">
            {title && (
              <div className="d-flex">
                <div className="hot-item-link font-weight-bold mt-3">{title}</div>
              </div>
            )}

            {image && (
              <div
                className="search-post-image d-flex align-self-center mt-3"
                style={{
                  backgroundImage: `url(${proxifyImageSrc(image)})`
                }}
              />
            )}
            <div className="mt-3 hot-item-post-count deck-item-body text-secondary">{body}</div>
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
              <div>{entry.children}</div>
            </div>
          </Link>

          <EntryReblogBtn entry={entry} />
          <EntryMenu history={history!!} alignBottom={false} entry={entry} />
        </div>
      </div>
    </div>
  );
};
