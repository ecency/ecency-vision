import React, { useEffect, useRef, useState } from "react";
import useDebounce from "react-use/lib/useDebounce";
import { useLocation } from "react-router";
import { History } from "history";
import { Button, Form, InputGroup, Modal, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

import { ActiveUser } from "../../../store/active-user/types";
import { Chat, DirectContactsType } from "../../../store/chat/types";
import { Community } from "../../../store/communities/types";
import { Global } from "../../../store/global/types";
import { User } from "../../../store/users/types";
import { ToggleType, UI } from "../../../store/ui/types";
import { Account } from "../../../store/accounts/types";
import {
  Channel,
  ChannelUpdate,
  DirectMessage,
  PublicMessage
} from "../../../../providers/message-provider-types";

import Tooltip from "../../tooltip";
import UserAvatar from "../../user-avatar";
import LinearProgress from "../../linear-progress";
import { error, success } from "../../feedback";
import { setNostrkeys } from "../../../../providers/message-provider";
import OrDivider from "../../or-divider";
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
  keySvg,
  syncSvg
} from "../../../img/svg";

import {
  NOSTRKEY,
  HIDEMESSAGE,
  BLOCKUSER,
  UNBLOCKUSER,
  NEWCHATACCOUNT,
  CHATIMPORT,
  RESENDMESSAGE,
  EmojiPickerStyle,
  GifPickerStyle
} from "./chat-constants";

import { getPublicKey } from "../../../../lib/nostr-tools/keys";
import * as ls from "../../../util/local-storage";
import accountReputation from "../../../helper/account-reputation";
import { _t } from "../../../i18n";

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
  setProfileMetaData
} from "../utils";
import { useMappedStore } from "../../../store/use-mapped-store";

interface Props {
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  targetUsername: string;
  where?: string;
  history: History;
  global: Global;
  chat: Chat;
  resetChat: () => void;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  deletePublicMessage: (channelId: string, msgId: string) => void;
  deleteDirectMessage: (peer: string, msgId: string) => void;
}

export default function ChatPopUp(props: Props) {
  const routerLocation = useLocation();
  const prevPropsRef = useRef(props);
  const chatBodyDivRef = useRef<HTMLDivElement | null>(null);

  const { activeUser } = useMappedStore();

  const [expanded, setExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isScrollToTop, setIsScrollToTop] = useState(false);
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [hasUserJoinedChat, setHasUserJoinedChat] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [show, setShow] = useState(false);
  const [activeUserKeys, setActiveUserKeys] = useState<NostrKeysType>();
  const [receiverPubKey, setReceiverPubKey] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [directMessagesList, setDirectMessagesList] = useState<DirectMessage[]>([]);
  const [isCurrentUserJoined, setIsCurrentUserJoined] = useState(true);
  const [isCommunity, setIsCommunity] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [currentCommunity, setCurrentCommunity] = useState<Community>();
  const [currentChannel, setCurrentChannel] = useState<Channel>();
  const [publicMessages, setPublicMessages] = useState<PublicMessage[]>([]);
  const [clickedMessage, setClickedMessage] = useState("");
  const [keyDialog, setKeyDialog] = useState(false);
  const [step, setStep] = useState(0);
  const [communities, setCommunities] = useState<Channel[]>([]);
  const [searchtext, setSearchText] = useState("");
  const [userList, setUserList] = useState<AccountWithReputation[]>([]);
  const [addRoleError, setAddRoleError] = useState("");
  const [noStrPrivKey, setNoStrPrivKey] = useState("");
  const [chatPrivKey, setChatPrivkey] = useState("");
  const [hiddenMsgId, setHiddenMsgId] = useState("");
  const [removedUserId, setRemovedUserID] = useState("");
  const [isActveUserRemoved, setIsActiveUserRemoved] = useState(false);
  const [isTop, setIsTop] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [removedUsers, setRemovedUsers] = useState<string[]>([]);
  const [importPrivKey, setImportPrivKey] = useState(false);
  const [revelPrivateKey, setRevealPrivateKey] = useState(false);
  const [innerWidth, setInnerWidth] = useState(0);
  const [isChatPage, setIsChatPage] = useState(false);
  const [refreshChat, setRefreshChat] = useState(false);

  useEffect(() => {
    console.log("Chat in store", props.chat);
  }, [props.chat]);

  useEffect(() => {
    if (currentChannel && props.chat.leftChannelsList.includes(currentChannel.id)) {
      setIsCommunity(false);
      setCommunityName("");
    }
  }, [props.chat.leftChannelsList]);

  useEffect(() => {
    handleRouterChange();
  }, [routerLocation]);

  useEffect(() => {
    if (isChatPage) {
      setShow(false);
    }
  }, [isChatPage]);

  useEffect(() => {
    // resetProfile(props.activeUser);
    fetchProfileData();
    !isChatPage && setShow(!!props.activeUser?.username);
    const noStrPrivKey = getPrivateKey(props.activeUser?.username!);
    setNoStrPrivKey(noStrPrivKey);
    setInnerWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    const updated: ChannelUpdate = props.chat.updatedChannel
      .filter((x) => x.channelId === currentChannel?.id!)
      .sort((a, b) => b.created - a.created)[0];
    if (currentChannel && updated) {
      const publicMessages: PublicMessage[] = fetchCommunityMessages(
        props.chat.publicMessages,
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
  }, [props.chat.updatedChannel]);

  useEffect(() => {
    if (isTop) {
      fetchPrevMessages();
    }
  }, [isTop]);

  useEffect(() => {
    if (window.messageService) {
      setHasUserJoinedChat(true);
      const noStrPrivKey = getPrivateKey(props.activeUser?.username!);
      setNoStrPrivKey(noStrPrivKey);
    }
    setTimeout(() => {
      if (props.chat.channels.length === 0 && props.chat.directContacts.length === 0) {
        setRefreshChat(false);
      }
    }, 5000);
  }, [typeof window !== "undefined" && window?.messageService]);

  useEffect(() => {
    const communities = getJoinedCommunities(props.chat.channels, props.chat.leftChannelsList);
    setCommunities(communities);
    fetchProfileData();
  }, [props.chat.channels, props.chat.leftChannelsList]);

  useEffect(() => {
    const msgsList = fetchDirectMessages(receiverPubKey!);
    const messages = msgsList.sort((a, b) => a.created - b.created);
    setDirectMessagesList(messages);
  }, [props.chat.directMessages]);

  useEffect(() => {
    const prevProps = prevPropsRef.current;

    if (prevProps.activeUser?.username !== props.activeUser?.username) {
      setIsCommunity(false);
      setIsCurrentUser(false);
      setCurrentUser("");
      setCommunityName("");
    }
    prevPropsRef.current = props;
  }, [props.global.theme, props.activeUser]);

  useEffect(() => {
    if (directMessagesList.length !== 0 || publicMessages.length !== 0) {
      // zoomInitializer();
    }
    if (directMessagesList.length !== 0) {
      scrollerClicked();
    }
    if (!isScrollToBottom && publicMessages.length !== 0 && isCommunity) {
      scrollerClicked();
    }
  }, [directMessagesList, publicMessages]);

  useEffect(() => {
    if (currentChannel && isCommunity) {
      window?.messageService?.fetchChannel(currentChannel.id);
      const publicMessages: PublicMessage[] = fetchCommunityMessages(
        props.chat.publicMessages,
        currentChannel,
        currentChannel.hiddenMessageIds
      );
      currentChannel?.removedUserIds && setRemovedUsers(currentChannel.removedUserIds);
      const messages = publicMessages.sort((a, b) => a.created - b.created);
      setPublicMessages(messages);
    }
  }, [currentChannel, isCommunity, props.chat.publicMessages]);

  useEffect(() => {
    if (isCurrentUser) {
      // zoomInitializer();
      scrollerClicked();
    } else {
      scrollerClicked();
    }
  }, [isCurrentUser]);

  useEffect(() => {
    if (removedUsers) {
      const removed = removedUsers.includes(activeUserKeys?.pub!);
      setIsActiveUserRemoved(removed);
    }
  }, [removedUsers]);

  useEffect(() => {
    fetchProfileData();
    const msgsList = fetchDirectMessages(receiverPubKey!);
    const messages = msgsList.sort((a, b) => a.created - b.created);
    setDirectMessagesList(messages);
    const noStrPrivKey = getPrivateKey(props.activeUser?.username!);
    setNoStrPrivKey(noStrPrivKey);
  }, [props.activeUser]);

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
      const isCurrentUserFound = props.chat.directContacts.some(
        (contact) => contact.name === currentUser
      );
      if (isCurrentUserFound) {
        fetchCurrentUserData();
      } else {
        setInProgress(true);
        fetchCurrentUserData();
      }

      const peer = props.chat.directContacts.find((x) => x.name === currentUser)?.pubkey ?? "";
      const msgsList = fetchDirectMessages(peer!);
      const messages = msgsList.sort((a, b) => a.created - b.created);
      setDirectMessagesList(messages);
      if (!window.messageService) {
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
    const community = await getCommunity(communityName, props.activeUser?.username);
    setCurrentCommunity(community!);
  };

  const fetchCurrentChannel = (communityName: string) => {
    const channel = props.chat.channels.find((channel) => channel.communityName === communityName);
    if (channel) {
      const updated: ChannelUpdate = props.chat.updatedChannel
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
    for (const item of props.chat.directMessages) {
      if (item.peer === peer) {
        return Object.values(item.chat);
      }
    }
    return [];
  };

  const fetchCurrentUserData = async () => {
    const response = await getAccountFull(currentUser);
    const { posting_json_metadata } = response;
    const profile = JSON.parse(posting_json_metadata!).profile;
    const { nsKey } = profile || {};
    setReceiverPubKey(nsKey);
    setIsCurrentUserJoined(!!nsKey);
    setInProgress(false);
  };

  const fetchProfileData = async () => {
    const profileData = await getProfileMetaData(props.activeUser?.username!);
    const noStrPrivKey = getPrivateKey(props.activeUser?.username!);
    const activeUserKeys = {
      pub: profileData?.nsKey,
      priv: noStrPrivKey
    };
    setActiveUserKeys(activeUserKeys);
    const hasNoStrKey = profileData && profileData.hasOwnProperty(NOSTRKEY);
    setHasUserJoinedChat(hasNoStrKey);
  };

  const userClicked = (username: string) => {
    setIsCurrentUser(true);
    setCurrentUser(username);
  };

  const fetchPrevMessages = () => {
    if (!hasMore || inProgress) return;

    setInProgress(true);
    window.messageService
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
  };

  const handleRefreshSvgClick = () => {
    const { resetChat } = props;
    resetChat();
    handleBackArrowSvg();
    if (getPrivateKey(props.activeUser?.username!)) {
      setRefreshChat(true);
      const keys = {
        pub: activeUserKeys?.pub!,
        priv: getPrivateKey(props.activeUser?.username!)
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
    const { resetChat } = props;
    setShowSpinner(true);
    resetChat();
    const keys = createNoStrAccount();
    ls.set(`${props.activeUser?.username}_nsPrivKey`, keys.priv);
    setNoStrPrivKey(keys.priv);
    await setProfileMetaData(props.activeUser, keys.pub);
    setHasUserJoinedChat(true);
    setNostrkeys(keys);
    window.messageService?.updateProfile({
      name: props.activeUser?.username!,
      about: "",
      picture: ""
    });
    setActiveUserKeys(keys);
    setShowSpinner(false);
  };

  const chatButtonSpinner = (
    <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
  );

  const communityClicked = (community: string, name: string) => {
    setIsCommunity(true);
    setCommunityName(community);
  };

  const copyToClipboard = (content: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = content;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    success(`${isCommunity ? "Link" : "Key"} copied into clipboard`);
  };

  const handleImportChatSubmit = () => {
    try {
      const pubKey = getPublicKey(chatPrivKey);
      if (pubKey === activeUserKeys?.pub) {
        setNoStrPrivKey(chatPrivKey);
        ls.set(`${props.activeUser?.username}_nsPrivKey`, chatPrivKey);
        const keys = {
          pub: activeUserKeys?.pub!,
          priv: chatPrivKey
        };
        setNostrkeys(keys);
        setStep(4);
        setChatPrivkey("");
        setImportPrivKey(false);
      } else {
        setImportPrivKey(true);
        setAddRoleError("Invalid Private key");
      }
    } catch (error) {
      setImportPrivKey(true);
      setAddRoleError("Invalid Private key");
    }
  };

  const finish = () => {
    setStep(0);
    setKeyDialog(false);
  };

  const handleConfirmButton = (actionType: string) => {
    switch (actionType) {
      case NEWCHATACCOUNT:
        setInProgress(true);
        deleteChatPublicKey(props.activeUser)
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

  const handleChannelUpdate = (operationType: string) => {
    let updatedMetaData = {
      name: currentChannel?.name!,
      about: currentChannel?.about!,
      picture: "",
      communityName: currentChannel?.communityName!,
      communityModerators: currentChannel?.communityModerators,
      hiddenMessageIds: currentChannel?.hiddenMessageIds,
      removedUserIds: currentChannel?.removedUserIds
    };

    switch (operationType) {
      case HIDEMESSAGE:
        const updatedHiddenMessages = [...(currentChannel?.hiddenMessageIds || []), hiddenMsgId!];
        updatedMetaData.hiddenMessageIds = updatedHiddenMessages;
        break;
      case BLOCKUSER:
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
      default:
        break;
    }

    try {
      window.messageService?.updateChannel(currentChannel!, updatedMetaData);
      setCurrentChannel({ ...currentChannel!, ...updatedMetaData });
      if (operationType === HIDEMESSAGE) {
        setStep(0);
        setKeyDialog(false);
        fetchCommunityMessages(
          props.chat.publicMessages,
          currentChannel!,
          currentChannel?.hiddenMessageIds
        );
        setHiddenMsgId("");
      }
      if (operationType === BLOCKUSER || operationType === UNBLOCKUSER) {
        setStep(0);
        setKeyDialog(false);
        setRemovedUserID("");
      }
    } catch (err) {
      error(_t("chat.error-updating-community"));
    }
  };

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
    setAddRoleError("");
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
    setRevealPrivateKey(false);
    setAddRoleError("");
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
            {(currentUser || communityName || showSearchUser || revelPrivateKey) && expanded && (
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
                  : revelPrivateKey
                  ? "Manage chat key"
                  : "Messages"}
              </p>
            </div>
            <div className="actionable-imgs">
              {!currentUser &&
                hasUserJoinedChat &&
                noStrPrivKey &&
                !isCommunity &&
                !revelPrivateKey && (
                  <>
                    <div className="message-image" onClick={handleMessageSvgClick}>
                      <Tooltip content={_t("chat.new-message")}>
                        <p className="message-svg">{addMessageSVG}</p>
                      </Tooltip>
                    </div>
                  </>
                )}
              {hasUserJoinedChat && noStrPrivKey && !revelPrivateKey && (
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
                  <ChatsCommunityDropdownMenu
                    username={communityName}
                    {...props}
                    currentChannel={currentChannel!}
                    currentChannelSetter={setCurrentChannel}
                  />
                </div>
              )}{" "}
              {!isCommunity && !isCurrentUser && noStrPrivKey && (
                <div className="simple-menu">
                  <ChatsDropdownMenu
                    {...props}
                    onManageChatKey={() => {
                      setRevealPrivateKey(!revelPrivateKey);
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
            {hasUserJoinedChat && !revelPrivateKey ? (
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
                      {!isCurrentUserJoined && (
                        <p className="not-joined">{_t("chat.not-joined")}</p>
                      )}
                      {isCurrentUser ? (
                        <ChatsDirectMessages
                          {...props}
                          directMessages={directMessagesList}
                          activeUserKeys={activeUserKeys!}
                          currentUser={currentUser}
                          isScrollToBottom={false}
                        />
                      ) : (
                        <ChatsChannelMessages
                          {...props}
                          username={communityName}
                          publicMessages={publicMessages}
                          currentChannel={currentChannel!}
                          activeUserKeys={activeUserKeys!}
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
                    {(props.chat.directContacts.length !== 0 ||
                      (props.chat.channels.length !== 0 && communities.length !== 0)) &&
                    !refreshChat &&
                    noStrPrivKey ? (
                      <React.Fragment>
                        {props.chat.channels.length !== 0 && communities.length !== 0 && (
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
                                    <p className="username" style={{ paddingTop: "8px" }}>
                                      {channel.name}
                                    </p>
                                    <p className="last-message">
                                      {getCommunityLastMessage(
                                        channel.id,
                                        props.chat.publicMessages
                                      )}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            {props.chat.directContacts.length !== 0 && (
                              <div className="dm-header">{_t("chat.dms")}</div>
                            )}
                          </>
                        )}
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
                                <p className="last-message">
                                  {getDirectLastMessage(user.pubkey, props.chat.directMessages)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ) : !noStrPrivKey || noStrPrivKey.length === 0 || noStrPrivKey === null ? (
                      <>
                        <div
                          className="d-flex justify-content-center import-chat-btn"
                          style={{ marginTop: "20%" }}
                        >
                          <Button
                            variant="primary"
                            onClick={() => setImportPrivKey(!importPrivKey)}
                          >
                            {_t("chat.import-chat")}
                          </Button>
                        </div>
                        {importPrivKey && (
                          <div className="private-key" style={{ margin: "15px 10px" }}>
                            <Form
                              onSubmit={(e: React.FormEvent) => {
                                e.preventDefault();
                              }}
                            >
                              <InputGroup>
                                <InputGroup.Prepend>
                                  <InputGroup.Text>{keySvg}</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                  value={chatPrivKey}
                                  type="password"
                                  autoFocus={true}
                                  autoComplete="off"
                                  placeholder="Chat private key"
                                  onChange={(e) => setChatPrivkey(e.target.value)}
                                />
                                <InputGroup.Append>
                                  <Button onClick={handleImportChatSubmit}>
                                    {_t("chat.submit")}
                                  </Button>
                                </InputGroup.Append>
                              </InputGroup>
                              {addRoleError && (
                                <Form.Text className="text-danger">{addRoleError}</Form.Text>
                              )}
                            </Form>
                          </div>
                        )}
                        {<OrDivider />}
                        <div className="d-flex justify-content-center create-new-chat-btn">
                          <Button
                            variant="primary"
                            onClick={() => {
                              setKeyDialog(true);
                              setStep(9);
                            }}
                          >
                            {_t("chat.create-new-account")}
                          </Button>
                        </div>
                      </>
                    ) : refreshChat ? (
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
            ) : revelPrivateKey ? (
              <ManageChatKey />
            ) : (
              <Button className="join-chat-btn" onClick={handleJoinChat}>
                {showSpinner && chatButtonSpinner}
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
              receiverPubKey={receiverPubKey}
              isActveUserRemoved={isActveUserRemoved}
              currentUser={currentUser}
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
}
