import React, { useContext, useMemo } from "react";
import { _t } from "../../../../i18n";
import { getJoinedCommunities } from "../../utils";
import { ChatsImport } from "../chats-import";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import { ChatContext } from "../../chat-context-provider";
import { ChatDirectMessage } from "./chat-direct-message";
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
  const { showSpinner, setReceiverPubKey } = useContext(ChatContext);

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
      !showSpinner &&
      privateKey ? (
        <>
          {joinedChannels.length !== 0 && (
            <>
              <div className="community-header">{_t("chat.communities")}</div>
              {joinedChannels.map((channel) => (
                <ChatDirectMessage
                  key={channel.id}
                  username={channel.communityName!!}
                  lastMessage={directContactsLastMessages[channel.name]?.content}
                  userClicked={() => communityClicked(channel.communityName!)}
                />
              ))}
              {directContacts?.length !== 0 && <div className="dm-header">{_t("chat.dms")}</div>}
            </>
          )}
          {directContacts?.map((user) => (
            <ChatDirectMessage
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
        <ChatsImport />
      ) : showSpinner ? (
        <div className="flex items-center justify-center h-full">
          <Spinner className="w-4 h-4" />
        </div>
      ) : (
        <>
          <p className="no-chat">{_t("chat.no-chat")}</p>
          <div className="start-chat-btn">
            <Button onClick={() => setShowSearchUser(true)}>{_t("chat.start-chat")}</Button>
          </div>
        </>
      )}
    </>
  );
}