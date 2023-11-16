import React from "react";
import { History } from "history";
import { chatKeySvg, kebabMenuSvg, keySvg } from "../../../img/svg";
import { _t } from "../../../i18n";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { Button } from "@ui/button";
import { useLogoutFromChats } from "../mutations";

interface Props {
  history: History | null;
  onManageChatKey?: () => void;
}

const ChatsDropdownMenu = (props: Props) => {
  const { mutateAsync: logout } = useLogoutFromChats();

  return (
    <Dropdown>
      <DropdownToggle>
        <Button size="sm" appearance="gray-link" noPadding={true}>
          {kebabMenuSvg}
        </Button>
        <DropdownMenu align="right">
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
