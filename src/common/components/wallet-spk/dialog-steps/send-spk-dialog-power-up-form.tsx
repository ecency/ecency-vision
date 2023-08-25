import { WalletSpkGroup } from "../wallet-spk-group";
import { Alert, Button } from "react-bootstrap";
import { _t } from "../../../i18n";
import React from "react";
import { ActiveUser } from "../../../store/active-user/types";
import { FormControl, InputGroup } from "@ui/input";

interface Props {
  activeUser: ActiveUser | null;
  amount: string;
  balance: string;
  setAmount: (value: string) => void;
  submit: Function;
  asset: string;
}

export const SendSpkDialogPowerUpForm = ({
  activeUser,
  amount,
  setAmount,
  balance,
  submit,
  asset
}: Props) => {
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
              {_t("transfer.balance")}
              {": "}
            </span>
            <span className="balance-num" onClick={() => setAmount(balance)}>
              {balance} {asset}
            </span>
          </div>
        </>
      </WalletSpkGroup>
      {+amount > +balance ? (
        <Alert className="mt-3" variant={"warning"}>
          {_t("wallet.spk.send.warning")}
        </Alert>
      ) : (
        <></>
      )}
      <WalletSpkGroup label="">
        <Button disabled={!amount} variant={"primary"} onClick={() => submit()}>
          {_t("wallet.spk.send.next")}
        </Button>
      </WalletSpkGroup>
    </>
  );
};
