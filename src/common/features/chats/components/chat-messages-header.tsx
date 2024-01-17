import React, { useContext } from "react";
import { History } from "history";
import ChatsCommunityDropdownMenu from "./chats-community-actions";
import UserAvatar from "../../../components/user-avatar";
import { CHATPAGE } from "./chat-popup/chat-constants";
import Link from "../../../components/alink";
import { expandSideBar } from "../../../img/svg";
import { Button } from "@ui/button";
import isCommunity from "../../../helper/is-community";
import { ChatContext, formattedUserName, useChannelsQuery } from "@ecency/ns-query";

interface Props {
  username: string;
  history: History;
}

export default function ChatsMessagesHeader(props: Props) {
  const { username } = props;
  const { setReceiverPubKey } = useContext(ChatContext);
  const { data: channels } = useChannelsQuery();

  const formattedName = (username: string) => {
    if (username && !username.startsWith("@")) {
      const community = channels?.find((channel) => channel.communityName === username);
      if (community) {
        return community.name;
      }
    }
    return username.replace("@", "");
  };

  return (
    <div className="flex sticky z-[10] top-[63px] md:top-0 bg-white justify-between border-b border-[--border-color] px-4 h-[57px]">
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
          className="flex items-center gap-3 decoration-0 after:!hidden font-semibold text-gray-800 dark:text-white"
          to={username.startsWith("@") ? `/${username}` : `/created/${username}`}
          target="_blank"
        >
          <UserAvatar username={formattedUserName(username)} size="medium" />
          <div>{formattedName(username)}</div>
        </Link>
      </div>

      {isCommunity(username) && (
        <div className="flex items-center justify-center">
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
