import { Link } from "react-router-dom";
import React from "react";
import UserAvatar from "../../../../components/user-avatar";

interface Props {
  username: string;
  lastMessage?: string;
  userClicked: (username: string) => void;
}

export function ChatDirectMessage({ username, userClicked, lastMessage }: Props) {
  return (
    <div
      className="flex items-center gap-3 px-3 border-b border-[--border-color] py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
      onClick={() => userClicked(username)}
    >
      <Link to={`/@${username}`}>
        <UserAvatar username={username} size="medium" />
      </Link>

      <div>
        <p className="font-semibold">{username}</p>
        <p className="text-gray-600 text-sm">{lastMessage}</p>
      </div>
    </div>
  );
}
