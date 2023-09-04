import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { match } from "react-router";

import NavBar from "../../components/navbar";
import NavBarElectron from "../../../desktop/app/components/navbar";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import ChatsSideBar from "../../components/chats-sidebar/indes";
import ChatsMessagesBox from "../../components/chats-messages-box";

import "./index.scss";

import * as ls from "../../util/local-storage";
import {
  copyToClipboard,
  createNoStrAccount,
  getPrivateKey,
  getProfileMetaData,
  NostrKeysType,
  setProfileMetaData
} from "../../helper/chat-utils";
import { Button, Spinner } from "react-bootstrap";
import { setNostrkeys } from "../../../providers/message-provider";
import ManageChatKey from "../../components/manage-chat-key";
import Feedback, { success } from "../../components/feedback";

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
  const { channels, directContacts } = props.chat;

  const [marginTop, setMarginTop] = useState(0);
  const [activeUserKeys, setActiveUserKeys] = useState<NostrKeysType>();
  const [inProgrss, setInProgress] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [noStrPrivKey, setNoStrPrivKey] = useState("");
  const [revelPrivateKey, setRevealPrivateKey] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    console.log("noStrPrivKey", noStrPrivKey);
  }, [noStrPrivKey]);

  useEffect(() => {
    handleResize();
    getActiveUserChatKeys();
    const noStrPrivKey = getPrivateKey(props.activeUser?.username!);
    setNoStrPrivKey(noStrPrivKey);
  }, []);

  useEffect(() => {
    setInProgress(false);
  }, [activeUserKeys]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (inProgrss) {
      setTimeout(() => {
        setInProgress(false);
      }, 7000);
    }
  }, [inProgrss]);

  const handleResize = () => {
    const parentElemet = document.getElementById("sticky-container")?.getBoundingClientRect();
    if (parentElemet) {
      setMarginTop(parentElemet?.y + parentElemet?.height - 30);
    }
  };

  const getActiveUserChatKeys = async () => {
    setInProgress(true);
    const profileData = await getProfileMetaData(props.activeUser?.username!);
    const noStrPrivKey = getPrivateKey(props.activeUser?.username!);
    const activeUserKeys = {
      pub: profileData?.nsKey,
      priv: noStrPrivKey
    };
    setActiveUserKeys(activeUserKeys);
  };

  const inProgressSetter = (d: boolean) => {
    setInProgress(d);
  };

  const revealPrivateKeySetter = (d: boolean) => {
    setRevealPrivateKey(d);
  };

  const handleJoinChat = async () => {
    const { resetChat } = props;
    setShowSpinner(true);
    resetChat();
    const keys = createNoStrAccount();
    ls.set(`${props.activeUser?.username}_nsPrivKey`, keys.priv);
    setNoStrPrivKey(keys.priv);
    await setProfileMetaData(props.activeUser, keys.pub);
    // setHasUserJoinedChat(true);
    setNostrkeys(keys);
    window.messageService?.updateProfile({
      name: props.activeUser?.username!,
      about: "",
      picture: ""
    });
    setActiveUserKeys(keys);
    setShowSpinner(false);
  };

  const copyPrivateKey = () => {
    copyToClipboard(noStrPrivKey);
    success("Key copied into clipboad");
  };

  return (
    <>
      <Feedback activeUser={props.activeUser} />
      {props.global.isElectron ? <NavBarElectron {...props} /> : <NavBar history={props.history} />}
      <div
        style={{ marginTop: marginTop }}
        className={props.global.isElectron ? "chats-page mb-lg-0 pt-6" : "chats-page mb-lg-0"}
      >
        {inProgrss ? (
          <div className="d-flex justify-content-center align-items-center full-page">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            {activeUserKeys?.pub ? (
              noStrPrivKey ? (
                <>
                  <ChatsSideBar
                    {...props}
                    channels={channels}
                    directContacts={directContacts}
                    activeUserKeys={activeUserKeys}
                    inProgressSetter={inProgressSetter}
                    revealPrivateKeySetter={revealPrivateKeySetter}
                    revelPrivateKey={revelPrivateKey}
                    chatPrivKey={noStrPrivKey}
                  />
                  {revelPrivateKey ? (
                    <div className="chats-messages-box">
                      <ManageChatKey noStrPrivKey={noStrPrivKey} copyPrivateKey={copyPrivateKey} />
                    </div>
                  ) : (
                    //if any person has not joined any community then how can he see its message. handle this thing here.
                    <ChatsMessagesBox
                      {...props}
                      activeUserKeys={activeUserKeys}
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
                  <p>You haven't joined the chat yet. Please join the chat to start chatting.</p>
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
  );
};
export default connect(pageMapStateToProps, pageMapDispatchToProps)(Chats);
