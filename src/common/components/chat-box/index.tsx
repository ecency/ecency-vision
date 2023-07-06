import React, { useEffect, useState } from "react";
import { Button, Form, FormControl, InputGroup, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

import { ActiveUser } from "../../store/active-user/types";
import { Chat, DirectContactsType } from "../../store/chat/types";
import { DirectMessage } from "../../../providers/message-provider-types";

import Tooltip from "../tooltip";
import UserAvatar from "../user-avatar";
import SeachUser from "../search-user";
import LinearProgress from "../linear-progress";
import EmojiPicker from "../emoji-picker";
import ClickAwayListener from "../clickaway-listener";
import { setNostrkeys } from "../../../providers/message-provider";

import {
  addMessageSVG,
  expandArrow,
  collapseArrow,
  arrowBackSvg,
  messageSendSvg,
  chevronUpSvg,
  chevronDownSvgForSlider,
  emoticonHappyOutlineSvg
} from "../../img/svg";
import { dateToFormatted } from "../../helper/parse-date";
import {
  createNoStrAccount,
  formatMessageDate,
  formatMessageTime,
  getDirectMessages,
  getProfileMetaData,
  NostrKeys,
  setProfileMetaData,
  resetProfile
} from "../../helper/chat-utils";
import { _t } from "../../i18n";
import { getAccountFull } from "../../api/hive";

import "./index.scss";

export interface profileData {
  joiningData: string;
  about: string | undefined;
  followers: number | undefined;
}

interface Props {
  activeUser: ActiveUser | null;
  chat: Chat;
  resetChat: () => void;
}

export default function ChatBox(props: Props) {
  const chatBodyDivRef = React.createRef<HTMLDivElement>();
  const [expanded, setExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [message, setMessage] = useState("");
  const [isMessageText, setIsMessageText] = useState(false);
  const [profileData, setProfileData] = useState<profileData>();
  const [isScrollToTop, setIsScrollToTop] = useState(false);
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [hasUserJoinedChat, setHasUserJoinedChat] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [show, setShow] = useState(false);
  const [activeUserKeys, setActiveUserKeys] = useState<NostrKeys>();
  const [receiverPubKey, setReceiverPubKey] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [messagesList, setMessagesList] = useState<DirectMessage[]>([]);
  const [isUserFromSearch, setIsUserFromSearch] = useState(false);
  const [isCurrentUserJoined, setIsCurrentUserJoined] = useState(true);

  useEffect(() => {
    // resetProfile(props.activeUser);
    fetchProfileData();
    setShow(!!props.activeUser?.username);
  }, []);

  useEffect(() => {
    const msgsList = fetchMessages(receiverPubKey!);
    const messages = msgsList.sort((a, b) => a.created - b.created);
    setMessagesList(messages);
  }, [props.chat.directMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messagesList]);

  useEffect(() => {
    if (isCurrentUser) {
      scrollToBottom();
    }
  }, [isCurrentUser]);

  useEffect(() => {
    fetchProfileData();
    setShow(!!props.activeUser?.username);
    const msgsList = fetchMessages(receiverPubKey!);
    const messages = msgsList.sort((a, b) => a.created - b.created);
    setMessagesList(messages);
  }, [props.activeUser]);

  useEffect(() => {
    if (currentUser) {
      const isCurrentUserFound = props.chat.directContacts.some(
        (contact) => contact.name === currentUser
      );
      if (isCurrentUserFound) {
        fetchCurrentUserData();
      } else {
        setShowSpinner(true);
        fetchCurrentUserData();
      }

      const peer = props.chat.directContacts.find((x) => x.name === currentUser)?.pubkey ?? null;
      setReceiverPubKey(peer!);
      const msgsList = fetchMessages(peer!);
      const messages = msgsList.sort((a, b) => a.created - b.created);
      setMessagesList(messages);
      if (!window.raven) {
        setNostrkeys(activeUserKeys!);
      }
    } else {
      setIsCurrentUserJoined(true);
      setMessage("");
      setShowSpinner(false);
    }
  }, [currentUser]);

  const formatFollowers = (count: number | undefined) => {
    if (count) {
      return count >= 1e6
        ? (count / 1e6).toLocaleString() + "M"
        : count >= 1e3
        ? (count / 1e3).toLocaleString() + "K"
        : count.toLocaleString();
    }
    return count;
  };

  const fetchMessages = (peer: string) => {
    for (const item of props.chat.directMessages) {
      if (item.peer === peer) {
        return item.chat;
      }
    }
    return [];
  };

  const fetchCurrentUserData = async () => {
    const response = await getAccountFull(currentUser);
    setProfileData({
      joiningData: response.created,
      about: response.profile?.about,
      followers: response.follow_stats?.follower_count
    });
    const { posting_json_metadata } = response;
    const profile = JSON.parse(posting_json_metadata!).profile;
    const { noStrKey } = profile || {};
    setReceiverPubKey(noStrKey?.pub);
    setIsCurrentUserJoined(!!noStrKey?.pub);
    setShowSpinner(false);
  };

  const fetchProfileData = async () => {
    const profileData = await getProfileMetaData(props.activeUser?.username!);
    setActiveUserKeys(profileData?.noStrKey);
    const hasNoStrKey = "noStrKey" in profileData;
    setHasUserJoinedChat(hasNoStrKey);
    setShow(!!props.activeUser?.username);
  };

  const userClicked = (username: string) => {
    setIsCurrentUser(true);
    setCurrentUser(username);
  };

  const setCurrentUserFromSearch = (username: string) => {
    setCurrentUser(username);
    setExpanded(true);
    setIsCurrentUser(true);
    setIsUserFromSearch(true);
  };

  const handleMessage = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsMessageText(e.target.value.length !== 0);
  };

  const sendMessage = () => {
    if (message.length !== 0) {
      setMessage("");
      setIsMessageText(false);
      window.raven?.sendDirectMessage(receiverPubKey, message);
    }
    if (isUserFromSearch && receiverPubKey) {
      window.raven?.publishContacts(currentUser, receiverPubKey);
      setIsUserFromSearch(false);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    var element = event.currentTarget;
    let srollHeight: number = (element.scrollHeight / 100) * 25;
    const isScrollToTop = !isCurrentUser && element.scrollTop >= srollHeight;
    const isScrollToBottom =
      isCurrentUser &&
      element.scrollTop + chatBodyDivRef?.current?.clientHeight! < element.scrollHeight;
    setIsScrollToTop(isScrollToTop);
    setIsScrollToBottom(isScrollToBottom);
  };

  const scrollerClicked = () => {
    chatBodyDivRef?.current?.scrollTo({
      top: isCurrentUser ? chatBodyDivRef?.current?.scrollHeight : 0
    });
  };

  const scrollToBottom = () => {
    chatBodyDivRef?.current?.scrollTo({
      top: chatBodyDivRef?.current?.scrollHeight
    });
  };

  const handleMessageSvgClick = () => {
    setShowSearchUser(true);
  };

  const setSearchUser = (d: boolean) => {
    setShowSearchUser(d);
  };

  const handleJoinChat = async () => {
    const { resetChat } = props;
    setInProgress(true);
    resetChat();
    const keys = createNoStrAccount();
    await setProfileMetaData(props.activeUser, keys);
    setHasUserJoinedChat(true);
    setNostrkeys(keys);
    window.raven?.updateProfile({ name: props.activeUser?.username!, about: "", picture: "" });
    setActiveUserKeys(keys);
    setInProgress(false);
  };

  const chatButtonSpinner = (
    <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
  );

  const getFormattedDateAndDay = (msg: DirectMessage, i: number) => {
    const prevMsg = messagesList[i - 1];
    const msgDate = formatMessageDate(msg.created);
    const prevMsgDate = prevMsg ? formatMessageDate(prevMsg.created) : null;
    if (msgDate !== prevMsgDate) {
      return (
        <div className="custom-divider">
          <span className="custom-divider-text">{msgDate}</span>
        </div>
      );
    }
    return <></>;
  };

  const handleEmojiSelection = (emoji: string) => {
    setMessage((prevMessage) => prevMessage + emoji);
  };

  const getLastMessage = (pubkey: string) => {
    const msgsList = fetchMessages(pubkey!);
    const messages = msgsList.sort((a, b) => a.created - b.created);
    const lastMessage = messages.slice(-1);
    return lastMessage[0]?.content;
  };

  return (
    <>
      {show && (
        <div className={`chatbox-container ${expanded ? "expanded" : ""}`}>
          <div className="chat-header">
            {currentUser && expanded && (
              <Tooltip content={_t("chat.back")}>
                <div className="back-arrow-image">
                  <span
                    className="back-arrow-svg"
                    onClick={() => {
                      setCurrentUser("");
                      setIsCurrentUser(false);
                    }}
                  >
                    {" "}
                    {arrowBackSvg}
                  </span>
                </div>
              </Tooltip>
            )}
            <div className="message-title" onClick={() => setExpanded(!expanded)}>
              {currentUser && (
                <p className="user-icon">
                  <UserAvatar username={currentUser} size="small" />
                </p>
              )}

              <p className="message-content">{currentUser ? currentUser : _t("chat.messages")}</p>
            </div>
            <div className="actionable-imgs">
              {!currentUser && hasUserJoinedChat && (
                <div className="message-image" onClick={handleMessageSvgClick}>
                  <Tooltip content={_t("chat.new-message")}>
                    <p className="message-svg">{addMessageSVG}</p>
                  </Tooltip>
                </div>
              )}
              <div className="arrow-image">
                <Tooltip content={expanded ? _t("chat.collapse") : _t("chat.expand")}>
                  <p className="arrow-svg" onClick={() => setExpanded(!expanded)}>
                    {expanded ? expandArrow : collapseArrow}
                  </p>
                </Tooltip>
              </div>
            </div>
          </div>

          <div
            className={`chat-body ${currentUser ? "current-user" : ""} ${
              !hasUserJoinedChat ? "join-chat" : ""
            }`}
            ref={chatBodyDivRef}
            onScroll={handleScroll}
          >
            {hasUserJoinedChat ? (
              <>
                {currentUser.length !== 0 ? (
                  <>
                    <Link to={`/@${currentUser}`}>
                      <div className="user-profile">
                        {profileData?.joiningData && (
                          <div className="user-profile-data">
                            <span className="user-logo">
                              <UserAvatar username={currentUser} size="large" />
                            </span>
                            <h4 className="user-name user-logo ">{currentUser}</h4>
                            {profileData.about && (
                              <p className="about user-logo ">{profileData.about}</p>
                            )}

                            <div className="created-date user-logo joining-info">
                              <p>
                                {" "}
                                {_t("chat.joined")}{" "}
                                {dateToFormatted(profileData!.joiningData, "LL")}
                              </p>
                              <p className="followers">
                                {" "}
                                {formatFollowers(profileData!.followers)} {_t("chat.followers")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="chats">
                      {!isCurrentUserJoined ? (
                        <p className="not-joined">{_t("chat.not-joined")}</p>
                      ) : (
                        <>
                          {messagesList.map((msg, i) => {
                            const dayAndMonth = getFormattedDateAndDay(msg, i);

                            return (
                              <React.Fragment key={msg.id}>
                                {dayAndMonth}
                                {msg.creator !== activeUserKeys?.pub ? (
                                  <div key={msg.id} className="message">
                                    <div className="user-img">
                                      <Link to={`/@${currentUser}`}>
                                        <span>
                                          <UserAvatar username={currentUser} size="medium" />
                                        </span>
                                      </Link>
                                    </div>
                                    <div className="user-info">
                                      <p className="user-msg-time">
                                        {formatMessageTime(msg.created)}
                                      </p>
                                      <p className="receiver-message-content">{msg.content}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div key={msg.id} className="sender">
                                    <p className="sender-message-time">
                                      {formatMessageTime(msg.created)}
                                    </p>
                                    <div className="sender-message">
                                      <p className="sender-message-content">{msg.content}</p>
                                    </div>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {props.chat.directContacts.length !== 0 ? (
                      <React.Fragment>
                        {props.chat.directContacts.map((user: DirectContactsType) => {
                          return (
                            <div key={user.pubkey} className="chat-content">
                              <Link to={`/@${user.name}`}>
                                <div className="user-img">
                                  <span>
                                    <UserAvatar username={user.name} size="medium" />
                                  </span>
                                </div>
                              </Link>

                              <div className="user-title" onClick={() => userClicked(user.name)}>
                                <p className="username">{user.name}</p>
                                <p className="last-message">{getLastMessage(user.pubkey)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <p className="no-chat">{_t("chat.no-chat")}</p>
                        <div className="start-chat-btn">
                          <Button variant="primary" onClick={() => setShowSearchUser(true)}>
                            {_t("chat.start-chat")}
                          </Button>
                        </div>
                      </React.Fragment>
                    )}
                  </>
                )}
              </>
            ) : (
              <Button className="join-chat-btn" onClick={handleJoinChat}>
                {inProgress && chatButtonSpinner}
                {_t("chat.join-chat")}
              </Button>
            )}

            {((isScrollToTop && !isCurrentUser) || (isCurrentUser && isScrollToBottom)) && (
              <Tooltip
                content={isScrollToTop ? _t("scroll-to-top.title") : _t("chat.scroll-to-bottom")}
              >
                <div
                  className="scroller"
                  style={{ bottom: isCurrentUser && isScrollToBottom ? "20px" : "55px" }}
                  onClick={scrollerClicked}
                >
                  {isCurrentUser ? chevronDownSvgForSlider : chevronUpSvg}
                </div>
              </Tooltip>
            )}
          </div>
          {showSpinner && <LinearProgress />}
          {currentUser && (
            <div className="chat">
              <div className="chatbox-emoji-picker">
                <div className="chatbox-emoji">
                  <Tooltip content={_t("editor-toolbar.emoji")}>
                    <div className="emoji-icon">{emoticonHappyOutlineSvg}</div>
                  </Tooltip>
                  <EmojiPicker
                    style={{
                      top: "255px",
                      left: "0px",
                      marginLeft: "14px",
                      borderTopLeftRadius: "8px",
                      borderTopRightRadius: "8px",
                      borderBottomLeftRadius: "0px"
                    }}
                    fallback={(e) => {
                      handleEmojiSelection(e);
                    }}
                  />
                </div>
              </div>

              <Form
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sendMessage();
                }}
                style={{ width: "100%" }}
              >
                <InputGroup className="chat-input-group">
                  <Form.Control
                    value={message}
                    onChange={handleMessage}
                    required={true}
                    type="text"
                    placeholder={_t("chat.start-chat-placeholder")}
                    autoComplete="off"
                    className="chat-input"
                    style={{ maxWidth: "100%", overflowWrap: "break-word" }}
                    disabled={
                      showSpinner || receiverPubKey === null || receiverPubKey === undefined
                    }
                  />
                  <InputGroup.Append
                    className={`msg-svg ${isMessageText ? "active" : ""}`}
                    onClick={sendMessage}
                  >
                    {messageSendSvg}
                  </InputGroup.Append>
                </InputGroup>
              </Form>
            </div>
          )}
        </div>
      )}

      {showSearchUser && (
        <SeachUser
          setSearchUser={setSearchUser}
          setCurrentUserFromSearch={setCurrentUserFromSearch}
        />
      )}
    </>
  );
}
