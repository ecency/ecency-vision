import React, { useEffect, useMemo, useState } from "react";
import "./index.scss";
import { ChatMessageItem } from "../chat-message-item";
import {
  checkContiguousMessage,
  DirectContact,
  DirectMessage,
  Message,
  useDirectMessagesQuery,
  useKeysQuery
} from "@ecency/ns-query";
import { ChatFloatingDate } from "../chat-floating-date";
import { differenceInCalendarDays } from "date-fns";
import { groupMessages } from "../../utils";
import useDebounce from "react-use/lib/useDebounce";
import { Dropdown, DropdownItemWithIcon, DropdownMenu } from "@ui/dropdown";
import { UilCommentAltMessage, UilMessage } from "@iconscout/react-unicons";
import { _t } from "../../../../i18n";
import { ForwardMessageDialog } from "../forward-message-dialog";

interface Props {
  directMessages: DirectMessage[];
  currentContact: DirectContact;
  isPage?: boolean;
}

export default function ChatsDirectMessages(props: Props) {
  const { directMessages } = props;

  const [needFetchNextPage, setNeedFetchNextPage] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message>();

  const { publicKey } = useKeysQuery();
  const directMessagesQuery = useDirectMessagesQuery(props.currentContact);

  // Message where users interacted with context menu
  const [currentInteractingMessageId, setCurrentInteractingMessageId] = useState<string>();

  const groupedDirectMessages = useMemo(() => groupMessages(directMessages), [directMessages]);

  useDebounce(
    () => {
      if (needFetchNextPage) {
        directMessagesQuery.fetchNextPage();
      }
    },
    500,
    [needFetchNextPage]
  );

  useEffect(() => {
    if (directMessages.length === 0) {
      directMessagesQuery.refetch();
    }
  }, [directMessages]);

  return (
    <>
      <div className="direct-messages">
        {groupedDirectMessages?.map(([date, messages], i) => {
          const diff = i > 0 ? differenceInCalendarDays(date, groupedDirectMessages[i - 1][0]) : 1;
          return (
            <React.Fragment key={date.getTime()}>
              {diff > 0 && <ChatFloatingDate currentDate={date} isPage={props.isPage} />}
              {messages.map((message, j) => (
                <Dropdown
                  key={message.id}
                  closeOnClickOutside={true}
                  show={currentInteractingMessageId === message.id}
                  setShow={(v) =>
                    setCurrentInteractingMessageId(v ? currentInteractingMessageId : undefined)
                  }
                >
                  <ChatMessageItem
                    showDate={j === messages.length - 1}
                    key={message.id}
                    currentContact={props.currentContact}
                    type={message.creator !== publicKey ? "receiver" : "sender"}
                    message={message}
                    isSameUser={checkContiguousMessage(message, i, directMessages)}
                    onContextMenu={() => setCurrentInteractingMessageId(message.id)}
                    onAppear={() =>
                      setTimeout(
                        () =>
                          groupedDirectMessages?.length - 1 === i && messages.length - 1 === j
                            ? document
                                .querySelector(`[data-message-id="${message.id}"]`)
                                ?.scrollIntoView({ block: "nearest" })
                            : {},
                        300
                      )
                    }
                    onInViewport={(inViewport) =>
                      i === 0 && j === 0 && setNeedFetchNextPage(inViewport)
                    }
                  />
                  <DropdownMenu
                    size="small"
                    className="top-[70%]"
                    align={message.creator === publicKey ? "right" : "left"}
                  >
                    <DropdownItemWithIcon
                      icon={<UilMessage />}
                      label={_t("chat.forward")}
                      onClick={() => setForwardingMessage(message)}
                    />
                    <DropdownItemWithIcon
                      icon={<UilCommentAltMessage />}
                      label={_t("chat.reply")}
                      onClick={() => {}}
                    />
                  </DropdownMenu>
                </Dropdown>
              ))}
            </React.Fragment>
          );
        })}
        <ForwardMessageDialog
          message={forwardingMessage!!}
          show={!!forwardingMessage}
          setShow={() => setForwardingMessage(undefined)}
        />
      </div>
    </>
  );
}
