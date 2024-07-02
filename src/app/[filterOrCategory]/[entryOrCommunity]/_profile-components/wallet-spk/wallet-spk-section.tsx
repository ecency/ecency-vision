import React from "react";
import { Account } from "@/entities";
import {
  Dropdown,
  DropdownItemWithIcon,
  DropdownMenu,
  DropdownToggle,
  MenuItem
} from "@ui/dropdown";
import { menuDownSvg } from "@ui/svg";

interface Props {
  account: Account;
  title: string;
  description: string;
  slot?: JSX.Element;
  amountSlot?: JSX.Element;
  additionalAmountSlot?: JSX.Element;
  actionSlot?: JSX.Element;
  isAlternative?: boolean;
  items: MenuItem[];
  showItems?: boolean;
}

export const WalletSpkSection = (props: Props) => {
  return (
    <div className={"balance-row hive " + (props.isAlternative ? "alternative" : "")}>
      <div className="balance-info text-left">
        <div className="title">{props.title}</div>
        <div className="description">{props.description}</div>
        {props.slot}
      </div>
      <div className="balance-values">
        <div className="amount">
          {props.items.length > 0 &&
          (typeof props.showItems === "boolean" ? props.showItems : true) ? (
            <div className="amount-actions">
              <Dropdown>
                <DropdownToggle>{menuDownSvg}</DropdownToggle>
                <DropdownMenu align="right">
                  {props.items.map((item, i) => (
                    <DropdownItemWithIcon
                      key={i}
                      onClick={item.onClick}
                      icon={item.icon}
                      label={item.label}
                    />
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          ) : (
            <></>
          )}
          <span>{props.amountSlot}</span>
        </div>
        {props.additionalAmountSlot}
      </div>
    </div>
  );
};
