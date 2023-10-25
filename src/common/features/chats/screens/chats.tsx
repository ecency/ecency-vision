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
import { Spinner } from "@ui/spinner";
import ImportChats from "../components/import-chats";
import ChatsMessagesBox from "../components/chat-message-box";
import JoinChat from "../components/join-chat";
import { classNameObject } from "../../../helper/class-name-object";

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
  const { match, history } = props;

  const username = match.params.username;

  const {
    receiverPubKey,
    showSpinner,
    activeUserKeys,
    revealPrivKey,
    chatPrivKey,
    showMobileMessageBox
  } = useContext(ChatContext);

  const isReady = useMemo(
    () => !!(activeUser && activeUserKeys?.pub && chatPrivKey),
    [activeUserKeys, activeUserKeys, chatPrivKey]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return (
    <div className="bg-blue-duck-egg dark:bg-transparent pt-[4.5rem] min-h-[100vh]">
      <Feedback activeUser={activeUser} />
      <NavBar history={props.history} />

      <div className="container mx-auto py-6">
        <div className="grid grid-cols-12 overflow-hidden rounded-2xl bg-white border border-[--border-color] relative">
          <div className="col-span-12 md:col-span-4 xl:col-span-3 border-r border-[--border-color] h-[calc(100vh-3rem-69px)] overflow-y-auto">
            {isReady ? <ChatsSideBar history={history} username={username} /> : <></>}
          </div>
          <div
            className={classNameObject({
              "col-span-12 md:col-span-8 xl:col-span-9 h-[calc(100vh-3rem-69px)] overflow-y-auto absolute w-full bg-white z-10 md:static duration-500":
                true,
              "left-0": showMobileMessageBox,
              "left-[100%]": showMobileMessageBox
            })}
          >
            {isReady && revealPrivKey && (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-[400px] bg-gray-100 w-full p-4 rounded-2xl border border-[--border-color]">
                  <ManageChatKey />
                </div>
              </div>
            )}
            {showSpinner && (
              <div className="flex justify-center items-center h-full w-full">
                <Spinner className="w-6 h-6" />
              </div>
            )}
            {!isReady && !showSpinner && (
              <div className="h-full w-full flex items-center justify-center">
                <ImportChats />
              </div>
            )}
            {isReady && !showSpinner && receiverPubKey && !revealPrivKey && (
              <ChatsMessagesBox match={match} history={history} />
            )}
            {isReady && !receiverPubKey && !revealPrivKey && !showSpinner && (
              <div className="flex flex-col justify-center items-center w-full h-full">
                <div className="text-xl text-blue-dark-sky mb-4 font-semibold">
                  Hello, @{activeUser?.username}
                </div>
                <div>Search a person or community and start messaging</div>
              </div>
            )}
            {!isReady && (
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
