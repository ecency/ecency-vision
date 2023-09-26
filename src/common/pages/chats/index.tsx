import React, { useContext, useEffect, useState } from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import { Spinner } from "react-bootstrap";
import NavBar from "../../components/navbar";
import NavBarElectron from "../../../desktop/app/components/navbar";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import ChatsSideBar from "../../components/chats/chats-sidebar/indes";
import ChatsMessagesBox from "../../components/chats/chats-messages-box";

import ManageChatKey from "../../components/manage-chat-key";
import Feedback from "../../components/feedback";
import { useMappedStore } from "../../store/use-mapped-store";
import { ChatContext } from "../../components/chats/chat-context-provider";
import ImportChats from "../../components/chats/import-chats";
import JoinChat from "../../components/chats/join-chat";

import "./index.scss";

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
  const { match, history } = props;
  const [marginTop, setMarginTop] = useState(0);

  const username = match.params.username;

  const { showSpinner, activeUserKeys, revealPrivKey, chatPrivKey, windowWidth } =
    useContext(ChatContext);

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
    <>
      <Feedback activeUser={activeUser} />
      {global.isElectron ? <NavBarElectron {...props} /> : <NavBar history={props.history} />}

      <div
        style={{ marginTop: marginTop }}
        className={props.global.isElectron ? "chats-page mb-lg-0 pt-6" : "chats-page mb-lg-0"}
      >
        {activeUser ? (
          showSpinner ? (
            <div className="d-flex justify-content-center align-items-center full-page">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 ml-2" style={{ fontSize: "26px" }}>
                Loading...
              </p>
            </div>
          ) : (
            <>
              {activeUserKeys?.pub ? (
                chatPrivKey ? (
                  <>
                    <ChatsSideBar history={history} username={username} />
                    {revealPrivKey ? (
                      <div
                        className="chats-manage-key"
                        style={{ position: windowWidth < 768 ? "absolute" : "static" }}
                      >
                        <ManageChatKey history={history} />
                      </div>
                    ) : (
                      <>
                        <ChatsMessagesBox {...props} />
                      </>
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
                  <JoinChat />
                </div>
              )}
            </>
          )
        ) : (
          <h4 className="d-flex justify-content-center align-items-center full-page text-center">
            Please login to continue the chat
          </h4>
        )}
      </div>
    </>
  );
};
export default connect(pageMapStateToProps, pageMapDispatchToProps)(Chats);
