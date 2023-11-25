import React, { useEffect, useMemo, useState } from "react";
import { Zoom } from "medium-zoom";
import { useMappedStore } from "../../../store/use-mapped-store";
import usePrevious from "react-use/lib/usePrevious";
import { _t } from "../../../i18n";
import { Theme } from "../../../store/global/types";
import { checkContiguousMessage, formatMessageDateAndDay } from "../utils";
import { ChatMessageItem } from "./chat-message-item";
import { useKeysQuery } from "../queries/keys-query";
import { Dropdown, DropdownItemWithIcon, DropdownMenu } from "@ui/dropdown";
import { hideSvg, removeUserSvg } from "../../../img/svg";
import { useHideMessageInChannel, useUpdateChannelBlockedUsers } from "../mutations";
import { Spinner } from "@ui/spinner";
import { Channel, PublicMessage } from "../nostr";

interface Props {
  publicMessages: PublicMessage[];
  currentChannel: Channel;
  isScrollToBottom: boolean;
  isScrolled?: boolean;
  scrollToBottom?: () => void;
}

let zoom: Zoom | null = null;

export function ChatsChannelMessages({
  publicMessages,
  isScrollToBottom,
  isScrolled,
  currentChannel,
  scrollToBottom
}: Props) {
  const { global, activeUser } = useMappedStore();

  let prevGlobal = usePrevious(global);

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
    if (prevGlobal?.theme !== global.theme) {
      setBackground();
    }
    prevGlobal = global;
  }, [global.theme, activeUser]);

  useEffect(() => {
    if (!isScrollToBottom && messages.length !== 0 && !isScrolled) {
      scrollToBottom && scrollToBottom();
    }
  }, [messages, isScrollToBottom, channelMessagesRef]);

  const setBackground = () => {
    if (global.theme === Theme.day) {
      zoom?.update({ background: "#ffffff" });
    } else {
      zoom?.update({ background: "#131111" });
    }
  };

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