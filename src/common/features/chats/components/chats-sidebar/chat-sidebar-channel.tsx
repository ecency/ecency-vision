import { Link } from "react-router-dom";
import React, { useContext } from "react";
import { Channel } from "../../managers/message-manager-types";
import { ChatContext } from "../../chat-context-provider";
import UserAvatar from "../../../../components/user-avatar";
import { useLastMessagesQuery } from "../../queries";

interface Props {
  username: string;
  channel: Channel;
}

export function ChatSidebarChannel({ channel, username }: Props) {
  const { setRevealPrivKey } = useContext(ChatContext);

  const { data: lastMessages } = useLastMessagesQuery();

  return (
    <Link to={`/chats/${channel.communityName}`} key={channel.id}>
      <div
        className={`community ${username === channel.communityName ? "selected" : ""}`}
        key={channel.id}
        onClick={() => setRevealPrivKey(false)}
      >
        <UserAvatar username={channel.communityName!} size="medium" />
        <div className="community-info">
          <p className="community-name">{channel.name}</p>
          <p className="community-last-message">{lastMessages[channel.name].content}</p>
        </div>
      </div>
    </Link>
  );
}
