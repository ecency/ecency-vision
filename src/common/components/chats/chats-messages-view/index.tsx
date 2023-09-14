import React, { RefObject, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Channel, DirectMessage, PublicMessage } from "../../../../managers/message-manager-types";
import {
  fetchCommunityMessages,
  fetchDirectMessages,
  getPrivateKey,
  getProfileMetaData
} from "../utils";
import { History } from "history";
import { useMappedStore } from "../../../store/use-mapped-store";
import { Global } from "../../../store/global/types";
import ChatsProfileBox from "../chats-profile-box";

import "./index.scss";
import { _t } from "../../../i18n";
import ChatsChannelMessages from "../chats-channel-messages";
import ChatsDirectMessages from "../chats-direct-messages";
import { Account } from "../../../store/accounts/types";
import { ToggleType, UI } from "../../../store/ui/types";
import { User } from "../../../store/users/types";
import ChatInput from "../chat-input";
import ChatsScroller from "../chats-scroller";
import { CHATPAGE } from "../chat-popup/chat-constants";
import { EmojiPickerStyleProps, NostrKeysType } from "../types";
import { ChatContext } from "../chat-context-provider";

const EmojiPickerStyle: EmojiPickerStyleProps = {
  width: "56.5%",
  bottom: "58px",
  left: "340px",
  marginLeft: "14px",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
  borderBottomLeftRadius: "0px"
};
interface Props {
  username: string;
  users: User[];
  history: History;
  ui: UI;
  currentChannel: Channel;
  inProgress: boolean;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  currentChannelSetter: (channel: Channel) => void;
  setInProgress: (d: boolean) => void;
  deletePublicMessage: (channelId: string, msgId: string) => void;
  deleteDirectMessage: (peer: string, msgId: string) => void;
}

export default function ChatsMessagesView(props: Props) {
  const {
    username,
    currentChannel,
    inProgress,
    history,
    currentChannelSetter,
    setInProgress,
    deletePublicMessage,
    deleteDirectMessage
  } = props;

  const { messageServiceInstance, receiverPubKey } = useContext(ChatContext);

  // console.log("Receiver pubkey in Message view component", receiverPubKey, setReceiverPubKey);

  const messagesBoxRef = useRef<HTMLDivElement>(null);

  const { chat, activeUser } = useMappedStore();
  const [directUser, setDirectUser] = useState("");
  const [publicMessages, setPublicMessages] = useState<PublicMessage[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [communityName, setCommunityName] = useState("");
  const [activeUserKeys, setActiveUserKeys] = useState<NostrKeysType>();
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [isTop, setIsTop] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [removedUsers, setRemovedUsers] = useState<string[]>([]);
  const [isActveUserRemoved, setIsActiveUserRemoved] = useState(false);

  useEffect(() => {
    getActiveUserKeys();
    isDirectUserOrCommunity();
  }, []);

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
      currentChannel?.removedUserIds && setRemovedUsers(currentChannel.removedUserIds);
    }
  }, [directUser, communityName, currentChannel, chat.directMessages]);

  useEffect(() => {
    setDirectUser("");
    setCommunityName("");
    isDirectUserOrCommunity();
  }, [username]);

  useEffect(() => {
    if (isTop) {
      fetchPrevMessages();
    }
  }, [isTop]);

  useEffect(() => {
    if (removedUsers) {
      const removed = removedUsers.includes(activeUserKeys?.pub!);
      setIsActiveUserRemoved(removed);
    }
  }, [removedUsers]);

  const fetchPrevMessages = () => {
    if (!hasMore || inProgress) return;

    setInProgress(true);
    messageServiceInstance
      ?.fetchPrevMessages(currentChannel!.id, publicMessages[0].created)
      .then((num) => {
        console.log("number", num);
        if (num < 25) {
          setHasMore(false);
        }
      })
      .finally(() => {
        setInProgress(false);
        setIsTop(false);
      });
  };

  const getActiveUserKeys = async () => {
    const profileData = await getProfileMetaData(activeUser?.username!);
    const noStrPrivKey = getPrivateKey(activeUser?.username!);
    const activeUserKeys = {
      pub: profileData?.nsKey,
      priv: noStrPrivKey
    };
    setActiveUserKeys(activeUserKeys);
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
    console.log("user", user?.pubkey);
    const messages = user && fetchDirectMessages(user?.pubkey, chat.directMessages);
    setDirectMessages(messages!);
    console.log("Messages", messages);
  };

  const scrollToBottom = () => {
    console.log("Scroll to bottom clicked", messagesBoxRef.current?.scrollHeight);
    messagesBoxRef &&
      messagesBoxRef?.current?.scroll({
        top: messagesBoxRef.current?.scrollHeight,
        behavior: "auto"
      });
  };

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    var element = event.currentTarget;
    let srollHeight: number = (element.scrollHeight / 100) * 25;
    // const isScrollToTop = !isCurrentUser && !isCommunity && element.scrollTop >= srollHeight;
    const isScrollToBottom =
      element.scrollTop + messagesBoxRef?.current?.clientHeight! < element.scrollHeight - 200;
    setIsScrollToBottom(isScrollToBottom);
    // console.log(element.scrollTop, (element.scrollTop / 100) * 98);
    const isScrolled = element.scrollTop + element.clientHeight <= element.scrollHeight - 20;
    setIsScrolled(isScrolled);
    // const isScrolled = element.scrollHeight/100 *3 - 50;
    // console.log("isScrolled", isScrolled)
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
        className={`chats-messages-view ${isTop && hasMore ? "no-scroll" : ""}`}
        ref={messagesBoxRef}
        onScroll={handleScroll}
      >
        <Link
          to={username.startsWith("@") ? `/${username}` : `/created/${username}`}
          target="_blank"
        >
          <ChatsProfileBox username={username} />
        </Link>
        {communityName.length !== 0 ? (
          <>
            <ChatsChannelMessages
              {...props}
              publicMessages={publicMessages}
              currentChannel={currentChannel!}
              isScrollToBottom={isScrollToBottom}
              from={CHATPAGE}
              isScrolled={isScrolled}
              isActveUserRemoved={isActveUserRemoved}
              deletePublicMessage={deletePublicMessage}
              scrollToBottom={scrollToBottom}
              currentChannelSetter={currentChannelSetter}
            />
          </>
        ) : (
          <ChatsDirectMessages
            {...props}
            directMessages={directMessages && directMessages}
            currentUser={directUser!}
            isScrolled={isScrolled}
            receiverPubKey={receiverPubKey}
            isScrollToBottom={isScrollToBottom}
            deleteDirectMessage={deleteDirectMessage}
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
      <ChatInput
        receiverPubKey={receiverPubKey}
        emojiPickerStyles={EmojiPickerStyle}
        gifPickerStyle={EmojiPickerStyle}
        isCurrentUser={directUser ? true : false}
        isCommunity={communityName ? true : false}
        isActveUserRemoved={isActveUserRemoved}
        currentUser={directUser}
        currentChannel={currentChannel!}
        isCurrentUserJoined={true}
      />
    </>
  );
}
