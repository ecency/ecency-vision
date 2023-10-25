import { Link } from "react-router-dom";
import ChatsProfileBox from "../chat-profile-box";
import ChatsDirectMessages from "../chats-direct-messages";
import ChatsChannelMessages from "../chats-channel-messages";
import { history } from "../../../../store";
import React, { useContext } from "react";
import { ChatContext } from "../../chat-context-provider";
import { Community } from "../../../../store/communities";
import { DirectMessage, PublicMessage } from "../../../../../managers/message-manager-types";

interface Props {
  isCurrentUser: boolean;
  currentUser: string;
  isCommunity: boolean;
  communityName: string;
  currentCommunity?: Community;
  directMessagesList: DirectMessage[];
  publicMessages: PublicMessage[];
}

export function ChatPopupMessagesList({
  isCommunity,
  currentUser,
  isCurrentUser,
  currentCommunity,
  communityName,
  directMessagesList,
  publicMessages
}: Props) {
  const { currentChannel, setCurrentChannel } = useContext(ChatContext);

  return (
    <div className="chats">
      {" "}
      <Link
        to={
          isCurrentUser
            ? `/@${currentUser}`
            : isCommunity
            ? `/created/${currentCommunity?.name}`
            : ""
        }
      >
        <ChatsProfileBox
          isCommunity={isCommunity}
          isCurrentUser={isCurrentUser}
          communityName={communityName}
          currentUser={currentUser}
        />
      </Link>
      {isCurrentUser ? (
        <ChatsDirectMessages
          directMessages={directMessagesList}
          currentUser={currentUser}
          isScrollToBottom={false}
        />
      ) : (
        <ChatsChannelMessages
          history={history!}
          username={communityName}
          publicMessages={publicMessages}
          currentChannel={currentChannel!}
          isScrollToBottom={false}
          currentChannelSetter={setCurrentChannel}
        />
      )}
    </div>
  );
}
