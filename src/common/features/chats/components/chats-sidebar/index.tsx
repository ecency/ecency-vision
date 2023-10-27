import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History } from "history";
import { Channel } from "../../../../../managers/message-manager-types";
import {
  formattedUserName,
  getCommunityLastMessage,
  getJoinedCommunities,
  getUserChatPublicKey
} from "../../utils";
import ChatsScroller from "../chats-scroller";
import UserAvatar from "../../../../components/user-avatar";
import { AccountWithReputation } from "../../types";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { ChatContext } from "../../chat-context-provider";
import { ChatSidebarHeader } from "./chat-sidebar-header";
import { ChatSidebarSearch } from "./chat-sidebar-search";
import { ChatSidebarSearchItem } from "./chat-sidebar-search-item";
import { ChatSidebarDirectContact } from "./chat-sidebar-direct-contact";
import { _t } from "../../../../i18n";

interface Props {
  username: string;
  history: History;
}

export default function ChatsSideBar(props: Props) {
  const { username } = props;
  const { chat } = useMappedStore();
  const { revealPrivKey, windowWidth, setRevealPrivKey, setReceiverPubKey } =
    useContext(ChatContext);
  const { channels, directContacts, leftChannelsList } = chat;

  const chatsSideBarRef = React.createRef<HTMLDivElement>();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDivider, setShowDivider] = useState(false);
  const [userList, setUserList] = useState<AccountWithReputation[]>([]);
  const [isScrollToTop, setIsScrollToTop] = useState(false);
  const [communities, setCommunities] = useState<Channel[]>([]);

  useEffect(() => {
    if (username) {
      if (username.startsWith("@")) {
        getReceiverPubKey(formattedUserName(username));
      }
    }
  }, [username]);

  useEffect(() => {
    const communities = getJoinedCommunities(channels, leftChannelsList);
    setCommunities(communities);
  }, [channels, leftChannelsList]);

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    var element = event.currentTarget;
    if (element.scrollTop > 2) {
      setShowDivider(true);
    } else {
      if (showDivider) {
        setShowDivider(false);
      }
    }
    let srollHeight: number = (element.scrollHeight / 100) * 25;
    const isScrollToTop = element.scrollTop >= srollHeight;
    setIsScrollToTop(isScrollToTop);
  };

  const handleRevealPrivKey = () => {
    if (revealPrivKey) {
      setRevealPrivKey(false);
    }
  };

  const getReceiverPubKey = async (username: string) => {
    const peer = directContacts.find((x) => x.name === username)?.pubkey ?? "";
    if (peer) {
      setReceiverPubKey(peer);
    } else {
      const pubkey = await getUserChatPublicKey(username);
      if (pubkey === undefined) {
        setReceiverPubKey("");
      } else {
        setReceiverPubKey(pubkey);
      }
    }
  };

  return (
    <div className="flex flex-col">
      <ChatSidebarHeader history={props.history} />
      <ChatSidebarSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setUserList={setUserList}
      />
      {showDivider && <div className="divider" />}
      <div className="flex flex-col" onScroll={handleScroll} ref={chatsSideBarRef}>
        {searchQuery ? (
          userList.map((user) => (
            <ChatSidebarSearchItem
              user={user}
              onClick={() => {
                setSearchQuery("");
                setRevealPrivKey(false);
                getReceiverPubKey(user.account);
              }}
              key={user.account}
            />
          ))
        ) : (
          <>
            {communities.length !== 0 && <p className="community-title">Communities</p>}
            {communities.map((channel) => (
              <Link to={`/chats/${channel.communityName}`} key={channel.id}>
                <div
                  className={`community ${username === channel.communityName ? "selected" : ""}`}
                  key={channel.id}
                  onClick={() => setRevealPrivKey(false)}
                >
                  <UserAvatar username={channel.communityName!} size="medium" />
                  <div className="community-info">
                    <p className="community-name">{channel.name}</p>
                    <p className="community-last-message">
                      {getCommunityLastMessage(channel.id, chat.publicMessages)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {directContacts.length !== 0 && (
              <div className="mt-4 mb-2 text-xs font-semibold text-gray-500 uppercase px-3">
                {_t("chat.direct-messages")}
              </div>
            )}
            {directContacts.map((contact) => (
              <ChatSidebarDirectContact
                key={contact.pubkey}
                contact={contact}
                username={username}
                handleRevealPrivKey={handleRevealPrivKey}
              />
            ))}
          </>
        )}
      </div>
      {isScrollToTop && (
        <ChatsScroller
          bodyRef={chatsSideBarRef}
          isScrollToTop={isScrollToTop}
          isScrollToBottom={false}
          marginRight={"5%"}
        />
      )}
    </div>
  );
}
