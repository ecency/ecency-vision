import React from "react";
import { _t } from "../../../../i18n";
import { ChatsWelcome } from "../chats-welcome";
import { Button } from "@ui/button";
import { useChannelsQuery, useDirectContactsQuery, useKeysQuery } from "@ecency/ns-query";
import { ChatSidebarDirectContact } from "../chats-sidebar/chat-sidebar-direct-contact";
import { ChatSidebarChannel } from "../chats-sidebar/chat-sidebar-channel";

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

  return (
    <>
      {(directContacts?.length !== 0 || (channels?.length !== 0 && channels?.length !== 0)) &&
      privateKey ? (
        <>
          {channels?.length !== 0 && (
            <>
              <div className="px-3 pt-3 pb-2 text-xs uppercase font-bold text-gray-500">
                {_t("chat.communities")}
              </div>
              {channels?.map((channel) => (
                <ChatSidebarChannel
                  isChannel={false}
                  key={channel.id}
                  channel={channel}
                  username={channel.communityName!!}
                  onClick={() => communityClicked(channel.communityName!)}
                />
              ))}
              {directContacts?.length !== 0 && (
                <div className="px-3 pt-3 pb-2 text-xs uppercase font-bold text-gray-500">
                  {_t("chat.dms")}
                </div>
              )}
            </>
          )}
          {directContacts?.map((user) => (
            <ChatSidebarDirectContact
              isLink={false}
              contact={user}
              onClick={() => userClicked(user.name)}
              key={user.pubkey}
            />
          ))}
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
