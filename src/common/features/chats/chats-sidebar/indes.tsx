import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History } from "history";
import useDebounce from "react-use/lib/useDebounce";
import { setNostrkeys } from "../../../../managers/message-manager";
import { Channel } from "../../../../managers/message-manager-types";
import { getAccountReputations } from "../../../api/hive";
import accountReputation from "../../../helper/account-reputation";
import {
  formattedUserName,
  getCommunityLastMessage,
  getDirectLastMessage,
  getJoinedCommunities,
  getUserChatPublicKey
} from "../utils";
import { _t } from "../../../i18n";
import { arrowBackSvg, closeSvg, syncSvg } from "../../../img/svg";
import ChatsScroller from "../chats-scroller";
import LinearProgress from "../../../components/linear-progress";
import Tooltip from "../../../components/tooltip";
import UserAvatar from "../../../components/user-avatar";

import ChatsDropdownMenu from "../chats-dropdown-menu";
import { AccountWithReputation } from "../types";
import { useMappedStore } from "../../../store/use-mapped-store";
import { ChatContext } from "../chat-context-provider";

import "./index.scss";
import { FormControl } from "@ui/input";

interface Props {
  username: string;
  history: History;
}
export default function ChatsSideBar(props: Props) {
  const { username } = props;
  const { chat, resetChat } = useMappedStore();
  const chatContext = useContext(ChatContext);
  const { channels, directContacts, leftChannelsList } = chat;

  const {
    activeUserKeys,
    revealPrivKey,
    chatPrivKey,
    showSideBar,
    windowWidth,
    setShowSideBar,
    setShowSpinner,
    setRevealPrivKey,
    setReceiverPubKey
  } = chatContext;

  const chatsSideBarRef = React.createRef<HTMLDivElement>();

  const [showDivider, setShowDivider] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchInProgress, setSearchInProgress] = useState(false);
  const [userList, setUserList] = useState<AccountWithReputation[]>([]);
  const [isScrollToTop, setIsScrollToTop] = useState(false);
  const [communities, setCommunities] = useState<Channel[]>([]);

  useDebounce(
    async () => {
      if (searchText.length !== 0) {
        const resp = await getAccountReputations(searchText, 30);
        const sortedByReputation = resp.sort((a, b) => (a.reputation > b.reputation ? -1 : 1));
        setUserList(sortedByReputation);
        setSearchInProgress(false);
      }
    },
    500,
    [searchText]
  );

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

  const handleRefreshChat = () => {
    resetChat();
    setNostrkeys(activeUserKeys!);
    setShowSpinner(true);
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

  const handleSideBar = () => {
    if (windowWidth < 768 && showSideBar) {
      setShowSideBar(false);
    }
  };

  return (
    <>
      {showSideBar && (
        <div className="chats-sidebar">
          {windowWidth < 768 && (
            <div
              className="close-sidebar d-flex justify-content-end"
              onClick={() => setShowSideBar(false)}
            >
              {closeSvg}
            </div>
          )}

          <div className="d-flex justify-content-between chats-title">
            <div className="d-flex chats-content">
              {revealPrivKey && windowWidth > 768 && (
                <Tooltip content={_t("chat.back")}>
                  <div
                    className="back-arrow-image d-flex justify-content-center align-items-center"
                    onClick={() => setRevealPrivKey(false)}
                  >
                    <span className="back-arrow-svg"> {arrowBackSvg}</span>
                  </div>
                </Tooltip>
              )}

              <p className="chats">Chats</p>
            </div>

            <div className="chat-actions d-flex">
              <div className="refresh-button">
                <Tooltip content={_t("chat.refresh")}>
                  <p className="refresh-svg" onClick={handleRefreshChat}>
                    {syncSvg}
                  </p>
                </Tooltip>
              </div>
              {chatPrivKey && (
                <div className="chat-menu">
                  <ChatsDropdownMenu
                    onManageChatKey={() => {
                      setRevealPrivKey(!revealPrivKey);
                      if (windowWidth < 768) {
                        setShowSideBar(false);
                      }
                    }}
                    {...props}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="chats-search">
            <div className="w-full mb-4">
              <FormControl
                type="text"
                placeholder={_t("chat.search")}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setSearchInProgress(true);
                  if (e.target.value.length === 0) {
                    setSearchInProgress(false);
                    setUserList([]);
                  }
                }}
              />
            </div>
          </div>
          {showDivider && <div className="divider" />}
          {searchInProgress && <LinearProgress />}
          <div className="chats-list" onScroll={handleScroll} ref={chatsSideBarRef}>
            {searchText ? (
              <div className="searched-users">
                {userList.map((user) => (
                  <Link
                    to={`/chats/@${user.account}`}
                    onClick={() => {
                      setSearchText("");
                      setSearchInProgress(false);
                    }}
                    key={user.account}
                  >
                    <div
                      className="d-flex user-info"
                      key={user.account}
                      onClick={() => {
                        setRevealPrivKey(false);
                        getReceiverPubKey(user.account);
                        handleSideBar();
                      }}
                    >
                      <span>
                        <UserAvatar username={user.account} size="medium" />
                      </span>
                      <span className="user-name">{user.account}</span>
                      <span className="user-reputation">
                        ({accountReputation(user.reputation)})
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <>
                {communities.length !== 0 && <p className="community-title">Communities</p>}
                {communities.map((channel) => (
                  <Link to={`/chats/${channel.communityName}`} key={channel.id}>
                    <div
                      className={`community ${
                        username === channel.communityName ? "selected" : ""
                      }`}
                      key={channel.id}
                      onClick={() => {
                        setRevealPrivKey(false);
                        handleSideBar();
                      }}
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
                {directContacts.length !== 0 && <p className="dm-title">DMs</p>}
                {directContacts.map((contact) => (
                  <Link
                    to={`/chats/@${contact.name}`}
                    key={contact.pubkey}
                    onClick={() => {
                      setReceiverPubKey(contact.pubkey);
                      handleSideBar();
                    }}
                  >
                    <div
                      className={`dm ${
                        username && username === `@${contact.name}` ? "selected" : ""
                      }`}
                      onClick={handleRevealPrivKey}
                    >
                      <UserAvatar username={contact.name} size="medium" />
                      <div className="dm-info">
                        <p className="dm-name">{contact.name}</p>
                        <p className="dm-last-message">
                          {getDirectLastMessage(contact.pubkey, chat.directMessages)}
                        </p>
                      </div>
                    </div>
                  </Link>
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
      )}
    </>
  );
}
