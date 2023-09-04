import React, { useRef, useState, RefObject, useEffect } from "react";
import mediumZoom, { Zoom } from "medium-zoom";
import {
  Channel,
  communityModerator,
  PublicMessage
} from "../../../providers/message-provider-types";
import {
  formatMessageTime,
  getFormattedDateAndDay,
  getProfileName,
  isMessageGif,
  isMessageImage,
  NostrKeysType
} from "../../helper/chat-utils";
import { History } from "history";
import { renderPostBody } from "@ecency/render-helper";
import { useMappedStore } from "../../store/use-mapped-store";
import {
  Button,
  Form,
  FormControl,
  InputGroup,
  OverlayTrigger,
  Popover,
  Spinner
} from "react-bootstrap";
import UserAvatar from "../user-avatar";
import FollowControls from "../follow-controls";
import { Account } from "../../store/accounts/types";
import { ToggleType, UI } from "../../store/ui/types";
import { Global } from "../../store/global/types";
import { _t } from "../../i18n";
import Tooltip from "../tooltip";
import { failedMessageSvg, hideSvg, resendMessageSvg } from "../../img/svg";

import "./index.scss";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import ChatsConfirmationModal from "../chats-confirmation-modal";
import { error } from "../feedback";
import { CHATPAGE } from "../chat-box/chat-constants";
import { Theme } from "../../store/global/types";

interface Props {
  publicMessages: PublicMessage[];
  currentChannel: Channel;
  activeUserKeys: NostrKeysType;
  username: string;
  global: Global;
  from?: string;
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  history: History | null;
  isScrollToBottom: boolean;
  isScrolled?: boolean;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  scrollToBottom?: () => void;
  currentChannelSetter: (channel: Channel) => void;
  deletePublicMessage: (channelId: string, msgId: string) => void;
}

let zoom: Zoom | null = null;
export default function ChatsChannelMessages(props: Props) {
  const {
    publicMessages,
    currentChannel,
    activeUserKeys,
    activeUser,
    history,
    from,
    isScrollToBottom,
    isScrolled,
    global,
    scrollToBottom,
    currentChannelSetter,
    deletePublicMessage
  } = props;
  const { chat } = useMappedStore();

  const prevPropsRef = useRef(props);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const channelMessagesRef = React.createRef<HTMLDivElement>();

  const [communityAdmins, setCommunityAdmins] = useState<string[]>([]);
  const [hoveredMessageId, setHoveredMessageId] = useState("");
  const [step, setStep] = useState(0);
  const [dmMessage, setDmMessage] = useState("");
  const [clickedMessage, setClickedMessage] = useState("");
  const [removedUserId, setRemovedUserID] = useState("");
  const [privilegedUsers, setPrivilegedUsers] = useState<string[]>([]);
  const [hiddenMsgId, setHiddenMsgId] = useState("");
  const [isActveUserRemoved, setIsActiveUserRemoved] = useState(false);
  const [removedUsers, setRemovedUsers] = useState<string[]>([]);
  const [resendMessage, setResendMessage] = useState<PublicMessage>();

  // useEffect(() => {
  //   scrollToBottom();
  //   console.log("Heloooooooo");
  // }, [publicMessages]);

  useEffect(() => {
    const prevProps = prevPropsRef.current;
    if (prevProps.global.theme !== props.global.theme) {
      setBackground();
    }
    // if (prevProps.activeUser?.username !== props.activeUser?.username) {
    //   setIsCommunity(false);
    //   setIsCurrentUser(false);
    //   setCurrentUser("");
    //   setCommunityName("");
    // }
    prevPropsRef.current = props;
  }, [props.global.theme, props.activeUser]);

  useEffect(() => {
    if (publicMessages.length !== 0) {
      zoomInitializer();
    }
    if (!isScrollToBottom && publicMessages.length !== 0 && !isScrolled) {
      scrollToBottom && scrollToBottom();
    }
  }, [publicMessages, isScrollToBottom, channelMessagesRef]);

  useEffect(() => {
    if (currentChannel) {
      zoomInitializer();
      getPrivilegedUsers(currentChannel?.communityModerators!);
      currentChannel?.removedUserIds && setRemovedUsers(currentChannel.removedUserIds);
    }
  }, [currentChannel]);

  useEffect(() => {
    if (removedUsers) {
      const removed = removedUsers.includes(activeUserKeys?.pub!);
      setIsActiveUserRemoved(removed);
    }
  }, [removedUsers]);

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
      // console.log("Message is send to", name);
      // if (
      //   receiverPubKey &&
      //   !props.chat.directContacts.some((contact) => contact.name === currentUser) &&
      //   isCurrentUser
      // ) {
      //   window.messageService?.publishContacts(currentUser, receiverPubKey);
      // }

      if (from && from === CHATPAGE) {
        history?.push(`/chats/@${name}`);
      }
    }
  };

  const handleDMChange = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    setDmMessage(e.target.value);
  };

  const zoomInitializer = () => {
    const elements: HTMLElement[] = [...document.querySelectorAll<HTMLElement>(".chat-image img")];
    // .filter((x) => x.parentNode?.nodeName !== "A");
    zoom = mediumZoom(elements);
    setBackground();
  };

  const setBackground = () => {
    if (global.theme === Theme.day) {
      zoom?.update({ background: "#ffffff" });
    } else {
      zoom?.update({ background: "#131111" });
    }
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

  const getPrivilegedUsers = (communityModerators: communityModerator[]) => {
    const privilegedRoles = ["owner", "admin", "mod"];
    const communityAdminRoles = ["owner", "admin"];

    const privilegedUsers = communityModerators.filter((user) =>
      privilegedRoles.includes(user.role)
    );
    const communityAdmins = communityModerators.filter((user) =>
      communityAdminRoles.includes(user.role)
    );

    const privilegedUserNames = privilegedUsers.map((user) => user.name);
    const communityAdminNames = communityAdmins.map((user) => user.name);

    setPrivilegedUsers(privilegedUserNames);
    setCommunityAdmins(communityAdminNames);
  };

  const handleConfirm = () => {
    let updatedMetaData = {
      name: currentChannel?.name!,
      about: currentChannel?.about!,
      picture: "",
      communityName: currentChannel?.communityName!,
      communityModerators: currentChannel?.communityModerators,
      hiddenMessageIds: currentChannel?.hiddenMessageIds,
      removedUserIds: currentChannel?.removedUserIds
    };

    switch (step) {
      case 1:
        const updatedHiddenMessages = [...(currentChannel?.hiddenMessageIds || []), hiddenMsgId!];
        updatedMetaData.hiddenMessageIds = updatedHiddenMessages;
        break;
      case 2:
        const updatedRemovedUsers = [...(currentChannel?.removedUserIds || []), removedUserId!];
        updatedMetaData.removedUserIds = updatedRemovedUsers;

        const isRemovedUserModerator = currentChannel?.communityModerators?.find(
          (x) => x.pubkey === removedUserId
        );
        const isModerator = !!isRemovedUserModerator;
        if (isModerator) {
          const NewUpdatedRoles = currentChannel?.communityModerators?.filter(
            (item) => item.pubkey !== removedUserId
          );
          updatedMetaData.communityModerators = NewUpdatedRoles;
        }
        break;
      case 3:
        console.log("Current removed users", currentChannel?.removedUserIds);
        console.log("removedUserId", removedUserId);
        const newUpdatedRemovedUsers =
          currentChannel &&
          currentChannel?.removedUserIds!.filter((item) => item !== removedUserId);

        console.log("newUpdatedRemovedUsers", newUpdatedRemovedUsers);
        updatedMetaData.removedUserIds = newUpdatedRemovedUsers;
        break;
      case 4:
        if (resendMessage) {
          deletePublicMessage(currentChannel.id, resendMessage?.id);
          window?.messageService?.sendPublicMessage(
            currentChannel!,
            resendMessage?.content,
            [],
            ""
          );
        }
        break;
      default:
        break;
    }

    try {
      window.messageService?.updateChannel(currentChannel!, updatedMetaData);
      currentChannelSetter({ ...currentChannel!, ...updatedMetaData });
      setStep(0);
      // if (operationType === HIDEMESSAGE) {
      //   setStep(0);
      //   setKeyDialog(false);
      //   fetchCommunityMessages(
      //     props.chat.publicMessages,
      //     currentChannel!,
      //     currentChannel?.hiddenMessageIds
      //   );
      //   setHiddenMsgId("");
      // }
      // if (operationType === BLOCKUSER || operationType === UNBLOCKUSER) {
      //   setStep(0);
      //   setKeyDialog(false);
      //   setRemovedUserID("");
      // }
    } catch (err) {
      error(_t("chat.error-updating-community"));
    }
  };

  return (
    <>
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
                        className={`d-flex mb-3 ${
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
                                    setStep(3);
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
                                    setStep(2);
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
                {dayAndMonth !== null && (
                  <span className="d-flex justify-content-center align-items-center mt-3 day-and-month">
                    {dayAndMonth}
                  </span>
                )}

                {pMsg.creator !== activeUserKeys?.pub ? (
                  <div
                    key={pMsg.id}
                    className="receiver"
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
                      <div className="receiver-messag">
                        <div
                          className={`receiver-message-content ${isGif ? "gif" : ""} ${
                            isImage ? "chat-image" : ""
                          }`}
                          dangerouslySetInnerHTML={{ __html: renderedPreview }}
                        />
                        {hoveredMessageId === pMsg.id &&
                          privilegedUsers.includes(props.activeUser?.username!) && (
                            <Tooltip content={"Hide Message"}>
                              <div className="hide-msg receiver">
                                <p
                                  className="hide-msg-svg"
                                  onClick={() => {
                                    setClickedMessage("");
                                    setStep(1);
                                    setHiddenMsgId(pMsg.id);
                                  }}
                                >
                                  {hideSvg}
                                </p>
                              </div>
                            </Tooltip>
                          )}
                      </div>
                    </div>
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
                                setStep(1);
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
                              setStep(4);
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
      {step !== 0 && (
        <ChatsConfirmationModal
          onClose={() => {
            setStep(0);
          }}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
