import React, { HTMLProps } from "react";
import "./_chat-reply-message.scss";

export function ChatReplyToMessageLayout(props: HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="bg-white border-t border-[--border-color] z-10 left-[-0.5rem] overflow-x-auto w-[calc(100%+0.5rem)] absolute bottom-[100%] flex gap-4"
    />
  );
}
