import React, { useEffect, useMemo, useState } from "react";
import { History, Location } from "history";
import { postBodySummary, setProxyBase } from "@ecency/render-helper";
import { Entry, EntryVote } from "../../store/entries/types";
import { Account, FullAccount } from "../../store/accounts/types";
import ProfileLink from "../profile-link/index";
import Tag from "../tag";
import UserAvatar from "../user-avatar/index";
import EntryLink from "../entry-link/index";
import EntryVoteBtn from "../entry-vote-btn/index";
import EntryReblogBtn from "../entry-reblog-btn/index";
import EntryPayout from "../entry-payout/index";
import EntryVotes from "../entry-votes";
import Tooltip from "../tooltip";
import EntryMenu from "../entry-menu";
import { dateToFormatted, dateToRelative } from "../../helper/parse-date";
import { _t } from "../../i18n";
import { Tsx } from "../../i18n/helper";
import _c from "../../util/fix-class-names";
import truncate from "../../util/truncate";
import { commentSvg, pinSvg, repeatSvg, volumeOffSvg } from "../../img/svg";
import defaults from "../../constants/defaults.json";
import { ProfilePopover } from "../profile-popover";
import { match } from "react-router-dom";
import { getPost } from "../../api/bridge";
import "./_index.scss";
import useMountedState from "react-use/lib/useMountedState";
import { useMappedStore } from "../../store/use-mapped-store";
import useMount from "react-use/lib/useMount";
import { useUnmount } from "react-use";
import { Community } from "../../store/communities";
import { EntryListItemThumbnail } from "./entry-list-item-thumbnail";

setProxyBase(defaults.imageServer);

interface Props {
  history: History;
  location: Location;
  entry: Entry;
  community?: Community | null;
  asAuthor?: string;
  promoted?: boolean;
  order: number;
  account?: Account;
  match?: match<{
    username: string;
  }>;
  muted?: boolean;
  pinEntry?: (entry: Entry | null) => void;
}

export function EntryListItem({
  asAuthor = "",
  entry: entryProp,
  community,
  account,
  match,
  history,
  muted: mutedProp,
  promoted = false,
  order
}: Props) {
  const pageAccount = account as FullAccount;

  const [showNsfw, setShowNsfw] = useState(false);
  const [showMuted, setShowMuted] = useState(mutedProp);
  const [showModMuted, setShowModMuted] = useState(false);

  const { global, activeUser, addAccount, updateEntry } = useMappedStore();

  const isMounted = useMountedState();

  useMount(() => {
    document.getElementsByTagName("html")[0].style.position = "relative";
  });

  useUnmount(() => {
    document.getElementsByTagName("html")[0].style.position = "unset";
  });

  useEffect(() => {
    setShowModMuted(entry.stats?.gray ?? false);
  }, [entryProp]);

  useEffect(() => {
    setShowMuted(false);
  }, [activeUser]);

  useEffect(() => {
    setShowMuted(mutedProp ?? false);
  }, [mutedProp]);

  const afterVote = async (votes: EntryVote[], estimated: number) => {
    const _entry = entry;
    const { payout } = _entry;
    const newPayout = payout + estimated;
    if (_entry.active_votes) {
      updateEntry({
        ..._entry,
        active_votes: votes,
        stats: { ..._entry.stats, total_votes: votes.length },
        payout: newPayout,
        pending_payout_value: String(newPayout)
      });
    } else {
      const entry = await getPost(_entry.author, _entry.permlink);
      if (entry) {
        updateEntry({
          ..._entry,
          active_votes: [...entry.active_votes, ...votes],
          payout: newPayout,
          pending_payout_value: String(newPayout)
        });
      }
    }
  };

  const pinned = useMemo(() => pageAccount?.profile?.pinned, [pageAccount]);
  const noImage = require("../../img/noimage.svg");

  const nsfwImage = require("../../img/nsfw.png");

  const isCrossPost = useMemo(() => !!entryProp.original_entry, [entryProp]);
  const entry = useMemo(() => entryProp.original_entry || entryProp, [entryProp]);
  const dateRelative = useMemo(() => dateToRelative(entry.created), [entry]);
  const dateFormatted = useMemo(() => dateToFormatted(entry.created), [entry]);
  const reBlogged = useMemo(() => {
    if (entry.reblogged_by?.length > 0) {
      return entry.reblogged_by[0];
    } else {
      return asAuthor && asAuthor !== entry.author && !entry.parent_author ? asAuthor : undefined;
    }
  }, [entry, asAuthor]);

  const nsfw = useMemo(
    () =>
      entry.json_metadata &&
      entry.json_metadata.tags &&
      Array.isArray(entry.json_metadata.tags) &&
      entry.json_metadata.tags.includes("nsfw"),
    [entry]
  );

  return (
    <div
      className={_c(`entry-list-item ${promoted ? "promoted-item" : ""} ${global.filter}`)}
      id={(entry.author + entry.permlink).replace(/[0-9]/g, "")}
    >
      {isCrossPost ? (
        <div className="cross-item">
          <ProfileLink history={history} addAccount={addAccount} username={entryProp.author}>
            <span className="cross-item-author notranslate">{`@${entryProp.author}`}</span>
          </ProfileLink>{" "}
          {_t("entry-list-item.cross-posted")}{" "}
          <EntryLink entry={entryProp.original_entry!}>
            <a className="cross-item-link">
              {truncate(
                `@${entryProp.original_entry!.author}/${entryProp.original_entry!.permlink}`,
                40
              )}
            </a>
          </EntryLink>{" "}
          {_t("entry-list-item.cross-posted-to")}{" "}
          <Tag
            global={global}
            history={history}
            type="link"
            tag={
              entryProp.community && entryProp.community_title
                ? { name: entryProp.community, title: entryProp.community_title }
                : entryProp.category
            }
          >
            <a className="community-name">{entryProp.community_title || entryProp.category}</a>
          </Tag>
        </div>
      ) : null}
      <div className="item-header">
        <div className="item-header-main">
          <div className="author-part" id={`${entry.author}-${entry.permlink}`}>
            <div className="flex items-center" id={`${entry.author}-${entry.permlink}`}>
              <ProfileLink username={entry.author} history={history} addAccount={addAccount}>
                <span className="author-avatar block">
                  <UserAvatar username={entry.author} size="small" />
                </span>
              </ProfileLink>

              <ProfilePopover entry={entry} />
            </div>
          </div>
          <Tag
            global={global}
            history={history}
            type="link"
            tag={
              entry.community && entry.community_title
                ? { name: entry.community, title: entry.community_title }
                : entry.category
            }
          >
            <a className="category">{entry.community_title || entry.category}</a>
          </Tag>
          <span className="read-mark" />
          <span className="date" title={dateFormatted}>
            {dateRelative}
          </span>
        </div>
        <div className="item-header-features">
          {(community && !!entry.stats?.is_pinned) ||
            (entry.permlink === pinned && (
              <Tooltip content={_t("entry-list-item.pinned")}>
                <span className="pinned">{pinSvg}</span>
              </Tooltip>
            ))}
          {reBlogged && (
            <span className="reblogged">
              {repeatSvg} {_t("entry-list-item.reblogged", { n: reBlogged })}
            </span>
          )}
          {promoted && (
            <>
              <span className="flex-spacer" />
              <div className="promoted">
                <a href="/faq#how-promotion-work">{_t("entry-list-item.promoted")}</a>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="item-body">
        {nsfw && !showNsfw && !global.nsfw ? (
          <>
            <div className="item-image item-image-nsfw">
              <img className="w-full sm:w-auto" src={nsfwImage} alt={entry.title} />
            </div>
            <div className="item-summary">
              <div className="item-nsfw">
                <span className="nsfw-badge">NSFW</span>
              </div>
              <div className="item-nsfw-options">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowNsfw(true);
                  }}
                >
                  {_t("nsfw.reveal")}
                </a>{" "}
                {_t("g.or").toLowerCase()}{" "}
                {activeUser && (
                  <>
                    {_t("nsfw.settings-1")}{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        history.push(`/@${activeUser.username}/settings`);
                      }}
                    >
                      {_t("nsfw.settings-2")}
                    </a>
                    {"."}
                  </>
                )}
                {!activeUser && (
                  <>
                    <Tsx k="nsfw.signup">
                      <span />
                    </Tsx>
                    {"."}
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
        {showModMuted && showMuted ? (
          <>
            <div className="item-image item-image-nsfw">
              <img className="w-full sm:w-auto" src={nsfwImage} alt={entry.title} />
            </div>
            <div className="item-summary">
              <div className="item-nsfw">
                <span className="nsfw-badge text-capitalize d-inline-flex align-items-center">
                  <div className="mute-icon">{volumeOffSvg}</div> <div>{_t("g.muted")}</div>
                </span>
              </div>
              <div className="item-nsfw-options">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    showModMuted ? setShowModMuted(false) : setShowMuted(false);
                  }}
                >
                  {showModMuted ? _t("g.modmuted-message") : _t("g.muted-message")}
                </a>
              </div>
            </div>
          </>
        ) : (
          <>
            <EntryListItemThumbnail
              entryProp={entryProp}
              history={history}
              isCrossPost={isCrossPost}
              noImage={noImage}
              entry={entry}
            />
            <div className="item-summary">
              <EntryLink entry={isCrossPost ? entryProp : entry} history={history}>
                <div className="item-title">{entry.title}</div>
              </EntryLink>
              <EntryLink entry={isCrossPost ? entryProp : entry} history={history}>
                <div className="item-body">
                  {entry.json_metadata.description || postBodySummary(entry, 200)}
                </div>
              </EntryLink>
            </div>
          </>
        )}
        <div className="item-controls">
          <EntryVoteBtn
            isPostSlider={true}
            entry={entry}
            afterVote={afterVote}
            account={account}
            history={history}
            match={match}
          />
          <EntryPayout entry={entry} />
          <EntryVotes entry={entry} history={history} />
          <EntryLink entry={isCrossPost ? entryProp : entry} history={history}>
            <a className="replies notranslate">
              <Tooltip
                content={
                  entry.children > 0
                    ? entry.children === 1
                      ? _t("entry-list-item.replies")
                      : _t("entry-list-item.replies-n", { n: entry.children })
                    : _t("entry-list-item.no-replies")
                }
              >
                <span className="inner">
                  {commentSvg} {entry.children}
                </span>
              </Tooltip>
            </a>
          </EntryLink>
          <EntryReblogBtn entry={entry} />
          <EntryMenu history={history} alignBottom={order >= 1} entry={entry} />
        </div>
      </div>
    </div>
  );
}

export default EntryListItem;
