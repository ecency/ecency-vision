import React from 'react';
import { ActiveUser } from '../../store/active-user/types';
import { Account } from '../../store/accounts/types';
import DropDown, { MenuItem } from '../dropdown';
import { History } from 'history';

interface Props {
  account: Account;
  activeUser: ActiveUser | null;
  title: string;
  description: string;
  slot?: JSX.Element;
  amountSlot?: JSX.Element;
  actionSlot?: JSX.Element;
  isAlternative?: boolean;
  history: History;
  items: MenuItem[];
}

export const WalletSpkSection = (props: Props) => {
  return <div className={"balance-row hive " + (props.isAlternative ? "alternative" : "")}>
    <div className="balance-info">
      <div className="title">{props.title}</div>
      <div className="description">{props.description}</div>
      {props.slot}
    </div>
    <div className="balance-values">
      <div className="amount">
        {props.items.length > 0 ? <div className="amount-actions">
          <DropDown history={props.history} label="" items={props.items} float="right" />
        </div> : <></>}
        <span>{props.amountSlot}</span>
      </div>
    </div>
  </div>
}