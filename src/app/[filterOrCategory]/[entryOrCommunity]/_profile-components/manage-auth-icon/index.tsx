import React from "react";
import { PrivateKey, PublicKey } from "@hiveio/dhive";
import { actionType } from "../manage-authority/types";
import "./index.scss";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import i18next from "i18next";
import { copyOutlinSvg, keyOutlineSvg, revokeSvg } from "@ui/svg";
import { kebabMenuSvg } from "@/assets/img/svg";

interface Props {
  type: string;
  account?: string;
  Pkey?: PrivateKey | string | PublicKey;
  label?: string;
  action?: string;
  keyType?: string;
  onRevoke?: (account: string) => void;
  onCopy?: (text: string) => void;
  onImport?: (type: string) => void;
  onReveal?: () => void;
}

export const ManageAuthIcon = (props: Props) => {
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
  return (
    <Dropdown>
      <DropdownToggle>{kebabMenuSvg}</DropdownToggle>
      <DropdownMenu align="right">
        {props.type === actionType.Revoke && (
          <DropdownItemWithIcon
            icon={revokeSvg}
            label={i18next.t("manage-authorities.revoke")}
            onClick={revokeClicked}
          />
        )}
        {props.type === actionType.Keys && (
          <>
            <DropdownItemWithIcon
              icon={copyOutlinSvg}
              label={i18next.t("manage-authorities.copy")}
              onClick={copyClicked}
            />
            <DropdownItemWithIcon
              icon={keyOutlineSvg}
              label={props.label!}
              onClick={keysHandleClicked}
            />
          </>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};
