import React, { useContext } from "react";
import { History } from "history";
import { useMappedStore } from "../../../store/use-mapped-store";
import ChatsCommunityDropdownMenu from "./chats-community-dropdown-menu";
import UserAvatar from "../../../components/user-avatar";
import { CHATPAGE } from "./chat-popup/chat-constants";
import { Chat } from "../../../store/chat/types";
import { formattedUserName } from "../utils";
import Link from "../../../components/alink";
import { expandSideBar } from "../../../img/svg";
import { Button } from "@ui/button";
import { ChatContext } from "../chat-context-provider";

interface Props {
  username: string;
  history: History;
}

export default function ChatsMessagesHeader(props: Props) {
  const { username } = props;
  const { setReceiverPubKey } = useContext(ChatContext);
  const { chat } = useMappedStore();

  const isChannel = (username: string) => !username.startsWith("@");

  const formattedName = (username: string, chat: Chat) => {
    if (username && !username.startsWith("@")) {
      const community = chat.channels.find((channel) => channel.communityName === username);
      if (community) {
        return community.name;
      }
    }
    return username.replace("@", "");
  };

  return (
    <div className="flex sticky top-0 bg-white justify-between border-b border-[--border-color] px-4 h-[60px]">
      <div className="flex items-center gap-4">
        <Button
          appearance="gray-link"
          className="md:hidden"
          noPadding={true}
          icon={expandSideBar}
          to="/chats"
          onClick={() => setReceiverPubKey("")}
        />
        <Link
          className="flex items-center gap-3 decoration-0 after:!hidden font-semibold text-gray-800"
          to={username.startsWith("@") ? `/${username}` : `/created/${username}`}
          target="_blank"
        >
          <UserAvatar username={formattedUserName(username)} size="medium" />
          <div>{formattedName(username, chat)}</div>
        </Link>
      </div>

      {isChannel(username) && (
        <div className="community-menu">
          <ChatsCommunityDropdownMenu
            from={CHATPAGE}
            history={props.history}
            username={props.username}
          />
        </div>
      )}
    </div>
  );
}
