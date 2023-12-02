import React, { useContext, useMemo, useState } from "react";
import { History } from "history";
import ChatsScroller from "../chats-scroller";
import { ChatSidebarHeader } from "./chat-sidebar-header";
import { ChatSidebarSearch } from "./chat-sidebar-search";
import { ChatSidebarSearchItem } from "./chat-sidebar-search-item";
import { ChatSidebarDirectContact } from "./chat-sidebar-direct-contact";
import { _t } from "../../../../i18n";
import { ChatSidebarChannel } from "./chat-sidebar-channel";
import {
  AccountWithReputation,
  ChatContext,
  getJoinedCommunities,
  useChannelsQuery,
  useDirectContactsQuery,
  useLeftCommunityChannelsQuery
} from "@ecency/ns-query";

interface Props {
  username: string;
  history: History;
}

export default function ChatsSideBar(props: Props) {
  const { username } = props;
  const { setRevealPrivateKey, setReceiverPubKey } = useContext(ChatContext);

  const { data: directContacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();
  const { data: leftChannelsIds } = useLeftCommunityChannelsQuery();

  const chatsSideBarRef = React.createRef<HTMLDivElement>();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDivider, setShowDivider] = useState(false);
  const [userList, setUserList] = useState<AccountWithReputation[]>([]);
  const [isScrollToTop, setIsScrollToTop] = useState(false);

  const communities = useMemo(
    () => getJoinedCommunities(channels ?? [], leftChannelsIds ?? []),
    [channels, leftChannelsIds]
  );

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    var element = event.currentTarget;
    if (element.scrollTop > 2) {
      setShowDivider(true);
    } else {
      if (showDivider) {
        setShowDivider(false);
      }
    }
    let srollHeight: number = (element.scrollHeight / 100) * 25;
    const isScrollToTop = element.scrollTop >= srollHeight;
    setIsScrollToTop(isScrollToTop);
  };

  return (
    <div className="flex flex-col">
      <ChatSidebarHeader history={props.history} />
      <ChatSidebarSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setUserList={setUserList}
      />
      {showDivider && <div className="divider" />}
      <div className="flex flex-col" onScroll={handleScroll} ref={chatsSideBarRef}>
        {searchQuery ? (
          userList.map((user) => (
            <ChatSidebarSearchItem
              user={user}
              onClick={() => {
                setSearchQuery("");
                setRevealPrivateKey(false);
              }}
              key={user.account}
            />
          ))
        ) : (
          <>
            {communities.length !== 0 && (
              <div className="mt-4 mb-2 text-xs font-semibold text-gray-500 uppercase px-3">
                {_t("chat.communities")}
              </div>
            )}
            {communities.map((channel) => (
              <ChatSidebarChannel key={channel.id} channel={channel} username={username} />
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
      {isScrollToTop && (
        <ChatsScroller
          bodyRef={chatsSideBarRef}
          isScrollToTop={isScrollToTop}
          isScrollToBottom={false}
          marginRight={"5%"}
        />
      )}
    </div>
  );
}
