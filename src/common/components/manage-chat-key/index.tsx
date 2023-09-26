import React, { useContext } from "react";
import { Form } from "react-bootstrap";
import { _t } from "../../i18n";
import { History } from "history";
import { copyContent, expandSideBar } from "../../img/svg";
import { ChatContext } from "../chats/chat-context-provider";
import { copyToClipboard } from "../chats/utils";
import { success } from "../feedback";
import Tooltip from "../tooltip";

import "./index.scss";

interface Props {
  history: History;
}

export default function ManageChatKey(props: Props) {
  const context = useContext(ChatContext);

  console.log("Props", props.history);

  const { chatPrivKey, windowWidth, setShowSideBar } = context;

  const { history } = props;

  const copyPrivateKey = () => {
    copyToClipboard(chatPrivKey);
    success("Key copied into clipboad");
  };

  return (
    <>
      <div className="manage-chat-key">
        <div className="private-key d-flex">
          {windowWidth < 768 && history.location.pathname.includes("/chats") && (
            <div className="expand-icon d-md-none">
              <p className="expand-svg" onClick={() => setShowSideBar(true)}>
                {expandSideBar}
              </p>
            </div>
          )}
          <Form.Group controlId="private-key" style={{ width: "39vw" }}>
            <Form.Label>{_t("chat.chat-priv-key")}</Form.Label>
            <div className="d-flex private-key-input">
              <Form.Control
                className="chat-priv-key"
                type="text"
                readOnly={true}
                value={chatPrivKey}
              />
              <Tooltip content={_t("chat.copy-priv-key")}>
                <p
                  className="copy-svg"
                  onClick={() => {
                    copyPrivateKey();
                  }}
                >
                  {copyContent}
                </p>
              </Tooltip>
            </div>
          </Form.Group>
        </div>
        {/* <OrDivider /> */}
      </div>
    </>
  );
}
