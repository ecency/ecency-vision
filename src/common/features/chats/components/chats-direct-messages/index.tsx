import React, { useMemo, useState } from "react";
import "./index.scss";
import { ChatMessageItem } from "../chat-message-item";
import {
  checkContiguousMessage,
  DirectContact,
  DirectMessage,
  useDirectMessagesQuery,
  useKeysQuery
} from "@ecency/ns-query";
import { ChatFloatingDate } from "../chat-floating-date";
import { differenceInCalendarDays } from "date-fns";
import { groupMessages } from "../../utils";
import useDebounce from "react-use/lib/useDebounce";

interface Props {
  directMessages: DirectMessage[];
  currentContact: DirectContact;
  isPage?: boolean;
}

export default function ChatsDirectMessages(props: Props) {
  const { directMessages } = props;

  const [needFetchNextPage, setNeedFetchNextPage] = useState(false);
  const { publicKey } = useKeysQuery();
  const directMessagesQuery = useDirectMessagesQuery(props.currentContact);

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

  return (
    <>
      <div className="direct-messages">
        {groupedDirectMessages?.map(([date, messages], i) => {
          const diff = i > 0 ? differenceInCalendarDays(date, groupedDirectMessages[i - 1][0]) : 1;
          return (
            <React.Fragment key={date.getTime()}>
              {diff > 0 && <ChatFloatingDate currentDate={date} isPage={props.isPage} />}
              {messages.map((message, j) => (
                <ChatMessageItem
                  showDate={j === messages.length - 1}
                  key={message.id}
                  currentContact={props.currentContact}
                  type={message.creator !== publicKey ? "receiver" : "sender"}
                  message={message}
                  isSameUser={checkContiguousMessage(message, i, directMessages)}
                  onAppear={() =>
                    setTimeout(
                      () =>
                        groupedDirectMessages?.length - 1 === i && messages.length - 1 === j
                          ? document
                              .querySelector(`[data-message-id="${message.id}"]`)
                              ?.scrollIntoView()
                          : {},
                      300
                    )
                  }
                  onInViewport={(inViewport) =>
                    i === 0 && j === 0 && setNeedFetchNextPage(inViewport)
                  }
                />
              ))}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}
