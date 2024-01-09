import { isMessageGif } from "../utils";
import { Spinner } from "@ui/spinner";
import React, { useMemo, useRef, useState } from "react";
import { classNameObject } from "../../../helper/class-name-object";
import { renderPostBody } from "@ecency/render-helper";
import { useMappedStore } from "../../../store/use-mapped-store";
import { _t } from "../../../i18n";
import { ChatMessageChannelItemExtension } from "./chat-message-channel-item-extension";
import useMount from "react-use/lib/useMount";
import { Button } from "@ui/button";
import { failedMessageSvg } from "../../../img/svg";
import useDebounce from "react-use/lib/useDebounce";
import {
  Channel,
  DirectContact,
  isMessageImage,
  isSingleEmoji,
  Message,
  useKeysQuery,
  useResendMessage
} from "@ecency/ns-query";
import { format } from "date-fns";
import { useInViewport } from "react-in-viewport";

interface Props {
  type: "sender" | "receiver";
  message: Message;
  isSameUser: boolean;
  showDate?: boolean;
  currentContact?: DirectContact;
  currentChannel?: Channel;
  onContextMenu?: () => void;
  onAppear?: () => void;
  onInViewport?: (inViewport: boolean) => void;
  className?: string;
}

export function ChatMessageItem({
  type,
  message,
  isSameUser,
  currentContact,
  currentChannel,
  onContextMenu,
  onInViewport,
  onAppear,
  showDate = true,
  className = ""
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { global } = useMappedStore();
  const { publicKey } = useKeysQuery();

  const [holdStarted, setHoldStarted] = useState(false);

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

  const { mutateAsync: resendMessage } = useResendMessage(currentChannel, currentContact);
  const { inViewport } = useInViewport(ref);

  useMount(() => onAppear?.());

  useDebounce(
    () => {
      if (holdStarted) {
        setHoldStarted(false);
        onContextMenu?.();
      }
    },
    500,
    [holdStarted]
  );

  useDebounce(
    () => {
      onInViewport?.(inViewport);
    },
    500,
    [inViewport]
  );

  return (
    <div key={message.id} data-message-id={message.id} ref={ref}>
      <div
        className={classNameObject({
          "flex gap-1 px-4": true,
          "justify-start": type === "receiver",
          "justify-end": type === "sender",
          failed: isFailed,
          sending: isSending,
          "mb-4": showDate,
          "mb-1": !showDate,
          [className]: !!className
        })}
        onMouseDown={() => setHoldStarted(true)}
        onMouseUp={() => setHoldStarted(false)}
        onTouchStart={() => setHoldStarted(true)}
        onTouchEnd={() => setHoldStarted(false)}
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
              "duration-300": true,
              "text-sm p-2.5 rounded-b-2xl": !isGif && !isImage && !isEmoji,
              "bg-blue-dark-sky text-white rounded-tl-2xl": type === "sender" && !isEmoji,
              "bg-gray-200 dark:bg-gray-800 rounded-tr-2xl": type === "receiver" && !isEmoji,
              "max-w-[300px] rounded-2xl overflow-hidden": isGif || isImage || isEmoji,
              "same-user-message": isSameUser,
              "text-[4rem]": isEmoji,
              "scale-90": holdStarted && !!onContextMenu
            })}
          >
            <div
              className="sender-message-content"
              dangerouslySetInnerHTML={{ __html: renderedPreview }}
            />
          </div>
          {message.sent == 1 && showDate && (
            <div className="text-gray-600 dark:text-gray-400 text-xs px-2">
              {format(new Date(message.created * 1000), "HH:mm")}
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
