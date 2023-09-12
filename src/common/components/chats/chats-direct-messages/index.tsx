import React, { useContext, useEffect, useRef } from "react";
import { DirectMessage } from "../../../../managers/message-manager-types";
import mediumZoom, { Zoom } from "medium-zoom";
import { Global, Theme } from "../../../store/global/types";
import {
  formatMessageTime,
  formatMessageDate,
  isMessageGif,
  isMessageImage,
  getUserChatPublicKey
} from "../utils";
import { renderPostBody } from "@ecency/render-helper";
import { useMappedStore } from "../../../store/use-mapped-store";
import { Link } from "react-router-dom";
import UserAvatar from "../../user-avatar";
import Tooltip from "../../tooltip";
import { failedMessageSvg, resendMessageSvg } from "../../../img/svg";
import { Spinner } from "react-bootstrap";

import "./index.scss";
import { ActiveUser } from "../../../store/active-user/types";
import usePrevious from "react-use/lib/usePrevious";
import { NostrKeysType } from "../types";
import { _t } from "../../../i18n";

interface Props {
  directMessages: DirectMessage[];
  activeUserKeys: NostrKeysType;
  currentUser: string;
  isScrollToBottom: boolean;
  isScrolled?: boolean;
  receiverPubKey: string;
  scrollToBottom?: () => void;
}

let zoom: Zoom | null = null;
export default function ChatsDirectMessages(props: Props) {
  const {
    directMessages,
    activeUserKeys,
    currentUser,
    isScrolled,
    receiverPubKey,
    isScrollToBottom,
    scrollToBottom
  } = props;

  const { chat, global, activeUser } = useMappedStore();

  console.log("directMessages", directMessages);

  let prevGlobal = usePrevious(global);

  useEffect(() => {
    if (prevGlobal?.theme !== global.theme) {
      setBackground();
    }
    prevGlobal = global;
  }, [global.theme, activeUser]);

  useEffect(() => {
    if (directMessages && directMessages.length !== 0) {
      zoomInitializer();
    }
    if (!isScrollToBottom && directMessages && directMessages.length !== 0 && !isScrolled) {
      scrollToBottom && scrollToBottom();
    }
  }, [directMessages, isScrollToBottom, scrollToBottom, receiverPubKey]);

  const zoomInitializer = () => {
    const elements: HTMLElement[] = [...document.querySelectorAll<HTMLElement>(".chat-image img")];
    zoom = mediumZoom(elements);
    setBackground();
  };

  const setBackground = () => {
    if (global.theme === Theme.day) {
      zoom?.update({ background: "#ffffff" });
    } else {
      zoom?.update({ background: "#131111" });
    }
  };

  const getFormattedDateAndDay = (msg: DirectMessage, i: number) => {
    const prevMsg = directMessages[i - 1];
    const msgDate = formatMessageDate(msg.created);
    const prevMsgDate = prevMsg ? formatMessageDate(prevMsg.created) : null;
    if (msgDate !== prevMsgDate) {
      return (
        <div className="custom-divider">
          <span className="d-flex justify-content-center align-items-center mt-3 custom-divider-text">
            {msgDate}
          </span>
        </div>
      );
    }
    return <></>;
  };

  return (
    <div className="direct-messages">
      {receiverPubKey ? (
        <>
          {directMessages &&
            directMessages.map((msg, i) => {
              const dayAndMonth = getFormattedDateAndDay(msg, i);
              let renderedPreview = renderPostBody(msg.content, false, global.canUseWebp);

              renderedPreview = renderedPreview.replace(/<p[^>]*>/g, "");
              renderedPreview = renderedPreview.replace(/<\/p>/g, "");

              const isGif = isMessageGif(msg.content);

              const isImage = isMessageImage(msg.content);

              return (
                <React.Fragment key={msg.id}>
                  {dayAndMonth}
                  {msg.creator !== activeUserKeys?.pub ? (
                    <div key={msg.id} className="receiver">
                      <div className="user-img">
                        <Link to={`/@${currentUser}`}>
                          <span>
                            <UserAvatar username={currentUser} size="medium" />
                          </span>
                        </Link>
                      </div>
                      <div className="user-info">
                        <p className="user-msg-time">{formatMessageTime(msg.created)}</p>

                        <div className="receiver-messag">
                          <div
                            className={`receiver-message-content ${isGif ? "gif" : ""} ${
                              isImage ? "chat-image" : ""
                            }`}
                            dangerouslySetInnerHTML={{ __html: renderedPreview }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="sender">
                      <p className="sender-message-time">{formatMessageTime(msg.created)}</p>
                      <div
                        className={`sender-message ${
                          msg.sent === 2 ? "failed" : msg.sent === 0 ? "sending" : ""
                        }`}
                      >
                        {msg.sent === 2 && (
                          <Tooltip content={"Resend"}>
                            <span
                              className="resend-svg"
                              onClick={() => {
                                // setKeyDialog(true);
                                // setStep(11);
                                // setResendMessage(msg);
                              }}
                            >
                              {resendMessageSvg}
                            </span>
                          </Tooltip>
                        )}
                        <div
                          className={`sender-message-content ${isGif ? "gif" : ""} ${
                            isImage ? "chat-image" : ""
                          }`}
                          dangerouslySetInnerHTML={{ __html: renderedPreview }}
                        />
                        {msg.sent === 0 && (
                          <span style={{ margin: "10px 0 0 5px" }}>
                            <Spinner animation="border" variant="primary" size="sm" />
                          </span>
                        )}
                        {msg.sent === 2 && (
                          <Tooltip content={"Failed"}>
                            <span className="failed-svg">{failedMessageSvg}</span>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
        </>
      ) : (
        <p className="not-joined">{_t("chat.not-joined")}</p>
      )}
    </div>
  );
}
