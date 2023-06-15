import React, { useEffect, useState } from "react";
import { Button, Form, FormControl, InputGroup, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";
import { DirectContactsType } from "../../store/chat/types";
import { DirectMessage, Keys } from "../../../providers/message-provider-types";

import Tooltip from "../tooltip";
import UserAvatar from "../user-avatar";
import SeachUser from "../search-user";
import { setNostrkeys } from "../../../providers/message-provider";

import {
  addMessageSVG,
  expandArrow,
  collapseArrow,
  arrowBackSvg,
  messageSendSvg,
  chevronUpSvg,
  chevronDownSvgForSlider
} from "../../img/svg";
import { dateToFormatted } from "../../helper/parse-date";
import {
  createNoStrAccount,
  getDirectMessages,
  getProfileMetaData,
  setProfileMetaData
} from "../../helper/chat-utils";
import { _t } from "../../i18n";
import { getAccountFull } from "../../api/hive";

import "./index.scss";
import { RavenEvents } from "../../helper/message-helper";
import { Chat } from "../../store/chat/types";
import { useMappedStore } from "../../store/use-mapped-store";

export interface profileData {
  joiningData: string;
  about: string | undefined;
  followers: number | undefined;
}

interface Props {
  activeUser: ActiveUser | null;
  chat: Chat;
}

export default function ChatBox(props: Props) {
  const chatBodyDivRef = React.createRef<HTMLDivElement>();
  const [expanded, setExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [message, setMessage] = useState("");
  const [isMessageText, setIsMessageText] = useState(false);
  const [accountData, setAccountData] = useState<Account>();
  const [profileData, setProfileData] = useState<profileData>();
  const [isScrollToTop, setIsScrollToTop] = useState(false);
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [hasUserJoinedChat, setHasUserJoinedChat] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [show, setShow] = useState(false);
  const [senderPubKey, setSenderPubKey] = useState("");
  const [receiverPubKey, setReceiverPubKey] = useState("");
  const [messagesList, setMessagesList] = useState<DirectMessage[]>([]);

  const { chat } = useMappedStore();

  useEffect(() => {
    fetchProfileData();
    setShow(!!props.activeUser?.username);
  }, []);

  useEffect(() => {
    const msgsList = getDirectMessages(chat.directMessages, receiverPubKey!);
    setMessagesList(msgsList);
  }, [chat.directMessages]);

  useEffect(() => {
    chatBodyDivRef?.current?.scrollTo(0, isCurrentUser ? chatBodyDivRef.current.scrollHeight : 0);
    console.log(chatBodyDivRef?.current?.scrollHeight, "ref");
  }, [isCurrentUser]);

  // useEffect(() => {
  //   fetchProfileData();
  //   setCurrentUser("");
  //   // setIsCurrentUser(false);
  //   setShow(!!props.activeUser?.username);
  //   // setExpanded(false);
  // }, [props.activeUser]);

  // useEffect(() => {
  //   currentUser ? fetchCurrentUserData() : setMessage("");
  // }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchCurrentUserData();
      const peer = chat.directContacts.find((x) => x.name === currentUser)?.creator ?? null;
      setReceiverPubKey(peer!);
      const msgsList = getDirectMessages(chat.directMessages, peer!);
      setMessagesList(msgsList);
    } else {
      setMessage("");
    }
  }, [currentUser]);

  useEffect(() => {
    chatBodyDivRef?.current?.scrollTo(0, isCurrentUser ? chatBodyDivRef.current.scrollHeight : 0);
  }, [isCurrentUser]);

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

  //Event listening

  // const handleDirectMessage = (data: DirectMessage[]) => {
  //   console.log("handleDirectMessage in chat compoenent", data);
  //   // const append = data.filter((x) => directMessages.find((y) => y.id === x.id) === undefined);
  //   // raven?.loadProfiles(append.map((x) => x.peer));
  //   // setDirectMessages([...directMessages, ...append]);
  // };

  // useEffect(() => {
  //   if (window.raven) {
  //     window.raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
  //     window.raven?.addListener(RavenEvents.DirectMessage, handleDirectMessage);
  //   }

  //   return () => {
  //     if (window.raven) {
  //       window.raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
  //     }
  //   };
  // }, []);

  const fetchCurrentUserData = async () => {
    const response = await getAccountFull(currentUser);
    setProfileData({
      joiningData: response.created,
      about: response.profile?.about,
      followers: response.follow_stats?.follower_count
    });
    const currentUserProfile = await getProfileMetaData(currentUser);
    // console.log(currentUserProfile.noStrKey);
    setReceiverPubKey(currentUserProfile.noStrKey.pub);
  };

  const fetchProfileData = async () => {
    const profileData = await getProfileMetaData(props.activeUser?.username!);
    console.log(profileData, "keys");
    setSenderPubKey(profileData?.noStrKey.pub);
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
  };

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    var element = event.currentTarget;
    let srollHeight: number = (element.scrollHeight / 100) * 25;
    const isScrollToTop = !isCurrentUser && element.scrollTop >= srollHeight;
    const isScrollToBottom =
      isCurrentUser &&
      element.scrollTop <= (element.scrollHeight / 100) * 50 &&
      element.scrollHeight > 700;

    setIsScrollToTop(isScrollToTop);
    setIsScrollToBottom(isScrollToBottom);
  };

  const ScrollerClicked = () => {
    chatBodyDivRef?.current?.scrollTo({
      top: isCurrentUser ? chatBodyDivRef?.current?.scrollHeight : 0,
      behavior: "smooth"
    });
  };

  // const scrollToBottomClicked = () => {
  //   console.log("Scroll to bottom clicked");
  //   chatBodyDivRef?.current?.scrollTo({
  //     top: chatBodyDivRef?.current?.scrollHeight+10,
  //     behavior: "smooth"
  //   });
  // };

  // const scrollToTopClicked = () => {
  //   console.log("Scroll to top clicked");
  //   chatBodyDivRef?.current?.scrollTo({
  //     top: 0,
  //     behavior: "smooth"
  //   });
  // };

  const handleMessageSvgClick = () => {
    setShowSearchUser(true);
  };

  const setSearchUser = (d: boolean) => {
    setShowSearchUser(d);
  };

  const handleJoinChat = () => {
    setInProgress(true);
    const keys = createNoStrAccount();
    setProfileMetaData(props.activeUser, keys);
    setInProgress(false);
    setHasUserJoinedChat(true);
    setNostrkeys(keys);
    // window.raven?.updateProfile({ name: activeUser?.username!, about: "", picture: "" });
  };

  const chatButtonSpinner = (
    <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
  );

  return (
    <>
      {show && (
        <div className={`chatbox-container ${expanded ? "expanded" : ""}`}>
          <div className="chat-header">
            {currentUser && expanded && (
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
                      {profileData?.joiningData && (
                        <div className="user-profile">
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
                              {_t("chat.joined")} {dateToFormatted(profileData!.joiningData, "LL")}
                            </p>
                            <p className="followers">
                              {" "}
                              {formatFollowers(profileData!.followers)} {_t("chat.followers")}
                            </p>
                          </div>
                        </div>
                      )}
                    </Link>
                    <div className="chats">
                      {messagesList.map((msg) => {
                        if (msg.creator !== senderPubKey) {
                          return (
                            <>
                              {/* <div key={msg.username} className="date-time-detail">
                                <p className="date-time">
                                  {msg.date}, {msg.time}
                                </p>
                              </div> */}
                              <div key={msg.id} className="message">
                                <div className="user-img">
                                  <Link to={`/@${currentUser}`}>
                                    <span>
                                      <UserAvatar username={currentUser} size="medium" />
                                    </span>
                                  </Link>
                                </div>
                                <div className="user-info">
                                  <p className="receiver-message-content">{msg.content}</p>
                                </div>
                              </div>
                            </>
                          );
                        } else {
                          return (
                            <div key={msg.id} className="sender">
                              <div className="sender-message">
                                {/* <span className="sender-message-time">{msg.time}</span> */}
                                <p className="sender-message-content">{msg.content}</p>
                              </div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    {chat.directContacts.map((user: DirectContactsType) => {
                      return (
                        <div key={user.creator} className="chat-content">
                          <Link to={`/@${user.name}`}>
                            <div className="user-img">
                              <span>
                                <UserAvatar username={user.name} size="medium" />
                              </span>
                            </div>
                          </Link>

                          <div className="user-title" onClick={() => userClicked(user.name)}>
                            <p className="username">{user.name}</p>
                            {/* <p className="last-message">{user.lastMessage}</p> */}
                          </div>
                        </div>
                      );
                    })}
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
                  onClick={ScrollerClicked}
                >
                  {isCurrentUser ? chevronDownSvgForSlider : chevronUpSvg}
                </div>
              </Tooltip>
            )}
          </div>

          {currentUser && (
            <div className="chat">
              <Form
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sendMessage();
                }}
              >
                <InputGroup className="chat-input-group">
                  <Form.Control
                    as="textarea"
                    value={message}
                    onChange={handleMessage}
                    required={true}
                    type="text"
                    placeholder={_t("chat.start-chat-placeholder")}
                    autoComplete="off"
                    className="chat-input"
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
