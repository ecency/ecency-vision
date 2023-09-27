import React, { useContext, useEffect, useRef, useState } from "react";
import useDebounce from "react-use/lib/useDebounce";
import { useLocation } from "react-router";
import { Button, Form, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { history } from "../../../../common/store";

import { Community } from "../../../store/communities/types";
import { ToggleType } from "../../../store/ui/types";
import { Account } from "../../../store/accounts/types";
import {
  Channel,
  ChannelUpdate,
  DirectMessage,
  PublicMessage
} from "../../../../managers/message-manager-types";

import Tooltip from "../../tooltip";
import UserAvatar from "../../user-avatar";
import LinearProgress from "../../linear-progress";
import { setNostrkeys } from "../../../../managers/message-manager";
import ManageChatKey from "../../manage-chat-key";
import ChatInput from "../chat-input";
import ChatsProfileBox from "../chats-profile-box";
import ChatsDropdownMenu from "../chats-dropdown-menu";
import ChatsCommunityDropdownMenu from "../chats-community-dropdown-menu";
import ChatsChannelMessages from "../chats-channel-messages";

import {
  addMessageSVG,
  expandArrow,
  collapseArrow,
  arrowBackSvg,
  chevronUpSvg,
  chevronDownSvgForSlider,
  syncSvg,
  extendedView
} from "../../../img/svg";

import { EmojiPickerStyle, GifPickerStyle } from "./chat-constants";

import accountReputation from "../../../helper/account-reputation";
import { _t } from "../../../i18n";
import { usePrevious } from "../../../util/use-previous";

import { getAccountReputations } from "../../../api/hive";
import { getCommunity } from "../../../api/bridge";

import "./index.scss";
import ChatsDirectMessages from "../chats-direct-messages";
import { AccountWithReputation } from "../types";
import {
  deleteChatPublicKey,
  fetchCommunityMessages,
  getCommunityLastMessage,
  getDirectLastMessage,
  getJoinedCommunities,
  getPrivateKey,
  getUserChatPublicKey
} from "../utils";
import { useMappedStore } from "../../../store/use-mapped-store";
import { ChatContext } from "../chat-context-provider";
import ImportChats from "../import-chats";

interface Props {
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
}

export const ChatPopUp = (props: Props) => {
  const { activeUser, global, chat, resetChat } = useMappedStore();

  const {
    messageServiceInstance,
    revealPrivKey,
    activeUserKeys,
    showSpinner,
    hasUserJoinedChat,
    currentChannel,
    windowWidth,
    setCurrentChannel,
    setRevealPrivKey,
    setShowSpinner,
    joinChat
  } = useContext(ChatContext);

  const routerLocation = useLocation();
  const prevActiveUser = usePrevious(activeUser);
  const chatBodyDivRef = useRef<HTMLDivElement | null>(null);

  const [expanded, setExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isScrollToTop, setIsScrollToTop] = useState(false);
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [show, setShow] = useState(false);
  const [receiverPubKey, setReceiverPubKey] = useState("");
  const [isSpinner, setIsSpinner] = useState(false);
  const [directMessagesList, setDirectMessagesList] = useState<DirectMessage[]>([]);
  const [isCurrentUserJoined, setIsCurrentUserJoined] = useState(true);
  const [isCommunity, setIsCommunity] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [currentCommunity, setCurrentCommunity] = useState<Community>();
  const [publicMessages, setPublicMessages] = useState<PublicMessage[]>([]);
  const [communities, setCommunities] = useState<Channel[]>([]);
  const [searchtext, setSearchText] = useState("");
  const [userList, setUserList] = useState<AccountWithReputation[]>([]);
  const [isTop, setIsTop] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isChatPage, setIsChatPage] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    console.log("chat in store", chat);
  }, [chat]);

  useEffect(() => {
    if (currentChannel && chat.leftChannelsList.includes(currentChannel.id)) {
      setIsCommunity(false);
      setCommunityName("");
    }
  }, [chat.leftChannelsList]);

  useEffect(() => {
    handleRouterChange();
  }, [routerLocation]);

  useEffect(() => {
    if (isChatPage) {
      setShow(false);
    }
  }, [isChatPage]);

  useEffect(() => {
    // deleteChatPublicKey(activeUser);
    setShow(!!activeUser?.username && !isChatPage);
  }, []);

  useEffect(() => {
    const updated: ChannelUpdate = chat.updatedChannel
      .filter((x) => x.channelId === currentChannel?.id!)
      .sort((a, b) => b.created - a.created)[0];
    if (currentChannel && updated) {
      const publicMessages: PublicMessage[] = fetchCommunityMessages(
        chat.publicMessages,
        currentChannel,
        updated?.hiddenMessageIds
      );
      const messages = publicMessages.sort((a, b) => a.created - b.created);
      setPublicMessages(messages);
      const channel = {
        name: updated.name,
        about: updated.about,
        picture: updated.picture,
        communityName: updated.communityName,
        communityModerators: updated.communityModerators,
        id: updated.channelId,
        creator: updated.creator,
        created: currentChannel?.created!,
        hiddenMessageIds: updated.hiddenMessageIds,
        removedUserIds: updated.removedUserIds
      };
      setCurrentChannel(channel);
    }
  }, [chat.updatedChannel]);

  useEffect(() => {
    if (isTop) {
      fetchPrevMessages();
    }
  }, [isTop]);

  useEffect(() => {
    if (messageServiceInstance) {
      setIsSpinner(false);
    }
  }, [messageServiceInstance]);

  useEffect(() => {
    const communities = getJoinedCommunities(chat.channels, chat.leftChannelsList);
    setCommunities(communities);
  }, [chat.channels, chat.leftChannelsList]);

  useEffect(() => {
    const msgsList = fetchDirectMessages(receiverPubKey!);
    const messages = msgsList.sort((a, b) => a.created - b.created);
    setDirectMessagesList(messages);
  }, [chat.directMessages]);

  useEffect(() => {
    if (prevActiveUser?.username !== activeUser?.username) {
      setIsCommunity(false);
      setIsCurrentUser(false);
      setCurrentUser("");
      setCommunityName("");
    }
  }, [global.theme, activeUser]);

  useEffect(() => {
    if (directMessagesList.length !== 0 && !isScrolled) {
      scrollerClicked();
    }
    if (!isScrolled && publicMessages.length !== 0 && isCommunity) {
      scrollerClicked();
    }
  }, [directMessagesList, publicMessages]);

  useEffect(() => {
    if (currentChannel && isCommunity) {
      messageServiceInstance?.fetchChannel(currentChannel.id);
      const publicMessages: PublicMessage[] = fetchCommunityMessages(
        chat.publicMessages,
        currentChannel,
        currentChannel.hiddenMessageIds
      );
      const messages = publicMessages.sort((a, b) => a.created - b.created);
      setPublicMessages(messages);
    }
  }, [currentChannel, isCommunity, chat.publicMessages]);

  useEffect(() => {
    if ((isCurrentUser || isCommunity) && show) {
      scrollerClicked();
    }
  }, [isCurrentUser, isCommunity, show]);

  useEffect(() => {
    const msgsList = fetchDirectMessages(receiverPubKey!);
    const messages = msgsList.sort((a, b) => a.created - b.created);
    setDirectMessagesList(messages);
  }, [activeUser]);

  useEffect(() => {
    if (isCommunity && show) {
      fetchCommunity();

      scrollerClicked();
      fetchCurrentChannel(communityName);
    }
  }, [isCommunity, communityName, show]);

  useEffect(() => {
    if (currentUser) {
      const isCurrentUserFound = chat.directContacts.find(
        (contact) => contact.name === currentUser
      );
      if (isCurrentUserFound) {
        setReceiverPubKey(isCurrentUserFound.pubkey);
        setIsCurrentUserJoined(true);
      } else {
        setInProgress(true);
        fetchCurrentUserData();
      }

      const peer = chat.directContacts.find((x) => x.name === currentUser)?.pubkey ?? "";
      const msgsList = fetchDirectMessages(peer!);
      const messages = msgsList.sort((a, b) => a.created - b.created);
      setDirectMessagesList(messages);
      if (!messageServiceInstance) {
        setNostrkeys(activeUserKeys!);
      }
    } else {
      setIsCurrentUserJoined(true);
      setInProgress(false);
    }
  }, [currentUser]);

  useDebounce(
    async () => {
      if (searchtext.length !== 0) {
        const resp = await getAccountReputations(searchtext, 30);
        const sortedByReputation = resp.sort((a, b) => (a.reputation > b.reputation ? -1 : 1));
        setUserList(sortedByReputation);
        setInProgress(false);
      } else {
        setInProgress(false);
        setUserList([]);
      }
    },
    500,
    [searchtext]
  );

  const handleRouterChange = () => {
    if (routerLocation.pathname.match("/chats")) {
      setShow(false);
      setIsChatPage(true);
    } else {
      setShow(!!activeUser?.username);
    }
  };

  const fetchCommunity = async () => {
    const community = await getCommunity(communityName, activeUser?.username);
    setCurrentCommunity(community!);
  };

  const fetchCurrentChannel = (communityName: string) => {
    const channel = chat.channels.find((channel) => channel.communityName === communityName);
    if (channel) {
      const updated: ChannelUpdate = chat.updatedChannel
        .filter((x) => x.channelId === channel.id)
        .sort((a, b) => b.created - a.created)[0];
      if (updated) {
        const channel = {
          name: updated.name,
          about: updated.about,
          picture: updated.picture,
          communityName: updated.communityName,
          communityModerators: updated.communityModerators,
          id: updated.channelId,
          creator: updated.creator,
          created: currentChannel?.created!,
          hiddenMessageIds: updated.hiddenMessageIds,
          removedUserIds: updated.removedUserIds
        };
        setCurrentChannel(channel);
      } else {
        setCurrentChannel(channel);
      }
    }
  };

  const fetchDirectMessages = (peer: string) => {
    for (const item of chat.directMessages) {
      if (item.peer === peer) {
        return Object.values(item.chat);
      }
    }
    return [];
  };

  const fetchCurrentUserData = async () => {
    const nsKey = await getUserChatPublicKey(currentUser);
    if (nsKey) {
      setReceiverPubKey(nsKey);
    } else {
      setReceiverPubKey("");
    }
    setIsCurrentUserJoined(!!nsKey);
    setInProgress(false);
  };

  const userClicked = (username: string) => {
    setIsCurrentUser(true);
    setCurrentUser(username);
  };

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

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    var element = event.currentTarget;
    let srollHeight: number = (element.scrollHeight / 100) * 25;
    const isScrollToTop = !isCurrentUser && !isCommunity && element.scrollTop >= srollHeight;
    const isScrollToBottom =
      (isCurrentUser || isCommunity) &&
      element.scrollTop + chatBodyDivRef?.current?.clientHeight! < element.scrollHeight - 200;
    const isScrolled = element.scrollTop + element.clientHeight <= element.scrollHeight - 20;
    setIsScrolled(isScrolled);
    setIsScrollToTop(isScrollToTop);
    setIsScrollToBottom(isScrollToBottom);
    const scrollerTop = element.scrollTop <= 600 && publicMessages.length > 25;
    if (isCommunity && scrollerTop) {
      setIsTop(true);
    } else {
      setIsTop(false);
    }
  };

  const scrollerClicked = () => {
    chatBodyDivRef?.current?.scroll({
      top: isCurrentUser || isCommunity ? chatBodyDivRef?.current?.scrollHeight : 0,
      behavior: "auto"
    });
  };

  const handleMessageSvgClick = () => {
    setShowSearchUser(!showSearchUser);
    setExpanded(true);
  };

  const handleRefreshSvgClick = () => {
    setExpanded(true);
    resetChat();
    handleBackArrowSvg();
    if (getPrivateKey(activeUser?.username!)) {
      setShowSpinner(true);
      const keys = {
        pub: activeUserKeys?.pub!,
        priv: getPrivateKey(activeUser?.username!)
      };
      setNostrkeys(keys);
      if (isCommunity && communityName) {
        fetchCurrentChannel(communityName);
      }
    }
  };

  const handleJoinChat = async () => {
    setIsSpinner(true);
    joinChat();
  };

  const chatButtonSpinner = (
    <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
  );

  const communityClicked = (community: string) => {
    setIsCommunity(true);
    setCommunityName(community);
  };

  const handleBackArrowSvg = () => {
    setCurrentUser("");
    setIsCurrentUser(false);
    setCommunityName("");
    setIsCommunity(false);
    setShowSearchUser(false);
    setSearchText("");
    setHasMore(true);
    setRevealPrivKey(false);
  };

  const handleExtendedView = () => {
    if (!isCurrentUser && !isCommunity) {
      history?.push("/chats");
    } else if (isCurrentUser) {
      history?.push(`/chats/@${currentUser}`);
    } else {
      history?.push(`/chats/${communityName}`);
    }
  };

  return (
    <>
      {show && (
        <div
          className={`chatbox-container ${expanded ? "expanded" : ""} ${
            windowWidth <= 666 ? "small-screen" : ""
          }`}
        >
          <div className="chat-header">
            {(currentUser || communityName || showSearchUser || revealPrivKey) && expanded && (
              <Tooltip content={_t("chat.back")}>
                <div className="back-arrow-image">
                  <span className="back-arrow-svg" onClick={handleBackArrowSvg}>
                    {" "}
                    {arrowBackSvg}
                  </span>
                </div>
              </Tooltip>
            )}
            <div className="message-header-title" onClick={() => setExpanded(!expanded)}>
              {(currentUser || isCommunity) && (
                <p className="user-icon">
                  <UserAvatar
                    username={
                      isCurrentUser ? currentUser : (isCommunity && currentCommunity?.name) || ""
                    }
                    size="small"
                  />
                </p>
              )}

              <p className="message-header-content">
                {currentUser
                  ? currentUser
                  : isCommunity
                  ? currentCommunity?.title
                  : showSearchUser
                  ? "New Message"
                  : revealPrivKey
                  ? "Manage chat key"
                  : "Messages"}
              </p>
            </div>
            <div className="actionable-imgs">
              <div className="extended-image" onClick={handleExtendedView}>
                <Tooltip content={_t("chat.extended-view")}>
                  <p className="extended-svg">{extendedView}</p>
                </Tooltip>
              </div>
              {!currentUser &&
                hasUserJoinedChat &&
                activeUserKeys?.priv &&
                !isCommunity &&
                !revealPrivKey && (
                  <>
                    <div className="message-image" onClick={handleMessageSvgClick}>
                      <Tooltip content={_t("chat.new-message")}>
                        <p className="message-svg">{addMessageSVG}</p>
                      </Tooltip>
                    </div>
                  </>
                )}
              {hasUserJoinedChat && activeUserKeys?.priv && !revealPrivKey && (
                <div className="message-image" onClick={handleRefreshSvgClick}>
                  <Tooltip content={_t("chat.refresh")}>
                    <p className="message-svg" style={{ paddingTop: "8px" }}>
                      {syncSvg}
                    </p>
                  </Tooltip>
                </div>
              )}
              {isCommunity && (
                <div className="community-menu">
                  <ChatsCommunityDropdownMenu history={history!} username={communityName} />
                </div>
              )}{" "}
              {!isCommunity && !isCurrentUser && activeUserKeys?.priv && (
                <div className="simple-menu" onClick={() => setExpanded(true)}>
                  <ChatsDropdownMenu
                    history={history!}
                    onManageChatKey={() => {
                      setRevealPrivKey(!revealPrivKey);
                    }}
                  />
                </div>
              )}
              <div className="arrow-image">
                <Tooltip content={expanded ? _t("chat.collapse") : _t("chat.expand")}>
                  <p
                    className="arrow-svg"
                    onClick={() => {
                      setExpanded(!expanded);
                    }}
                  >
                    {expanded ? expandArrow : collapseArrow}
                  </p>
                </Tooltip>
              </div>
            </div>
          </div>
          {inProgress && <LinearProgress />}
          <div
            className={`chat-body ${
              currentUser ? "current-user" : isCommunity ? "community" : ""
            } ${!hasUserJoinedChat ? "join-chat" : isTop && hasMore ? "no-scroll" : ""}`}
            ref={chatBodyDivRef}
            onScroll={handleScroll}
          >
            {hasUserJoinedChat && !revealPrivKey ? (
              <>
                {currentUser.length !== 0 || communityName.length !== 0 ? (
                  <div className="chats">
                    <>
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
                          receiverPubKey={receiverPubKey}
                          directMessages={directMessagesList}
                          currentUser={currentUser}
                          isScrollToBottom={false}
                        />
                      ) : (
                        <ChatsChannelMessages
                          {...props}
                          history={history!}
                          username={communityName}
                          publicMessages={publicMessages}
                          currentChannel={currentChannel!}
                          isScrollToBottom={false}
                          currentChannelSetter={setCurrentChannel}
                        />
                      )}
                    </>
                  </div>
                ) : showSearchUser ? (
                  <>
                    <div className="user-search-bar">
                      <Form.Group className="w-100 mb-3">
                        <Form.Control
                          type="text"
                          placeholder={_t("chat.search")}
                          value={searchtext}
                          autoFocus={true}
                          onChange={(e) => {
                            setSearchText(e.target.value);
                            setInProgress(true);
                          }}
                        />
                      </Form.Group>
                    </div>
                    <div className="user-search-suggestion-list">
                      {userList.map((user, index) => {
                        return (
                          <div
                            key={index}
                            className="search-content"
                            onClick={() => {
                              setCurrentUser(user.account);
                              setIsCurrentUser(true);
                            }}
                          >
                            <div className="search-user-img">
                              <span>
                                <UserAvatar username={user.account} size="medium" />
                              </span>
                            </div>

                            <div className="search-user-title">
                              <p className="search-username">{user.account}</p>
                              <p className="search-reputation">
                                ({accountReputation(user.reputation)})
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    {(chat.directContacts.length !== 0 ||
                      (chat.channels.length !== 0 && communities.length !== 0)) &&
                    !showSpinner &&
                    activeUserKeys?.priv ? (
                      <React.Fragment>
                        {chat.channels.length !== 0 && communities.length !== 0 && (
                          <>
                            <div className="community-header">{_t("chat.communities")}</div>
                            {communities.map((channel) => {
                              return (
                                <div key={channel.id} className="chat-content">
                                  <Link to={`/created/${channel.communityName}`}>
                                    <div className="user-img">
                                      <span>
                                        <UserAvatar
                                          username={channel.communityName!}
                                          size="medium"
                                        />
                                      </span>
                                    </div>
                                  </Link>

                                  <div
                                    className="user-title"
                                    onClick={() => communityClicked(channel.communityName!)}
                                  >
                                    <p className="username">{channel.name}</p>
                                    <p className="last-message">
                                      {getCommunityLastMessage(channel.id, chat.publicMessages)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            {chat.directContacts.length !== 0 && (
                              <div className="dm-header">{_t("chat.dms")}</div>
                            )}
                          </>
                        )}
                        {chat.directContacts.map((user) => {
                          return (
                            <div key={user.pubkey} className="chat-content">
                              <Link to={`/@${user.name}`}>
                                <div className="user-img">
                                  <span>
                                    <UserAvatar username={user.name} size="medium" />
                                  </span>
                                </div>
                              </Link>

                              <div
                                className="user-title"
                                onClick={() => {
                                  userClicked(user.name);
                                  setReceiverPubKey(user.pubkey);
                                }}
                              >
                                <p className="username">{user.name}</p>
                                <p className="last-message">
                                  {getDirectLastMessage(user.pubkey, chat.directMessages)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ) : !activeUserKeys?.priv ? (
                      <>
                        <ImportChats />
                      </>
                    ) : showSpinner ? (
                      <div className="no-chat">
                        <Spinner animation="border" variant="primary" size="sm" />
                        <p className="mt-3 ml-2">Loading...</p>
                      </div>
                    ) : (
                      <>
                        <p className="no-chat">{_t("chat.no-chat")}</p>
                        <div className="start-chat-btn">
                          <Button variant="primary" onClick={() => setShowSearchUser(true)}>
                            {_t("chat.start-chat")}
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            ) : revealPrivKey ? (
              <ManageChatKey history={history!} />
            ) : (
              <Button className="join-chat-btn" onClick={handleJoinChat}>
                {isSpinner && chatButtonSpinner}
                {_t("chat.join-chat")}
              </Button>
            )}

            {((isScrollToTop && !isCurrentUser) ||
              ((isCurrentUser || isCommunity) && isScrollToBottom)) && (
              <Tooltip
                content={isScrollToTop ? _t("scroll-to-top.title") : _t("chat.scroll-to-bottom")}
              >
                <div
                  className="scroller"
                  style={{
                    bottom: (isCurrentUser || isCommunity) && isScrollToBottom ? "20px" : "55px"
                  }}
                  onClick={scrollerClicked}
                >
                  {isCurrentUser || isCommunity ? chevronDownSvgForSlider : chevronUpSvg}
                </div>
              </Tooltip>
            )}
          </div>
          {(isCurrentUser || isCommunity) && (
            <ChatInput
              isCurrentUser={isCurrentUser}
              isCommunity={isCommunity}
              currentUser={currentUser}
              receiverPubKey={receiverPubKey}
              currentChannel={currentChannel!}
              isCurrentUserJoined={isCurrentUserJoined}
              emojiPickerStyles={EmojiPickerStyle}
              gifPickerStyle={GifPickerStyle}
            />
          )}
        </div>
      )}
    </>
  );
};
