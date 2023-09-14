import React, { useContext, useEffect, useState } from "react";
import usePrevious from "react-use/lib/usePrevious";
import mediumZoom, { Zoom } from "medium-zoom";
import { Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { formatMessageTime, formatMessageDate, isMessageGif, isMessageImage } from "../utils";

import { Theme } from "../../../store/global/types";
import { DirectMessage } from "../../../../managers/message-manager-types";

import { useMappedStore } from "../../../store/use-mapped-store";

import UserAvatar from "../../user-avatar";
import Tooltip from "../../tooltip";
import { ChatContext } from "../chat-context-provider";

import { failedMessageSvg, resendMessageSvg } from "../../../img/svg";

import { renderPostBody } from "@ecency/render-helper";
import { _t } from "../../../i18n";

import "./index.scss";
import ChatsConfirmationModal from "../chats-confirmation-modal";

interface Props {
  directMessages: DirectMessage[];
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
    currentUser,
    isScrolled,
    receiverPubKey,
    isScrollToBottom,
    scrollToBottom
  } = props;

  const { chat, global, activeUser, deleteDirectMessage } = useMappedStore();
  const { activeUserKeys, messageServiceInstance } = useContext(ChatContext);

  console.log("directMessages", directMessages);

  let prevGlobal = usePrevious(global);
  const [step, setStep] = useState(0);
  const [resendMessage, setResendMessage] = useState<DirectMessage>();

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

  const handleConfirm = () => {
    switch (step) {
      case 1:
        if (resendMessage) {
          deleteDirectMessage(receiverPubKey, resendMessage?.id);
          messageServiceInstance?.sendDirectMessage(receiverPubKey!, resendMessage.content);
        }
        break;
      default:
        break;
    }
    setStep(0);
  };

  return (
    <>
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
                                  setStep(1);
                                  setResendMessage(msg);
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
      {step !== 0 && (
        <ChatsConfirmationModal
          actionType={"Confirmation"}
          content={"Are you sure?"}
          onClose={() => {
            setStep(0);
          }}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
