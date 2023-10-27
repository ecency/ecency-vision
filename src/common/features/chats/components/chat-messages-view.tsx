import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Channel, DirectMessage, PublicMessage } from "../../../../managers/message-manager-types";
import { fetchCommunityMessages, fetchDirectMessages } from "../utils";
import { History } from "history";
import { useMappedStore } from "../../../store/use-mapped-store";
import ChatsProfileBox from "./chat-profile-box";
import ChatsChannelMessages from "./chats-channel-messages";
import ChatsDirectMessages from "./chats-direct-messages";
import ChatInput from "./chat-input";
import ChatsScroller from "./chats-scroller";
import { CHATPAGE } from "./chat-popup/chat-constants";
import { ChatContext } from "../chat-context-provider";
import { classNameObject } from "../../../helper/class-name-object";

interface Props {
  username: string;
  history: History;
  currentChannel: Channel;
  inProgress: boolean;
  currentChannelSetter: (channel: Channel) => void;
  setInProgress: (d: boolean) => void;
}

export default function ChatsMessagesView({
  username,
  currentChannel,
  inProgress,
  currentChannelSetter,
  setInProgress,
  history
}: Props) {
  const { messageServiceInstance } = useContext(ChatContext);

  const messagesBoxRef = useRef<HTMLDivElement>(null);

  const { chat } = useMappedStore();
  const [directUser, setDirectUser] = useState("");
  const [publicMessages, setPublicMessages] = useState<PublicMessage[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [communityName, setCommunityName] = useState("");
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [isTop, setIsTop] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    isDirectUserOrCommunity();
  }, []);

  useEffect(() => {
    if (publicMessages.length < 25) {
      setHasMore(false);
    }
  }, [publicMessages]);

  useEffect(() => {
    isDirectUserOrCommunity();
  }, [chat.channels]);

  useEffect(() => {
    getChannelMessages();
  }, [chat.publicMessages]);

  useEffect(() => {
    if (directUser) {
      getDirectMessages();
    } else if (communityName && currentChannel) {
      getChannelMessages();
    }
  }, [directUser, communityName, currentChannel, chat.directMessages]);

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
    if (!hasMore || inProgress) return;

    setInProgress(true);
    messageServiceInstance
      ?.fetchPrevMessages(currentChannel!.id, publicMessages[0].created)
      .then((num) => {
        if (num < 25) {
          setHasMore(false);
        }
      })
      .finally(() => {
        setInProgress(false);
        setIsTop(false);
      });
  };

  const isDirectUserOrCommunity = () => {
    if (username) {
      if (username && username.startsWith("@")) {
        setDirectUser(username.replace("@", ""));
      } else {
        setCommunityName(username);
      }
    }
  };

  const getChannelMessages = () => {
    if (currentChannel) {
      const publicMessages = fetchCommunityMessages(
        chat.publicMessages,
        currentChannel,
        currentChannel.hiddenMessageIds
      );
      const messages = publicMessages.sort((a, b) => a.created - b.created);
      setPublicMessages(messages);
    }
  };

  const getDirectMessages = () => {
    const user = chat.directContacts.find((item) => item.name === directUser);
    const messages = user && fetchDirectMessages(user?.pubkey, chat.directMessages);
    const directMessages = messages?.sort((a, b) => a.created - b.created);
    setDirectMessages(directMessages!);
  };

  const scrollToBottom = () => {
    messagesBoxRef &&
      messagesBoxRef?.current?.scroll({
        top: messagesBoxRef.current?.scrollHeight,
        behavior: "auto"
      });
  };

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    var element = event.currentTarget;
    const isScrollToBottom =
      element.scrollTop + messagesBoxRef?.current?.clientHeight! < element.scrollHeight - 200;
    setIsScrollToBottom(isScrollToBottom);
    const isScrolled = element.scrollTop + element.clientHeight <= element.scrollHeight - 20;
    setIsScrolled(isScrolled);
    const scrollerTop = element.scrollTop <= 600 && publicMessages.length > 25;
    if (communityName && scrollerTop) {
      setIsTop(true);
    } else {
      setIsTop(false);
    }
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
          <ChatsProfileBox username={username} />
        </Link>
        {communityName.length !== 0 ? (
          <>
            <ChatsChannelMessages
              username={username}
              history={history}
              publicMessages={publicMessages}
              currentChannel={currentChannel!}
              isScrollToBottom={isScrollToBottom}
              from={CHATPAGE}
              isScrolled={isScrolled}
              scrollToBottom={scrollToBottom}
              currentChannelSetter={currentChannelSetter}
            />
          </>
        ) : (
          <ChatsDirectMessages
            directMessages={directMessages && directMessages}
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
        <ChatInput
          isCurrentUser={!!directUser}
          isCommunity={!!communityName}
          currentUser={directUser}
          currentChannel={currentChannel!}
          isCurrentUserJoined={true}
        />
      </div>
    </>
  );
}
