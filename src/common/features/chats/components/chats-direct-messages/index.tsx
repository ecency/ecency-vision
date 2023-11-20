import React, { useContext, useEffect } from "react";
import usePrevious from "react-use/lib/usePrevious";
import mediumZoom, { Zoom } from "medium-zoom";
import { checkContiguousMessage, formatMessageDateAndDay } from "../../utils";
import { Theme } from "../../../../store/global/types";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { ChatContext } from "../../chat-context-provider";
import { _t } from "../../../../i18n";
import "./index.scss";
import { ChatMessageItem } from "../chat-message-item";
import { useKeysQuery } from "../../queries/keys-query";
import { DirectMessage } from "../../nostr";

interface Props {
  directMessages: DirectMessage[];
  currentUser: string;
  isScrollToBottom: boolean;
  isScrolled?: boolean;
  scrollToBottom?: () => void;
}

let zoom: Zoom | null = null;
export default function ChatsDirectMessages(props: Props) {
  const { directMessages, isScrolled, isScrollToBottom, scrollToBottom } = props;

  const { global, activeUser } = useMappedStore();
  const { receiverPubKey } = useContext(ChatContext);

  let prevGlobal = usePrevious(global);

  const { publicKey } = useKeysQuery();

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
                    type={msg.creator !== publicKey ? "receiver" : "sender"}
                    message={msg}
                    isSameUser={checkContiguousMessage(msg, i, directMessages)}
                  />
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <div className="flex flex-col justify-center text-center items-center p-4">
            <div className="font-bold">{_t("chat.welcome.oops")}</div>
            <div className="text-gray-600 dark:text-gray-400 mb-4">
              {_t("chat.welcome.user-not-joined-yet")}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
