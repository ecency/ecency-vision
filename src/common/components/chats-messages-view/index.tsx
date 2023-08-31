import React, { RefObject, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Channel, PublicMessage } from "../../../providers/message-provider-types";
import {
  fetchCommunityMessages,
  fetchCurrentUserData,
  getPrivateKey,
  getProfileMetaData,
  NostrKeysType
} from "../../helper/chat-utils";
import { useMappedStore } from "../../store/use-mapped-store";
import { Global } from "../../store/global/types";
import ChatsProfileBox from "../chats-profile-box";

import "./index.scss";
import { _t } from "../../i18n";
import ChatsChannelMessages from "../chats-channel-messages";
import ChatsDirectMessages from "../chats-direct-messages";
import { Account } from "../../store/accounts/types";
import { ToggleType, UI } from "../../store/ui/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import ChatInput from "../chat-input";
import ChatsScroller from "../chats-scroller";
import { EmojiPickerStyleProps } from "../chat-box";

const EmojiPickerStyle: EmojiPickerStyleProps = {
  width: "56.5%",
  bottom: "58px",
  left: "305px",
  marginLeft: "14px",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
  borderBottomLeftRadius: "0px"
};
interface Props {
  username: string;
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  global: Global;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
}

export default function ChatsMessagesView(props: Props) {
  const { username, activeUser, global } = props;

  const messagesBoxRef = React.createRef<HTMLDivElement>();

  const { chat } = useMappedStore();
  const [directUser, setDirectUser] = useState("");
  const [publicMessages, setPublicMessages] = useState<PublicMessage[]>([]);
  const [communityName, setCommunityName] = useState("");
  const [currentChannel, setCurrentChannel] = useState<Channel>();
  const [activeUserKeys, setActiveUserKeys] = useState<NostrKeysType>();
  const [receiverPubKey, setReceiverPubKey] = useState("");
  const [isScrollToTop, setIsScrollToTop] = useState(false);
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [isTop, setIsTop] = useState(false);

  useEffect(() => {
    getActiveUserKeys();
    setChannelData();
  }, []);

  useEffect(() => {
    console.log("publicMessages", publicMessages);
    if (publicMessages.length !== 0) {
      scrollToBottom();
    }
  }, [publicMessages]);

  useEffect(() => {
    if (directUser) {
      getReceiverPubKey();
    }
  }, [directUser]);

  useEffect(() => {
    setChannelData();
  }, [chat.channels]);

  useEffect(() => {
    getChannelMessages();
  }, [chat.publicMessages]);

  useEffect(() => {
    if (directUser) {
    } else if (communityName && currentChannel) {
      getChannelMessages();
    }
  }, [directUser, communityName, currentChannel]);

  useEffect(() => {
    setDirectUser("");
    setCommunityName("");
    setChannelData();
  }, [username]);

  // useEffect(() => {
  //   if (isTop) {
  //     fetchPrevMessages();
  //   }
  // }, [isTop]);

  const getActiveUserKeys = async () => {
    const profileData = await getProfileMetaData(props.activeUser?.username!);
    const noStrPrivKey = getPrivateKey(props.activeUser?.username!);
    const activeUserKeys = {
      pub: profileData?.nsKey,
      priv: noStrPrivKey
    };
    setActiveUserKeys(activeUserKeys);
  };

  const getReceiverPubKey = async () => {
    const profileData = await getProfileMetaData(directUser);

    if (profileData?.nsKey) {
      setReceiverPubKey(profileData?.nsKey);
    }
  };

  const setChannelData = () => {
    if (username) {
      if (username && username.startsWith("@")) {
        setDirectUser(username.replace("@", ""));
      } else {
        setCommunityName(username);
        const channel = chat.channels.find((channel) => channel.communityName === username);
        // console.log("channel", channel);
        setCurrentChannel(channel);
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

  const scrollToBottom = () => {
    console.log("Scroll to bottom scliced");
    messagesBoxRef &&
      messagesBoxRef?.current?.scroll({
        top: messagesBoxRef.current?.scrollHeight,
        behavior: "auto"
      });
  };

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    var element = event.currentTarget;
    // let srollHeight: number = (element.scrollHeight / 100) * 25;
    // const isScrollToTop = !isCurrentUser && !isCommunity && element.scrollTop >= srollHeight;
    const isScrollToBottom =
      element.scrollTop + messagesBoxRef?.current?.clientHeight! < element.scrollHeight - 200;
    setIsScrollToBottom(isScrollToBottom);
    const scrollerTop = element.scrollTop <= 600 && publicMessages.length > 25;
    if (communityName && scrollerTop) {
      setIsTop(true);
    } else {
      setIsTop(false);
    }
  };

  return (
    <>
      <div className="chats-messages-view" ref={messagesBoxRef} onScroll={handleScroll}>
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
              activeUserKeys={activeUserKeys!}
              scrollToBottom={scrollToBottom}
            />
          </>
        ) : (
          <ChatsDirectMessages />
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
        emojiPickerStyles={EmojiPickerStyle}
        gifPickerStyle={EmojiPickerStyle}
        activeUser={activeUser}
        global={global}
        chat={chat}
        isCurrentUser={directUser ? true : false}
        isCommunity={communityName ? true : false}
        receiverPubKey={receiverPubKey}
        isActveUserRemoved={false}
        currentUser={directUser}
        currentChannel={currentChannel!}
        isCurrentUserJoined={true}
      />
    </>
  );
}
