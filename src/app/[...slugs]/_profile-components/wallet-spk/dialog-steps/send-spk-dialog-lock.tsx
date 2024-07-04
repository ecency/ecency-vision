import React from "react";
import { SendSpkDialogPowerUpForm } from "./send-spk-dialog-power-up-form";

interface Props {
  amount: string;
  balance: string;
  setAmount: (value: string) => void;
  submit: Function;
  asset: string;
}

export const SendSpkDialogLockForm = ({ amount, setAmount, balance, submit, asset }: Props) => {
  return (
    <SendSpkDialogPowerUpForm
      amount={amount}
      balance={balance}
      setAmount={setAmount}
      submit={submit}
      asset={asset}
    />
  );
};
