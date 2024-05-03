import React, { useMemo, useState } from "react";
import { chatLeaveSvg, kebabMenuSvg, linkSvg, messageSendSvg } from "../../../../img/svg";
import { _t } from "../../../../i18n";
import { success } from "../../../../components/feedback";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { Button } from "@ui/button";
import {
  Channel,
  copyToClipboard,
  useChannelsQuery,
  useLeaveCommunityChannel
} from "@ecency/ns-query";
import { BlockedUsersModal } from "./blocked-users-modal";
import { useCommunityCache } from "../../../../core";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { HiddenMessagesModal } from "./hidden-messages-modal";
import { userIconSvg } from "../../../decks/icons";

interface Props {
  channel?: Channel;
}

const ChatsCommunityDropdownMenu = ({ channel }: Props) => {
  const { activeUser } = useMappedStore();

  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false);
  const [showHiddenMessagesModal, setShowHiddenMessagesModal] = useState(false);

  const { data: community } = useCommunityCache(channel?.communityName);
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
            label={_t("chat.invite")}
            onClick={() => {
              copyToClipboard(`https://ecency.com/chats/${channel?.communityName}/channel`);
              success("Link copied into clipboard.");
            }}
          />
          {isTeamMember && (
            <DropdownItemWithIcon
              icon={userIconSvg}
              label={_t("chat.blocked-users")}
              onClick={() => setShowBlockedUsersModal(true)}
            />
          )}
          {isTeamMember && (
            <DropdownItemWithIcon
              icon={messageSendSvg}
              label={_t("chat.hidden-messages")}
              onClick={() => setShowHiddenMessagesModal(true)}
            />
          )}
          {isJoinedToChannel && (
            <DropdownItemWithIcon
              icon={chatLeaveSvg}
              label={_t("chat.leave-channel")}
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

export default ChatsCommunityDropdownMenu;
