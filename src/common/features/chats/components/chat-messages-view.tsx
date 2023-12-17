import React, { useEffect, useRef, useState } from "react";
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
  useFetchPreviousMessages,
  useMessagesQuery
} from "@ecency/ns-query";

interface Props {
  currentContact: DirectContact;
  currentChannel: Channel;
  setInProgress: (d: boolean) => void;
}

export default function ChatsMessagesView({
  currentContact,
  currentChannel,
  setInProgress
}: Props) {
  const { data: messages } = useMessagesQuery(
    currentChannel?.name ?? currentContact?.name,
    currentChannel?.id ?? currentContact?.pubkey
  );

  const messagesBoxRef = useRef<HTMLDivElement>(null);

  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [isTop, setIsTop] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const { mutateAsync: fetchPreviousMessages, isLoading: isFetchingPreviousMessages } =
    useFetchPreviousMessages(currentChannel, () => {});

  useEffect(() => {
    setInProgress(isFetchingPreviousMessages);
  }, [isFetchingPreviousMessages]);

  useEffect(() => {
    if (messages.length < 45) {
      setHasMore(false);
    }
  }, [messages]);

  useEffect(() => {
    setIsScrollToBottom(false);
  }, [currentContact]);

  useEffect(() => {
    if (isTop) {
      fetchPrevMessages();
    }
  }, [isTop]);

  const fetchPrevMessages = () => {
    if (!hasMore) return;

    setInProgress(true);
    fetchPreviousMessages()
      .then((events) => {
        if (events.length < 25) {
          setHasMore(false);
        }
      })
      .finally(() => setIsTop(false));
  };

  const scrollToBottom = () => {
    messagesBoxRef &&
      messagesBoxRef?.current?.scroll({
        top: messagesBoxRef.current?.scrollHeight,
        behavior: "auto"
      });
  };

  return (
    <>
      <div
        className={classNameObject({
          "h-[100vh] md:h-full": true,
          "no-scroll": isTop && hasMore
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
              isScrollToBottom={isScrollToBottom}
              isScrolled={isScrolled}
              scrollToBottom={scrollToBottom}
              isPage={true}
            />
          </>
        ) : (
          <ChatsDirectMessages
            directMessages={messages as DirectMessage[]}
            currentContact={currentContact}
            isScrolled={isScrolled}
            isScrollToBottom={isScrollToBottom}
            scrollToBottom={scrollToBottom}
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
