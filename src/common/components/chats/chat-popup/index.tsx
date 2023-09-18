import React, { useContext, useEffect, useRef, useState } from "react";
import useDebounce from "react-use/lib/useDebounce";
import { useLocation } from "react-router";
import { History } from "history";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

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
import { error } from "../../feedback";
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
  syncSvg
} from "../../../img/svg";

import {
  NOSTRKEY,
  NEWCHATACCOUNT,
  CHATIMPORT,
  RESENDMESSAGE,
  EmojiPickerStyle,
  GifPickerStyle
} from "./chat-constants";

import * as ls from "../../../util/local-storage";
import accountReputation from "../../../helper/account-reputation";
import { _t } from "../../../i18n";
import { usePrevious } from "../../../util/use-previous";

import { getAccountFull, getAccountReputations } from "../../../api/hive";
import { getCommunity } from "../../../api/bridge";

import "./index.scss";
import ChatsDirectMessages from "../chats-direct-messages";
import { AccountWithReputation, NostrKeysType } from "../types";
import {
  createNoStrAccount,
  deleteChatPublicKey,
  fetchCommunityMessages,
  getCommunityLastMessage,
  getDirectLastMessage,
  getJoinedCommunities,
  getPrivateKey,
  getProfileMetaData,
  getUserChatPublicKey,
  setProfileMetaData
} from "../utils";
import { useMappedStore } from "../../../store/use-mapped-store";
import { ChatContext } from "../chat-context-provider";
import ImportChats from "../import-chats";
import MessageService from "../../../helper/message-service";

interface Props {
  history: History;
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
  const [clickedMessage, setClickedMessage] = useState("");
  const [keyDialog, setKeyDialog] = useState(false);
  const [step, setStep] = useState(0);
  const [communities, setCommunities] = useState<Channel[]>([]);
  const [searchtext, setSearchText] = useState("");
  const [userList, setUserList] = useState<AccountWithReputation[]>([]);
  const [noStrPrivKey, setNoStrPrivKey] = useState("");
  const [isActveUserRemoved, setIsActiveUserRemoved] = useState(false);
  const [isTop, setIsTop] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [removedUsers, setRemovedUsers] = useState<string[]>([]);
  const [innerWidth, setInnerWidth] = useState(0);
  const [isChatPage, setIsChatPage] = useState(false);

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
    const noStrPrivKey = getPrivateKey(activeUser?.username!);
    setNoStrPrivKey(noStrPrivKey);
    setInnerWidth(window.innerWidth);
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
      const noStrPrivKey = getPrivateKey(activeUser?.username!);
      setNoStrPrivKey(noStrPrivKey);
    }
  }, [typeof window !== "undefined" && messageServiceInstance]);

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
    if (directMessagesList.length !== 0) {
      scrollerClicked();
    }
    if (!isScrollToBottom && publicMessages.length !== 0 && isCommunity) {
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
      currentChannel?.removedUserIds && setRemovedUsers(currentChannel.removedUserIds);
      const messages = publicMessages.sort((a, b) => a.created - b.created);
      setPublicMessages(messages);
    }
  }, [currentChannel, isCommunity, chat.publicMessages]);

  useEffect(() => {
    scrollerClicked();
  }, [isCurrentUser, isCommunity]);

  useEffect(() => {
    if (removedUsers) {
      const removed = removedUsers.includes(activeUserKeys?.pub!);
      setIsActiveUserRemoved(removed);
    }
  }, [removedUsers]);

  useEffect(() => {
    const msgsList = fetchDirectMessages(receiverPubKey!);
    const messages = msgsList.sort((a, b) => a.created - b.created);
    setDirectMessagesList(messages);
    const noStrPrivKey = getPrivateKey(activeUser?.username!);
    setNoStrPrivKey(noStrPrivKey);
  }, [activeUser]);

  useEffect(() => {
    if (isCommunity) {
      fetchCommunity();
      scrollerClicked();
      fetchCurrentChannel(communityName);
    }
  }, [isCommunity, communityName]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
      setShow(true);
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

  const handleResize = () => {
    setInnerWidth(window.innerWidth);
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
    console.log("Fetch profile run");
    // const response = await getAccountFull(currentUser);
    // const { posting_json_metadata } = response;
    // const profile = JSON.parse(posting_json_metadata!).profile;
    // const { nsKey } = profile || {};
    const nsKey = await getUserChatPublicKey(currentUser);
    console.log("nsKey", nsKey);
    if (nsKey) {
      setReceiverPubKey(nsKey);
    } else {
      setReceiverPubKey("");
    }

    console.log("Hello reached");
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
    } else {
      setNoStrPrivKey("");
    }
  };

  const handleJoinChat = async () => {
    setIsSpinner(true);
    joinChat();
  };

  const chatButtonSpinner = (
    <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
  );

  const communityClicked = (community: string, name: string) => {
    setIsCommunity(true);
    setCommunityName(community);
  };

  const finish = () => {
    setStep(0);
    setKeyDialog(false);
  };

  const handleConfirmButton = (actionType: string) => {
    switch (actionType) {
      case NEWCHATACCOUNT:
        setInProgress(true);
        deleteChatPublicKey(activeUser)
          .then((updatedProfile) => {
            handleJoinChat();
            setStep(10);
            setInProgress(false);
          })
          .catch((err) => {
            error(err);
          });
        break;
      default:
        break;
    }
  };

  const successModal = (message: string) => {
    return (
      <>
        <div className="import-chat-dialog-header border-bottom">
          <div className="step-no">2</div>
          <div className="import-chat-dialog-titles">
            <div className="import-chat-main-title">{_t("manage-authorities.success-title")}</div>
            <div className="import-chat-sub-title">
              {_t("manage-authorities.success-sub-title")}
            </div>
          </div>
        </div>
        <div className="success-dialog-body">
          <div className="success-dialog-content">
            <span>
              {message === CHATIMPORT
                ? "Chats imported successfully"
                : message === NEWCHATACCOUNT
                ? "New Account created successfully"
                : ""}
            </span>
          </div>
          <div className="d-flex justify-content-center">
            <span className="hr-6px-btn-spacer" />
            <Button onClick={finish}>{_t("g.finish")}</Button>
          </div>
        </div>
      </>
    );
  };

  const confirmationModal = (actionType: string) => {
    return (
      <>
        <div className="join-community-dialog-header border-bottom">
          <div className="join-community-dialog-titles">
            <h2 className="join-community-main-title">
              {actionType === NEWCHATACCOUNT ? "Warning" : "Confirmation"}
            </h2>
          </div>
        </div>
        {inProgress && actionType === NEWCHATACCOUNT && <LinearProgress />}
        <div className="join-community-dialog-body" style={{ fontSize: "18px", marginTop: "12px" }}>
          {actionType === NEWCHATACCOUNT
            ? "creating new account will reset your chats"
            : "Are you sure?"}
        </div>
        <p className="join-community-confirm-buttons" style={{ textAlign: "right" }}>
          <Button
            variant="outline-primary"
            className="close-btn"
            style={{ marginRight: "20px" }}
            onClick={() => {
              setStep(0);
              setKeyDialog(false);
            }}
          >
            {_t("chat.close")}
          </Button>
          <Button
            variant="outline-primary"
            className="confirm-btn"
            onClick={() => handleConfirmButton(actionType)}
          >
            {_t("chat.confirm")}
          </Button>
        </p>
      </>
    );
  };

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
  };

  const handleBackArrowSvg = () => {
    setCurrentUser("");
    setIsCurrentUser(false);
    setCommunityName("");
    setIsCommunity(false);
    setClickedMessage("");
    setShowSearchUser(false);
    setSearchText("");
    setHasMore(true);
    setRevealPrivKey(false);
  };

  return (
    <>
      {show && (
        <div
          className={`chatbox-container ${expanded ? "expanded" : ""} ${
            innerWidth <= 666 ? "small-screen" : ""
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
              {!currentUser && hasUserJoinedChat && noStrPrivKey && !isCommunity && !revealPrivKey && (
                <>
                  <div className="message-image" onClick={handleMessageSvgClick}>
                    <Tooltip content={_t("chat.new-message")}>
                      <p className="message-svg">{addMessageSVG}</p>
                    </Tooltip>
                  </div>
                </>
              )}
              {hasUserJoinedChat && noStrPrivKey && !revealPrivKey && (
                <div className="message-image" onClick={handleRefreshSvgClick}>
                  <Tooltip content={_t("chat.refresh")}>
                    <p className="message-svg" style={{ paddingTop: "10px" }}>
                      {syncSvg}
                    </p>
                  </Tooltip>
                </div>
              )}
              {isCommunity && (
                <div className="community-menu">
                  <ChatsCommunityDropdownMenu history={props.history} username={communityName} />
                </div>
              )}{" "}
              {!isCommunity && !isCurrentUser && noStrPrivKey && (
                <div className="simple-menu" onClick={() => setExpanded(true)}>
                  <ChatsDropdownMenu
                    history={props.history}
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
          {inProgress && !isCommunity && !isCurrentUser && <LinearProgress />}
          <div
            className={`chat-body ${
              currentUser ? "current-user" : isCommunity ? "community" : ""
            } ${
              !hasUserJoinedChat
                ? "join-chat"
                : clickedMessage || (isTop && hasMore)
                ? "no-scroll"
                : ""
            }`}
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
                          username={communityName}
                          publicMessages={publicMessages}
                          currentChannel={currentChannel!}
                          isScrollToBottom={false}
                          isActveUserRemoved={isActveUserRemoved}
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
                    noStrPrivKey ? (
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
                                    onClick={() =>
                                      communityClicked(channel.communityName!, channel.name)
                                    }
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
                    ) : !noStrPrivKey || noStrPrivKey.length === 0 || noStrPrivKey === null ? (
                      <>
                        <ImportChats />
                      </>
                    ) : showSpinner ? (
                      <div className="no-chat">
                        <Spinner animation="border" variant="primary" />
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
              <ManageChatKey />
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
            {isActveUserRemoved && isCommunity && (
              <p className="d-flex justify-content-center mt-4 mb-0">
                {_t("chat.blocked-user-message")}
              </p>
            )}
          </div>
          {(isCurrentUser || isCommunity) && (
            <ChatInput
              isCurrentUser={isCurrentUser}
              isCommunity={isCommunity}
              isActveUserRemoved={isActveUserRemoved}
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

      {keyDialog && (
        <Modal
          animation={false}
          show={true}
          centered={true}
          onHide={toggleKeyDialog}
          keyboard={false}
          className="chats-dialog modal-thin-header"
          size="lg"
        >
          <Modal.Header closeButton={true} />
          <Modal.Body className="chat-modals-body">
            {step === 9 && confirmationModal(NEWCHATACCOUNT)}
            {step === 11 && confirmationModal(RESENDMESSAGE)}
            {step === 10 && successModal(NEWCHATACCOUNT)}
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};
