import React, { useMemo } from "react";
import { catchPostImage, postBodySummary } from "@ecency/render-helper";
import PopoverConfirm from "@ui/popover-confirm";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Draft, FullAccount } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import fallbackImage from "@/assets/img/fallback.png";
import noImage from "@/assets/img/noimage.svg";
import { useCommunityCache } from "@/core/caches";
import { accountReputation, dateToFormatted, dateToFullRelative } from "@/utils";
import { UserAvatar } from "@/features/shared";
import Image from "next/image";
import { classNameObject } from "@ui/util";
import { cloneOutlineSvg, deleteForeverSvg, pencilOutlineSvg } from "@ui/svg";
import i18next from "i18next";

interface Props {
  draft: Draft;
  editFn: (item: Draft) => void;
  deleteFn: (item: Draft) => void;
  cloneFn: (item: Draft) => void;
}

export function DraftListItem({ draft, editFn, deleteFn, cloneFn }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const canUseWebp = useGlobalStore((state) => state.canUseWebp);

  const account = useMemo(() => activeUser?.data as FullAccount, [activeUser]);

  const author = account.name;
  const reputation = account.reputation;

  const tags = draft.tags ? draft.tags.split(/[ ,]+/) : [];
  const tag = tags[0] || "";
  const img = catchPostImage(draft.body, 600, 500, canUseWebp ? "webp" : "match") || noImage;
  const summary = postBodySummary(draft.body, 200);

  const { data: community } = useCommunityCache(tag);

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
        <Badge>{community?.title ?? tag}</Badge>
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
          <Image
            alt={draft.title}
            src={img}
            width={500}
            height={500}
            onError={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLImageElement;
              target.src = fallbackImage.src;
            }}
            className={classNameObject({
              "w-full h-auto": img !== noImage,
              "w-[40px] h-auto": img === noImage
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
            title={i18next.t("g.clone")}
          />
          <Button
            noPadding={true}
            appearance="link"
            onClick={() => editFn(draft)}
            icon={pencilOutlineSvg}
            title={i18next.t("g.edit")}
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
              title={i18next.t("g.edit")}
            />
          </PopoverConfirm>
        </div>
      </div>
    </div>
  );
}
