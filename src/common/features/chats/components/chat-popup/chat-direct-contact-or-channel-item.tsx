import { Link } from "react-router-dom";
import React, { useMemo } from "react";
import UserAvatar from "../../../../components/user-avatar";
import { isCommunity, useMessagesQuery } from "@ecency/ns-query";
import { useCommunityCache } from "../../../../core";

interface Props {
  username: string;
  userClicked: (username: string) => void;
}

export function ChatDirectContactOrChannelItem({ username, userClicked }: Props) {
  const { data: messages } = useMessagesQuery(username);
  const lastMessage = useMemo(
    () => (messages.length > 0 ? messages[messages.length - 1].content : undefined),
    [messages]
  );
  const { data: community } = useCommunityCache(username);

  return (
    <div
      className="flex items-center gap-3 px-3 border-b border-[--border-color] py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-300"
      onClick={() => userClicked(username)}
    >
      <Link to={`/@${username}`}>
        <UserAvatar username={username} size="medium" />
      </Link>

      <div>
        <p className="font-semibold">
          {isCommunity(username) && community ? community.title : username}
        </p>
        <p className="text-gray-600 text-sm">{lastMessage}</p>
      </div>
    </div>
  );
}
