import React from "react";
import { ActiveUser } from "../../store/active-user/types";
import { Account } from "../../store/accounts/types";
import DropDown, { MenuItem } from "../dropdown";
import { History } from "history";

interface Props {
  account: Account;
  activeUser: ActiveUser | null;
  title: string;
  description: string;
  slot?: JSX.Element;
  amountSlot?: JSX.Element;
  additionalAmountSlot?: JSX.Element;
  actionSlot?: JSX.Element;
  isAlternative?: boolean;
  history: History;
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
              <DropDown history={props.history} label="" items={props.items} float="right" />
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
