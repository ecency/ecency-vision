import React, { useMemo } from "react";
import "./_index.scss";
import { useGlobalStore } from "@/core/global-store";
import { LoginRequired } from "@/features/shared";
import { Tooltip } from "@ui/tooltip";
import i18next from "i18next";
import { bookmarkOutlineSvg, bookmarkSvg } from "@ui/svg";
import { useBookmarksQuery } from "@/api/queries";
import { Entry } from "@/entities";
import { useBookmarkAdd, useBookmarkDelete } from "@/api/mutations/bookmarks";

export interface Props {
  entry: Entry;
}

export function BookmarkBtn({ entry }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  const { data: bookmarks } = useBookmarksQuery();

  const bookmarkId = useMemo(() => {
    const bookmark = bookmarks.find(
      (x) => x.author === entry.author && x.permlink == entry.permlink
    );
    return bookmark?._id;
  }, [bookmarks, entry.author, entry.permlink]);

  const { mutateAsync: addBookmark, isPending: isAdding } = useBookmarkAdd(entry);
  const { mutateAsync: deleteBookmark, isPending: isDeleting } = useBookmarkDelete(bookmarkId);

  if (!activeUser) {
    return (
      <LoginRequired>
        <div className="bookmark-btn">
          <Tooltip content={i18next.t("bookmark-btn.add")}>
            <span>{bookmarkOutlineSvg}</span>
          </Tooltip>
        </div>
      </LoginRequired>
    );
  }

  if (bookmarkId) {
    return (
      <div
        className={`bookmark-btn bookmarked ${isDeleting ? "in-progress" : ""}`}
        onClick={() => deleteBookmark()}
      >
        <Tooltip content={i18next.t("bookmark-btn.delete")}>
          <span>{bookmarkSvg}</span>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={`bookmark-btn ${isAdding ? "in-progress" : ""}`} onClick={() => addBookmark()}>
      <Tooltip content={i18next.t("bookmark-btn.add")}>
        <span>{bookmarkOutlineSvg}</span>
      </Tooltip>
    </div>
  );
}
