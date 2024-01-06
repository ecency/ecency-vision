import React, { useState } from "react";
import { useSearchUsersQuery } from "../../queries";
import { ChatSidebarSearch } from "../chats-sidebar/chat-sidebar-search";
import { useSearchCommunitiesQuery } from "../../queries/search-communities-query";
import { ChatSidebarSearchItem } from "../chats-sidebar/chat-sidebar-search-item";
import { useCreateTemporaryContact } from "../../hooks";
import { Community } from "../../../../store/communities";
import { isCommunity } from "@ecency/ns-query";
import { Reputations } from "../../../../api/hive";

export function ChatPopupSearchUser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("");

  const { data: searchUsers } = useSearchUsersQuery(searchQuery);
  const { data: searchCommunities } = useSearchCommunitiesQuery(searchQuery);

  useCreateTemporaryContact(selectedUser);

  return (
    <>
      <div className="w-full mb-3">
        <ChatSidebarSearch setSearch={setSearchQuery} />
      </div>
      <div className="user-search-suggestion-list">
        {[...searchUsers, ...searchCommunities].map((item) => (
          <ChatSidebarSearchItem
            item={item}
            onClick={async () => {
              setSearchQuery("");

              const community = item as Community;
              if (community.name && isCommunity(community.name)) {
                // history.push(`/chats/${(item as Community).name}/channel`);
              } else {
                setSelectedUser((item as Reputations).account);
              }
            }}
            key={"account" in item ? item.account : item.id}
          />
        ))}
      </div>
    </>
  );
}
