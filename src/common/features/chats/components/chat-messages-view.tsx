import React, { useRef } from "react";
import { Link } from "react-router-dom";
import ChatsProfileBox from "./chat-profile-box";
import ChatsDirectMessages from "./chats-direct-messages";
import ChatInput from "./chat-input";
import { classNameObject } from "../../../helper/class-name-object";
import { ChatsChannelMessages } from "./chat-channel-messages";
import {
  Channel,
  DirectContact,
  DirectMessage,
  PublicMessage,
  useMessagesQuery
} from "@ecency/ns-query";

interface Props {
  currentContact: DirectContact;
  currentChannel: Channel;
}

export default function ChatsMessagesView({ currentContact, currentChannel }: Props) {
  const { data: messages } = useMessagesQuery(
    currentChannel?.name ?? currentContact?.name,
    currentChannel?.id ?? currentContact?.pubkey
  );

  const messagesBoxRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        className={classNameObject({
          "h-[100vh] md:h-full": true
        })}
        ref={messagesBoxRef}
      >
        <Link
          className="after:!hidden"
          to={!!currentChannel ? `/created/${currentChannel?.name}` : `/@${currentContact?.name}`}
          target="_blank"
        >
          <ChatsProfileBox
            communityName={currentChannel?.name}
            currentUser={currentContact?.name}
          />
        </Link>
        {currentChannel ? (
          <>
            <ChatsChannelMessages
              publicMessages={messages as PublicMessage[]}
              currentChannel={currentChannel!}
              isPage={true}
            />
          </>
        ) : (
          <ChatsDirectMessages
            directMessages={messages as DirectMessage[]}
            currentContact={currentContact}
            isPage={true}
          />
        )}
      </div>

      <div className="sticky z-10 bottom-0 border-t border-[--border-color] bg-white pl-3">
        <ChatInput currentContact={currentContact} currentChannel={currentChannel} />
      </div>
    </>
  );
}
