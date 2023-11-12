import React, { useContext, useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import NavBar from "../../../components/navbar";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../../../pages/common";
import ChatsSideBar from "../components/chats-sidebar";
import ManageChatKey from "../components/manage-chat-key";
import Feedback from "../../../components/feedback";
import { useMappedStore } from "../../../store/use-mapped-store";
import { ChatContext } from "../chat-context-provider";
import ChatsMessagesBox from "../components/chat-message-box";
import JoinChat from "../components/join-chat";
import { classNameObject } from "../../../helper/class-name-object";
import "./_chats.scss";
import { useChannelsQuery, useCommunityChannelQuery } from "../queries";
import { useLeftCommunityChannelsQuery } from "../queries/left-community-channels-query";
import { useKeysQuery } from "../queries/keys-query";
import { ChatsImport } from "../components/chats-import";
import { useCommunityCache } from "../../../core";

interface Props extends PageProps {
  match: match<{
    filter: string;
    name: string;
    path: string;
    url: string;
    username: string;
  }>;
}

export const Chats = (props: Props) => {
  const { activeUser, global } = useMappedStore();
  const { receiverPubKey, revealPrivateKey } = useContext(ChatContext);
  const { data: community } = useCommunityCache(props.match.params.username);

  const { publicKey, privateKey } = useKeysQuery();
  const { data: channels } = useChannelsQuery();
  const { data: leftCommunityChannelsIds } = useLeftCommunityChannelsQuery();
  const { data: communityChannel } = useCommunityChannelQuery(community ?? undefined);

  const isChannel = useMemo(
    () =>
      [...(channels ?? []), ...(communityChannel ? [communityChannel] : [])].some(
        (channel) =>
          channel.communityName === props.match.params.username &&
          !leftCommunityChannelsIds?.includes(channel.name)
      ),
    [channels, leftCommunityChannelsIds, props.match.params.username, communityChannel]
  );

  const isReady = useMemo(
    () => !!(activeUser && publicKey && privateKey),
    [publicKey, privateKey, activeUser]
  );
  const isShowManageKey = useMemo(() => isReady && revealPrivateKey, [isReady, revealPrivateKey]);
  const isShowChatRoom = useMemo(
    () => isReady && (!!receiverPubKey || isChannel) && !revealPrivateKey,
    [isReady, receiverPubKey, revealPrivateKey, isChannel]
  );
  const isShowDefaultScreen = useMemo(
    () => isReady && !receiverPubKey && !isChannel && !revealPrivateKey,
    [isReady, receiverPubKey, revealPrivateKey, isChannel]
  );
  const isShowImportChats = useMemo(() => !isReady, [isReady]);

  const { match, history } = props;

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="bg-blue-duck-egg dark:bg-transparent pt-[63px] min-h-[100vh]">
      <Feedback activeUser={activeUser} />
      <NavBar history={props.history} />

      <div className="container mx-auto md:py-6">
        <div className="grid grid-cols-12 overflow-hidden md:rounded-2xl bg-white border border-[--border-color] relative h-[100vh] md:h-auto">
          <div className="col-span-12 md:col-span-4 xl:col-span-3 border-r border-[--border-color] h-[calc(100vh-3rem-69px)] overflow-y-auto">
            {isReady ? <ChatsSideBar history={history} username={match.params.username} /> : <></>}
          </div>
          <div
            className={classNameObject({
              "col-span-12 md:col-span-8 xl:col-span-9 h-[calc(100vh-3rem-69px)] overflow-y-auto absolute w-full bg-white z-10 md:static duration-500":
                true,
              "left-0": isShowChatRoom || isShowManageKey,
              "left-[100%]": !isShowChatRoom && !isShowManageKey
            })}
          >
            {isShowManageKey && (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-[400px] bg-gray-100 dark:bg-gray-900 w-full p-4 rounded-2xl border border-[--border-color] p-4">
                  <ManageChatKey />
                </div>
              </div>
            )}
            {isShowImportChats && activeUser && (
              <div className="h-full w-full flex items-center justify-center">
                <ChatsImport />
              </div>
            )}
            {isShowChatRoom && <ChatsMessagesBox match={match} history={history} />}
            {isShowDefaultScreen && (
              <div className="flex flex-col justify-center items-center w-full h-full">
                <div className="text-xl text-blue-dark-sky mb-4 font-semibold">
                  Hello, @{activeUser?.username}
                </div>
                <div>Search a person or community and start messaging</div>
              </div>
            )}
            {!isReady && !isShowImportChats && (
              <div className="flex justify-center items-center full-page">
                <JoinChat />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default connect(pageMapStateToProps, pageMapDispatchToProps)(Chats);
