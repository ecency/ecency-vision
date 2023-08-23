import React from "react";
import { Form } from "react-bootstrap";
import { _t } from "../../i18n";
import { copyContent } from "../../img/svg";
import OrDivider from "../or-divider";
import Tooltip from "../tooltip";

import "./index.scss";

interface Props {
  noStrPrivKey: string;
  copyPrivateKey: (privKey: string) => void;
}

export default function ManageChatKey(props: Props) {
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
                value={props.noStrPrivKey}
              />
              <Tooltip content={_t("chat.copy-priv-key")}>
                <p
                  className="copy-svg"
                  onClick={() => {
                    props.copyPrivateKey(props.noStrPrivKey);
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
