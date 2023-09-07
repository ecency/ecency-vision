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
import { setNostrkeys } from "../../../providers/message-provider";
import ManageChatKey from "../../components/manage-chat-key";
import Feedback, { success } from "../../components/feedback";
import { NostrKeysType } from "../../components/chats/types";
import {
  copyToClipboard,
  createNoStrAccount,
  getPrivateKey,
  getProfileMetaData,
  setProfileMetaData
} from "../../components/chats/utils";
import { useMappedStore } from "../../store/use-mapped-store";
import ChatProvider, { ChatContext } from "../../components/chats/chat-provider";

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

  const context = useContext(ChatContext);
  const { setChatPrivKey, setActiveUserKeys } = context;

  const [marginTop, setMarginTop] = useState(0);
  const [showSpinner, setShowSpinner] = useState(false);

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

  const handleJoinChat = async () => {
    const { resetChat } = props;
    setShowSpinner(true);
    resetChat();
    const keys = createNoStrAccount();
    ls.set(`${activeUser?.username}_nsPrivKey`, keys.priv);
    setChatPrivKey(keys.priv);
    await setProfileMetaData(activeUser, keys.pub);
    setNostrkeys(keys);
    window.messageService?.updateProfile({
      name: activeUser?.username!,
      about: "",
      picture: ""
    });
    setActiveUserKeys(keys);
    setShowSpinner(false);
  };

  // return (
  //   <>
  //   <ChatProvider>
  //     <Feedback activeUser={activeUser} />
  //     {global.isElectron ? <NavBarElectron {...props} /> : <NavBar history={props.history} />}
  //     <div
  //       style={{ marginTop: marginTop }}
  //       className={props.global.isElectron ? "chats-page mb-lg-0 pt-6" : "chats-page mb-lg-0"}
  //     >
  //       {inProgrss ? (
  //         <div className="d-flex justify-content-center align-items-center full-page">
  //           <Spinner animation="border" variant="primary" />
  //         </div>
  //       ) : (
  //         <>
  //           {activeUserKeys?.pub ? (
  //             chatPrivKey ? (
  //               <>
  //                 <ChatsSideBar
  //                   {...props}
  //                   activeUserKeys={activeUserKeys}
  //                   inProgressSetter={inProgressSetter}
  //                   revealPrivateKeySetter={revealPrivateKeySetter}
  //                   revelPrivateKey={revelPrivateKey}
  //                   chatPrivKey={chatPrivKey}
  //                 />
  //                 {revelPrivateKey ? (
  //                   <div className="chats-messages-box">
  //                     <ManageChatKey noStrPrivKey={chatPrivKey} copyPrivateKey={copyPrivateKey} />
  //                   </div>
  //                 ) : (
  //                   //if any person has not joined any community then how can he see its message. handle this thing here.
  //                   <ChatsMessagesBox
  //                     {...props}
  //                     activeUserKeys={activeUserKeys}
  //                     deletePublicMessage={props.deletePublicMessage}
  //                   />
  //                 )}
  //               </>
  //             ) : (
  //               <h2>No private key</h2>
  //             )
  //           ) : (
  //             <div className="d-flex justify-content-center align-items-center full-page">
  //               <div className="no-chat text-center">
  //                 <p>You haven't joined the chat yet. Please join the chat to start chatting.</p>
  //                 <Button onClick={handleJoinChat}>
  //                   {showSpinner && (
  //                     <Spinner
  //                       animation="grow"
  //                       variant="light"
  //                       size="sm"
  //                       style={{ marginRight: "6px" }}
  //                     />
  //                   )}
  //                   Join Chat
  //                 </Button>
  //               </div>
  //             </div>
  //           )}
  //         </>
  //       )}
  //     </div>
  //     </ChatProvider>
  //   </>
  // );
  return (
    <ChatProvider>
      {(context) => (
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
                    <h2>No private key</h2>
                  )
                ) : (
                  <div className="d-flex justify-content-center align-items-center full-page">
                    <div className="no-chat text-center">
                      <p>
                        You haven't joined the chat yet. Please join the chat to start chatting.
                      </p>
                      <Button onClick={handleJoinChat}>
                        {showSpinner && (
                          <Spinner
                            animation="grow"
                            variant="light"
                            size="sm"
                            style={{ marginRight: "6px" }}
                          />
                        )}
                        Join Chat
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </ChatProvider>
  );
};
export default connect(pageMapStateToProps, pageMapDispatchToProps)(Chats);
