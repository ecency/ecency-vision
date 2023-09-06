import { WalletSpkGroup } from "../wallet-spk-group";
import { Alert } from "react-bootstrap";
import { _t } from "../../../i18n";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { ActiveUser } from "../../../store/active-user/types";
import { Transactions } from "../../../store/transactions/types";
import { getSpkWallet, Market } from "../../../api/spk-api";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";

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
  markets: Market[];
}

export const SendSpkDialogDelegateForm = ({
  activeUser,
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
  const [delegatedAlready, setDelegatedAlready] = useState(0);

  useEffect(() => {
    setUsername("good-karma.spk");
  }, []);

  useEffect(() => {
    if (username) {
      setDelegatedAlready(0);
      setAmount("0");
      fetchUserDetails(activeUser?.username);
    }
  }, [username]);

  const fetchUserDetails = async (name: string | undefined) => {
    if (name) {
      const wallet = await getSpkWallet(name);
      const totalDelegated = Object.entries(wallet.granting).find(([name]) => name === username);
      if (totalDelegated) {
        setDelegatedAlready(totalDelegated[1] / 1000);
        setAmount((totalDelegated[1] / 1000).toFixed(3));
      }
    }
  };

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
            placeholder={_t("wallet.spk.delegate.node-operator-placeholder")}
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
              {_t("transfer.balance")}
              {": "}
            </span>
            <span className="balance-num" onClick={() => setAmount(getBalance())}>
              {getBalance()} {asset}
            </span>
          </div>
        </>
      </WalletSpkGroup>
      {+amount > +getBalance() ? (
        <Alert className="mt-3" variant={"warning"}>
          {_t("wallet.spk.send.warning")}
        </Alert>
      ) : (
        <></>
      )}
      <WalletSpkGroup label="">
        <Button disabled={!amount || !username} onClick={() => submit()}>
          {_t("wallet.spk.send.next")}
        </Button>
      </WalletSpkGroup>
    </>
  );
};
