import React from "react";
import { UserAvatar } from "@/features/shared";
import PopoverConfirm from "@ui/popover-confirm";
import { Tooltip } from "@ui/tooltip";
import { classNameObject } from "@ui/util";
import { User } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { deleteForeverSvg } from "@ui/svg";

interface Props {
  user: User;
  disabled: boolean;
  onSelect: (user: User) => void;
  onDelete: (user: User) => void;
  containerRef?: React.RefObject<HTMLInputElement>;
}

export function UserItem({ disabled, user, onSelect, onDelete, containerRef }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return (
    <div
      className={classNameObject({
        "user-list-item": true,
        disabled: disabled,
        active: !!activeUser && activeUser.username === user.username
      })}
      onClick={() => onSelect(user)}
    >
      <UserAvatar username={user.username} size="medium" />
      <span className="username">@{user.username}</span>
      {activeUser && activeUser.username === user.username && <div className="check-mark" />}
      <div className="flex-spacer" />
      <PopoverConfirm
        onConfirm={() => onDelete(user)}
        placement="left"
        trigger="click"
        containerRef={containerRef}
      >
        <div
          className="btn-delete"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Tooltip content={i18next.t("g.delete")}>
            <span>{deleteForeverSvg}</span>
          </Tooltip>
        </div>
      </PopoverConfirm>
    </div>
  );
}
