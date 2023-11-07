import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import { history } from "../../../../store";
import { Community } from "../../../../store/communities";
import { ChannelUpdate } from "../../managers/message-manager-types";
import Tooltip from "../../../../components/tooltip";
import LinearProgress from "../../../../components/linear-progress";
import ManageChatKey from "../manage-chat-key";
import ChatInput from "../chat-input";
import { chevronDownSvgForSlider, chevronUpSvg } from "../../../../img/svg";
import { _t } from "../../../../i18n";
import { usePrevious } from "../../../../util/use-previous";
import { getCommunity } from "../../../../api/bridge";
import "./index.scss";
import { getPrivateKey, getUserChatPublicKey } from "../../utils";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { ChatContext } from "../../chat-context-provider";
import { useMount } from "react-use";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import { classNameObject } from "../../../../helper/class-name-object";
import { ChatPopupHeader } from "./chat-popup-header";
import { ChatPopupMessagesList } from "./chat-popup-messages-list";
import { ChatPopupSearchUser } from "./chat-popup-search-user";
import { ChatPopupDirectMessages } from "./chat-popup-direct-messages";
import { setNostrkeys } from "../../managers/message-manager";
import { useJoinChat } from "../../mutations/join-chat";
import { useChannelsQuery, useDirectContactsQuery, useMessagesQuery } from "../../queries";
import { useLeftCommunityChannelsQuery } from "../../queries/left-community-channels-query";

export const ChatPopUp = () => {
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
    setShowSpinner
  } = useContext(ChatContext);
  const { mutateAsync: joinChat, isLoading: isJoinChatLoading } = useJoinChat();

  const { data: directContacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();
  const { data: leftCommunityChannelsIds } = useLeftCommunityChannelsQuery();
  const directContact = useMemo(
    () => directContacts?.find((contact) => contact.pubkey === receiverPubKey),
    [directContacts]
  );
  const { data: messages } = useMessagesQuery(directContact?.name);

  const routerLocation = useLocation();
  const prevActiveUser = usePrevious(activeUser);
  const chatBodyDivRef = useRef<HTMLDivElement | null>(null);

  const [expanded, setExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isScrollToTop, setIsScrollToTop] = useState(false);
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [show, setShow] = useState(false);
  const [receiverPubKey, setReceiverPubKey] = useState("");
  const [isCommunity, setIsCommunity] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [currentCommunity, setCurrentCommunity] = useState<Community>();
  const [isTop, setIsTop] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const isCurrentUser = useMemo(() => !!currentUser, [currentUser]);
  const canSendMessage = useMemo(
    () =>
      !currentUser && hasUserJoinedChat && !!activeUserKeys?.priv && !isCommunity && !revealPrivKey,
    [currentUser, hasUserJoinedChat, activeUserKeys, isCommunity, revealPrivKey]
  );

  useMount(() => {
    setShow(!routerLocation.pathname.match("/chats") && !!activeUser);
  });

  // Show or hide the popup if current pathname was changed or user changed
  useEffect(() => {
    setShow(!routerLocation.pathname.match("/chats") && !!activeUser);
  }, [routerLocation, activeUser]);

  // todo: ??
  useEffect(() => {
    if (currentChannel && leftCommunityChannelsIds?.includes(currentChannel.id)) {
      setIsCommunity(false);
      setCommunityName("");
    }
  }, [leftCommunityChannelsIds]);

  // todo ???
  useEffect(() => {
    const updated: ChannelUpdate = chat.updatedChannel
      .filter((x) => x.channelId === currentChannel?.id!)
      .sort((a, b) => b.created - a.created)[0];
    if (currentChannel && updated) {
      // TODO: check that updated channel affecting messagse
      // const publicMessages: PublicMessage[] = fetchCommunityMessages(
      //   chat.publicMessages,
      //   currentChannel,
      //   updated?.hiddenMessageIds
      // );
      // const messages = publicMessages.sort((a, b) => a.created - b.created);
      // setPublicMessages(messages);
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

  // Fetching previous messages when scrol achieved top
  useEffect(() => {
    if (isTop) {
      fetchPrevMessages();
    }
  }, [isTop]);

  useEffect(() => {
    if (prevActiveUser?.username !== activeUser?.username) {
      setIsCommunity(false);
      setCurrentUser("");
      setCommunityName("");
    }
  }, [global.theme, activeUser]);

  useEffect(() => {
    if (messages.length !== 0 && !isScrolled) {
      scrollerClicked();
    }
  }, [messages]);

  useEffect(() => {
    if ((isCurrentUser || isCommunity) && show) {
      scrollerClicked();
    }
  }, [isCurrentUser, isCommunity, show]);

  useEffect(() => {
    if (isCommunity && show) {
      fetchCommunity();

      scrollerClicked();
    }
  }, [isCommunity, communityName, show]);

  useEffect(() => {
    if (currentUser) {
      const isCurrentUserFound = directContacts?.find((contact) => contact.name === currentUser);
      if (isCurrentUserFound) {
        setReceiverPubKey(isCurrentUserFound.pubkey);
      } else {
        setInProgress(true);
        fetchCurrentUserData();
      }

      if (!messageServiceInstance) {
        setNostrkeys(activeUserKeys!);
      }
    } else {
      setInProgress(false);
    }
  }, [currentUser]);

  const fetchCommunity = async () => {
    const community = await getCommunity(communityName, activeUser?.username);
    setCurrentCommunity(community!);
  };

  const fetchCurrentUserData = async () => {
    const nsKey = await getUserChatPublicKey(currentUser);
    if (nsKey) {
      setReceiverPubKey(nsKey);
    } else {
      setReceiverPubKey("");
    }
    setInProgress(false);
  };

  const fetchPrevMessages = () => {
    if (!hasMore || inProgress) return;

    setInProgress(true);
    // todo: make it infinite query
    messageServiceInstance
      ?.fetchPrevMessages(currentChannel!.id, messages[0].created)
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
    const scrollerTop = element.scrollTop <= 600 && messages.length > 25;
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
        priv: getPrivateKey(activeUser?.username!)!!
      };
      setNostrkeys(keys);
    }
  };

  const communityClicked = (community: string) => {
    setIsCommunity(true);
    setCommunityName(community);
  };

  const handleBackArrowSvg = () => {
    setCurrentUser("");
    setCommunityName("");
    setIsCommunity(false);
    setShowSearchUser(false);
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
          className={classNameObject({
            "chatbox-container": true,
            expanded
          })}
        >
          <ChatPopupHeader
            currentUser={currentUser}
            setExpanded={setExpanded}
            canSendMessage={canSendMessage}
            expanded={expanded}
            isCurrentUser={isCurrentUser}
            communityName={communityName}
            isCommunity={isCommunity}
            handleBackArrowSvg={handleBackArrowSvg}
            handleExtendedView={handleExtendedView}
            handleMessageSvgClick={handleMessageSvgClick}
            handleRefreshSvgClick={handleRefreshSvgClick}
            showSearchUser={showSearchUser}
            currentCommunity={currentCommunity}
          />
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
                  <ChatPopupMessagesList
                    isCurrentUser={isCurrentUser}
                    currentUser={currentUser}
                    isCommunity={isCommunity}
                    communityName={communityName}
                  />
                ) : showSearchUser ? (
                  <ChatPopupSearchUser setCurrentUser={setCurrentUser} />
                ) : (
                  <ChatPopupDirectMessages
                    communityClicked={communityClicked}
                    setReceiverPubKey={setReceiverPubKey}
                    setShowSearchUser={setShowSearchUser}
                    userClicked={(username) => setCurrentUser(username)}
                  />
                )}
              </>
            ) : revealPrivKey ? (
              <div className="p-4">
                <ManageChatKey />
              </div>
            ) : (
              <Button
                className="join-chat-btn"
                onClick={() => joinChat()}
                icon={isJoinChatLoading && <Spinner className="w-3.5 h-3.5" />}
                iconPlacement="left"
              >
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
                    bottom: (isCurrentUser || isCommunity) && isScrollToBottom ? "0" : "55px"
                  }}
                  onClick={scrollerClicked}
                >
                  {isCurrentUser || isCommunity ? chevronDownSvgForSlider : chevronUpSvg}
                </div>
              </Tooltip>
            )}
          </div>
          <div className="pl-2">
            {(isCurrentUser || isCommunity) && (
              <ChatInput currentUser={currentUser} currentChannel={currentChannel ?? undefined} />
            )}
          </div>
        </div>
      )}
    </>
  );
};
