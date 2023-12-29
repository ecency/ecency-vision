import accountReputation from "../../../../helper/account-reputation";
import { Link } from "react-router-dom";
import React, { createElement, useMemo } from "react";
import UserAvatar from "../../../../components/user-avatar";
import isCommunity from "../../../../helper/is-community";
import { AccountWithReputation } from "@ecency/ns-query";
import { Community } from "../../../../store/communities";

interface Props {
  item: AccountWithReputation | Community;
  onClick: () => void;
}

export function ChatSidebarSearchItem({ item, onClick }: Props) {
  const username = useMemo(() => {
    if ("account" in item) {
      return isCommunity(item.account) ? item.account : "@" + item.account;
    }
    return item.name;
  }, [item]);

  return createElement(
    Link,
    {
      to: `/chats/${username}`,
      className:
        "flex items-center cursor-pointer justify-between gap-3 p-3 border-b border-[--border-color] last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800",
      onClick
    },
    <>
      <div className="flex items-center gap-3">
        <UserAvatar username={username} size="medium" />
        <div>
          <div className="user-name text-dark-200 dark:text-white">
            {"account" in item ? item.account : item.title}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-xs">
            {isCommunity(username) ? "Community" : "User"}
          </div>
        </div>
      </div>
      {"reputation" in item && (
        <span className="user-reputation">({accountReputation(item.reputation)})</span>
      )}
    </>
  );
}
