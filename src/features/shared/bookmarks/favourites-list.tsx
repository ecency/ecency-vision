import { LinearProgress, ProfileLink, UserAvatar } from "@/features/shared";
import React, { useMemo } from "react";
import { useFavouritesQuery } from "@/api/queries";
import i18next from "i18next";

interface Props {
  onHide: () => void;
}

export function FavouritesList({ onHide }: Props) {
  const { data, isLoading } = useFavouritesQuery();
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
                  <ProfileLink username={item.account} afterClick={onHide}>
                    <div className="dialog-list-item">
                      <UserAvatar username={item.account} size="medium" />
                      <div className="item-body">
                        <span className="author notranslate">{item.account}</span>
                      </div>
                    </div>
                  </ProfileLink>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!isLoading && items.length === 0 && (
        <div className="dialog-list">{i18next.t("g.empty-list")}</div>
      )}
    </div>
  );
}
