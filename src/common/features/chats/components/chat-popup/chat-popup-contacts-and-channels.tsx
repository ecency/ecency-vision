import React from "react";
import { _t } from "../../../../i18n";
import { ChatsWelcome } from "../chats-welcome";
import { Button } from "@ui/button";
import { useChannelsQuery, useDirectContactsQuery, useKeysQuery } from "@ecency/ns-query";
import { ChatSidebarDirectContact } from "../chats-sidebar/chat-sidebar-direct-contact";
import { ChatSidebarChannel } from "../chats-sidebar/chat-sidebar-channel";
import { useComposedContactsAndChannelsQuery } from "../../queries";

interface Props {
  communityClicked: (v: string) => void;
  userClicked: (v: string) => void;
  setShowSearchUser: (v: boolean) => void;
}

export function ChatPopupContactsAndChannels({
  communityClicked,
  userClicked,
  setShowSearchUser
}: Props) {
  const { privateKey } = useKeysQuery();

  const { data: directContacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();
  const composedContactsAndChannels = useComposedContactsAndChannelsQuery();

  return (
    <>
      {(directContacts?.length !== 0 || (channels?.length !== 0 && channels?.length !== 0)) &&
      privateKey ? (
        <>
          {composedContactsAndChannels.map((contactOrChannel) =>
            "id" in contactOrChannel ? (
              <ChatSidebarChannel
                isChannel={false}
                key={contactOrChannel.id}
                channel={contactOrChannel}
                username={contactOrChannel.communityName!!}
                onClick={() => communityClicked(contactOrChannel.communityName!)}
                isLink={false}
              />
            ) : (
              <ChatSidebarDirectContact
                isLink={false}
                contact={contactOrChannel}
                onClick={() => userClicked(contactOrChannel.name)}
                key={contactOrChannel.pubkey}
              />
            )
          )}
        </>
      ) : !privateKey ? (
        <ChatsWelcome />
      ) : (
        <div className="flex items-center justify-center h-full flex-col">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{_t("chat.no-chat")}</p>
          <Button onClick={() => setShowSearchUser(true)}>{_t("chat.start-chat")}</Button>
        </div>
      )}
    </>
  );
}
