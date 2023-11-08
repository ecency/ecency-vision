import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import { history } from "../../../../store";
import Tooltip from "../../../../components/tooltip";
import LinearProgress from "../../../../components/linear-progress";
import ManageChatKey from "../manage-chat-key";
import ChatInput from "../chat-input";
import { chevronDownSvgForSlider, chevronUpSvg } from "../../../../img/svg";
import { _t } from "../../../../i18n";
import { usePrevious } from "../../../../util/use-previous";
import "./index.scss";
import { getPrivateKey } from "../../utils";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { ChatContext } from "../../chat-context-provider";
import { useMount } from "react-use";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import { classNameObject } from "../../../../helper/class-name-object";
import { ChatPopupHeader } from "./chat-popup-header";
import { ChatPopupMessagesList } from "./chat-popup-messages-list";
import { ChatPopupSearchUser } from "./chat-popup-search-user";
import { ChatPopupContactsAndChannels } from "./chat-popup-contacts-and-channels";
import { useChannelsQuery, useDirectContactsQuery, useMessagesQuery } from "../../queries";
import { useFetchPreviousMessages, useJoinChat } from "../../mutations";
import { useKeysQuery } from "../../queries/keys-query";

export const ChatPopUp = () => {
  const { activeUser, global, chat, resetChat } = useMappedStore();

  const { receiverPubKey, revealPrivKey, hasUserJoinedChat, setRevealPrivKey, setShowSpinner } =
    useContext(ChatContext);
  const { mutateAsync: joinChat, isLoading: isJoinChatLoading } = useJoinChat();

  const { privateKey, publicKey } = useKeysQuery();
  const { data: directContacts, isLoading: isDirectContactsLoading } = useDirectContactsQuery();
  const directContact = useMemo(
    () => directContacts?.find((contact) => contact.pubkey === receiverPubKey),
    [directContacts, receiverPubKey]
  );
  const { data: messages } = useMessagesQuery(directContact?.name);
  const { data: channels, isLoading: isChannelsLoading } = useChannelsQuery();

  const routerLocation = useLocation();
  const prevActiveUser = usePrevious(activeUser);
  const chatBodyDivRef = useRef<HTMLDivElement | null>(null);

  const [expanded, setExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isScrollToTop, setIsScrollToTop] = useState(false);
  const [isScrollToBottom, setIsScrollToBottom] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [show, setShow] = useState(false);
  const [isCommunity, setIsCommunity] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [isTop, setIsTop] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const currentChannel = useMemo(
    () => channels?.find((channel) => channel.communityName === communityName),
    [communityName, channels]
  );
  const isCurrentUser = useMemo(() => !!currentUser, [currentUser]);
  const canSendMessage = useMemo(
    () => !currentUser && hasUserJoinedChat && !!privateKey && !isCommunity && !revealPrivKey,
    [currentUser, hasUserJoinedChat, privateKey, isCommunity, revealPrivKey]
  );

  const { mutateAsync: fetchPreviousMessages, isLoading: isFetchingMore } =
    useFetchPreviousMessages(currentChannel);

  useMount(() => {
    setShow(!routerLocation.pathname.match("/chats") && !!activeUser);
  });

  // Show or hide the popup if current pathname was changed or user changed
  useEffect(() => {
    setShow(!routerLocation.pathname.match("/chats") && !!activeUser);
  }, [routerLocation, activeUser]);

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
      scrollerClicked();
    }
  }, [isCommunity, communityName, show]);

  const fetchPrevMessages = () => {
    if (!hasMore) return;

    fetchPreviousMessages()
      .then((events) => {
        if (events.length < 25) {
          setHasMore(false);
        }
      })
      .finally(() => setIsTop(false));
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
        pub: publicKey!,
        priv: privateKey
      };
    }
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
          />
          {(isJoinChatLoading || isChannelsLoading || isFetchingMore) && <LinearProgress />}
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
                  <ChatPopupMessagesList username={currentUser ? currentUser : communityName} />
                ) : showSearchUser ? (
                  <ChatPopupSearchUser setCurrentUser={setCurrentUser} />
                ) : (
                  <ChatPopupContactsAndChannels
                    communityClicked={(community: string) => {
                      setIsCommunity(true);
                      setCommunityName(community);
                    }}
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
