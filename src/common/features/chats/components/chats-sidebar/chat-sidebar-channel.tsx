import { Link } from "react-router-dom";
import React, { useContext, useMemo } from "react";
import { Channel } from "../../managers/message-manager-types";
import UserAvatar from "../../../../components/user-avatar";
import { useLastMessagesQuery } from "../../queries";
import { classNameObject } from "../../../../helper/class-name-object";
import { getRelativeDate } from "../../utils";
import { ChatContext } from "../../chat-context-provider";

interface Props {
  username: string;
  channel: Channel;
}

export function ChatSidebarChannel({ channel, username }: Props) {
  const { revealPrivKey, setRevealPrivKey, setReceiverPubKey } = useContext(ChatContext);

  const { data: lastMessages } = useLastMessagesQuery();

  const rawUsername = useMemo(() => username?.replace("@", "") ?? "", [username]);
  const lastMessageDate = useMemo(
    () => getRelativeDate(lastMessages[channel.name]?.created),
    [lastMessages]
  );

  return (
    <Link
      className={classNameObject({
        "flex items-center text-dark-200 gap-3 p-3 border-b border-[--border-color] last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800":
          true,
        "bg-gray-100 dark:bg-gray-800": rawUsername === channel.name
      })}
      to={`/chats/${channel.communityName}`}
      onClick={() => {
        if (revealPrivKey) {
          setRevealPrivKey(false);
        }
      }}
    >
      <UserAvatar username={channel.communityName!} size="medium" />
      <div className="flex flex-col w-[calc(100%-40px-0.75rem)]">
        <div className="flex justify-between w-full items-center">
          <div className="font-semibold truncate dark:text-white">{channel.name}</div>
          <div className="text-xs text-gray-500">{lastMessageDate}</div>
        </div>
        <div className="text-sm text-gray-600 truncate">{lastMessages[channel.name]?.content}</div>
      </div>
    </Link>
  );
}