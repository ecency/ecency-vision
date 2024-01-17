import { _t } from "../../../i18n";
import ChatsProfileBox from "../components/chat-profile-box";
import React, { HTMLProps } from "react";
import { match } from "react-router";
import { classNameObject } from "../../../helper/class-name-object";

export function ChatsUserNotJoinedSection({
  match,
  className
}: HTMLProps<HTMLDivElement> & { match: match<{ username: string }> }) {
  return (
    <div
      className={classNameObject({
        "flex flex-col justify-center md:h-full items-center px-4": true,
        [className ?? ""]: !!className
      })}
    >
      <div className="font-bold">{_t("chat.welcome.oops")}</div>
      <div className="text-gray-600 dark:text-gray-400 mb-4">
        {_t("chat.welcome.user-not-joined-yet")}
      </div>
      <ChatsProfileBox currentUser={match.params.username} />
    </div>
  );
}
