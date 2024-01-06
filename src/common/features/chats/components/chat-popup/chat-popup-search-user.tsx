import React, { useState } from "react";
import { useSearchUsersQuery } from "../../queries";
import { ChatSidebarSearch } from "../chats-sidebar/chat-sidebar-search";
import { useSearchCommunitiesQuery } from "../../queries/search-communities-query";
import { ChatSidebarSearchItem } from "../chats-sidebar/chat-sidebar-search-item";
import { useCreateTemporaryContact } from "../../hooks";
import { Community } from "../../../../store/communities";
import { isCommunity } from "@ecency/ns-query";
import { Reputations } from "../../../../api/hive";
import { useCreateTemporaryChannel } from "../../hooks/user-create-temporary-channel";

interface Props {
  onCommunityClicked: (communityName: string) => void;
}

export function ChatPopupSearchUser({ onCommunityClicked }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedCommunity, setSelectedCommunity] = useState("");

  const { data: searchUsers } = useSearchUsersQuery(searchQuery);
  const { data: searchCommunities } = useSearchCommunitiesQuery(searchQuery);

  useCreateTemporaryContact(selectedUser);
  useCreateTemporaryChannel(selectedCommunity);

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
