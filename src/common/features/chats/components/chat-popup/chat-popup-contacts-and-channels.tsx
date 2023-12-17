import React, { useContext, useMemo } from "react";
import { _t } from "../../../../i18n";
import { ChatsWelcome } from "../chats-welcome";
import { Button } from "@ui/button";
import { ChatDirectContactOrChannelItem } from "./chat-direct-contact-or-channel-item";
import {
  ChatContext,
  getJoinedCommunities,
  useChannelsQuery,
  useDirectContactsQuery,
  useKeysQuery,
  useLeftCommunityChannelsQuery
} from "@ecency/ns-query";

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
                  channel={channel}
                  username={channel.communityName!!}
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
              contact={user}
              userClicked={(v) => {
                setReceiverPubKey(user.pubkey);
                userClicked(v);
              }}
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
