import React from "react";
import { History } from "history";
import DropDown, { MenuItem } from "../dropdown";

import { KebabMenu, chatKeySvg } from "../../img/svg";
import { _t } from "../../i18n";
import { DropDownStyle } from "../chat-box/chat-constants";

interface Props {
  history: History | null;
  onManageChatKey?: () => void;
}

const ChatsDropdownMenu = (props: Props) => {
  const onManageChatKey = () => {
    const { onManageChatKey } = props;
    if (onManageChatKey) {
      onManageChatKey();
    }
  };

  const menuItems: MenuItem[] = [
    {
      label: "Manage Chat key",
      onClick: onManageChatKey,
      icon: chatKeySvg
    }
  ];

  const menuConfig = {
    history: props.history,
    label: "",
    icon: KebabMenu,
    items: menuItems
  };

  return (
    <DropDown
      {...menuConfig}
      style={DropDownStyle}
      float="right"
      alignBottom={false}
      noMarginTop={true}
    />
  );
};

export default ChatsDropdownMenu;
