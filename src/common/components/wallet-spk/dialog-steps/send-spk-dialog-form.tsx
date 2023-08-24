import { WalletSpkGroup } from "../wallet-spk-group";
import { Alert, Button, Form } from "react-bootstrap";
import { SearchByUsername } from "../../search-by-username";
import { _t } from "../../../i18n";
import React from "react";
import { ActiveUser } from "../../../store/active-user/types";
import { Transactions } from "../../../store/transactions/types";
import { InputGroup } from "@ui/input";

interface Props {
  activeUser: ActiveUser | null;
  username: string;
  amount: string;
  balance: string;
  memo: string;
  setMemo: (value: string) => void;
  setUsername: (value: string) => void;
  setAmount: (value: string) => void;
  submit: Function;
  asset: string;
  transactions: Transactions;
}

export const SendSpkDialogForm = ({
  activeUser,
  amount,
  setUsername,
  setAmount,
  balance,
  memo,
  setMemo,
  submit,
  username,
  asset,
  transactions
}: Props) => {
  const recent = [
    ...new Set(
      transactions.list
        .filter(
          (x) =>
            (x.type === "transfer" && x.from === activeUser!.username) ||
            (x.type === "delegate_vesting_shares" && x.delegator === activeUser!.username)
        )
        .map((x) =>
          x.type === "transfer" ? x.to : x.type === "delegate_vesting_shares" ? x.delegatee : ""
        )
        .filter((x) => {
          if (username.trim() === "") {
            return true;
          }

          return x.indexOf(username) !== -1;
        })
        .reverse()
        .slice(0, 5)
    )
  ];

  return (
    <>
      <WalletSpkGroup label="wallet.spk.send.from">
        <InputGroup prepend="@">
          <Form.Control
            type="text"
            autoFocus={true}
            placeholder=""
            value={activeUser!.username}
            onChange={() => {}}
          />
        </InputGroup>
      </WalletSpkGroup>
      <WalletSpkGroup label="wallet.spk.send.to">
        <SearchByUsername
          username={username}
          activeUser={activeUser}
          excludeActiveUser={true}
          setUsername={setUsername}
          recent={recent}
        />
      </WalletSpkGroup>
      <WalletSpkGroup label="wallet.spk.send.amount">
        <>
          <InputGroup prepend="#">
            <Form.Control
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

      <WalletSpkGroup label="wallet.spk.send.memo">
        <Form.Control
          type="text"
          autoFocus={true}
          placeholder=""
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
        />
      </WalletSpkGroup>
      <WalletSpkGroup label="">
        <Button disabled={!amount || !username} variant={"primary"} onClick={() => submit()}>
          {_t("wallet.spk.send.next")}
        </Button>
      </WalletSpkGroup>
    </>
  );
};
