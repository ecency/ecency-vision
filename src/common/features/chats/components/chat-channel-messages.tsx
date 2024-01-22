import React, { useEffect, useMemo, useState } from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { _t } from "../../../i18n";
import { ChatMessageItem } from "./chat-message-item";
import { Dropdown, DropdownItemWithIcon, DropdownMenu } from "@ui/dropdown";
import { hideSvg, removeUserSvg } from "../../../img/svg";
import { Spinner } from "@ui/spinner";
import {
  Channel,
  checkContiguousMessage,
  PublicMessage,
  useHideMessageInChannel,
  useKeysQuery,
  usePublicMessagesQuery,
  useUpdateChannelBlockedUsers
} from "@ecency/ns-query";
import { groupMessages } from "../utils";
import { ChatFloatingDate } from "./chat-floating-date";
import { differenceInCalendarDays } from "date-fns";
import useDebounce from "react-use/lib/useDebounce";

interface Props {
  publicMessages: PublicMessage[];
  currentChannel: Channel;
  isPage?: boolean;
}

export function ChatsChannelMessages({ publicMessages, currentChannel, isPage }: Props) {
  const { activeUser } = useMappedStore();

  const channelMessagesRef = React.createRef<HTMLDivElement>();

  // Message where users interacted with context menu
  const [currentInteractingMessageId, setCurrentInteractingMessageId] = useState<string>();
  const [needFetchNextPage, setNeedFetchNextPage] = useState(false);

  const { publicKey } = useKeysQuery();
  const { fetchNextPage, refetch } = usePublicMessagesQuery(currentChannel);

  const { mutateAsync: updateBlockedUsers, isLoading: isUsersBlockingLoading } =
    useUpdateChannelBlockedUsers(currentChannel);
  const { mutateAsync: hideMessage, isLoading: isHideMessageLoading } =
    useHideMessageInChannel(currentChannel);

  const messages = useMemo(
    () => publicMessages,
    // todo
    // publicMessages.filter((m) =>
    //   currentChannel?.removedUserIds ? !currentChannel.removedUserIds.includes(m.creator) : true
    // ),
    [publicMessages, currentChannel]
  );
  const groupedMessages = useMemo(() => groupMessages(messages), [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      refetch();
    }
  }, [messages]);

  useDebounce(
    () => {
      if (needFetchNextPage) {
        fetchNextPage();
      }
    },
    500,
    [needFetchNextPage]
  );

  return (
    <>
      <div className="channel-messages" ref={channelMessagesRef}>
        {groupedMessages.map(([date, group], i) => (
          <React.Fragment key={date.getTime()}>
            {(i > 0 ? differenceInCalendarDays(date, groupedMessages[i - 1][0]) : 1) ? (
              <ChatFloatingDate key={date.getTime()} currentDate={date} isPage={isPage} />
            ) : (
              <></>
            )}
            {group.map((message, j) => (
              <>
                <Dropdown
                  key={message.id}
                  show={currentInteractingMessageId === message.id}
                  setShow={(v) =>
                    setCurrentInteractingMessageId(v ? currentInteractingMessageId : undefined)
                  }
                >
                  <ChatMessageItem
                    currentChannel={currentChannel}
                    type={message.creator !== publicKey ? "receiver" : "sender"}
                    message={message}
                    isSameUser={checkContiguousMessage(message, i, messages)}
                    onContextMenu={() => {
                      if (currentChannel?.communityName === activeUser?.username) {
                        setCurrentInteractingMessageId(message.id);
                      }
                    }}
                    onAppear={() =>
                      setTimeout(
                        () =>
                          publicMessages?.length - 1 === i
                            ? document
                                .querySelector(`[data-message-id="${message.id}"]`)
                                ?.scrollIntoView()
                            : {},
                        100
                      )
                    }
                    onInViewport={(inViewport) =>
                      i === 0 && j === 0 && setNeedFetchNextPage(inViewport)
                    }
                  />
                  <DropdownMenu
                    className="top-[70%]"
                    align={message.creator === publicKey ? "right" : "left"}
                  >
                    <DropdownItemWithIcon
                      icon={isHideMessageLoading ? <Spinner className="w-3.5 h-3.5" /> : hideSvg}
                      label={_t("chat.hide-message")}
                      onClick={
                        () => {}
                        // todo
                        // hideMessage({
                        //   hide:
                        //     currentChannel?.hiddenMessageIds?.some((id) => id === message.id) ===
                        //     false,
                        //   messageId: message.id
                        // })
                      }
                    />
                    <DropdownItemWithIcon
                      icon={
                        isUsersBlockingLoading ? <Spinner className="w-3.5 h-3.5" /> : removeUserSvg
                      }
                      label={_t("chat.block-author")}
                      onClick={
                        () => {}
                        // todo
                        // updateBlockedUsers([
                        //   ...(currentChannel?.removedUserIds ?? []),
                        //   message.creator
                        // ])
                      }
                    />
                  </DropdownMenu>
                </Dropdown>
              </>
            ))}
          </React.Fragment>
        ))}
        // todo
        {/*{currentChannel?.removedUserIds?.includes(activeUser?.username!!) && (*/}
        {/*  <span className="flex justify-center items-center mt-3">*/}
        {/*    You have been blocked from this community*/}
        {/*  </span>*/}
        {/*)}*/}
      </div>
    </>
  );
}
