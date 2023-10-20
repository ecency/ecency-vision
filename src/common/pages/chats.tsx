import React, { useContext, useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import NavBar from "../components/navbar";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import ChatsSideBar from "../features/chats/components/chats-sidebar";
import ChatsMessagesBox from "../features/chats/components/chats-messages-box";
import ManageChatKey from "../features/chats/components/manage-chat-key";
import Feedback from "../components/feedback";
import { useMappedStore } from "../store/use-mapped-store";
import { ChatContext } from "../features/chats/chat-context-provider";
import ImportChats from "../features/chats/components/import-chats";
import { Spinner } from "@ui/spinner";

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

  const { showSpinner, activeUserKeys, revealPrivKey, chatPrivKey, windowWidth } =
    useContext(ChatContext);

  const isReady = useMemo(
    () => activeUser && activeUserKeys?.pub && chatPrivKey,
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
        <div className="grid grid-cols-12 overflow-hidden rounded-2xl bg-white border border-[--border-color]">
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3 border-r border-[--border-color] h-[calc(100vh-3rem-69px)] overflow-y-auto">
            {isReady ? <ChatsSideBar history={history} username={username} /> : <></>}
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-8 xl:col-span-9 h-[calc(100vh-3rem-69px)] overflow-y-auto">
            {isReady ? (
              revealPrivKey ? (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-[400px] bg-gray-100 w-full p-4 rounded-2xl border border-[--border-color]">
                    <ManageChatKey />
                  </div>
                </div>
              ) : (
                <div className="import-chat">
                  <ImportChats />
                </div>
              )
            ) : (
              <ChatsMessagesBox {...props} />
            )}
            {showSpinner ? (
              <div className="flex justify-center items-center full-page">
                <Spinner />
                <p className="mt-3 ml-2" style={{ fontSize: "26px" }}>
                  Loading...
                </p>
              </div>
            ) : (
              <></>
            )}
          </div>
          {/*{activeUser ? (): (*/}
          {/*  <>*/}
          {/*    {activeUserKeys?.pub ? (*/}
          {/*      chatPrivKey ? (*/}
          {/*        <></>*/}
          {/*      ) : (*/}
          {/*        <>*/}

          {/*        </>*/}
          {/*      )*/}
          {/*    ) : (*/}
          {/*      <div className="flex justify-center items-center full-page">*/}
          {/*        <JoinChat />*/}
          {/*      </div>*/}
          {/*    )}*/}
          {/*  </>*/}
          {/*  )*/}
          {/*  ) : (*/}
          {/*  <h4 className="flex justify-center items-center full-page text-center">*/}
          {/*  Please login to continue the chat*/}
          {/*  </h4>*/}
          {/*  )}*/}
        </div>
      </div>
    </div>
  );
};
export default connect(pageMapStateToProps, pageMapDispatchToProps)(Chats);
