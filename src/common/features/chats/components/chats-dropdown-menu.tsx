import React, { useEffect } from "react";
import { History } from "history";
import {
  chatKeySvg,
  chatLeaveSvg,
  extendedView,
  kebabMenuSvg,
  keySvg,
  pinSvg
} from "../../../img/svg";
import { _t } from "../../../i18n";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { Button } from "@ui/button";
import { history } from "../../../store";
import { useLocation } from "react-router";
import {
  Channel,
  DirectContact,
  useLeaveCommunityChannel,
  useLogoutFromChats,
  usePinContact
} from "@ecency/ns-query";
import { error, success } from "../../../components/feedback";

interface Props {
  history: History | null;
  onManageChatKey?: () => void;
  currentUser?: string;
  channel?: Channel;
  contact?: DirectContact;
}

const ChatsDropdownMenu = (props: Props) => {
  const { mutateAsync: logout } = useLogoutFromChats();
  const location = useLocation();

  const { mutateAsync: leaveChannel, isLoading: isLeavingLoading } = useLeaveCommunityChannel(
    props.channel
  );
  const {
    mutateAsync: pinContact,
    isLoading: isContactPinning,
    isSuccess: isPinned,
    isError: isPinFailed
  } = usePinContact();

  useEffect(() => {
    if (isPinned) {
      success(_t("g.success"));
    }
  }, [isPinned]);

  useEffect(() => {
    if (isPinFailed) {
      error(_t("g.error"));
    }
  }, [isPinFailed]);

  const handleExtendedView = () => {
    history?.push("/chats");
  };

  return (
    <Dropdown>
      <DropdownToggle>
        <Button size="sm" appearance="gray-link">
          {kebabMenuSvg}
        </Button>
        <DropdownMenu align="right">
          {props.contact && (
            <DropdownItemWithIcon
              icon={pinSvg}
              label={props.contact.pinned ? _t("chat.unpin") : _t("chat.pin")}
              disabled={isContactPinning}
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                if (!isContactPinning) {
                  pinContact({ contact: props.contact!, pinned: !props.contact!.pinned });
                }
              }}
            />
          )}
          {!location.pathname.startsWith("/chats") && (
            <DropdownItemWithIcon
              icon={extendedView}
              label={_t("chat.extended-view")}
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                handleExtendedView();
              }}
            />
          )}
          {props.channel && (
            <DropdownItemWithIcon
              icon={chatLeaveSvg}
              label={isLeavingLoading ? _t("chat.leaving") : _t("chat.leave-channel")}
              onClick={() => leaveChannel()}
            />
          )}
          <DropdownItemWithIcon
            label={_t("chat.manage-chat-key")}
            icon={chatKeySvg}
            onClick={() => props.onManageChatKey?.()}
          />
          <DropdownItemWithIcon icon={keySvg} label={_t("chat.logout")} onClick={() => logout()} />
        </DropdownMenu>
      </DropdownToggle>
    </Dropdown>
  );
};

export default ChatsDropdownMenu;
