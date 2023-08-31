import React, { useRef, useState, RefObject, useEffect } from "react";
import { Channel, PublicMessage } from "../../../providers/message-provider-types";
import {
  formatMessageTime,
  getFormattedDateAndDay,
  getProfileName,
  isMessageGif,
  isMessageImage,
  NostrKeysType
} from "../../helper/chat-utils";
import { renderPostBody } from "@ecency/render-helper";
import { useMappedStore } from "../../store/use-mapped-store";
import {
  Button,
  Col,
  Form,
  FormControl,
  InputGroup,
  Modal,
  OverlayTrigger,
  Popover,
  Row,
  Spinner
} from "react-bootstrap";
import UserAvatar from "../user-avatar";
import FollowControls from "../follow-controls";
import { Account } from "../../store/accounts/types";
import { ToggleType, UI } from "../../store/ui/types";
import { _t } from "../../i18n";
import Tooltip from "../tooltip";
import { failedMessageSvg, hideSvg, resendMessageSvg } from "../../img/svg";

import "./index.scss";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import ChatInput from "../chat-input";

interface Props {
  publicMessages: PublicMessage[];
  currentChannel: Channel;
  activeUserKeys: NostrKeysType;
  username: string;
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  scrollToBottom: () => void;
}

export default function ChatsChannelMessages(props: Props) {
  const { publicMessages, currentChannel, activeUserKeys, activeUser, scrollToBottom } = props;
  const { global, chat } = useMappedStore();

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const channelMessagesRef = React.createRef<HTMLDivElement>();

  const [communityAdmins, setCommunityAdmins] = useState<string[]>([]);
  const [hoveredMessageId, setHoveredMessageId] = useState("");
  const [dmMessage, setDmMessage] = useState("");
  const [clickedMessage, setClickedMessage] = useState("");
  const [removedUserId, setRemovedUserID] = useState("");
  const [privilegedUsers, setPrivilegedUsers] = useState<string[]>([]);
  const [hiddenMsgId, setHiddenMsgId] = useState("");
  const [isActveUserRemoved, setIsActiveUserRemoved] = useState(false);
  const [resendMessage, setResendMessage] = useState<PublicMessage>();

  // useEffect(() => {
  //   scrollToBottom();
  // }, [publicMessages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedElement = event.target as HTMLElement;

      if (!popoverRef.current) {
        return;
      }

      const isAvatarClicked =
        clickedElement.classList.contains("user-avatar") &&
        clickedElement.classList.contains("medium");
      if (
        popoverRef.current &&
        !popoverRef.current?.contains(event.target as Node) &&
        !isAvatarClicked
      ) {
        setClickedMessage("");
      }
    };

    if (channelMessagesRef.current) {
      channelMessagesRef.current.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      if (channelMessagesRef.current) {
        channelMessagesRef.current.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [clickedMessage]);

  const sendDM = (name: string, pubkey: string) => {
    if (dmMessage) {
      window.messageService?.sendDirectMessage(pubkey, dmMessage);

      // setIsCurrentUser(true);
      // setCurrentUser(name);
      // setIsCommunity(false);
      // setCommunityName("");
      setClickedMessage("");
      setDmMessage("");
    }
  };

  const handleDMChange = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    setDmMessage(e.target.value);
  };

  const handleImageClick = (msgId: string, pubkey: string) => {
    if (clickedMessage === msgId) {
      popoverRef.current = null;
      setClickedMessage("");
    } else {
      popoverRef.current = null;
      setClickedMessage(msgId);
      setRemovedUserID(pubkey);
    }
  };

  return (
    <div className="channel-messages" ref={channelMessagesRef}>
      {publicMessages.length !== 0 &&
        activeUserKeys &&
        publicMessages.map((pMsg, i) => {
          const dayAndMonth = getFormattedDateAndDay(pMsg, i, publicMessages);
          let renderedPreview = renderPostBody(pMsg.content, false, global.canUseWebp);

          renderedPreview = renderedPreview.replace(/<p[^>]*>/g, "");
          renderedPreview = renderedPreview.replace(/<\/p>/g, "");

          const isGif = isMessageGif(pMsg.content);

          const isImage = isMessageImage(pMsg.content);

          const name = getProfileName(pMsg.creator, chat.profiles);

          const popover = (
            <Popover id={`profile-popover`} placement="right" className="profile-popover">
              <Popover.Content>
                <div className="profile-box" ref={popoverRef as RefObject<HTMLDivElement>}>
                  <div className="profile-box-content">
                    <div className="profile-box-logo d-flex justify-content-center">
                      <UserAvatar username={name!} size="large" />
                    </div>

                    <p className="d-flex justify-content-center profile-name">{`@${name!}`}</p>
                    <div
                      className={`d-flex ${
                        communityAdmins.includes(activeUser?.username!)
                          ? "justify-content-between"
                          : "justify-content-center"
                      }  profile-box-buttons`}
                    >
                      <FollowControls {...props} targetUsername={name!} where={"chat-box"} />

                      {communityAdmins.includes(activeUser?.username!) && (
                        <>
                          {currentChannel?.removedUserIds?.includes(pMsg.creator) ? (
                            <>
                              <Button
                                variant="primary"
                                onClick={() => {
                                  // setKeyDialog(true);
                                  // setStep(7);
                                  setClickedMessage("");
                                }}
                              >
                                {_t("chat.unblock")}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="primary"
                                onClick={() => {
                                  // setKeyDialog(true);
                                  // setStep(6);
                                  setClickedMessage("");
                                }}
                              >
                                {_t("chat.block")}
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    <Form
                      onSubmit={(e: React.FormEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        sendDM(name!, pMsg.creator);
                      }}
                    >
                      <InputGroup className="dm-input-group">
                        <Form.Control
                          value={dmMessage}
                          autoFocus={true}
                          onChange={handleDMChange}
                          required={true}
                          type="text"
                          placeholder={"Send direct message"}
                          autoComplete="off"
                          className="dm-chat-input"
                        />
                      </InputGroup>
                    </Form>
                  </div>
                </div>
              </Popover.Content>
            </Popover>
          );

          return (
            <React.Fragment key={pMsg.id}>
              <span className="d-flex justify-content-center align-items-center day-and-month mt-3">
                {dayAndMonth}
              </span>

              {pMsg.creator !== activeUserKeys?.pub ? (
                <div
                  key={pMsg.id}
                  className="message"
                  onMouseEnter={() => setHoveredMessageId(pMsg.id)}
                  onMouseLeave={() => setHoveredMessageId("")}
                >
                  <div className="community-user-img">
                    <OverlayTrigger
                      trigger="click"
                      placement="right"
                      show={clickedMessage === pMsg.id}
                      overlay={popover}
                      delay={1000}
                      onToggle={() => handleImageClick(pMsg.id, pMsg.creator)}
                    >
                      <span>
                        <UserAvatar username={name!} size="medium" />
                      </span>
                    </OverlayTrigger>
                  </div>

                  <div className="user-info">
                    <p className="user-msg-time">
                      <span className="username-community">{name}</span>
                      {formatMessageTime(pMsg.created)}
                    </p>
                    <div
                      className={`receiver-message-content ${isGif ? "gif" : ""} ${
                        isImage ? "chat-image" : ""
                      }`}
                      dangerouslySetInnerHTML={{ __html: renderedPreview }}
                    />
                  </div>
                  {hoveredMessageId === pMsg.id &&
                    privilegedUsers.includes(props.activeUser?.username!) && (
                      <Tooltip content={"Hide Message"}>
                        <div className="hide-msg receiver">
                          <p
                            className="hide-msg-svg"
                            onClick={() => {
                              setClickedMessage("");
                              // setKeyDialog(true);
                              // setStep(5);
                              setHiddenMsgId(pMsg.id);
                            }}
                          >
                            {hideSvg}
                          </p>
                        </div>
                      </Tooltip>
                    )}
                </div>
              ) : (
                <div
                  key={pMsg.id}
                  className="sender"
                  onMouseEnter={() => setHoveredMessageId(pMsg.id)}
                  onMouseLeave={() => setHoveredMessageId("")}
                >
                  <p className="sender-message-time">{formatMessageTime(pMsg.created)}</p>
                  <div
                    className={`sender-message ${
                      pMsg.sent === 2 ? "failed" : pMsg.sent === 0 ? "sending" : ""
                    }`}
                  >
                    {hoveredMessageId === pMsg.id && !isActveUserRemoved && (
                      <Tooltip content={"Hide Message"}>
                        <div className="hide-msg">
                          <p
                            className="hide-msg-svg"
                            onClick={() => {
                              setClickedMessage("");
                              // setKeyDialog(true);
                              // setStep(5);
                              setHiddenMsgId(pMsg.id);
                            }}
                          >
                            {hideSvg}
                          </p>
                        </div>
                      </Tooltip>
                    )}
                    {pMsg.sent === 2 && (
                      <Tooltip content={"Resend"}>
                        <span
                          className="resend-svg"
                          onClick={() => {
                            // setKeyDialog(true);
                            // setStep(11);
                            setResendMessage(pMsg);
                          }}
                        >
                          {resendMessageSvg}
                        </span>
                      </Tooltip>
                    )}
                    <div
                      className={`sender-message-content ${isGif ? "gif" : ""} ${
                        isImage ? "chat-image" : ""
                      }`}
                      dangerouslySetInnerHTML={{ __html: renderedPreview }}
                    />
                    {pMsg.sent === 0 && (
                      <span style={{ margin: "10px 0 0 5px" }}>
                        <Spinner animation="border" variant="primary" size="sm" />
                      </span>
                    )}
                    {pMsg.sent === 2 && (
                      <Tooltip content={"Failed"}>
                        <span className="failed-svg">{failedMessageSvg}</span>
                      </Tooltip>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
    </div>
  );
}
