import React, { useMemo } from "react";
import { History } from "history";
import DropDown, { MenuItem } from "../../../../components/dropdown";
import { chatKeySvg, kebabMenuSvg } from "../../../../img/svg";
import { _t } from "../../../../i18n";

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

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        label: _t("chat.manage-chat-key"),
        onClick: onManageChatKey,
        icon: chatKeySvg
      }
    ],
    []
  );
  return (
    <DropDown
      history={props.history}
      label=""
      icon={kebabMenuSvg}
      items={menuItems}
      style={{
        width: "35px",
        height: "35px"
      }}
      float="right"
      alignBottom={false}
      noMarginTop={true}
    />
  );
};

export default ChatsDropdownMenu;
