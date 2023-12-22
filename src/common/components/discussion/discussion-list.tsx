import { History } from "history";
import { Entry } from "../../store/entries/types";
import { Community } from "../../store/communities";
import React, { useEffect, useMemo, useState } from "react";
import { _t } from "../../i18n";
import { useUnmount } from "react-use";
import useMount from "react-use/lib/useMount";
import { useMappedStore } from "../../store/use-mapped-store";
import { DiscussionItem } from "./discussion-item";
import { useLocation } from "react-router";
import { useFetchMutedUsersQuery } from "../../api/queries";

interface Props {
  hideControls: boolean;
  parent: Entry;
  isRawContent: boolean;
  history: History;
  community: Community | null;
  discussionList: Entry[];
}

export function DiscussionList({
  parent,
  hideControls,
  isRawContent,
  history,
  community,
  discussionList
}: Props) {
  const [isHiddenPermitted, setIsHiddenPermitted] = useState(false);

  const location = useLocation();
  const { activeUser } = useMappedStore();

  const { data: mutedUsers } = useFetchMutedUsersQuery();

  const filtered = useMemo(
    () =>
      discussionList.filter(
        (x) => x.parent_author === parent.author && x.parent_permlink === parent.permlink
      ),
    [discussionList, parent]
  );
  const mutedContent = useMemo(
    () =>
      filtered.filter(
        (item) =>
          activeUser &&
          mutedUsers.includes(item.author) &&
          item.depth === 1 &&
          item.parent_author === parent.author
      ),
    [filtered, parent]
  );
  const data = useMemo(() => {
    if (!activeUser) {
      return filtered;
    }

    const unMutedContent = filtered.filter((md) =>
      mutedContent.every((fd) => fd.post_id !== md.post_id)
    );

    return isHiddenPermitted ? [...unMutedContent, ...mutedContent] : unMutedContent;
  }, [filtered, activeUser, mutedUsers, isHiddenPermitted]);

  useMount(() => (document.getElementsByTagName("html")[0].style.position = "relative"));
  useUnmount(() => (document.getElementsByTagName("html")[0].style.position = "unset"));

  useEffect(() => {
    if (discussionList.length > 0) {
      if (location.hash) {
        const permlink = location.hash.replace("#", "");
        const anchorId = `anchor-${permlink}`;
        const anchorEl = document.getElementById(anchorId);
        if (anchorEl) {
          anchorEl.scrollIntoView();
        }
      }
    }
  }, [discussionList, location]);

  return filtered.length > 0 ? (
    <div className="discussion-list">
      {data.map((d) => (
        <DiscussionItem
          discussionList={discussionList}
          community={community}
          history={history}
          key={`${d.author}-${d.permlink}`}
          entry={d}
          hideControls={hideControls}
          isRawContent={isRawContent}
        />
      ))}
      {!isHiddenPermitted && mutedContent.length > 0 && activeUser && activeUser.username && (
        <div className="hidden-warning flex justify-between flex-1 items-center mt-3">
          <div className="flex-1">{_t("discussion.reveal-muted-long-description")}</div>
          <div onClick={() => setIsHiddenPermitted(true)} className="pointer p-3">
            <b>{_t("g.show")}</b>
          </div>
        </div>
      )}
    </div>
  ) : (
    <></>
  );
}
