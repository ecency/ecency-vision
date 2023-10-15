import React, { useContext } from "react";
import { _t } from "../../../i18n";
import { History } from "history";
import { expandSideBar } from "../../../img/svg";
import { ChatContext } from "../chat-context-provider";
import "./index.scss";
import { InputGroupCopyClipboard } from "@ui/input";

interface Props {
  history: History;
}

export default function ManageChatKey({ history }: Props) {
  const context = useContext(ChatContext);
  const { chatPrivKey, windowWidth, setShowSideBar } = context;

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
          <div className="mb-4" style={{ width: "39vw" }}>
            <div>{_t("chat.chat-priv-key")}</div>
            <InputGroupCopyClipboard value={chatPrivKey} />
          </div>
        </div>
        {/* <OrDivider /> */}
      </div>
    </>
  );
}
