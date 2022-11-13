import React from "react";
import { ActiveUser } from "../../../store/active-user/types";
import { SendSpkDialogPowerUpForm } from "./send-spk-dialog-power-up-form";

interface Props {
  activeUser: ActiveUser | null;
  amount: string;
  balance: string;
  setAmount: (value: string) => void;
  submit: Function;
  asset: string;
}

export const SendSpkDialogLockForm = ({
  activeUser,
  amount,
  setAmount,
  balance,
  submit,
  asset
}: Props) => {
  return (
    <SendSpkDialogPowerUpForm
      activeUser={activeUser}
      amount={amount}
      balance={balance}
      setAmount={setAmount}
      submit={submit}
      asset={asset}
    />
  );
};
