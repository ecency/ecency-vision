import { classNameObject } from "../../../../helper/class-name-object";
import { _t } from "../../../../i18n";
import ProfileLink from "../../../../components/profile-link";
import { history } from "../../../../store";
import React from "react";
import { Message, useNostrGetUserProfileQuery } from "@ecency/ns-query";
import { useMappedStore } from "../../../../store/use-mapped-store";

interface Props {
  message: Message;
  type: "receiver" | "sender";
}

export function ChatMessageForwardingLabel({ message, type }: Props) {
  const { addAccount } = useMappedStore();

  const { data: nostrForwardedUserProfiles } = useNostrGetUserProfileQuery(message.forwardedFrom);

  return message.forwardedFrom ? (
    <div
      className={classNameObject({
        "text-xs text-gray-300": true,
        "dark:text-gray-700": type === "receiver"
      })}
    >
      {_t("chat.forwarded-from")}
      {nostrForwardedUserProfiles?.[0]?.name && (
        <ProfileLink
          target="_blank"
          addAccount={addAccount}
          history={history!!}
          username={nostrForwardedUserProfiles?.[0]?.name}
        >
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
