"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import ManageChatKey from "../manage-chat-key";
import { ChatInput } from "../chat-input";
import "./_index.scss";
import { useMount } from "react-use";
import { ChatPopupHeader } from "./chat-popup-header";
import { ChatPopupMessagesList } from "./chat-popup-messages-list";
import { ChatPopupSearchUser } from "./chat-popup-search-user";
import { ChatPopupContactsAndChannels } from "./chat-popup-contacts-and-channels";
import { ChatsWelcome } from "../chats-welcome";
import {
  ChatContext,
  useChannelsQuery,
  useDirectContactsQuery,
  useJoinChat,
  useKeysQuery,
  useOriginalJoinedChannelsQuery
} from "@ecency/ns-query";
import { ChatInvitation } from "../chat-invitation";
import { ChatChannelNotJoined } from "../chat-channel-not-joined";
import { ChatsUserNotJoinedSection } from "@/app/chats/_screens/chats-user-not-joined-section";
import { NetworkError } from "../network-error";
import { useGlobalStore } from "@/core/global-store";
import usePrevious from "react-use/lib/usePrevious";
import { usePathname } from "next/navigation";
import { classNameObject } from "@ui/util";
import { LinearProgress } from "@/features/shared";

export const ChatPopUp = () => {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const theme = useGlobalStore((state) => state.theme);

  const { receiverPubKey, revealPrivateKey, setRevealPrivateKey, setReceiverPubKey } =
    useContext(ChatContext);
  const { isPending: isJoinChatLoading } = useJoinChat();

  const { privateKey } = useKeysQuery();
  const { data: directContacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();
  const { data: originalChannels } = useOriginalJoinedChannelsQuery();
  const pathname = usePathname();
  const prevActiveUser = usePrevious(activeUser);
  const chatBodyDivRef = useRef<HTMLDivElement | null>(null);

  const [expanded, setExpanded] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [show, setShow] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const hasUserJoinedChat = useMemo(() => !!privateKey, [privateKey]);
  const currentContact = useMemo(
    () => directContacts?.find((dc) => dc.pubkey === receiverPubKey),
    [directContacts, receiverPubKey]
  );
  const isContactJoined = useMemo(
    () => !!currentContact?.pubkey && !currentContact.pubkey.startsWith("not_joined_"),
    [currentContact]
  );
  const currentChannel = useMemo(
    () => channels?.find((channel) => channel.communityName === communityName),
    [communityName, channels]
  );
  const canSendMessage = useMemo(
    () => hasUserJoinedChat && !!privateKey && !currentChannel && !revealPrivateKey,
    [hasUserJoinedChat, privateKey, currentChannel, revealPrivateKey]
  );
  const isJoinedToChannel = useMemo(
    () => originalChannels?.some((c) => c.id === currentChannel?.id) === true,
    [currentChannel, originalChannels]
  );
  useMount(() => {
    setShow(!pathname.match("/chats") && !!activeUser);
  });

  // Show or hide the popup if current pathname was changed or user changed
  useEffect(() => {
    setShow(
      !pathname.match("/chats") &&
        !pathname.match("/submit") &&
        !pathname.match("/draft") &&
        !pathname.match("/edit") &&
        !!activeUser
    );
  }, [pathname, activeUser]);

  useEffect(() => {
    if (prevActiveUser?.username !== activeUser?.username) {
      setCommunityName("");
    }
  }, [theme, activeUser]);

  const handleMessageSvgClick = () => {
    setShowSearchUser(!showSearchUser);
    setExpanded(true);
    setRevealPrivateKey(false);
    setReceiverPubKey("");
  };

  const handleBackArrowSvg = () => {
    setReceiverPubKey("");
    setCommunityName("");
    setShowSearchUser(false);
    setHasMore(true);
    setRevealPrivateKey(false);
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
            directContact={currentContact}
            channel={currentChannel}
            setExpanded={setExpanded}
            canSendMessage={canSendMessage}
            expanded={expanded}
            handleBackArrowSvg={handleBackArrowSvg}
            handleMessageSvgClick={handleMessageSvgClick}
            showSearchUser={showSearchUser}
          />
          {isJoinChatLoading && <LinearProgress />}
          <NetworkError />
          <div
            className={`chat-body h-full ${
              currentContact ? "current-user" : currentChannel ? "community" : ""
            } ${
              !hasUserJoinedChat ? "flex items-center justify-center" : hasMore ? "no-scroll" : ""
            }`}
            ref={chatBodyDivRef}
          >
            {hasUserJoinedChat && !revealPrivateKey ? (
              <>
                {!!currentContact || !!currentChannel ? (
                  isContactJoined || !!currentChannel ? (
                    <ChatPopupMessagesList
                      currentContact={currentContact}
                      currentChannel={currentChannel}
                    />
                  ) : (
                    currentContact && <ChatInvitation currentContact={currentContact} />
                  )
                ) : showSearchUser ? (
                  <ChatPopupSearchUser
                    onCommunityClicked={(v) => {
                      setCommunityName(v);
                      setReceiverPubKey("");
                    }}
                  />
                ) : (
                  <ChatPopupContactsAndChannels
                    communityClicked={(community: string) => {
                      setCommunityName(community);
                      setReceiverPubKey("");
                    }}
                    setShowSearchUser={setShowSearchUser}
                    userClicked={(username) => {
                      setCommunityName("");
                    }}
                  />
                )}
              </>
            ) : revealPrivateKey ? (
              <div className="p-4">
                <ManageChatKey />
              </div>
            ) : (
              <ChatsWelcome />
            )}
            {communityName && !currentChannel && (
              <ChatsUserNotJoinedSection username={communityName} />
            )}
          </div>
          <div className="pl-2">
            {((currentContact && isContactJoined) || (currentChannel && isJoinedToChannel)) && (
              <ChatInput currentContact={currentContact} currentChannel={currentChannel} />
            )}
            {currentChannel && !isJoinedToChannel && (
              <ChatChannelNotJoined channel={currentChannel} />
            )}
          </div>
        </div>
      )}
    </>
  );
};
