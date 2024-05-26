import React from "react";
import { Message, useNostrGetUserProfileQuery } from "@ecency/ns-query";
import { classNameObject } from "@ui/util";
import i18next from "i18next";
import { ProfileLink } from "@/features/shared";

interface Props {
  message: Message;
  type: "receiver" | "sender";
}

export function ChatMessageForwardingLabel({ message, type }: Props) {
  const { data: nostrForwardedUserProfiles } = useNostrGetUserProfileQuery(message.forwardedFrom);

  return message.forwardedFrom ? (
    <div
      className={classNameObject({
        "text-xs text-gray-300": true,
        "dark:text-gray-700": type === "receiver"
      })}
    >
      {i18next.t("chat.forwarded-from")}
      {nostrForwardedUserProfiles?.[0]?.name && (
        <ProfileLink target="_blank" username={nostrForwardedUserProfiles?.[0]?.name}>
          <span
            className={classNameObject({
              "text-xs text-gray-300": true,
              "dark:text-gray-700": type === "receiver"
            })}
          >
            ({nostrForwardedUserProfiles[0].name})
          </span>
        </ProfileLink>
      )}
    </div>
  ) : (
    <></>
  );
}
