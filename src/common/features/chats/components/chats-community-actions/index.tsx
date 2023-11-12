import React, { useMemo, useState } from "react";
import { History } from "history";
import { chatLeaveSvg, editSVG, kebabMenuSvg, linkSvg, removeUserSvg } from "../../../../img/svg";
import { _t } from "../../../../i18n";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { success } from "../../../../components/feedback";
import { copyToClipboard } from "../../utils";
import { useLeaveCommunityChannel } from "../../mutations";
import { useChannelsQuery } from "../../queries";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { EditRolesModal } from "./edit-roles-modal";
import { Button } from "@ui/button";
import { BlockedUsersModal } from "./blocked-users-modal";

interface Props {
  history: History;
  from?: string;
  username: string;
}

const ChatsCommunityDropdownMenu = ({ history, username }: Props) => {
  const { activeUser } = useMappedStore();

  const [showEditRolesModal, setShowEditRolesModal] = useState(false);
  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false);

  const { data: channels } = useChannelsQuery();

  const currentChannel = useMemo(
    () => channels?.find((channel) => channel.communityName === username),
    [channels, username]
  );
  const communityAdmins = useMemo(
    () => (currentChannel?.communityModerators ?? []).map((mod) => mod.name),
    [currentChannel]
  );

  const { mutateAsync: leaveChannel } = useLeaveCommunityChannel(() => history?.push("/chats"));

  return (
    <>
      <Dropdown>
        <DropdownToggle>
          <Button icon={kebabMenuSvg} appearance="gray-link" noPadding={true} />
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItemWithIcon
            icon={linkSvg}
            label={_t("chat.invite")}
            onClick={() => {
              copyToClipboard(
                `https://ecency.com/created/${currentChannel?.communityName}?communityid=${currentChannel?.id}`
              );
              success("Link copied into clipboard.");
            }}
          />
          <DropdownItemWithIcon
            icon={chatLeaveSvg}
            label={_t("chat.leave")}
            onClick={() => leaveChannel(currentChannel?.id!!)}
          />
          {activeUser?.username === currentChannel?.communityName && (
            <DropdownItemWithIcon
              icon={editSVG}
              label={_t("chat.edit-roles")}
              onClick={() => setShowEditRolesModal(true)}
            />
          )}
          {communityAdmins && communityAdmins.includes(activeUser?.username!) && (
            <DropdownItemWithIcon
              icon={removeUserSvg}
              label={_t("chat.blocked-users")}
              onClick={() => setShowBlockedUsersModal(true)}
            />
          )}
        </DropdownMenu>
      </Dropdown>
      <EditRolesModal
        show={showEditRolesModal}
        setShow={setShowEditRolesModal}
        username={currentChannel?.communityName!!}
      />
      <BlockedUsersModal
        username={currentChannel?.communityName!!}
        show={showBlockedUsersModal}
        setShow={setShowBlockedUsersModal}
      />
    </>
  );
};

export default ChatsCommunityDropdownMenu;
