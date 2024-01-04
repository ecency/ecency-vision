import React, { useContext, useEffect, useState } from "react";
import { useSearchUsersQuery } from "../../queries";
import { ChatSidebarSearch } from "../chats-sidebar/chat-sidebar-search";
import { useSearchCommunitiesQuery } from "../../queries/search-communities-query";
import { ChatSidebarSearchItem } from "../chats-sidebar/chat-sidebar-search-item";
import { ChatContext, getUserChatPublicKey } from "@ecency/ns-query";
import { useGetAccountFullQuery } from "../../../../api/queries";

export function ChatPopupSearchUser() {
  const { setReceiverPubKey } = useContext(ChatContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>();

  const { data: currentUserAccount } = useGetAccountFullQuery(selectedUser);
  const { data: searchUsers } = useSearchUsersQuery(searchQuery);
  const { data: searchCommunities } = useSearchCommunitiesQuery(searchQuery);

  useEffect(() => {
    if (currentUserAccount) {
      setReceiverPubKey(getUserChatPublicKey(currentUserAccount) ?? "");
    }
  }, [currentUserAccount]);

  return (
    <>
      <div className="w-full mb-3">
        <ChatSidebarSearch setSearch={setSearchQuery} />
      </div>
      <div className="user-search-suggestion-list">
        {[...searchUsers, ...searchCommunities].map((item) => (
          <ChatSidebarSearchItem
            item={item}
            onClick={() => setSelectedUser("account" in item ? item.account : item.name)}
            key={"account" in item ? item.account : item.id}
          />
        ))}
      </div>
    </>
  );
}
