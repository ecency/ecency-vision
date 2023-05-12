import React, { useEffect, useState } from "react";
import { Button, Form, FormControl, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";

import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";

import Tooltip from "../tooltip";
import UserAvatar from "../user-avatar";
import SeachUser from "../search-user";

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
}

export default function ChatBox({ activeUser }: Props) {
  const chatBodyDivRef = React.createRef<HTMLDivElement>();
  const [expanded, setExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [message, setMessage] = useState("");
  const [isMessageText, setIsMessageText] = useState(false);
  const [currentUserAccount, setCurrentUserAccount] = useState<Account>();
  const [profileData, setProfileData] = useState<profileData>();
  const [isScrollToTop, setIsScrollToTop] = useState(false);
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchAccountData();
    }
  }, [currentUser]);

  const contentList = [
    {
      username: "good-karma",
      lastMessage: "Hy Hope so you are doing well"
    },
    {
      username: "ecency",
      lastMessage: "Hy"
    },
    {
      username: "demo.com",
      lastMessage: "Whats Up"
    },
    {
      username: "hive-189310",
      lastMessage: "Hello"
    },
    {
      username: "hispapro",
      lastMessage: "Hy Hope so you are doing well"
    },
    {
      username: "galenkp",
      lastMessage: "How are you?"
    },
    {
      username: "deanliu",
      lastMessage: "Bro"
    },
    {
      username: "demo123",
      lastMessage: "What are you doing"
    },
    {
      username: "fastchrisuk",
      lastMessage: "Hy Hope so you are doing well"
    },
    {
      username: "incublus",
      lastMessage: "Hy Hope so you are doing well"
    },
    {
      username: "ipexito",
      lastMessage: "Hello"
    },
    {
      username: "belemo",
      lastMessage: "Hy Hope so you are doing well"
    },
    {
      username: "foodchunk",
      lastMessage: "How are you?"
    },
    {
      username: "macro1997",
      lastMessage: "Bro"
    },
    {
      username: "gelenkp",
      lastMessage: "What are you doing"
    },
    {
      username: "der-prophet",
      lastMessage: "Hy Hope so you are doing well"
    }
  ];

  const messageList = [
    {
      username: "demo.com",
      time: "4.27 pm",
      message: "Hy How are you.",
      date: "4/9/2022"
    },
    {
      username: "mtsaeed",
      time: "4.44 pm",
      message: "I am fine",
      date: "6/9/2022"
    },
    {
      username: "mtsaeed",
      time: "4.44 pm",
      message: "What's about you",
      date: "6/9/2022"
    },
    {
      username: "demo.com",
      time: "4.45 pm",
      message: "Looks good",
      date: "12/9/2022"
    },
    {
      username: "mtsaeed",
      time: "4.46 pm",
      message: "Thanks for asking",
      date: "12/9/2022"
    },
    {
      username: "demo.com",
      time: "4.48 pm",
      message: "What are you doing Nowadays",
      date: "14/9/2022"
    },
    {
      username: "mtsaeed",
      time: "4.49 pm",
      message:
        "He was educated at the Aitchison College and Cathedral School in Lahore, and then the Royal Grammar School Worcester in England, where he excelled at cricket. In 1972, he enrolled in Keble College, Oxford where he studied Philosophy, Politics and Economics, graduating in 1975.",
      date: "24/9/2022"
    },
    {
      username: "demo.com",
      time: "4.50 pm",
      message: "Seems good",
      date: "4/10/2022"
    },
    {
      username: "mtsaeed",
      time: "4.50 pm",
      message: "Excellent",
      date: "4/10/2022"
    },
    {
      username: "mtsaeed",
      time: "4.52 pm",
      message: "Thanks",
      date: "4/11/2022"
    }
  ];

  const fetchAccountData = async () => {
    const response = await getAccountFull(currentUser);
    setCurrentUserAccount(response);
    setProfileData({
      joiningData: response.created,
      about: response.profile?.about,
      followers: response.follow_stats?.follower_count
    });
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
    }
  };

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

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    var element = event.currentTarget;
    let srollHeight: number = (element.scrollHeight / 100) * 25;
    if (!isCurrentUser) {
      if (element.scrollTop >= srollHeight) {
        setIsScrollToTop(true);
        return;
      }
      setIsScrollToTop(false);
    } else {
      if (element.scrollTop <= (element.scrollHeight / 100) * 40 && element.scrollHeight > 700) {
        setIsScrollToBottom(true);
        return;
      }
      setIsScrollToBottom(false);
    }
  };

  const ScrollerClicked = () => {
    chatBodyDivRef?.current?.scrollTo({
      top: isCurrentUser ? chatBodyDivRef?.current?.scrollHeight : 0,
      behavior: "smooth"
    });
  };

  const handleMessageSvgClick = () => {
    setShowSearchUser(true);
  };

  const setSearchUser = (d: boolean) => {
    setShowSearchUser(d);
  };

  return (
    <>
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
            <p className="message-content">{currentUser ? currentUser : _t("chat.messages")}</p>
          </div>
          <div className="actionable-imgs">
            {!currentUser && (
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
          className={`chat-body ${currentUser ? "current-user" : ""}`}
          ref={chatBodyDivRef}
          onScroll={handleScroll}
        >
          {currentUser.length !== 0 ? (
            <>
              <Link to={`/@${currentUser}`}>
                {profileData?.joiningData && (
                  <div className="user-profile">
                    <span className="user-logo">
                      <UserAvatar username={currentUser} size="large" />
                    </span>
                    <h4 className="user-name user-logo ">{currentUser}</h4>
                    {profileData.about && <p className="about user-logo ">{profileData.about}</p>}

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
                {messageList.map((msg) => {
                  if (msg.username !== activeUser?.username) {
                    return (
                      <>
                        <div key={msg.username} className="date-time-detail">
                          <p className="date-time">
                            {msg.date}, {msg.time}
                          </p>
                        </div>
                        <div key={msg.time} className="message">
                          <div className="user-img">
                            <span>
                              <UserAvatar username={msg.username} size="medium" />
                            </span>
                          </div>
                          <div className="user-info">
                            <p className="receiver-message-content">{msg.message}</p>
                          </div>
                        </div>
                      </>
                    );
                  } else {
                    return (
                      <div className="sender">
                        <div className="sender-message">
                          {/* <span className="sender-message-time">{msg.time}</span> */}
                          <p className="sender-message-content">{msg.message}</p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </>
          ) : (
            <>
              {contentList.map((user) => {
                return (
                  <div key={user.username} className="chat-content">
                    <Link to={`/@${user.username}`}>
                      <div className="user-img">
                        <span>
                          <UserAvatar username={user.username} size="medium" />
                        </span>
                      </div>
                    </Link>

                    <div className="user-title" onClick={() => userClicked(user.username)}>
                      <p className="username">{user.username}</p>
                      <p className="last-message">{user.lastMessage}</p>
                    </div>
                  </div>
                );
              })}
            </>
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
      {showSearchUser && (
        <SeachUser
          setSearchUser={setSearchUser}
          setCurrentUserFromSearch={setCurrentUserFromSearch}
        />
      )}
    </>
  );
}
