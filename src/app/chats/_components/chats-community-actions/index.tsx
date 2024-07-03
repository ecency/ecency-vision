import React, { useMemo, useState } from "react";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { Button } from "@ui/button";
import {
  Channel,
  copyToClipboard,
  useChannelsQuery,
  useLeaveCommunityChannel
} from "@ecency/ns-query";
import { BlockedUsersModal } from "./blocked-users-modal";
import { HiddenMessagesModal } from "./hidden-messages-modal";
import { useGlobalStore } from "@/core/global-store";
import { getCommunityCache } from "@/core/caches";
import { chatLeaveSvg, kebabMenuSvg, messageSendSvg } from "@/assets/img/svg";
import { linkSvg } from "@ui/svg";
import i18next from "i18next";
import { success } from "@/features/shared";
import { userIconSvg } from "@ui/icons";

interface Props {
  channel?: Channel;
}

export const ChatsCommunityDropdownMenu = ({ channel }: Props) => {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false);

  const [showHiddenMessagesModal, setShowHiddenMessagesModal] = useState(false);

  const { data: community } = getCommunityCache(channel?.communityName).useClientQuery();
  const { data: channels } = useChannelsQuery();

  const isJoinedToChannel = useMemo(
    () => channels?.some((c) => c.id === channel?.id) === true,
    [channel, channels]
  );
  const isTeamMember = useMemo(
    () => community?.team.some(([name]) => name === activeUser?.username) === true,
    [activeUser, community]
  );

  const { mutateAsync: leaveChannel } = useLeaveCommunityChannel(channel);

  return (
    <>
      <Dropdown>
        <DropdownToggle>
          <Button icon={kebabMenuSvg} appearance="gray-link" noPadding={true} />
        </DropdownToggle>
        <DropdownMenu align="right">
          <DropdownItemWithIcon
            icon={linkSvg}
            label={i18next.t("chat.invite")}
            onClick={() => {
              copyToClipboard(`https://ecency.com/chats/${channel?.communityName}/channel`);
              success("Link copied into clipboard.");
            }}
          />
          {isTeamMember && (
            <DropdownItemWithIcon
              icon={userIconSvg}
              label={i18next.t("chat.blocked-users")}
              onClick={() => setShowBlockedUsersModal(true)}
            />
          )}
          {isTeamMember && (
            <DropdownItemWithIcon
              icon={messageSendSvg}
              label={i18next.t("chat.hidden-messages")}
              onClick={() => setShowHiddenMessagesModal(true)}
            />
          )}
          {isJoinedToChannel && (
            <DropdownItemWithIcon
              icon={chatLeaveSvg}
              label={i18next.t("chat.leave-channel")}
              onClick={() => leaveChannel()}
            />
          )}
        </DropdownMenu>
      </Dropdown>
      <BlockedUsersModal
        show={showBlockedUsersModal}
        setShow={setShowBlockedUsersModal}
        channel={channel}
      />
      <HiddenMessagesModal
        show={showHiddenMessagesModal}
        setShow={setShowHiddenMessagesModal}
        channel={channel}
      />
    </>
  );
};
