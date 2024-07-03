import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useMount, useUnmount } from "react-use";
import { DiscussionItem } from "./discussion-item";
import { Community, Entry } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { getMutedUsersQuery } from "@/api/queries/get-muted-users-query";
import { getBotsQuery } from "@/api/queries";
import i18next from "i18next";

interface Props {
  hideControls: boolean;
  root: Entry;
  parent: Entry;
  isRawContent: boolean;
  community: Community | null;
  discussionList: Entry[];
}

export function DiscussionList({
  parent,
  root,
  hideControls,
  isRawContent,
  community,
  discussionList
}: Props) {
  const [isHiddenPermitted, setIsHiddenPermitted] = useState(false);

  const activeUser = useGlobalStore((s) => s.activeUser);

  const location = useLocation();
  const { data: mutedUsers } = getMutedUsersQuery(activeUser).useClientQuery();
  const { data: botsList } = getBotsQuery().useClientQuery();

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
          mutedUsers?.includes(item.author) &&
          item.depth === 1 &&
          item.parent_author === parent.author
      ),
    [activeUser, filtered, mutedUsers, parent.author]
  );
  const data = useMemo(() => {
    if (!activeUser) {
      return filtered;
    }

    const unMutedContent = filtered.filter((md) =>
      mutedContent.every((fd) => fd.post_id !== md.post_id)
    );

    return isHiddenPermitted ? [...unMutedContent, ...mutedContent] : unMutedContent;
  }, [activeUser, filtered, isHiddenPermitted, mutedContent]);
  const botsFreeData = useMemo(
    () => data.filter((entry) => (botsList?.includes(entry.author) ? entry.children > 0 : true)),
    [botsList, data]
  );

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
      {botsFreeData.map((d) => (
        <DiscussionItem
          root={root}
          discussionList={discussionList}
          community={community}
          key={`${d.author}-${d.permlink}`}
          entry={d}
          hideControls={hideControls}
          isRawContent={isRawContent}
        />
      ))}
      {!isHiddenPermitted && mutedContent.length > 0 && activeUser && activeUser.username && (
        <div className="hidden-warning flex justify-between flex-1 items-center mt-3">
          <div className="flex-1">{i18next.t("discussion.reveal-muted-long-description")}</div>
          <div onClick={() => setIsHiddenPermitted(true)} className="pointer p-3">
            <b>{i18next.t("g.show")}</b>
          </div>
        </div>
      )}
    </div>
  ) : (
    <></>
  );
}
