import { savedMessagesSvg } from "../../../../img/svg";
import React from "react";

export function ChatSidebarSavedMessagesAvatar({
  width = 40,
  height = 40
}: {
  width?: number;
  height?: number;
}) {
  return (
    <div
      className="text-white flex items-center justify-center bg-gradient-to-tl rounded-full from-blue-dark-sky to-blue-dark-sky-010"
      style={{
        width,
        height
      }}
    >
      {savedMessagesSvg}
    </div>
  );
}
