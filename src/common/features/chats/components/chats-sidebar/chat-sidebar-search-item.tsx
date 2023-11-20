import accountReputation from "../../../../helper/account-reputation";
import { Link } from "react-router-dom";
import React from "react";
import { AccountWithReputation } from "../../types";
import UserAvatar from "../../../../components/user-avatar";
import isCommunity from "../../../../helper/is-community";

interface Props {
  user: AccountWithReputation;
  onClick: () => void;
}

export function ChatSidebarSearchItem({ user, onClick }: Props) {
  return (
    <Link
      to={`/chats/${isCommunity(user.account) ? user.account : "@" + user.account}`}
      className="flex items-center gap-3 p-3 border-b border-[--border-color] last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800"
      onClick={onClick}
    >
      <UserAvatar username={user.account} size="medium" />
      <span className="user-name">{user.account}</span>
      <span className="user-reputation">({accountReputation(user.reputation)})</span>
    </Link>
  );
}
