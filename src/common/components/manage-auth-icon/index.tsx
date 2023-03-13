import React, { Component } from "react";
import { History } from "history";
import { KebabMenu, revokeSvg, copyContent, copyOutlinSvg, keyOutlineSvg } from "../../img/svg";
import "./index.scss";
import DropDown, { MenuItem } from "../dropdown";
import { _t } from "../../i18n";
import { actionType } from "../manage-authority/types";

interface Props {
  type: string;
  account?: string;
  history: History | null;
  Pkey?: any;
  label?: string;
  action?: string;
  keyType?: string;
  onRevoke?: (account: string) => void;
  onCopy?: (key: any) => void;
  onImport?: (type: string) => void;
  onReveal?: () => void;
}

export class ManageAuthIcon extends Component<Props> {
  revokeClicked = () => {
    const { onRevoke, account } = this.props;
    if (onRevoke) {
      onRevoke(account!);
    }
  };

  copyClicked = () => {
    const { onCopy, Pkey, label } = this.props;
    if (onCopy) {
      onCopy(Pkey);
    }
  };
  keysHandleClicked = () => {
    const { onImport, action, keyType, onReveal } = this.props;
    if (action === actionType.Import && onImport) {
      onImport(keyType!);
    } else {
      if (onReveal) {
        onReveal();
      }
    }
  };

  render() {
    let menuItems: MenuItem[] = [];
    switch (this.props.type) {
      case actionType.Revoke:
        menuItems = [
          {
            label: "Revoke",
            onClick: this.revokeClicked,
            icon: revokeSvg
          }
        ];
        break;
      case actionType.Keys:
        menuItems = [
          {
            label: "Copy",
            onClick: this.copyClicked,
            icon: copyOutlinSvg
          },
          {
            label: this.props.label!,
            onClick: this.keysHandleClicked,
            icon: keyOutlineSvg
          }
        ];
        break;
      // default:
      //   // code block
    }

    const menuConfig = {
      history: this.props.history,
      label: "",
      icon: KebabMenu,
      items: menuItems
    };

    return <DropDown {...menuConfig} float="right" alignBottom={false} />;
  }
}

export default (p: Props) => {
  const props = {
    type: p.type,
    account: p.account,
    history: p.history,
    Pkey: p.Pkey,
    label: p.label,
    action: p.action,
    keyType: p.keyType,
    onRevoke: p.onRevoke,
    onCopy: p.onCopy,
    onImport: p.onImport,
    onReveal: p.onReveal
  };

  return <ManageAuthIcon {...props} />;
};
