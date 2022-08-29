import React from 'react';

interface Props {
  title: string;
  description: string;
  slot?: JSX.Element;
  amountSlot?: JSX.Element;
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
    </div>
  </div>
}