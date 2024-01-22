import React, { useMemo } from "react";
import { chatLeaveSvg, kebabMenuSvg, linkSvg } from "../../../../img/svg";
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

interface Props {
  channel?: Channel;
}

const ChatsCommunityDropdownMenu = ({ channel }: Props) => {
  const { data: channels } = useChannelsQuery();

  const isJoinedToChannel = useMemo(
    () => channels?.some((c) => c.id === channel?.id) === true,
    [channel, channels]
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
          {isJoinedToChannel && (
            <DropdownItemWithIcon
              icon={chatLeaveSvg}
              label={_t("chat.leave-channel")}
              onClick={() => leaveChannel()}
            />
          )}
        </DropdownMenu>
      </Dropdown>
    </>
  );
};

export default ChatsCommunityDropdownMenu;
