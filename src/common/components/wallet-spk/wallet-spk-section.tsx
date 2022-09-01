import React from 'react';
import { ActiveUser } from '../../store/active-user/types';
import { Account } from '../../store/accounts/types';

interface Props {
  account: Account;
  activeUser: ActiveUser | null;
  title: string;
  description: string;
  slot?: JSX.Element;
  amountSlot?: JSX.Element;
  actionSlot?: JSX.Element;
  isAlternative?: boolean;
}

export const WalletSpkSection = (props: Props) => {
  return <div className={"balance-row hive " + (props.isAlternative ? "alternative" : "")}>
    <div className="balance-info">
      <div className="title">{props.title}</div>
      <div className="description">{props.description}</div>
      {props.slot}
    </div>
    <div className="balance-values">
      <div className="amount">{props.amountSlot}</div>
      {props.account.name === props.activeUser?.username ? <div className="action">{props.actionSlot}</div> : <></>}
    </div>
  </div>
}