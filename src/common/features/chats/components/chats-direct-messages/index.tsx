import React, { useContext, useEffect, useState } from "react";
import usePrevious from "react-use/lib/usePrevious";
import mediumZoom, { Zoom } from "medium-zoom";
import { checkContiguousMessage, formatMessageDateAndDay } from "../../utils";
import { Theme } from "../../../../store/global/types";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { ChatContext } from "../../chat-context-provider";
import { _t } from "../../../../i18n";
import "./index.scss";
import ChatsConfirmationModal from "../chats-confirmation-modal";
import { DirectMessage } from "../../managers/message-manager-types";
import { ChatMessageItem } from "../chat-message-item";

interface Props {
  directMessages: DirectMessage[];
  currentUser: string;
  isScrollToBottom: boolean;
  isScrolled?: boolean;
  scrollToBottom?: () => void;
}

let zoom: Zoom | null = null;
export default function ChatsDirectMessages(props: Props) {
  const { directMessages, currentUser, isScrolled, isScrollToBottom, scrollToBottom } = props;

  const { global, activeUser, deleteDirectMessage } = useMappedStore();
  const { activeUserKeys, messageServiceInstance, receiverPubKey } = useContext(ChatContext);

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
            {directMessages?.map((msg, i) => {
              const dayAndMonth = formatMessageDateAndDay(msg, i, directMessages);
              return (
                <React.Fragment key={msg.id}>
                  {dayAndMonth && (
                    <div className="custom-divider">
                      <span className="flex justify-center items-center mt-3 custom-divider-text">
                        {dayAndMonth}
                      </span>
                    </div>
                  )}
                  <ChatMessageItem
                    type={msg.creator !== activeUserKeys?.pub ? "receiver" : "sender"}
                    message={msg}
                    isSameUser={checkContiguousMessage(msg, i, directMessages)}
                  />
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
