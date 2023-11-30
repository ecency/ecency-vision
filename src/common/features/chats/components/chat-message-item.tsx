import { formatMessageTime, isMessageGif, isMessageImage, isSingleEmoji } from "../utils";
import { Spinner } from "@ui/spinner";
import React, { useMemo } from "react";
import { classNameObject } from "../../../helper/class-name-object";
import { renderPostBody } from "@ecency/render-helper";
import { useMappedStore } from "../../../store/use-mapped-store";
import { _t } from "../../../i18n";
import { ChatMessageChannelItemExtension } from "./chat-message-channel-item-extension";
import { Channel, Message } from "../nostr";
import { useKeysQuery } from "../queries/keys-query";
import useMount from "react-use/lib/useMount";
import { Button } from "@ui/button";
import { failedMessageSvg } from "../../../img/svg";
import { useResendMessage } from "../mutations";

interface Props {
  type: "sender" | "receiver";
  message: Message;
  isSameUser: boolean;
  currentUser?: string;
  currentChannel?: Channel;
  onContextMenu?: () => void;
  onAppear?: () => void;
}

export function ChatMessageItem({
  type,
  message,
  isSameUser,
  currentUser,
  currentChannel,
  onContextMenu,
  onAppear
}: Props) {
  const { global } = useMappedStore();
  const { publicKey } = useKeysQuery();

  const isFailed = useMemo(() => message.sent === 2, [message]);
  const isSending = useMemo(() => message.sent === 0, [message]);
  const isGif = useMemo(() => isMessageGif(message.content), [message]);
  const isImage = useMemo(() => isMessageImage(message.content), [message]);
  const isEmoji = useMemo(() => isSingleEmoji(message.content), [message]);
  const renderedPreview = useMemo(
    () =>
      renderPostBody(message.content, false, global.canUseWebp)
        .replace(/<p[^>]*>/g, "")
        .replace(/<\/p>/g, ""),
    [message]
  );

  const { mutateAsync: resendMessage } = useResendMessage(currentChannel, currentUser);

  useMount(() => onAppear?.());

  return (
    <div key={message.id} data-message-id={message.id}>
      <div
        className={classNameObject({
          "flex gap-1 mb-4 px-4": true,
          "justify-start": type === "receiver",
          "justify-end": type === "sender",
          failed: isFailed,
          sending: isSending
        })}
        onContextMenu={(e) => {
          if (onContextMenu) {
            e.stopPropagation();
            e.preventDefault();
            onContextMenu();
          }
        }}
      >
        {currentChannel && message.creator !== publicKey && (
          <ChatMessageChannelItemExtension
            creator={message.creator}
            currentChannel={currentChannel}
          />
        )}
        <div
          className={classNameObject({
            "flex gap-1 flex-col": true,
            "items-start": type === "receiver",
            "items-end": type === "sender"
          })}
        >
          <div
            className={classNameObject({
              "text-sm p-2.5 rounded-b-2xl": !isGif && !isImage && !isEmoji,
              "bg-blue-dark-sky text-white rounded-tl-2xl": type === "sender" && !isEmoji,
              "bg-gray-200 dark:bg-gray-800 rounded-tr-2xl": type === "receiver" && !isEmoji,
              "max-w-[300px] rounded-2xl overflow-hidden": isGif || isImage || isEmoji,
              "same-user-message": isSameUser,
              "text-[4rem]": isEmoji
            })}
          >
            <div
              className="sender-message-content"
              dangerouslySetInnerHTML={{ __html: renderedPreview }}
            />
          </div>
          {message.sent == 1 && (
            <div className="text-gray-600 dark:text-gray-400 text-xs px-2">
              {formatMessageTime(message.created)}
            </div>
          )}
          {message.sent === 0 && <Spinner className="w-3 h-3 mx-2" />}
          {message.sent === 2 && (
            <div className="flex items-center gap-1">
              {failedMessageSvg}
              <Button
                size="xs"
                className="text-xs"
                appearance="link"
                noPadding={true}
                onClick={() => resendMessage(message)}
              >
                {_t("g.resend")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
