import React, { useMemo } from "react";
import { Message, useNostrGetUserProfileQuery } from "@ecency/ns-query";
import { useFocusOnMessageById } from "./hooks";
import { classNameObject } from "@ui/util";

interface Props {
  message: Message;
  type: "receiver" | "sender";
}

export function ChatMessageRepliedLabel({ message, type }: Props) {
  const { focus } = useFocusOnMessageById(message.parentMessage?.id);

  const { data: nostrUserProfiles } = useNostrGetUserProfileQuery(message?.creator);
  const profile = useMemo(
    () => nostrUserProfiles?.find((p) => p.creator === message?.creator),
    [nostrUserProfiles, message?.creator]
  );

  return message.parentMessage ? (
    <div
      className={classNameObject({
        "rounded-b-xl py-1 px-3 mb-1.5 truncate cursor-pointer": true,
        "bg-blue-dark-sky-010 text-white rounded-tl-xl dark:blue-dark-sky-active":
          type === "sender",
        "bg-gray-300 dark:bg-gray-700 rounded-tr-xl": type === "receiver"
      })}
      onClick={() => focus()}
    >
      <div className="text-xs font-semibold">{profile?.name}</div>
      <div className="text-xs">{message.parentMessage.content}</div>
    </div>
  ) : (
    <></>
  );
}
