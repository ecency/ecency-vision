import { WalletSpkGroup } from "../wallet-spk-group";
import React, { useMemo } from "react";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { Alert } from "@ui/alert";
import { SearchByUsername } from "@/features/shared/search-by-username";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import { getTransactionsQuery } from "@/api/queries";

interface Props {
  username: string;
  amount: string;
  balance: string;
  memo: string;
  setMemo: (value: string) => void;
  setUsername: (value: string) => void;
  setAmount: (value: string) => void;
  submit: Function;
  asset: string;
}

export const SendSpkDialogForm = ({
  amount,
  setUsername,
  setAmount,
  balance,
  memo,
  setMemo,
  submit,
  username,
  asset
}: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { data } = getTransactionsQuery(activeUser?.username).useClientQuery();
  const transactions = useMemo(
    () => data?.pages?.reduce((acc, page) => [...acc, ...page]) ?? [],
    [data?.pages]
  );

  const recent = Array.from(
    new Set(
      transactions
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
  );

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
      <WalletSpkGroup label="wallet.spk.send.to">
        <SearchByUsername
          username={username}
          excludeActiveUser={true}
          setUsername={setUsername}
          recent={recent}
        />
      </WalletSpkGroup>
      <WalletSpkGroup label="wallet.spk.send.amount">
        <>
          <InputGroup prepend="#" append={asset}>
            <FormControl
              type="text"
              autoFocus={true}
              placeholder=""
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
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

      <WalletSpkGroup label="wallet.spk.send.memo">
        <FormControl
          type="text"
          autoFocus={true}
          placeholder=""
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
        />
      </WalletSpkGroup>
      <WalletSpkGroup label="">
        <Button disabled={!amount || !username} onClick={() => submit()}>
          {i18next.t("wallet.spk.send.next")}
        </Button>
      </WalletSpkGroup>
    </>
  );
};
