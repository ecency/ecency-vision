import React, { useContext, useMemo } from "react";
import { _t } from "../../../../i18n";
import { getJoinedCommunities } from "../../utils";
import { ChatsWelcome } from "../chats-welcome";
import { Button } from "@ui/button";
import { ChatContext } from "../../chat-context-provider";
import { ChatDirectContactOrChannelItem } from "./chat-direct-contact-or-channel-item";
import { useChannelsQuery, useDirectContactsQuery, useLastMessagesQuery } from "../../queries";
import { useLeftCommunityChannelsQuery } from "../../queries/left-community-channels-query";
import { useKeysQuery } from "../../queries/keys-query";

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
  const { setReceiverPubKey } = useContext(ChatContext);

  const { privateKey } = useKeysQuery();
  const { data: directContacts } = useDirectContactsQuery();
  const { data: directContactsLastMessages } = useLastMessagesQuery();
  const { data: channels } = useChannelsQuery();
  const { data: leftChannelsIds } = useLeftCommunityChannelsQuery();

  const joinedChannels = useMemo(
    () => getJoinedCommunities(channels ?? [], leftChannelsIds ?? []),
    [channels, leftChannelsIds]
  );

  return (
    <>
      {(directContacts?.length !== 0 || (channels?.length !== 0 && joinedChannels.length !== 0)) &&
      privateKey ? (
        <>
          {joinedChannels.length !== 0 && (
            <>
              <div className="px-3 pt-3 pb-2 text-xs uppercase font-bold text-gray-500">
                {_t("chat.communities")}
              </div>
              {joinedChannels.map((channel) => (
                <ChatDirectContactOrChannelItem
                  key={channel.id}
                  username={channel.communityName!!}
                  lastMessage={directContactsLastMessages[channel.name]?.content}
                  userClicked={() => communityClicked(channel.communityName!)}
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
            <ChatDirectContactOrChannelItem
              username={user.name}
              userClicked={(v) => {
                setReceiverPubKey(user.pubkey);
                userClicked(v);
              }}
              key={user.pubkey}
              lastMessage={directContactsLastMessages[user.name]?.content}
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
