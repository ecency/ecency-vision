import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { arrowLeftSvg } from "../../img/svg";
import "./index.scss";
import { FullAccount } from "../../store/accounts/types";
import { useAccountClaiming } from "../../api/mutations";
import { _t } from "../../i18n";
import KeyOrHot from "../key-or-hot";
import { useMappedStore } from "../../store/use-mapped-store";
import { claimAccountByHiveSigner } from "../../api/operations";

interface Props {
  account: FullAccount;
  claimAccountAmount: number;
}

const ClaimAccountCredit = ({ account, claimAccountAmount }: Props) => {
  const { global, activeUser, addAccount } = useMappedStore();
  const {
    mutateAsync: claimAccount,
    isLoading,
    error,
    isSuccess,
    reset
  } = useAccountClaiming(account);

  const [key, setKey] = useState("");
  const [isKeySetting, setIsKeySetting] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      addAccount({
        ...account,
        pending_claimed_accounts: 0
      });
    }
  }, [isSuccess]);

  return (
    <div className="claim-credit">
      <div className="claim-credit-title">
        {isKeySetting ? (
          <div
            className="claim-credit-title-back"
            onClick={() => {
              setIsKeySetting(false);
              reset();
            }}
          >
            {arrowLeftSvg}
          </div>
        ) : (
          <></>
        )}
        {_t("rc-info.claim-accounts")}
        <span className="text-primary">{claimAccountAmount}</span>
      </div>
      {!isSuccess &&
      !isKeySetting &&
      claimAccountAmount > 0 &&
      activeUser?.username === account.name ? (
        <Button size="sm" onClick={() => setIsKeySetting(true)}>
          {_t("rc-info.claim")}
        </Button>
      ) : (
        <></>
      )}
      {isSuccess ? (
        <small className="text-success my-3 d-block">{_t("rc-info.successfully-claimed")}</small>
      ) : (
        <></>
      )}
      {error ? (
        <small className="d-block text-danger my-3">{(error as Error)?.message}</small>
      ) : (
        <></>
      )}
      {isKeySetting && !isSuccess ? (
        <KeyOrHot
          inProgress={isLoading}
          signingKey={key}
          setSigningKey={(k) => setKey(k)}
          global={global}
          activeUser={activeUser}
          onKey={(key) => claimAccount({ key })}
          onHot={() => claimAccountByHiveSigner(account)}
          onKc={() =>
            claimAccount({
              isKeychain: true
            })
          }
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default ClaimAccountCredit;
