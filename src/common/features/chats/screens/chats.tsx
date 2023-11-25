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
import { classNameObject } from "../../../helper/class-name-object";
import "./_chats.scss";
import { useChannelsQuery, useCommunityChannelQuery } from "../queries";
import { useKeysQuery } from "../queries/keys-query";
import { ChatsWelcome } from "../components/chats-welcome";
import { useCommunityCache } from "../../../core";
import { useGetAccountFullQuery } from "../../../api/queries";
import { getUserChatPublicKey } from "../utils";
import useMountedState from "react-use/lib/useMountedState";
import ChatsProfileBox from "../components/chat-profile-box";
import { _t } from "../../../i18n";
import Meta from "../../../components/meta";
import { Button } from "@ui/button";
import { arrowBackSvg } from "../../../img/svg";
import moment from "moment/moment";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";
import { Alert } from "@ui/alert";

interface Props extends PageProps {
  match: match<{
    filter: string;
    name: string;
    path: string;
    url: string;
    username: string;
  }>;
}

export const Chats = ({ match, history }: Props) => {
  const { activeUser, global } = useMappedStore();
  const { receiverPubKey, revealPrivateKey, setReceiverPubKey, setRevealPrivateKey } =
    useContext(ChatContext);
  const { data: community } = useCommunityCache(match.params.username);

  const { publicKey, privateKey } = useKeysQuery();
  const { data: userAccount } = useGetAccountFullQuery(match.params.username?.replace("@", ""));
  const { data: channels } = useChannelsQuery();
  const { data: communityChannel } = useCommunityChannelQuery(community ?? undefined);

  const [lastKeysSavingTime, setLastKeysSaving] = useLocalStorage<string>(PREFIX + "_chats_lkst");

  const isChannel = useMemo(
    () =>
      [...(channels ?? []), ...(communityChannel ? [communityChannel] : [])].some(
        (channel) => channel.communityName === match.params.username
      ),
    [channels, match.params.username, communityChannel]
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
    () => isReady && !receiverPubKey && !isChannel && !revealPrivateKey && !match.params.username,
    [isReady, receiverPubKey, revealPrivateKey, isChannel]
  );
  const isShowImportChats = useMemo(() => !isReady, [isReady]);

  // We offer user to save account credentials each month
  const isLastKeysSavingTimeExpired = useMemo(
    () =>
      lastKeysSavingTime
        ? moment(new Date(lastKeysSavingTime)).isBefore(moment().subtract(30, "days"))
        : true,
    [lastKeysSavingTime]
  );

  const isMounted = useMountedState();

  const title = useMemo(() => {
    let title = _t("chat.page-title");

    if (community) {
      title = `${community.title} | ${title}`;
    } else if (userAccount) {
      title = `${userAccount.name} | ${title}`;
    }

    return title;
  }, [community, userAccount]);

  useEffect(() => {
    if (userAccount) {
      const key = getUserChatPublicKey(userAccount);
      setReceiverPubKey(key ?? "");
    }
  }, [userAccount]);

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
              <div className="h-full">
                <div className="flex gap-4 items-center sticky z-[10] top-0 bg-white border-b border-[--border-color] px-4 h-[57px]">
                  <Button
                    className="hidden md:flex"
                    noPadding={true}
                    appearance="gray-link"
                    icon={arrowBackSvg}
                    onClick={() => setRevealPrivateKey(false)}
                  />
                  {_t("chat.manage-chat-key")}
                </div>
                <div className="max-w-[400px] mx-auto my-6 bg-gray-100 dark:bg-gray-900 w-full rounded-2xl border border-[--border-color] p-4">
                  <ManageChatKey />
                </div>
                <div className="h-[1rem]" />
              </div>
            )}
            {isShowImportChats && activeUser && (
              <div className="h-full w-full flex items-center justify-center">
                <ChatsWelcome />
              </div>
            )}
            {isShowChatRoom && (
              <ChatsMessagesBox match={match} history={history} channel={communityChannel!!} />
            )}
            {!isShowChatRoom && isReady && match.params.username && (
              <div className="flex flex-col justify-center h-full items-center">
                <div className="font-bold">{_t("chat.welcome.oops")}</div>
                <div className="text-gray-600 dark:text-gray-400 mb-4">
                  {_t("chat.welcome.user-not-joined-yet")}
                </div>
                <ChatsProfileBox currentUser={match.params.username} />
              </div>
            )}
            {isShowDefaultScreen && (
              <div className="flex flex-col justify-center items-center w-full h-full">
                <div className="text-xl text-blue-dark-sky mb-4 font-semibold">
                  {_t("chat.welcome.hello")}, @{activeUser?.username}
                </div>
                <div>{_t("chat.welcome.start-description")}</div>
                {isLastKeysSavingTimeExpired && (
                  <Alert
                    appearance="primary"
                    className="max-w-[550px] flex items-center mt-4 gap-4"
                  >
                    <span>{_t("chat.warn-key-saving")}</span>
                    <Button
                      className="whitespace-nowrap"
                      onClick={() => {
                        setRevealPrivateKey(true);
                        setLastKeysSaving(moment().toDate().toISOString());
                      }}
                    >
                      {_t("chat.view-and-save")}
                    </Button>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};
export default connect(pageMapStateToProps, pageMapDispatchToProps)(Chats);
