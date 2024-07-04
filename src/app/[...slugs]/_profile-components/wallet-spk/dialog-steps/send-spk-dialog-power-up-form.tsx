import { WalletSpkGroup } from "../wallet-spk-group";
import React from "react";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { Alert } from "@ui/alert";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  amount: string;
  balance: string;
  setAmount: (value: string) => void;
  submit: Function;
  asset: string;
}

export const SendSpkDialogPowerUpForm = ({ amount, setAmount, balance, submit, asset }: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return (
    <>
      <WalletSpkGroup label="wallet.spk.send.from">
        <InputGroup prepend="@">
          <FormControl
            type="text"
            autoFocus={true}
            placeholder=""
            value={activeUser!.username}
            onChange={() => {}}
          />
        </InputGroup>
      </WalletSpkGroup>
      <WalletSpkGroup label="wallet.spk.send.amount">
        <>
          <InputGroup prepend="#">
            <FormControl
              type="text"
              autoFocus={true}
              placeholder=""
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <div className="align-self-center ml-1">{asset}</div>
          </InputGroup>
          <div className="balance">
            <span className="balance-label">
              {i18next.t("transfer.balance")}
              {": "}
            </span>
            <span className="balance-num" onClick={() => setAmount(balance)}>
              {balance} {asset}
            </span>
          </div>
        </>
      </WalletSpkGroup>
      {+amount > +balance ? (
        <Alert className="mt-3" appearance="warning">
          {i18next.t("wallet.spk.send.warning")}
        </Alert>
      ) : (
        <></>
      )}
      <WalletSpkGroup label="">
        <Button disabled={!amount} onClick={() => submit()}>
          {i18next.t("wallet.spk.send.next")}
        </Button>
      </WalletSpkGroup>
    </>
  );
};
