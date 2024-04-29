import React, { HTMLProps } from "react";

export function ChatReplyToMessageLayout(props: HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="bg-white bg-opacity-50 backdrop-blur border-t border-[--border-color] z-10 left-[-0.5rem] overflow-x-auto w-[calc(100%+0.5rem)] absolute bottom-[100%] flex gap-4"
    />
  );
}
