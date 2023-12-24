import { History } from "history";
import { Entry } from "../../store/entries/types";
import { Community, ROLES } from "../../store/communities";
import React, { useContext, useEffect, useMemo, useState } from "react";
import * as ss from "../../util/session-storage";
import { createReplyPermlink, makeJsonMetaDataReply } from "../../helper/posting";
import _c from "../../util/fix-class-names";
import ProfileLink from "../profile-link";
import { ProfilePopover } from "../profile-popover";
import { dateToFormatted, dateToFullRelative } from "../../helper/parse-date";
import { _t } from "../../i18n";
import { deleteForeverSvg, dotsHorizontal, pencilOutlineSvg, pinSvg } from "../../img/svg";
import { Tsx } from "../../i18n/helper";
import { version } from "../../../../package.json";
import UserAvatar from "../user-avatar";
import { EntryLink } from "../entry-link";
import EntryVoteBtn from "../entry-vote-btn";
import EntryPayout from "../entry-payout";
import EntryVotes from "../entry-votes";
import MuteBtn from "../mute-btn";
import Comment from "../comment";
import { EntriesCacheContext, useEntryCache } from "../../core";
import { useMappedStore } from "../../store/use-mapped-store";
import { useLocation } from "react-router";
import { DiscussionList } from "./discussion-list";
import { DiscussionItemBody } from "./discussion-item-body";
import { useFetchMutedUsersQuery } from "../../api/queries";
import { useCreateReply, usePinReply, useUpdateReply } from "../../api/mutations";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { EntryDeleteBtn } from "../entry-delete-btn";
import { Button } from "@ui/button";

interface Props {
  history: History;
  entry: Entry;
  root: Entry;
  community: Community | null;
  isRawContent: boolean;
  hideControls: boolean;
  discussionList: Entry[];
}

export function DiscussionItem({
  history,
  hideControls,
  isRawContent,
  entry: initialEntry,
  community,
  discussionList,
  root
}: Props) {
  const [reply, setReply] = useState(false);
  const [edit, setEdit] = useState(false);
  const [lsDraft, setLsDraft] = useState("");

  const { data: entry } = useEntryCache(initialEntry);
  const { data: mutedUsers } = useFetchMutedUsersQuery();
  const {
    activeUser,
    addAccount,
    global,
    users,
    ui,
    setActiveUser,
    updateActiveUser,
    deleteUser,
    toggleUIProp
  } = useMappedStore();
  const { updateVotes, updateCache } = useContext(EntriesCacheContext);

  const location = useLocation();

  const readMore = useMemo(() => entry.children > 0 && entry.depth > 5, [entry]);
  const showSubList = useMemo(() => !readMore && entry.children > 0, [entry]);
  const canEdit = useMemo(
    () => activeUser && activeUser.username === entry.author,
    [activeUser, entry]
  );
  const anchorId = useMemo(() => `anchor-@${entry.author}/${entry.permlink}`, [entry]);
  const canMute = useMemo(
    () =>
      !!activeUser &&
      !!community &&
      community.team.some(
        (m) =>
          m[0] === activeUser.username &&
          [ROLES.OWNER.toString(), ROLES.ADMIN.toString(), ROLES.MOD.toString()].includes(m[1])
      ),
    [activeUser, community]
  );
  const selected = useMemo(
    () => location.hash && location.hash.replace("#", "") === `@${entry.author}/${entry.permlink}`,
    [location, entry]
  );
  const entryIsMuted = useMemo(() => mutedUsers.includes(entry.author), [entry, mutedUsers]);
  const isTopComment = useMemo(
    () => entry.parent_author === root.author && entry.parent_permlink === root.permlink,
    [entry, root]
  );
  const isComment = useMemo(() => !!entry.parent_author, [entry]);
  const isOwnRoot = useMemo(
    () => !!activeUser && activeUser.username === root.author,
    [activeUser, root]
  );
  const isOwnReply = useMemo(
    () => !!activeUser && activeUser.username === entry.author,
    [activeUser, entry]
  );
  const isHidden = useMemo(
    () => entry?.net_rshares < -7000000000 && entry?.active_votes?.length > 3,
    [entry]
  ); // 1000 HP
  const isMuted = useMemo(
    () => entry?.stats?.gray && entry?.net_rshares >= 0 && entry?.author_reputation >= 0,
    [entry]
  );
  const isLowReputation = useMemo(
    () => entry?.stats?.gray && entry?.net_rshares >= 0 && entry?.author_reputation < 0,
    [entry]
  );
  const mightContainMutedComments = useMemo(
    () => !!activeUser && entryIsMuted && !isComment && !isOwnReply,
    [activeUser, entryIsMuted, isComment, isOwnReply]
  );
  const isDeletable = useMemo(
    () => !(entry.is_paidout || entry.net_rshares > 0 || entry.children > 0),
    [entry]
  );
  const isPinned = useMemo(
    () => root.json_metadata.pinned_reply === `${entry.author}/${entry.permlink}`,
    [root, entry]
  );

  const { mutateAsync: createReply, isLoading: isCreateLoading } = useCreateReply(entry, root, () =>
    toggleReply()
  );
  const { mutateAsync: updateReply, isLoading: isUpdateReplyLoading } = useUpdateReply(entry, () =>
    toggleEdit()
  );
  const { mutateAsync: pinReply, isLoading: isPinReplyLoading } = usePinReply(entry, root);

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

  const submitReply = (text: string) =>
    createReply({
      text,
      jsonMeta: makeJsonMetaDataReply(entry.json_metadata.tags || ["ecency"], version),
      permlink: createReplyPermlink(entry.author),
      point: true
    });

  const _updateReply = (text: string) =>
    updateReply({
      text,
      point: true,
      jsonMeta: makeJsonMetaDataReply(entry.json_metadata.tags || ["ecency"], version)
    });

  return (
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
            <div className="flex items-center">
              <EntryLink entry={entry} history={history}>
                <span className="date" title={dateToFormatted(entry.created)}>
                  {dateToFullRelative(entry.created)}
                </span>
              </EntryLink>
              {isPinned && <div className="w-3.5 h-3.5 ml-3 flex">{pinSvg}</div>}
            </div>
          </div>
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
              {community && canMute && (
                <MuteBtn
                  entry={entry}
                  community={community}
                  activeUser={activeUser!}
                  onSuccess={(entry) => updateCache([entry])}
                />
              )}

              <div className="ml-3 dropdown-container">
                <Dropdown>
                  <DropdownToggle>
                    <Button icon={dotsHorizontal} appearance="gray-link" />
                  </DropdownToggle>
                  <DropdownMenu>
                    {canEdit && (
                      <DropdownItemWithIcon onClick={toggleEdit}>
                        {pencilOutlineSvg}
                        {_t("g.edit")}
                      </DropdownItemWithIcon>
                    )}
                    {isOwnRoot && isTopComment && (
                      <DropdownItemWithIcon onClick={() => pinReply({ pin: !isPinned })}>
                        {pinSvg}
                        {_t(isPinned ? "g.unpin" : "g.pin")}
                      </DropdownItemWithIcon>
                    )}
                    {isDeletable && !isPinned && (
                      <DropdownItemWithIcon>
                        <EntryDeleteBtn activeUser={activeUser} parent={root} entry={entry}>
                          <div className="flex items-center [&>svg]:w-3.5 gap-3">
                            {deleteForeverSvg} {_t("g.delete")}
                          </div>
                        </EntryDeleteBtn>
                      </DropdownItemWithIcon>
                    )}
                    {!canEdit && !(isOwnRoot && isTopComment) && !isDeletable && (
                      <>No actions to perform</>
                    )}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          )}
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
          inProgress={isCreateLoading || isUpdateReplyLoading}
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
          inProgress={isCreateLoading || isUpdateReplyLoading}
          autoFocus={true}
        />
      )}

      {showSubList && (
        <DiscussionList
          discussionList={discussionList}
          community={community}
          parent={entry}
          root={root}
          hideControls={hideControls}
          history={history}
          isRawContent={isRawContent}
        />
      )}
    </div>
  );
}
