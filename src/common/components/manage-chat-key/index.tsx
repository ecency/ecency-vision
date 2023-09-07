import React, { useContext } from "react";
import { Form } from "react-bootstrap";
import { _t } from "../../i18n";
import { copyContent } from "../../img/svg";
import { ChatContext } from "../chats/chat-provider";
import { copyToClipboard } from "../chats/utils";
import { success } from "../feedback";
import OrDivider from "../or-divider";
import Tooltip from "../tooltip";

import "./index.scss";

export default function ManageChatKey() {
  const context = useContext(ChatContext);

  const { chatPrivKey } = context;

  console.log("chatPrivKey in manage chat key", chatPrivKey);

  const copyPrivateKey = () => {
    copyToClipboard(chatPrivKey);
    success("Key copied into clipboad");
  };

  return (
    <>
      <div className="manage-chat-key">
        <div className="private-key">
          <Form.Group controlId="private-key">
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
                    console.log("SVG clicked");
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
