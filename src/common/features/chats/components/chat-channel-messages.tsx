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
  formatMessageDateAndDay,
  PublicMessage,
  useHideMessageInChannel,
  useKeysQuery,
  useUpdateChannelBlockedUsers
} from "@ecency/ns-query";

interface Props {
  publicMessages: PublicMessage[];
  currentChannel: Channel;
  isScrollToBottom: boolean;
  isScrolled?: boolean;
  scrollToBottom?: () => void;
}

export function ChatsChannelMessages({
  publicMessages,
  isScrollToBottom,
  isScrolled,
  currentChannel,
  scrollToBottom
}: Props) {
  const { activeUser } = useMappedStore();

  const channelMessagesRef = React.createRef<HTMLDivElement>();

  // Message where users interacted with context menu
  const [currentInteractingMessageId, setCurrentInteractingMessageId] = useState<string>();

  const { publicKey } = useKeysQuery();

  const { mutateAsync: updateBlockedUsers, isLoading: isUsersBlockingLoading } =
    useUpdateChannelBlockedUsers(currentChannel);
  const { mutateAsync: hideMessage, isLoading: isHideMessageLoading } =
    useHideMessageInChannel(currentChannel);

  const messages = useMemo(
    () =>
      publicMessages
        .filter((m) =>
          currentChannel.hiddenMessageIds ? !currentChannel.hiddenMessageIds.includes(m.id) : true
        )
        .filter((m) =>
          currentChannel.removedUserIds ? !currentChannel.removedUserIds.includes(m.creator) : true
        ),
    [publicMessages, currentChannel]
  );

  useEffect(() => {
    if (!isScrollToBottom && messages.length !== 0 && !isScrolled) {
      scrollToBottom && scrollToBottom();
    }
  }, [messages, isScrollToBottom, channelMessagesRef]);

  return (
    <>
      <div className="channel-messages" ref={channelMessagesRef}>
        {messages.map((message, i) => (
          <React.Fragment key={message.id}>
            {formatMessageDateAndDay(message, i, messages) && (
              <div className="custom-divider">
                <span className="flex justify-center items-center mt-3 text-gray-600 dark:text-gray-400 my-4 text-sm">
                  {formatMessageDateAndDay(message, i, messages)}
                </span>
              </div>
            )}

            <Dropdown
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
                  if (currentChannel.communityName === activeUser?.username) {
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
              />
              <DropdownMenu
                className="top-[70%]"
                align={message.creator === publicKey ? "right" : "left"}
              >
                <DropdownItemWithIcon
                  icon={isHideMessageLoading ? <Spinner className="w-3.5 h-3.5" /> : hideSvg}
                  label={_t("chat.hide-message")}
                  onClick={() =>
                    hideMessage({
                      hide:
                        currentChannel.hiddenMessageIds?.some((id) => id === message.id) === false,
                      messageId: message.id
                    })
                  }
                />
                <DropdownItemWithIcon
                  icon={
                    isUsersBlockingLoading ? <Spinner className="w-3.5 h-3.5" /> : removeUserSvg
                  }
                  label={_t("chat.block-author")}
                  onClick={() =>
                    updateBlockedUsers([...(currentChannel.removedUserIds ?? []), message.creator])
                  }
                />
              </DropdownMenu>
            </Dropdown>
          </React.Fragment>
        ))}
        {/*TODO: CHeck it in messages query*/}
        {false && (
          <span className="flex justify-center items-center mt-3">
            You have been blocked from this community
          </span>
        )}
      </div>
    </>
  );
}
