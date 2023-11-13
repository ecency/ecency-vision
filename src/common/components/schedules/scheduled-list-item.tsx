import { Schedule } from "../../api/private-api";
import React, { useMemo } from "react";
import { FullAccount } from "../../store/accounts/types";
import { catchPostImage, postBodySummary } from "@ecency/render-helper";
import { dateToFormatted, dateToFullRelative } from "../../helper/parse-date";
import accountReputation from "../../helper/account-reputation";
import { _t } from "../../i18n";
import {
  alertCircleSvg,
  checkAllSvg,
  deleteForeverSvg,
  textBoxOutline,
  timeSvg
} from "../../img/svg";
import PopoverConfirm from "@ui/popover-confirm";
import UserAvatar from "../user-avatar";
import { useMappedStore } from "../../store/use-mapped-store";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { classNameObject } from "../../helper/class-name-object";
import Tooltip from "../tooltip";

interface Props {
  post: Schedule;
  deleteFn: (item: Schedule) => void;
  moveFn: (item: Schedule) => void;
}

export function ScheduledListItem({ post, deleteFn, moveFn }: Props) {
  const { activeUser, global } = useMappedStore();

  const fallbackImage = require("../../img/fallback.png");

  const noImage = require("../../img/noimage.svg");

  const account = useMemo(() => activeUser?.data as FullAccount, [activeUser]);

  const author = account.name;
  const reputation = account.reputation;

  const tag = post.tags_arr[0] || "";
  const img = catchPostImage(post.body, 600, 500, global.canUseWebp ? "webp" : "match") || noImage;
  const summary = postBodySummary(post.body, 200);

  const dateRelative = useMemo(() => dateToFullRelative(post.schedule), [post]);
  const dateFormatted = useMemo(() => dateToFormatted(post.schedule), [post]);

  return !activeUser?.data.__loaded ? null : (
    <div className="drafts-list-item border dark:border-dark-400 rounded-3xl overflow-hidden">
      <div className="flex items-center gap-3 border-b dark:border-dark-300 mb-4 p-2 bg-gray-100 dark:bg-dark-500">
        <div className="flex items-center gap-2">
          <UserAvatar username={author} size="medium" />
          <div className="flex items-center text-sm">
            <div className="font-bold">{author}</div>
            <div className="text-gray-600 dark:text-gray-400 pl-1">
              ({accountReputation(reputation)})
            </div>
          </div>
        </div>
        <Badge>{tag}</Badge>
        <div className="text-sm text-gray-600 dark:text-gray-400" title={dateFormatted}>
          {dateRelative}
        </div>
      </div>
      <div
        className="grid gap-4 p-2"
        style={{
          gridTemplateColumns: "150px 1fr"
        }}
      >
        <div className="w-full flex items-center justify-center border rounded-2xl aspect-[4/3] overflow-hidden">
          <img
            alt={post.title}
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
        <div>
          <div className="text-gray-charcoal dark:text-white text-lg font-semibold">
            {post.title}
          </div>
          <div className="text-gray-steel dark:text-white-075">{summary}</div>
        </div>
      </div>
      <div className="flex justify-between items-center px-3 py-2">
        {post.status === 1 && (
          <Tooltip content={dateRelative}>
            <div className="flex items-center gap-3 text-gray-steel-light-005 dark:text-blue-metallic">
              <div className="w-[1.5rem]">{timeSvg}</div>
              <span className="text-xs">{dateFormatted}</span>
            </div>
          </Tooltip>
        )}
        {post.status === 2 && (
          <Tooltip content={dateRelative}>
            <div className="flex items-center gap-3 text-orange">
              <div className="w-[1.5rem]">{timeSvg}</div>
              <span className="text-xs">{dateFormatted}</span>
            </div>
          </Tooltip>
        )}
        {post.status === 3 && <div className="w-[1.5rem] ml-4 text-green">{checkAllSvg}</div>}
        {post.status === 4 && <div className="w-[1.5rem] ml-4 text-red">{alertCircleSvg}</div>}
        <div className="flex items-center gap-2 justify-end w-full">
          <PopoverConfirm titleText={`${_t("schedules.move")}?`} onConfirm={() => moveFn(post)}>
            <Button
              noPadding={true}
              appearance="link"
              title={_t("schedules.move")}
              icon={textBoxOutline}
            />
          </PopoverConfirm>

          <PopoverConfirm onConfirm={() => deleteFn(post)}>
            <Button
              noPadding={true}
              appearance="link"
              title={_t("g.delete")}
              icon={deleteForeverSvg}
            />
          </PopoverConfirm>
        </div>
      </div>
    </div>
  );
}
