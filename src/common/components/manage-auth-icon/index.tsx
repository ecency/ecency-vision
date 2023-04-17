import React from "react";
import { History } from "history";
import { PrivateKey, PublicKey } from "@hiveio/dhive";

import { actionType } from "../manage-authority/types";
import DropDown, { MenuItem } from "../dropdown";

import { KebabMenu, revokeSvg, copyOutlinSvg, keyOutlineSvg } from "../../img/svg";
import { _t } from "../../i18n";
import "./index.scss";

interface Props {
  type: string;
  account?: string;
  history: History | null;
  Pkey?: PrivateKey | string | PublicKey;
  label?: string;
  action?: string;
  keyType?: string;
  onRevoke?: (account: string) => void;
  onCopy?: (text: string) => void;
  onImport?: (type: string) => void;
  onReveal?: () => void;
}

const ManageAuthIcon = (props: Props) => {
  const revokeClicked = () => {
    const { onRevoke, account } = props;
    if (onRevoke) {
      onRevoke(account!);
    }
  };

  const copyClicked = () => {
    const { onCopy, Pkey } = props;
    if (onCopy) {
      onCopy(Pkey!.toString());
    }
  };

  const keysHandleClicked = () => {
    const { onImport, action, keyType, onReveal } = props;
    if (action === actionType.Import && onImport) {
      onImport(keyType!);
    } else {
      if (onReveal) {
        onReveal();
      }
    }
  };

  let menuItems: MenuItem[] = [];
  switch (props.type) {
    case actionType.Revoke:
      menuItems = [
        {
          label: _t("manage-authorities.revoke"),
          onClick: revokeClicked,
          icon: revokeSvg
        }
      ];
      break;
    case actionType.Keys:
      menuItems = [
        {
          label: _t("manage-authorities.copy"),
          onClick: copyClicked,
          icon: copyOutlinSvg
        },
        {
          label: props.label!,
          onClick: keysHandleClicked,
          icon: keyOutlineSvg
        }
      ];
      break;
  }

  const menuConfig = {
    history: props.history,
    label: "",
    icon: KebabMenu,
    items: menuItems
  };

  return <DropDown {...menuConfig} float="right" alignBottom={false} noMarginTop={true} />;
};

export default ManageAuthIcon;
