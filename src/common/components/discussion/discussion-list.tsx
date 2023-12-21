import { History } from "history";
import { Discussion as DiscussionType } from "../../store/discussion/types";
import { Entry } from "../../store/entries/types";
import { Community } from "../../store/communities";
import React, { useMemo, useState } from "react";
import { getFollowing } from "../../api/hive";
import { _t } from "../../i18n";
import { useMountedState, useUnmount } from "react-use";
import useMount from "react-use/lib/useMount";
import { useMappedStore } from "../../store/use-mapped-store";
import { DiscussionItem } from "./discussion-item";

interface Props {
  hideControls: boolean;
  parent: Entry;
  discussion: DiscussionType;
  isRawContent: boolean;
  history: History;
  community: Community | null;
}

export function DiscussionList({
  discussion,
  parent,
  hideControls,
  isRawContent,
  history,
  community
}: Props) {
  const [isHiddenPermitted, setIsHiddenPermitted] = useState(false);
  const [mutedData, setMutedData] = useState<string[]>([]);

  const isMounted = useMountedState();
  const { activeUser } = useMappedStore();

  const filtered = useMemo(
    () =>
      discussion.list.filter(
        (x) => x.parent_author === parent.author && x.parent_permlink === parent.permlink
      ),
    [discussion, parent]
  );
  const mutedContent = useMemo(
    () =>
      filtered.filter(
        (item) =>
          activeUser &&
          mutedData.includes(item.author) &&
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
  }, [filtered, activeUser, mutedData, isHiddenPermitted]);

  useMount(() => (document.getElementsByTagName("html")[0].style.position = "relative"));
  useUnmount(() => (document.getElementsByTagName("html")[0].style.position = "unset"));

  const fetchMutedUsers = async () => {
    if (activeUser) {
      const response = await getFollowing(activeUser.username, "", "ignore", 100);
      if (response && isMounted()) {
        setMutedData(response.map((user) => user.following));
      }
    }
  };

  return filtered.length > 0 ? (
    <div className="discussion-list">
      {data.map((d) => (
        <DiscussionItem
          community={community}
          discussion={discussion}
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
