import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Tsx } from "../../i18n/helper";
import appPackage from "../../../../package.json";
import { EntryLink } from "../entry-link";
import { DiscussionList } from "./discussion-list";
import { DiscussionItemBody } from "./discussion-item-body";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { Button } from "@ui/button";
import { DiscussionBots } from "./discussion-bots";
import { Community, Entry, ROLES } from "@/entities";
import { EntriesCacheContext, useEntryCache } from "@/core/caches";
import { getMutedUsersQuery } from "@/api/queries/get-muted-users-query";
import { useGlobalStore } from "@/core/global-store";
import { getBotsQuery } from "@/api/queries";
import { useCreateReply, usePinReply, useUpdateReply } from "@/api/mutations";
import * as ss from "@/utils/session-storage";
import {
  createReplyPermlink,
  dateToFormatted,
  dateToFullRelative,
  makeJsonMetaDataReply
} from "@/utils";
import {
  EntryDeleteBtn,
  EntryPayout,
  EntryVoteBtn,
  EntryVotes,
  ProfileLink,
  ProfilePopover,
  UserAvatar
} from "@/features/shared";
import { deleteForeverSvg, dotsHorizontal, pencilOutlineSvg, pinSvg } from "@ui/svg";
import i18next from "i18next";
import { MuteBtn } from "@/features/shared/mute-btn";
import { Comment } from "../comment";

interface Props {
  entry: Entry;
  root: Entry;
  community: Community | null;
  isRawContent: boolean;
  hideControls: boolean;
  discussionList: Entry[];
}

export function DiscussionItem({
  hideControls,
  isRawContent,
  entry: initialEntry,
  community,
  discussionList,
  root
}: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const [reply, setReply] = useState(false);
  const [edit, setEdit] = useState(false);
  const [lsDraft, setLsDraft] = useState("");

  const { data: entry } = useEntryCache(initialEntry);
  const { data: mutedUsers } = getMutedUsersQuery(activeUser).useClientQuery();
  const { updateVotes, updateCache } = useContext(EntriesCacheContext);

  const { data: botsList } = getBotsQuery().useClientQuery();

  const readMore = useMemo(() => entry.children > 0 && entry.depth > 5, [entry]);
  const showSubList = useMemo(() => !readMore && entry.children > 0, [entry.children, readMore]);
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
    [entry]
  );
  const entryIsMuted = useMemo(
    () => mutedUsers?.includes(entry.author) ?? false,
    [entry, mutedUsers]
  );
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
    () =>
      !(entry.is_paidout || entry.net_rshares > 0 || entry.children > 0) &&
      entry.author === activeUser?.username,
    [activeUser?.username, entry.author, entry.children, entry.is_paidout, entry.net_rshares]
  );
  const isPinned = useMemo(
    () => root.json_metadata.pinned_reply === `${entry.author}/${entry.permlink}`,
    [root, entry]
  );
  const hasAnyAction = useMemo(
    () => canEdit || (isOwnRoot && isTopComment) || isDeletable,
    [canEdit, isOwnRoot, isTopComment, isDeletable]
  );
  const filtered = useMemo(
    () =>
      discussionList.filter(
        (x) => x.parent_author === entry.author && x.parent_permlink === entry.permlink
      ),
    [discussionList, entry]
  );
  const botsData = useMemo(
    () => filtered.filter((entry) => botsList?.includes(entry.author) && entry.children === 0),
    [botsList, filtered]
  );

  const { mutateAsync: createReply, isPending: isCreateLoading } = useCreateReply(entry, root, () =>
    toggleReply()
  );
  const { mutateAsync: updateReply, isPending: isUpdateReplyLoading } = useUpdateReply(entry, () =>
    toggleEdit()
  );
  const { mutateAsync: pinReply } = usePinReply(entry, root);

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

  const checkLsDraft = useCallback(() => {
    let replyDraft = ss.get(`reply_draft_${entry?.author}_${entry?.permlink}`);
    replyDraft = (replyDraft && replyDraft.trim()) || "";
    setLsDraft(replyDraft);
  }, [entry?.author, entry?.permlink]);

  const submitReply = (text: string) =>
    createReply({
      text,
      jsonMeta: makeJsonMetaDataReply(entry.json_metadata.tags || ["ecency"], appPackage.version),
      permlink: createReplyPermlink(entry.author),
      point: true
    });

  const _updateReply = (text: string) =>
    updateReply({
      text,
      point: true,
      jsonMeta: makeJsonMetaDataReply(entry.json_metadata.tags || ["ecency"], appPackage.version)
    });

  useEffect(() => {
    if (edit || reply) {
      checkLsDraft();
    }
  }, [checkLsDraft, edit, reply]);

  return (
    <div className={`discussion-item depth-${entry.depth} ${selected ? "selected-item" : ""}`}>
      <div className="relative">
        <div className="item-anchor" id={anchorId} />
      </div>
      <div className="item-inner">
        <div className="item-figure">
          <ProfileLink username={entry.author}>
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
              <EntryLink entry={entry}>
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
              <span>{i18next.t("entry.hidden-warning")}</span>
            </div>
          )}

          {isLowReputation && (
            <div className="hidden-warning mt-2">
              <span>{i18next.t("entry.lowrep-warning")}</span>
            </div>
          )}

          {mightContainMutedComments && (
            <div className="hidden-warning mt-2">
              <span>{i18next.t("entry.comments-hidden")}</span>
            </div>
          )}

          <DiscussionItemBody entry={entry} isRawContent={isRawContent} />
          {hideControls ? (
            <></>
          ) : (
            <div className="item-controls">
              <EntryVoteBtn entry={entry} isPostSlider={false} />
              <EntryPayout entry={entry} />
              <EntryVotes entry={entry} />
              <a className={`reply-btn ${edit ? "disabled" : ""}`} onClick={toggleReply}>
                {i18next.t("g.reply")}
              </a>
              {community && canMute && (
                <MuteBtn
                  entry={entry}
                  community={community}
                  onSuccess={(entry) => updateCache([entry])}
                />
              )}

              <div className="ml-3 dropdown-container">
                {hasAnyAction && (
                  <Dropdown>
                    <DropdownToggle>
                      <Button icon={dotsHorizontal} appearance="gray-link" />
                    </DropdownToggle>
                    <DropdownMenu>
                      {canEdit && (
                        <DropdownItemWithIcon
                          label={i18next.t("g.edit")}
                          icon={pencilOutlineSvg}
                          onClick={toggleEdit}
                        />
                      )}
                      {isOwnRoot && isTopComment && (
                        <DropdownItemWithIcon
                          label={i18next.t(isPinned ? "g.unpin" : "g.pin")}
                          icon={pinSvg}
                          onClick={() => pinReply({ pin: !isPinned })}
                        />
                      )}
                      {isDeletable && (
                        <DropdownItemWithIcon
                          label={
                            <EntryDeleteBtn parent={root} entry={entry}>
                              <div className="flex items-center [&>svg]:w-3.5 gap-3">
                                {} {i18next.t("g.delete")}
                              </div>
                            </EntryDeleteBtn>
                          }
                          icon={deleteForeverSvg}
                        />
                      )}
                    </DropdownMenu>
                  </Dropdown>
                )}
              </div>
              <DiscussionBots entries={botsData} />
            </div>
          )}
          {readMore && (
            <div className="read-more">
              <EntryLink entry={entry}>
                <a>{i18next.t("discussion.read-more")}</a>
              </EntryLink>
            </div>
          )}
        </div>
      </div>

      {reply && (
        <Comment
          entry={entry}
          defText={lsDraft}
          submitText={i18next.t("g.reply")}
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
          defText={entry.body}
          submitText={i18next.t("g.update")}
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
          isRawContent={isRawContent}
        />
      )}
    </div>
  );
}
