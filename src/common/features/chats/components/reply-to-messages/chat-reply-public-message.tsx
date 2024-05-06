import { _t } from "../../../../i18n";
import { Button } from "@ui/button";
import { UilMessage, UilMultiply } from "@iconscout/react-unicons";
import React, { useMemo } from "react";
import { usePersistentReplyToMessage } from "../../hooks";
import { Channel, useNostrGetUserProfileQuery } from "@ecency/ns-query";
import { ChatReplyToMessageLayout } from "./chat-reply-to-message-layout";

interface Props {
  currentChannel?: Channel;
}

export function ChatReplyPublicMessage({ currentChannel }: Props) {
  const [reply, _, clearReply] = usePersistentReplyToMessage(currentChannel);

  const { data: nostrUserProfiles } = useNostrGetUserProfileQuery(reply?.creator);
  const profile = useMemo(
    () => nostrUserProfiles?.find((p) => p.creator === reply?.creator),
    [nostrUserProfiles, reply?.creator]
  );

  return reply ? (
    <ChatReplyToMessageLayout>
      <div className="chat-reply-to-message w-full gap-4 px-3 py-2">
        <UilMessage className="text-blue-dark-sky" />
        <div className="chat-reply-to-message-text text-sm flex flex-col border-l-[0.25rem] border-blue-dark-sky pl-2">
          <div className="text-xs text-blue-dark-sky">
            {_t("chat.reply-to", { account: profile?.name })}
          </div>
          <div>{reply.content}</div>
        </div>
        <Button
          appearance="gray-link"
          size="sm"
          noPadding={true}
          icon={<UilMultiply />}
          onClick={() => clearReply()}
        />
      </div>
    </ChatReplyToMessageLayout>
  ) : (
    <></>
  );
}
