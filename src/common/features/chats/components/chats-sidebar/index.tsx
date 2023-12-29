import React, { useContext, useState } from "react";
import { History } from "history";
import { ChatSidebarHeader } from "./chat-sidebar-header";
import { ChatSidebarSearch } from "./chat-sidebar-search";
import { ChatSidebarSearchItem } from "./chat-sidebar-search-item";
import { ChatSidebarDirectContact } from "./chat-sidebar-direct-contact";
import { _t } from "../../../../i18n";
import { ChatSidebarChannel } from "./chat-sidebar-channel";
import { ChatContext, useChannelsQuery, useDirectContactsQuery } from "@ecency/ns-query";
import { useSearchUsersQuery } from "../../queries";
import { useSearchCommunitiesQuery } from "../../queries/search-communities-query";

interface Props {
  username: string;
  history: History;
  isChannel: boolean;
}

export default function ChatsSideBar(props: Props) {
  const { username } = props;
  const { setRevealPrivateKey } = useContext(ChatContext);

  const { data: directContacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();
  const chatsSideBarRef = React.createRef<HTMLDivElement>();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDivider, setShowDivider] = useState(false);

  const { data: searchUsers } = useSearchUsersQuery(searchQuery);
  const { data: searchCommunities } = useSearchCommunitiesQuery(searchQuery);

  return (
    <div className="flex flex-col h-full">
      <ChatSidebarHeader history={props.history} />
      <ChatSidebarSearch setSearch={setSearchQuery} />
      {showDivider && <div className="divider" />}
      <div className="flex flex-col" ref={chatsSideBarRef}>
        {searchQuery ? (
          [...searchUsers, ...searchCommunities].map((item) => (
            <ChatSidebarSearchItem
              item={item}
              onClick={() => {
                setSearchQuery("");
                setRevealPrivateKey(false);
              }}
              key={"account" in item ? item.account : item.id}
            />
          ))
        ) : (
          <>
            {channels?.length !== 0 && (
              <div className="mt-4 mb-2 text-xs font-semibold text-gray-500 uppercase px-3">
                {_t("chat.communities")}
              </div>
            )}
            {channels?.map((channel) => (
              <ChatSidebarChannel
                isChannel={props.isChannel}
                key={channel.id}
                channel={channel}
                username={username}
              />
            ))}
            {directContacts?.length !== 0 && (
              <div className="mt-4 mb-2 text-xs font-semibold text-gray-500 uppercase px-3">
                {_t("chat.direct-messages")}
              </div>
            )}
            {directContacts?.map((contact) => (
              <ChatSidebarDirectContact
                key={contact.pubkey}
                contact={contact}
                username={username}
              />
            ))}
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
