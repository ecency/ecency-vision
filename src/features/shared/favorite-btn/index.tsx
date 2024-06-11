import React, { useEffect, useMemo, useState } from "react";
import "./_index.scss";
import { Button } from "@ui/button";
import { useGlobalStore } from "@/core/global-store";
import { LoginRequired } from "@/features/shared";
import Tooltip from "@ui/tooltip";
import { personFavoriteOutlineSvg, personFavoriteSvg } from "@ui/svg";
import i18next from "i18next";
import { useAddFavourite, useCheckFavourite, useDeleteFavourite } from "@/api/mutations";

interface Props {
  targetUsername: string;
}

export function FavouriteBtn({ targetUsername }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const [favourited, setFavourited] = useState(false);

  const { mutateAsync: detect, isPending: isCheckPending } = useCheckFavourite();
  const { mutateAsync: add, isPending: isAddPending } = useAddFavourite(() => {
    detect({ account: targetUsername }).then((r) => setFavourited(r));
  });
  const { mutateAsync: deleteFrom, isPending: isDeletePending } = useDeleteFavourite(() => {
    detect({ account: targetUsername }).then((r) => setFavourited(r));
  });

  const inProgress = useMemo(
    () => isAddPending || isDeletePending || isCheckPending,
    [isAddPending, isDeletePending, isCheckPending]
  );

  useEffect(() => {
    detect({ account: targetUsername });
  }, [activeUser, detect, targetUsername]);

  return (
    <>
      {!activeUser && (
        <LoginRequired>
          <span className="favorite-btn">
            <Tooltip content={i18next.t("favorite-btn.add")}>
              <Button
                disabled={inProgress}
                onClick={() => deleteFrom({ account: targetUsername })}
                icon={personFavoriteOutlineSvg}
              />
            </Tooltip>
          </span>
        </LoginRequired>
      )}
      {activeUser && favourited && (
        <span className="favorite-btn">
          <Tooltip content={i18next.t("favorite-btn.delete")}>
            <Button
              disabled={inProgress}
              onClick={() => deleteFrom({ account: targetUsername })}
              icon={personFavoriteSvg}
            />
          </Tooltip>
        </span>
      )}
      {activeUser && !favourited && (
        <span className="favorite-btn">
          <Tooltip content={i18next.t("favorite-btn.add")}>
            <Button
              disabled={inProgress}
              onClick={() => add({ account: targetUsername })}
              icon={personFavoriteOutlineSvg}
            />
          </Tooltip>
        </span>
      )}
    </>
  );
}
