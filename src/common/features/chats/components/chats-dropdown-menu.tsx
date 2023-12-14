import React from "react";
import { History } from "history";
import { chatKeySvg, extendedView, kebabMenuSvg, keySvg } from "../../../img/svg";
import { _t } from "../../../i18n";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { Button } from "@ui/button";
import { history } from "../../../store";
import { useLocation } from "react-router";
import { useLogoutFromChats } from "@ecency/ns-query";

interface Props {
  history: History | null;
  onManageChatKey?: () => void;
  currentUser?: string;
  communityName?: string;
}

const ChatsDropdownMenu = (props: Props) => {
  const { mutateAsync: logout } = useLogoutFromChats();
  const location = useLocation();

  const handleExtendedView = () => {
    if (props.currentUser) {
      history?.push(`/chats/@${props.currentUser}`);
    } else if (props.communityName) {
      history?.push(`/chats/${props.communityName}`);
    } else {
      history?.push("/chats");
    }
  };

  return (
    <Dropdown>
      <DropdownToggle>
        <Button size="sm" appearance="gray-link">
          {kebabMenuSvg}
        </Button>
        <DropdownMenu align="right">
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
