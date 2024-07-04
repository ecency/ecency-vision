import { WalletSpkGroup } from "../wallet-spk-group";
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { Alert } from "@ui/alert";
import { Market } from "@/entities";
import { getSpkWallet } from "@/api/spk-api";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import useMount from "react-use/lib/useMount";

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
  markets: Market[];
}

export const SendSpkDialogDelegateForm = ({
  amount,
  username,
  setUsername,
  setAmount,
  balance,
  submit,
  asset,
  markets
}: Props) => {
  const selectRef = useRef<any>();

  const activeUser = useGlobalStore((s) => s.activeUser);

  const [delegatedAlready, setDelegatedAlready] = useState(0);

  useMount(() => {
    setUsername("good-karma.spk");
  });

  const fetchUserDetails = useCallback(
    async (name: string | undefined) => {
      if (name) {
        const wallet = await getSpkWallet(name);
        const totalDelegated = Object.entries(wallet.granting).find(([name]) => name === username);
        if (totalDelegated) {
          setDelegatedAlready(totalDelegated[1] / 1000);
          setAmount((totalDelegated[1] / 1000).toFixed(3));
        }
      }
    },
    [setAmount, username]
  );

  useEffect(() => {
    if (username) {
      setDelegatedAlready(0);
      setAmount("0");
      fetchUserDetails(activeUser?.username);
    }
  }, [activeUser?.username, fetchUserDetails, setAmount, username]);

  const getBalance = () => {
    return (+balance + delegatedAlready).toFixed(3);
  };

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
        <InputGroup prepend="@">
          <FormControl
            type="select"
            ref={selectRef}
            placeholder={i18next.t("wallet.spk.delegate.node-operator-placeholder")}
            className="form-control"
            value={username}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setUsername(event.target.value)}
          >
            {markets.map((market) => (
              <option key={market.name} value={market.name}>
                {market.status} {market.name}
              </option>
            ))}
          </FormControl>
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
            <span className="balance-num" onClick={() => setAmount(getBalance())}>
              {getBalance()} {asset}
            </span>
          </div>
        </>
      </WalletSpkGroup>
      {+amount > +getBalance() ? (
        <Alert className="mt-3" appearance="warning">
          {i18next.t("wallet.spk.send.warning")}
        </Alert>
      ) : (
        <></>
      )}
      <WalletSpkGroup label="">
        <Button disabled={!amount || !username} onClick={() => submit()}>
          {i18next.t("wallet.spk.send.next")}
        </Button>
      </WalletSpkGroup>
    </>
  );
};
