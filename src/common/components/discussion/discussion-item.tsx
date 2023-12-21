import { History } from "history";
import { Discussion as DiscussionType } from "../../store/discussion/types";
import { Entry } from "../../store/entries/types";
import { Community, ROLES } from "../../store/communities";
import { FullAccount } from "../../store/accounts/types";
import React, { useContext, useEffect, useState } from "react";
import * as ss from "../../util/session-storage";
import { createReplyPermlink, makeJsonMetaDataReply } from "../../helper/posting";
import { comment, formatError } from "../../api/operations";
import tempEntry from "../../helper/temp-entry";
import { error } from "../feedback";
import { getFollowing } from "../../api/hive";
import _c from "../../util/fix-class-names";
import ProfileLink from "../profile-link";
import { ProfilePopover } from "../profile-popover";
import { dateToFormatted, dateToFullRelative } from "../../helper/parse-date";
import { _t } from "../../i18n";
import { deleteForeverSvg, dotsHorizontal, pencilOutlineSvg } from "../../img/svg";
import { Tsx } from "../../i18n/helper";
import MyDropDown from "../dropdown";
import { version } from "../../../../package.json";
import UserAvatar from "../user-avatar";
import { EntryLink } from "../entry-link";
import EntryDeleteBtn from "../entry-delete-btn";
import EntryVoteBtn from "../entry-vote-btn";
import EntryPayout from "../entry-payout";
import EntryVotes from "../entry-votes";
import MuteBtn from "../mute-btn";
import Comment from "../comment";
import { EntriesCacheContext } from "../../core";
import { useMappedStore } from "../../store/use-mapped-store";
import { useLocation } from "react-router";
import { DiscussionList } from "./discussion-list";
import { DiscussionItemBody } from "./discussion-item-body";

interface Props {
  history: History;
  discussion: DiscussionType;
  entry: Entry;
  community: Community | null;
  isRawContent: boolean;
  hideControls: boolean;
}

export function DiscussionItem({
  history,
  discussion,
  hideControls,
  isRawContent,
  entry,
  community
}: Props) {
  const [reply, setReply] = useState(false);
  const [edit, setEdit] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [mutedData, setMutedData] = useState([] as string[]);
  const [isMounted, setIsMounted] = useState(false);
  const [lsDraft, setLsDraft] = useState("");

  const {
    activeUser,
    addAccount,
    global,
    users,
    ui,
    setActiveUser,
    updateActiveUser,
    deleteUser,
    toggleUIProp,
    deleteReply
  } = useMappedStore();
  const { addReply, updateVotes, updateRepliesCount, updateCache } =
    useContext(EntriesCacheContext);

  const location = useLocation();

  useEffect(() => {
    setIsMounted(true);
    isMounted && fetchMutedUsers();
    checkLsDraft();
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (edit || reply) {
      checkLsDraft();
    }
  }, [edit, reply]);

  const toggleReply = () => {
    if (edit) {
      return;
    }
    setReply(!reply);
  };

  const toggleEdit = () => {
    if (reply) {
      return;
    }
    setEdit(!edit);
  };

  const checkLsDraft = () => {
    let replyDraft = ss.get(`reply_draft_${entry?.author}_${entry?.permlink}`);
    replyDraft = (replyDraft && replyDraft.trim()) || "";
    setLsDraft(replyDraft);
  };

  const submitReply = (text: string) => {
    if (!activeUser || !activeUser.data.__loaded) {
      return;
    }

    const { author: parentAuthor, permlink: parentPermlink } = entry;
    const author = activeUser.username;
    const permlink = createReplyPermlink(entry.author);

    const jsonMeta = makeJsonMetaDataReply(entry.json_metadata.tags || ["ecency"], version);
    setInProgress(true);

    comment(author, parentAuthor, parentPermlink, permlink, "", text, jsonMeta, null, true)
      .then(() => {
        const nReply = tempEntry({
          author: activeUser.data as FullAccount,
          permlink,
          parentAuthor,
          parentPermlink,
          title: "",
          body: text,
          tags: [],
          description: null
        });

        // add new reply to store
        addReply(entry, nReply);

        // remove reply draft
        ss.remove(`reply_draft_${entry.author}_${entry.permlink}`);

        // close comment box
        toggleReply();

        if (entry.children === 0 && isMounted) {
          // Update parent comment.
          updateRepliesCount(entry, 1);
        }
      })
      .catch((e) => {
        console.log(e);
        error(...formatError(e));
      })
      .finally(() => {
        setInProgress(false);
      });
  };

  const _updateReply = (text: string) => {
    const { permlink, parent_author: parentAuthor, parent_permlink: parentPermlink } = entry;
    const jsonMeta = makeJsonMetaDataReply(entry.json_metadata.tags || ["ecency"], version);
    setInProgress(true);

    comment(
      activeUser?.username!,
      parentAuthor!,
      parentPermlink!,
      permlink,
      "",
      text,
      jsonMeta,
      null
    )
      .then(() => {
        const nReply: Entry = {
          ...entry,
          body: text
        };
        ss.remove(`reply_draft_${entry.author}_${entry.permlink}`);

        updateCache([nReply]);
        toggleEdit(); // close comment box
      })
      .catch((e) => {
        error(...formatError(e));
      })
      .finally(() => {
        setInProgress(false);
      });
  };

  const deleted = () => {
    deleteReply(entry);
  };

  const fetchMutedUsers = () => {
    if (activeUser) {
      getFollowing(activeUser.username, "", "ignore", 100).then((r) => {
        if (r) {
          let filterList = r.map((user) => user.following);
          isMounted && setMutedData(filterList as string[]);
        }
      });
    }
  };

  const readMore = entry.children > 0 && entry.depth > 5;
  const showSubList = !readMore && entry.children > 0;
  const canEdit = activeUser && activeUser.username === entry.author;

  const canMute =
    activeUser && community
      ? !!community.team.find((m) => {
          return (
            m[0] === activeUser.username &&
            [ROLES.OWNER.toString(), ROLES.ADMIN.toString(), ROLES.MOD.toString()].includes(m[1])
          );
        })
      : false;

  const anchorId = `anchor-@${entry.author}/${entry.permlink}`;

  const selected =
    location.hash && location.hash.replace("#", "") === `@${entry.author}/${entry.permlink}`;

  let normalComponent = (
    <div className={_c(`discussion-item depth-${entry.depth} ${selected ? "selected-item" : ""}`)}>
      <div className="relative">
        <div className="item-anchor" id={anchorId} />
      </div>
      <div className="item-inner">
        <div className="item-figure">
          <ProfileLink history={history} username={entry.author} addAccount={addAccount}>
            <UserAvatar username={entry.author} size="medium" />
          </ProfileLink>
        </div>
        <div className="item-content">
          <div className="item-header">
            <div className="flex items-center" id={`${entry.author}-${entry.permlink}`}>
              <ProfilePopover entry={entry} />
            </div>
            <span className="separator circle-separator" />
            <EntryLink entry={entry} history={history}>
              <span className="date" title={dateToFormatted(entry.created)}>
                {dateToFullRelative(entry.created)}
              </span>
            </EntryLink>
          </div>
          {(() => {
            let menuItems = [
              {
                label: _t("g.edit"),
                onClick: toggleEdit,
                icon: pencilOutlineSvg
              }
            ];
            if (!(entry.is_paidout || entry.net_rshares > 0 || entry.children > 0)) {
              let deleteItem = {
                label: "",
                onClick: () => {},
                icon: (
                  <EntryDeleteBtn activeUser={activeUser} entry={entry} onSuccess={deleted}>
                    <a title={_t("g.delete")} className="delete-btn ml-0 pr-3">
                      {deleteForeverSvg} {_t("g.delete")}
                    </a>
                  </EntryDeleteBtn>
                )
              };
              menuItems.push(deleteItem);
            }

            const menuConfig = {
              history: history,
              label: "",
              icon: dotsHorizontal,
              items: menuItems
            };

            const entryIsMuted = mutedData.includes(entry.author);
            const isComment = !!entry.parent_author;
            const ownEntry = activeUser && activeUser.username === entry.author;
            const isHidden = entry?.net_rshares < -7000000000 && entry?.active_votes?.length > 3; // 1000 HP
            const isMuted =
              entry?.stats?.gray && entry?.net_rshares >= 0 && entry?.author_reputation >= 0;
            const isLowReputation =
              entry?.stats?.gray && entry?.net_rshares >= 0 && entry?.author_reputation < 0;
            const mightContainMutedComments = activeUser && entryIsMuted && !isComment && !ownEntry;

            return (
              <>
                {isMuted && (
                  <div className="hidden-warning mt-2">
                    <span>
                      <Tsx k="entry.muted-warning" args={{ community: entry.community_title }}>
                        <span />
                      </Tsx>
                    </span>
                  </div>
                )}

                {isHidden && (
                  <div className="hidden-warning mt-2">
                    <span>{_t("entry.hidden-warning")}</span>
                  </div>
                )}

                {isLowReputation && (
                  <div className="hidden-warning mt-2">
                    <span>{_t("entry.lowrep-warning")}</span>
                  </div>
                )}

                {mightContainMutedComments && (
                  <div className="hidden-warning mt-2">
                    <span>{_t("entry.comments-hidden")}</span>
                  </div>
                )}

                <DiscussionItemBody entry={entry} isRawContent={isRawContent} />
                {hideControls ? (
                  <></>
                ) : (
                  <div className="item-controls">
                    <EntryVoteBtn
                      entry={entry}
                      afterVote={(votes, estimated) =>
                        updateVotes(entry, votes, entry.payout + estimated)
                      }
                      isPostSlider={false}
                    />
                    <EntryPayout entry={entry} />
                    <EntryVotes entry={entry} history={history} />
                    <a className={_c(`reply-btn ${edit ? "disabled" : ""}`)} onClick={toggleReply}>
                      {_t("g.reply")}
                    </a>
                    {community &&
                      canMute &&
                      MuteBtn({
                        entry,
                        community: community!,
                        activeUser: activeUser!,
                        onSuccess: (entry) => updateCache([entry])
                      })}
                    {canEdit && (
                      <div className="ml-3 dropdown-container">
                        <MyDropDown {...menuConfig} float="right" alignBottom={true} />
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}

          {readMore && (
            <div className="read-more">
              <EntryLink entry={entry} history={history}>
                <a>{_t("discussion.read-more")}</a>
              </EntryLink>
            </div>
          )}
        </div>
      </div>

      {reply && (
        <Comment
          entry={entry}
          updateActiveUser={updateActiveUser}
          deleteUser={deleteUser}
          toggleUIProp={toggleUIProp}
          global={global}
          location={location}
          ui={ui}
          users={users}
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          defText={lsDraft}
          submitText={_t("g.reply")}
          cancellable={true}
          onSubmit={submitReply}
          onCancel={toggleReply}
          inProgress={inProgress}
          autoFocus={true}
        />
      )}

      {edit && (
        <Comment
          entry={entry}
          updateActiveUser={updateActiveUser}
          deleteUser={deleteUser}
          toggleUIProp={toggleUIProp}
          global={global}
          location={location}
          ui={ui}
          users={users}
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          defText={entry.body}
          submitText={_t("g.update")}
          cancellable={true}
          onSubmit={_updateReply}
          onCancel={toggleEdit}
          inProgress={inProgress}
          autoFocus={true}
        />
      )}

      {showSubList && (
        <DiscussionList
          community={community}
          discussion={discussion}
          parent={entry}
          hideControls={hideControls}
          history={history}
          isRawContent={isRawContent}
        />
      )}
    </div>
  );

  return normalComponent;
}
