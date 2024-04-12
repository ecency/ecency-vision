import React, { useContext, useState } from "react";
import { History } from "history";
import { ChatSidebarHeader } from "./chat-sidebar-header";
import { ChatSidebarSearch } from "./chat-sidebar-search";
import { ChatSidebarSearchItem } from "./chat-sidebar-search-item";
import { ChatSidebarDirectContact } from "./chat-sidebar-direct-contact";
import { _t } from "../../../../i18n";
import { ChatSidebarChannel } from "./chat-sidebar-channel";
import {
  ChatContext,
  isCommunity,
  useChannelsQuery,
  useDirectContactsQuery
} from "@ecency/ns-query";
import { useComposedContactsAndChannelsQuery, useSearchUsersQuery } from "../../queries";
import { useSearchCommunitiesQuery } from "../../queries/search-communities-query";
import { Community } from "../../../../store/communities";
import { Reputations } from "../../../../api/hive";
import { useCreateTemporaryContact } from "../../hooks";
import { useCreateTemporaryChannel } from "../../hooks/user-create-temporary-channel";
import { NetworkError } from "../network-error";

interface Props {
  username: string;
  history: History;
  isChannel: boolean;
}

export default function ChatsSideBar(props: Props) {
  const { username } = props;
  const { setRevealPrivateKey, setReceiverPubKey } = useContext(ChatContext);

  const { data: directContacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();
  const composedContactsAndChannels = useComposedContactsAndChannelsQuery();
  const chatsSideBarRef = React.createRef<HTMLDivElement>();

  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDivider, setShowDivider] = useState(false);

  const { data: searchUsers } = useSearchUsersQuery(searchQuery);
  const { data: searchCommunities } = useSearchCommunitiesQuery(searchQuery);

  useCreateTemporaryContact(selectedAccount);
  useCreateTemporaryChannel(selectedCommunity);

  return (
    <div className="flex flex-col md:h-full">
      <ChatSidebarHeader history={props.history} />
      <ChatSidebarSearch setSearch={setSearchQuery} />
      <NetworkError />
      {showDivider && <div className="divider" />}
      <div className="flex flex-col" ref={chatsSideBarRef}>
        {searchQuery ? (
          [...searchUsers, ...searchCommunities].map((item) => (
            <ChatSidebarSearchItem
              item={item}
              onClick={async () => {
                setSearchQuery("");
                setRevealPrivateKey(false);

                const community = item as Community;
                if (community.name && isCommunity(community.name)) {
                  setSelectedCommunity(community.name);
                  setReceiverPubKey("");
                  props.history.push(`/chats/${(item as Community).name}/channel`);
                } else {
                  props.history.push("/chats");
                  setSelectedAccount((item as Reputations).account);
                }
              }}
              key={"account" in item ? item.account : item.id}
            />
          ))
        ) : (
          <>
            {composedContactsAndChannels.map((contactOrChannel) =>
              "id" in contactOrChannel ? (
                <ChatSidebarChannel
                  isChannel={props.isChannel}
                  key={contactOrChannel.id}
                  channel={contactOrChannel}
                  username={username}
                />
              ) : (
                <ChatSidebarDirectContact
                  isLink={true}
                  key={contactOrChannel.pubkey}
                  contact={contactOrChannel}
                />
              )
            )}
          </>
        )}
      </div>
      {directContacts?.length === 0 && channels?.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
          {_t("chat.no-contacts-or-channels")}
        </div>
      )}
    </div>
  );
}
