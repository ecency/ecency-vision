import { ChatsProfileBox } from "@/app/chats/_components/chat-profile-box";
import React, { HTMLProps } from "react";
import { classNameObject } from "@ui/util";
import i18next from "i18next";

export function ChatsUserNotJoinedSection({
  username,
  className
}: HTMLProps<HTMLDivElement> & { username: string }) {
  return (
    <div
      className={classNameObject({
        "flex flex-col justify-center md:h-full items-center px-4": true,
        [className ?? ""]: !!className
      })}
    >
      <div className="font-bold">{i18next.t("chat.welcome.oops")}</div>
      <div className="text-gray-600 text-center dark:text-gray-400 mb-4">
        {i18next.t("chat.welcome.user-not-joined-yet")}
      </div>
      <ChatsProfileBox currentUser={username} />
    </div>
  );
}
