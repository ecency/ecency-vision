import React, { useEffect, useRef } from "react";
import { DirectMessage } from "../../../providers/message-provider-types";
import mediumZoom, { Zoom } from "medium-zoom";
import { Global, Theme } from "../../store/global/types";
import {
  formatMessageTime,
  getFormattedDateAndDay,
  isMessageGif,
  isMessageImage,
  NostrKeysType
} from "../../helper/chat-utils";
import { renderPostBody } from "@ecency/render-helper";
import { useMappedStore } from "../../store/use-mapped-store";
import { Link } from "react-router-dom";
import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";
import { failedMessageSvg, resendMessageSvg } from "../../img/svg";
import { Spinner } from "react-bootstrap";

import "./index.scss";
import { ActiveUser } from "../../store/active-user/types";

interface Props {
  directMessages: DirectMessage[];
  activeUserKeys: NostrKeysType;
  currentUser: string;
  global: Global;
  activeUser: ActiveUser | null;
  isScrollToBottom: boolean;
  isScrolled?: boolean;
  scrollToBottom?: () => void;
}

let zoom: Zoom | null = null;
export default function ChatsDirectMessages(props: Props) {
  const {
    directMessages,
    activeUserKeys,
    currentUser,
    isScrolled,
    global,
    isScrollToBottom,
    activeUser,
    scrollToBottom
  } = props;
  const { chat } = useMappedStore();

  const prevPropsRef = useRef(props);

  useEffect(() => {
    const prevProps = prevPropsRef.current;
    if (prevProps.global.theme !== global.theme) {
      setBackground();
    }
    prevPropsRef.current = props;
  }, [global.theme, activeUser]);

  useEffect(() => {
    if (directMessages && directMessages.length !== 0) {
      zoomInitializer();
    }
    if (!isScrollToBottom && directMessages && directMessages.length !== 0 && !isScrolled) {
      scrollToBottom && scrollToBottom();
    }
  }, [directMessages, isScrollToBottom, scrollToBottom]);

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

  return (
    <div className="direct-messages">
      {directMessages &&
        directMessages.map((msg, i) => {
          const dayAndMonth = getFormattedDateAndDay(msg, i, directMessages);
          let renderedPreview = renderPostBody(msg.content, false, global.canUseWebp);

          renderedPreview = renderedPreview.replace(/<p[^>]*>/g, "");
          renderedPreview = renderedPreview.replace(/<\/p>/g, "");

          const isGif = isMessageGif(msg.content);

          const isImage = isMessageImage(msg.content);

          return (
            <React.Fragment key={msg.id}>
              {dayAndMonth !== null && (
                <span className="d-flex justify-content-center align-items-center mt-3 day-and-month">
                  {dayAndMonth}
                </span>
              )}
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
    </div>
  );
}
