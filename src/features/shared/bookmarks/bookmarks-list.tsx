import { EntryLink, LinearProgress, UserAvatar } from "@/features/shared";
import React, { useMemo } from "react";
import { useBookmarksQuery } from "@/api/queries";
import i18next from "i18next";

interface Props {
  onHide: () => void;
}

export function BookmarksList({ onHide }: Props) {
  const { data, isLoading } = useBookmarksQuery();
  const items = useMemo(() => data.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1)), [data]);

  return (
    <div className="dialog-content">
      {isLoading && <LinearProgress />}
      {items.length > 0 && (
        <div className="dialog-list">
          <div className="dialog-list-body">
            {items.map((item) => {
              return (
                <div key={item._id}>
                  <EntryLink
                    entry={{
                      category: "foo",
                      author: item.author,
                      permlink: item.permlink
                    }}
                    afterClick={onHide}
                  >
                    <div className="dialog-list-item">
                      <UserAvatar username={item.author} size="medium" />
                      <div className="item-body">
                        <span className="author with-slash">{item.author}</span>
                        <span className="permlink">{item.permlink}</span>
                      </div>
                    </div>
                  </EntryLink>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!isLoading && data.length === 0 && (
        <div className="dialog-list">{i18next.t("g.empty-list")}</div>
      )}
    </div>
  );
}
