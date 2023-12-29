import React, { useState } from "react";
import { useSearchUsersQuery } from "../../queries";
import { ChatSidebarSearch } from "../chats-sidebar/chat-sidebar-search";
import { useSearchCommunitiesQuery } from "../../queries/search-communities-query";
import { ChatSidebarSearchItem } from "../chats-sidebar/chat-sidebar-search-item";

interface Props {
  setCurrentUser: (v: string) => void;
}

export function ChatPopupSearchUser({ setCurrentUser }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchUsers } = useSearchUsersQuery(searchQuery);
  const { data: searchCommunities } = useSearchCommunitiesQuery(searchQuery);

  return (
    <>
      <div className="w-full mb-3">
        <ChatSidebarSearch setSearch={setSearchQuery} />
      </div>
      <div className="user-search-suggestion-list">
        {[...searchUsers, ...searchCommunities].map((item) => (
          <ChatSidebarSearchItem
            item={item}
            onClick={() => setCurrentUser("account" in item ? item.account : item.name)}
            key={"account" in item ? item.account : item.id}
          />
        ))}
      </div>
    </>
  );
}
