import { classNameObject } from "../../../../helper/class-name-object";
import React from "react";
import { DirectContact, Message } from "@ecency/ns-query";

interface Props {
  message: Message;
  currentContact?: DirectContact;
  type: "receiver" | "sender";
}

export function ChatMessageRepliedLabel({ message, currentContact, type }: Props) {
  return message.parentMessage && currentContact ? (
    <div
      className={classNameObject({
        "rounded-b-xl py-1 px-3 mb-1.5 truncate": true,
        "bg-blue-dark-sky-010 text-white rounded-tl-xl dark:blue-dark-sky-active":
          type === "sender",
        "bg-gray-300 dark:bg-gray-700 rounded-tr-xl": type === "receiver"
      })}
    >
      <div className="text-xs font-semibold">{currentContact?.name}</div>
      <div className="text-xs">{message.parentMessage.content}</div>
    </div>
  ) : (
    <></>
  );
}
