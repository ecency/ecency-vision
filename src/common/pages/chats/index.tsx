import React, { useContext, useEffect, useState } from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import NavBar from "../../components/navbar";
import NavBarElectron from "../../../desktop/app/components/navbar";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import ChatsSideBar from "../../components/chats/chats-sidebar/indes";
import ChatsMessagesBox from "../../components/chats/chats-messages-box";

import "./index.scss";

import * as ls from "../../util/local-storage";
import { Button, Spinner } from "react-bootstrap";
import { setNostrkeys } from "../../../managers/message-manager";
import ManageChatKey from "../../components/manage-chat-key";
import Feedback, { success } from "../../components/feedback";
import { useMappedStore } from "../../store/use-mapped-store";
import ChatContextProvider, { ChatContext } from "../../components/chats/chat-context-provider";
import ImportChats from "../../components/chats/import-chats";
import JoinChat from "../../components/chats/join-chat";

interface MatchParams {
  filter: string;
  name: string;
  path: string;
  url: string;
  username: string;
}

interface Props extends PageProps {
  match: match<MatchParams>;
}

export const Chats = (props: Props) => {
  const { activeUser, global } = useMappedStore();

  const [marginTop, setMarginTop] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    handleResize();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleResize = () => {
    const parentElemet = document.getElementById("sticky-container")?.getBoundingClientRect();
    if (parentElemet) {
      setMarginTop(parentElemet?.y + parentElemet?.height - 30);
    }
  };

  return (
    <ChatContextProvider>
      <>
        <Feedback activeUser={activeUser} />
        {global.isElectron ? <NavBarElectron {...props} /> : <NavBar history={props.history} />}
        <div
          style={{ marginTop: marginTop }}
          className={props.global.isElectron ? "chats-page mb-lg-0 pt-6" : "chats-page mb-lg-0"}
        >
          {context.inProgress ? (
            <div className="d-flex justify-content-center align-items-center full-page">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <>
              {context.activeUserKeys?.pub ? (
                context.chatPrivKey ? (
                  <>
                    <ChatsSideBar {...props} />
                    {context.revealPrivKey ? (
                      <div className="chats-messages-box">
                        <ManageChatKey />
                      </div>
                    ) : (
                      // Handle the case when the user hasn't joined any community here
                      <ChatsMessagesBox
                        {...props}
                        deletePublicMessage={props.deletePublicMessage}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <div className="import-chat">
                      <ImportChats />
                    </div>
                  </>
                )
              ) : (
                <div className="d-flex justify-content-center align-items-center full-page">
                  <JoinChat {...props} />
                </div>
              )}
            </>
          )}
        </div>
      </>
    </ChatContextProvider>
  );
};
export default connect(pageMapStateToProps, pageMapDispatchToProps)(Chats);
