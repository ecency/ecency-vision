import React from "react";
import { History } from "history";
import { chatKeySvg, kebabMenuSvg } from "../../../img/svg";
import { _t } from "../../../i18n";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { Button } from "@ui/button";

interface Props {
  history: History | null;
  onManageChatKey?: () => void;
}

const ChatsDropdownMenu = (props: Props) => {
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
        </DropdownMenu>
      </DropdownToggle>
    </Dropdown>
  );
};

export default ChatsDropdownMenu;
