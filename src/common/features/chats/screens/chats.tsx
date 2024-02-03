import React, { useContext, useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import NavBar from "../../../components/navbar";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../../../pages/common";
import ChatsSideBar from "../components/chats-sidebar";
import Feedback from "../../../components/feedback";
import { useMappedStore } from "../../../store/use-mapped-store";
import ChatsMessagesBox from "../components/chat-message-box";
import { classNameObject } from "../../../helper/class-name-object";
import "./_chats.scss";
import { ChatsWelcome } from "../components/chats-welcome";
import { useCommunityCache } from "../../../core";
import useMountedState from "react-use/lib/useMountedState";
import { _t } from "../../../i18n";
import Meta from "../../../components/meta";
import { ChatsDefaultScreen } from "../components/chats-default-screen";
import { ChatsManageKeySection } from "./chats-manage-key-section";
import { ChatsUserNotJoinedSection } from "./chats-user-not-joined-section";
import {
  ChatContext,
  useChannelsQuery,
  useCommunityChannelQuery,
  useDirectContactsQuery,
  useKeysQuery
} from "@ecency/ns-query";
import { useUnmount } from "react-use";

interface Props extends PageProps {
  match: match<{
    filter: string;
    name: string;
    path: string;
    url: string;
    username: string;
    channel?: string;
  }>;
}

export const Chats = ({ match, history }: Props) => {
  const { activeUser } = useMappedStore();
  const { receiverPubKey, revealPrivateKey, setReceiverPubKey } = useContext(ChatContext);
  const { data: community } = useCommunityCache(match.params.username);

  const { publicKey, privateKey } = useKeysQuery();
  const { data: directContacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();

  const isChannel = useMemo(() => match.params.channel === "channel", [match.params]);

  const directContact = useMemo(
    () => directContacts?.find((dc) => dc.pubkey === receiverPubKey),
    [directContacts, receiverPubKey]
  );
  const { data: communityChannel } = useCommunityChannelQuery(
    isChannel && community ? community : undefined
  );

  const isReady = useMemo(
    () => !!(activeUser && publicKey && privateKey),
    [publicKey, privateKey, activeUser]
  );
  const isShowManageKey = useMemo(() => isReady && revealPrivateKey, [isReady, revealPrivateKey]);
  const isShowChatRoom = useMemo(
    () => isReady && (!!directContact || !!communityChannel) && !revealPrivateKey,
    [isReady, revealPrivateKey, communityChannel, directContact]
  );
  const isShowImportChats = useMemo(() => !isReady, [isReady]);
  const isShowUserNotJoined = useMemo(
    () =>
      !isShowChatRoom &&
      isReady &&
      (!!directContact?.pubkey.startsWith("not_joined_") || (community && !communityChannel)),
    [isShowChatRoom, isReady, directContact, communityChannel, community]
  );

  const isShowDefaultScreen = useMemo(
    () =>
      isReady &&
      !directContact &&
      !communityChannel &&
      !revealPrivateKey &&
      !receiverPubKey &&
      !isShowUserNotJoined,
    [isReady, receiverPubKey, directContact, communityChannel, receiverPubKey, isShowUserNotJoined]
  );

  const isMounted = useMountedState();

  const title = useMemo(() => {
    let title = _t("chat.page-title");

    if (community) {
      title = `${community.title} | ${title}`;
    } else if (directContact) {
      title = `${directContact.name} | ${title}`;
    }

    return title;
  }, [community, directContact]);

  useUnmount(() => {
    setReceiverPubKey("");
  });

  useEffect(() => {
    if (communityChannel) {
      setReceiverPubKey("");
    }
  }, [communityChannel]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return isMounted() ? (
    <div className="bg-blue-duck-egg dark:bg-transparent pt-[63px] min-h-[100vh]">
      <Feedback activeUser={activeUser} />
      <NavBar history={history} />
      <Meta title={title || _t("chat.page-title")} />

      <div className="container mx-auto md:py-6">
        <div className="grid grid-cols-12 overflow-hidden md:rounded-2xl bg-white md:border border-[--border-color] relative h-[100vh] md:h-auto">
          <div className="col-span-12 md:col-span-4 xl:col-span-3 md:border-r border-[--border-color] md:h-[calc(100vh-69px-3rem)] overflow-y-auto">
            {isReady ? (
              <ChatsSideBar
                isChannel={isChannel}
                history={history}
                username={match.params.username}
              />
            ) : (
              <></>
            )}
            {(!directContacts?.length || !channels?.length) && isShowDefaultScreen && (
              <ChatsDefaultScreen className="md:hidden" />
            )}
            {(!directContacts?.length || !channels?.length) && isShowImportChats && activeUser && (
              <div className="md:h-full w-full flex items-center justify-center md:hidden">
                <ChatsWelcome />
              </div>
            )}
            {isShowUserNotJoined && (
              <ChatsUserNotJoinedSection
                username={directContact?.name ?? community?.name ?? ""}
                className="md:hidden"
              />
            )}
          </div>
          <div
            className={classNameObject({
              "col-span-12 md:col-span-8 xl:col-span-9 md:h-[calc(100vh-69px-3rem)] md:overflow-y-auto absolute w-full bg-white z-10 md:static":
                true,
              "translate-x-0": isShowChatRoom || isShowManageKey,
              "translate-x-[100%] md:translate-x-0": !isShowChatRoom && !isShowManageKey
            })}
          >
            {isShowManageKey && <ChatsManageKeySection />}
            {isShowImportChats && activeUser && (
              <div className="md:h-full w-full flex items-center justify-center">
                <ChatsWelcome />
              </div>
            )}
            {isShowChatRoom && (
              <ChatsMessagesBox
                community={community}
                history={history}
                channel={communityChannel!!}
                currentContact={directContact}
              />
            )}
            {isShowUserNotJoined && (
              <ChatsUserNotJoinedSection username={directContact?.name ?? community?.name ?? ""} />
            )}
            {isShowDefaultScreen && <ChatsDefaultScreen />}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};
export default connect(pageMapStateToProps, pageMapDispatchToProps)(Chats);
