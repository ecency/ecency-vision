import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ChatsProfileBox from "./chat-profile-box";
import ChatsDirectMessages from "./chats-direct-messages";
import ChatInput from "./chat-input";
import ChatsScroller from "./chats-scroller";
import { classNameObject } from "../../../helper/class-name-object";
import { useMessagesQuery } from "../queries";
import isCommunity from "../../../helper/is-community";
import { useFetchPreviousMessages } from "../mutations";
import { ChatsChannelMessages } from "./chat-channel-messages";
import { Channel, DirectMessage, PublicMessage } from "../nostr";

interface Props {
  username: string;
  currentChannel: Channel;
  setInProgress: (d: boolean) => void;
}

export default function ChatsMessagesView({ username, currentChannel, setInProgress }: Props) {
  const { data: messages } = useMessagesQuery(username.replace("@", ""));

  const messagesBoxRef = useRef<HTMLDivElement>(null);

  const [directUser, setDirectUser] = useState("");
  const [communityName, setCommunityName] = useState("");
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [isTop, setIsTop] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const { mutateAsync: fetchPreviousMessages, isLoading: isFetchingPreviousMessages } =
    useFetchPreviousMessages(currentChannel, () => {});

  useEffect(() => {
    isDirectUserOrCommunity();
  }, []);

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
    setDirectUser("");
    setCommunityName("");
    isDirectUserOrCommunity();
  }, [username]);

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

  const isDirectUserOrCommunity = () => {
    if (isCommunity(username)) {
      setCommunityName(username.replace("@", ""));
    } else {
      setDirectUser(username.replace("@", ""));
    }
  };

  const scrollToBottom = () => {
    messagesBoxRef &&
      messagesBoxRef?.current?.scroll({
        top: messagesBoxRef.current?.scrollHeight,
        behavior: "auto"
      });
  };

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const isScrollToBottom =
      element.scrollTop + messagesBoxRef?.current?.clientHeight! < element.scrollHeight - 200;
    setIsScrollToBottom(isScrollToBottom);
    const isScrolled = element.scrollTop + element.clientHeight <= element.scrollHeight - 20;
    setIsScrolled(isScrolled);
    const scrollerTop = element.scrollTop <= 600 && messages.length > 25;
    setIsTop(!!communityName && scrollerTop);
  };

  return (
    <>
      <div
        className={classNameObject({
          "h-full": true,
          "no-scroll": isTop && hasMore
        })}
        ref={messagesBoxRef}
        onScroll={handleScroll}
      >
        <Link
          className="after:!hidden"
          to={username.startsWith("@") ? `/${username}` : `/created/${username}`}
          target="_blank"
        >
          <ChatsProfileBox communityName={username} currentUser={username} />
        </Link>
        {communityName.length !== 0 ? (
          <>
            <ChatsChannelMessages
              publicMessages={messages as PublicMessage[]}
              currentChannel={currentChannel!}
              isScrollToBottom={isScrollToBottom}
              isScrolled={isScrolled}
              scrollToBottom={scrollToBottom}
            />
          </>
        ) : (
          <ChatsDirectMessages
            directMessages={messages as DirectMessage[]}
            currentUser={directUser!}
            isScrolled={isScrolled}
            isScrollToBottom={isScrollToBottom}
            scrollToBottom={scrollToBottom}
          />
        )}
        {isScrollToBottom && (
          <ChatsScroller
            bodyRef={messagesBoxRef}
            isScrollToTop={false}
            isScrollToBottom={true}
            marginRight={"5%"}
          />
        )}
      </div>

      <div className="sticky bottom-0 border-t border-[--border-color] bg-white">
        <ChatInput currentUser={directUser} currentChannel={currentChannel} />
      </div>
    </>
  );
}
