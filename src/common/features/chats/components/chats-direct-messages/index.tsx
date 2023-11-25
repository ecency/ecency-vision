import React, { useContext, useEffect, useState } from "react";
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
import { Button } from "@ui/button";
import { useInviteViaPostComment } from "../../mutations";
import { FormControl } from "@ui/input";
import { Alert } from "@ui/alert";

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

  const [initiatedInviting, setInitiatedInviting] = useState(false);
  const [invitationText, setInvitationText] = useState(
    "Hi! Let's start messaging. Follow to [Conversations](https://ecency.com/chats) and register an account."
  );
  let prevGlobal = usePrevious(global);

  const { publicKey } = useKeysQuery();

  const {
    mutateAsync: invite,
    isLoading: isInviting,
    isSuccess: isInvited
  } = useInviteViaPostComment(props.currentUser);

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
            {!isInvited &&
              (initiatedInviting ? (
                <div className="flex flex-col gap-4 items-center">
                  <Alert>{_t("chat.specify-invitation-message")}</Alert>
                  <FormControl
                    type="textarea"
                    value={invitationText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setInvitationText(e.target.value)
                    }
                  />
                  <Button
                    outline={true}
                    size="sm"
                    disabled={isInviting}
                    onClick={async () => {
                      await invite(invitationText);
                      setInitiatedInviting(false);
                    }}
                  >
                    {_t("chat.send-invite")}
                  </Button>
                </div>
              ) : (
                <Button outline={true} size="sm" onClick={() => setInitiatedInviting(true)}>
                  {_t("chat.invite")}
                </Button>
              ))}
            {isInvited && (
              <Alert className="my-4" appearance="success">
                {_t("chat.successfully-invited")}
              </Alert>
            )}
          </div>
        )}
      </div>
    </>
  );
}