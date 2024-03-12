import React, { useContext, useMemo } from "react";
import { History } from "history";
import ChatsCommunityDropdownMenu from "./chats-community-actions";
import UserAvatar from "../../../components/user-avatar";
import Link from "../../../components/alink";
import { expandSideBar } from "../../../img/svg";
import { Button } from "@ui/button";
import {
  Channel,
  ChatContext,
  DirectContact,
  formattedUserName,
  useChannelsQuery,
  useKeysQuery,
  usePinContact
} from "@ecency/ns-query";
import { ChatSidebarSavedMessagesAvatar } from "./chats-sidebar/chat-sidebar-saved-messages-avatar";
import { _t } from "../../../i18n";

interface Props {
  username: string;
  channel?: Channel;
  contact?: DirectContact;
  history: History;
}

export default function ChatsMessagesHeader(props: Props) {
  const { username } = props;
  const { setReceiverPubKey, receiverPubKey } = useContext(ChatContext);

  const { publicKey } = useKeysQuery();
  const { data: channels } = useChannelsQuery();

  const isActiveUser = useMemo(() => receiverPubKey === publicKey, [publicKey, receiverPubKey]);

  const { mutateAsync: pinContact, isLoading: isContactPinning } = usePinContact();

  const formattedName = (username: string) => {
    if (username && !username.startsWith("@")) {
      const community = channels?.find((channel) => channel.communityName === username);
      if (community) {
        return community.name;
      }
    }
    return username.replace("@", "");
  };

  return (
    <div className="flex sticky z-[10] top-[63px] md:top-0 bg-white justify-between border-b border-[--border-color] px-4 h-[57px]">
      <div className="flex items-center gap-4">
        <Button
          appearance="gray-link"
          className="md:hidden"
          noPadding={true}
          icon={expandSideBar}
          to="/chats"
          onClick={() => setReceiverPubKey("")}
        />
        <Link
          className="flex items-center gap-3 decoration-0 after:!hidden font-semibold text-gray-800 dark:text-white"
          to={username.startsWith("@") ? `/${username}` : `/created/${username}`}
          target="_blank"
        >
          {isActiveUser ? (
            <ChatSidebarSavedMessagesAvatar />
          ) : (
            <UserAvatar username={formattedUserName(username)} size="medium" />
          )}
          <div>{isActiveUser ? _t("chat.saved-messages") : formattedName(username)}</div>
        </Link>
      </div>

      {props.channel && (
        <div className="flex items-center justify-center">
          <ChatsCommunityDropdownMenu channel={props.channel} />
        </div>
      )}
      {props.contact && (
        <div className="flex items-center justify-center">
          <Button
            size="sm"
            appearance="gray-link"
            disabled={isContactPinning}
            onClick={(e: { stopPropagation: () => void }) => {
              e.stopPropagation();
              if (!isContactPinning) {
                pinContact({ contact: props.contact!, pinned: !props.contact!.pinned });
              }
            }}
          >
            {props.contact.pinned ? _t("chat.unpin") : _t("chat.pin")}
          </Button>
        </div>
      )}
    </div>
  );
}
