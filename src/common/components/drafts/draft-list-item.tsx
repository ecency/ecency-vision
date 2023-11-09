import { History } from "history";
import { Draft } from "../../api/private-api";
import React, { useMemo } from "react";
import { FullAccount } from "../../store/accounts/types";
import { catchPostImage, postBodySummary } from "@ecency/render-helper";
import { dateToFormatted, dateToFullRelative } from "../../helper/parse-date";
import accountReputation from "../../helper/account-reputation";
import { _t } from "../../i18n";
import { cloneOutlineSvg, deleteForeverSvg, pencilOutlineSvg } from "../../img/svg";
import PopoverConfirm from "@ui/popover-confirm";
import UserAvatar from "../user-avatar";
import { useMappedStore } from "../../store/use-mapped-store";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { classNameObject } from "../../helper/class-name-object";

interface Props {
  history: History;
  draft: Draft;
  editFn: (item: Draft) => void;
  deleteFn: (item: Draft) => void;
  cloneFn: (item: Draft) => void;
}

export function DraftListItem({ history, draft, editFn, deleteFn, cloneFn }: Props) {
  const { activeUser, global } = useMappedStore();

  const fallbackImage = require("../../img/fallback.png");

  const noImage = require("../../img/noimage.svg");

  const account = useMemo(() => activeUser?.data as FullAccount, [activeUser]);

  const author = account.name;
  const reputation = account.reputation;

  const tags = draft.tags ? draft.tags.split(/[ ,]+/) : [];
  const tag = tags[0] || "";
  const img = catchPostImage(draft.body, 600, 500, global.canUseWebp ? "webp" : "match") || noImage;
  const summary = postBodySummary(draft.body, 200);

  const dateRelative = useMemo(() => dateToFullRelative(draft.created), [draft]);
  const dateFormatted = useMemo(() => dateToFormatted(draft.created), [draft]);

  return !activeUser?.data.__loaded ? null : (
    <div className="drafts-list-item border dark:border-dark-400 rounded-3xl overflow-hidden">
      <div className="flex items-center gap-3 border-b dark:border-dark-300 mb-4 p-2 bg-gray-100 dark:bg-dark-500">
        <div className="flex items-center gap-2">
          <UserAvatar username={author} size="medium" />
          <div className="flex items-center text-sm">
            <div className="font-bold">{author}</div>
            <div className="text-gray-600 pl-1">({accountReputation(reputation)})</div>
          </div>
        </div>
        <Badge>{tag}</Badge>
        <div className="text-sm text-gray-600" title={dateFormatted}>
          {dateRelative}
        </div>
      </div>
      <div
        className="grid gap-4 p-2"
        style={{
          gridTemplateColumns: "150px 1fr"
        }}
      >
        <div
          className="w-full flex items-center justify-center border rounded-2xl aspect-[4/3] overflow-hidden"
          onClick={() => editFn(draft)}
        >
          <img
            alt={draft.title}
            src={img}
            onError={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLImageElement;
              target.src = fallbackImage;
            }}
            className={classNameObject({
              "w-full": img !== noImage,
              "w-[40px]": img === noImage
            })}
          />
        </div>
        <div onClick={() => editFn(draft)}>
          <div className="text-gray-charcoal dark:text-white text-lg font-semibold">
            {draft.title}
          </div>
          <div className="text-gray-steel dark:text-white-075">{summary}</div>
        </div>
        <div />
        <div className="flex items-center gap-2 justify-end w-full">
          <Button
            noPadding={true}
            appearance="link"
            onClick={() => cloneFn(draft)}
            icon={cloneOutlineSvg}
            title={_t("g.clone")}
          />
          <Button
            noPadding={true}
            appearance="link"
            onClick={() => editFn(draft)}
            icon={pencilOutlineSvg}
            title={_t("g.edit")}
          />
          <PopoverConfirm
            onConfirm={() => {
              deleteFn(draft);
            }}
          >
            <Button
              noPadding={true}
              appearance="link"
              onClick={() => deleteFn(draft)}
              icon={deleteForeverSvg}
              title={_t("g.edit")}
            />
          </PopoverConfirm>
        </div>
      </div>
    </div>
  );
}
