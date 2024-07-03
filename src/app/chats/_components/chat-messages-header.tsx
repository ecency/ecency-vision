import React, { useContext, useEffect, useMemo } from "react";
import { ChatsCommunityDropdownMenu } from "./chats-community-actions";
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
import { error, success, UserAvatar } from "@/features/shared";
import i18next from "i18next";
import { expandSideBar } from "@/assets/img/svg";
import Link from "next/link";

interface Props {
  username: string;
  channel?: Channel;
  contact?: DirectContact;
}

export function ChatsMessagesHeader(props: Props) {
  const { username } = props;
  const { setReceiverPubKey, receiverPubKey } = useContext(ChatContext);

  const { publicKey } = useKeysQuery();
  const { data: channels } = useChannelsQuery();

  const isActiveUser = useMemo(() => receiverPubKey === publicKey, [publicKey, receiverPubKey]);

  const {
    mutateAsync: pinContact,
    isPending: isContactPinning,
    isSuccess: isPinned,
    isError: isPinFailed
  } = usePinContact();

  useEffect(() => {
    if (isPinned) {
      success(i18next.t("g.success"));
    }
  }, [isPinned]);

  useEffect(() => {
    if (isPinFailed) {
      error(i18next.t("g.error"));
    }
  }, [isPinFailed]);

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
          href="/chats"
          onClick={() => setReceiverPubKey("")}
        />
        <Link
          className="flex items-center gap-3 decoration-0 after:!hidden font-semibold text-gray-800 dark:text-white"
          href={username.startsWith("@") ? `/${username}` : `/created/${username}`}
          target="_blank"
        >
          {isActiveUser ? (
            <ChatSidebarSavedMessagesAvatar />
          ) : (
            <UserAvatar username={formattedUserName(username)} size="medium" />
          )}
          <div>{isActiveUser ? i18next.t("chat.saved-messages") : formattedName(username)}</div>
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
            {props.contact.pinned ? i18next.t("chat.unpin") : i18next.t("chat.pin")}
          </Button>
        </div>
      )}
    </div>
  );
}
