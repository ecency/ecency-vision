import React, { useState } from "react";
import { useSearchUsersQuery } from "../../_queries";
import { ChatSidebarSearch } from "../chats-sidebar/chat-sidebar-search";
import { useSearchCommunitiesQuery } from "@/app/chats/_queries/search-communities-query";
import { ChatSidebarSearchItem } from "../chats-sidebar/chat-sidebar-search-item";
import { useCreateTemporaryContact } from "../../_hooks";
import { isCommunity } from "@ecency/ns-query";
import { useCreateTemporaryChannel } from "@/app/chats/_hooks/user-create-temporary-channel";
import useDebounce from "react-use/lib/useDebounce";
import { Community, Reputations } from "@/entities";

interface Props {
  onCommunityClicked: (communityName: string) => void;
}

export function ChatPopupSearchUser({ onCommunityClicked }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");

  const { data: searchUsers } = useSearchUsersQuery(searchQuery);
  const { data: searchCommunities } = useSearchCommunitiesQuery(searchQuery);

  useCreateTemporaryContact(selectedUser);
  useCreateTemporaryChannel(selectedCommunity);

  useDebounce(
    () => {
      if (searchInput) {
        setSearchQuery(searchInput);
      }
    },
    500,
    [searchInput]
  );

  return (
    <>
      <div className="w-full mb-3">
        <ChatSidebarSearch setSearch={setSearchInput} />
      </div>
      <div className="user-search-suggestion-list">
        {[...searchUsers, ...searchCommunities].map((item) => (
          <ChatSidebarSearchItem
            item={item}
            onClick={async () => {
              setSearchInput("");
              setSearchQuery("");

              const community = item as Community;
              if (community.name && isCommunity(community.name)) {
                setSelectedCommunity(community.name);
                onCommunityClicked(community.name);
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
