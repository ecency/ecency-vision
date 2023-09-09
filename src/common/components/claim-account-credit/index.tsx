import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { arrowLeftSvg, plusCircle } from "../../img/svg";
import "./index.scss";
import { FullAccount } from "../../store/accounts/types";
import { useAccountClaiming } from "../../api/mutations";
import { _t } from "../../i18n";
import KeyOrHot from "../key-or-hot";
import { useMappedStore } from "../../store/use-mapped-store";

interface Props {
  account: FullAccount;
}

const ClaimAccountCredit = ({ account }: Props) => {
  const { global, activeUser } = useMappedStore();
  const { mutateAsync: claimAccount, isLoading, error, reset } = useAccountClaiming(account);

  const [key, setKey] = useState("");
  const [isKeySetting, setIsKeySetting] = useState(false);

  return (
    <>
      {account.pending_claimed_accounts > 0 && (
        <div className="claim-credit">
          {isKeySetting ? (
            <>
              <div className="claim-credit-title">
                <div className="claim-credit-title-back" onClick={() => setIsKeySetting(false)}>
                  {arrowLeftSvg}
                </div>
                {_t("rc-info.you-claiming", { n: account.pending_claimed_accounts })}
              </div>
              {error ? (
                <small className="d-block text-danger">{(error as Error)?.message}</small>
              ) : (
                <></>
              )}
              <KeyOrHot
                keyOnly={true}
                inProgress={isLoading}
                signingKey={key}
                setSigningKey={(k) => setKey(k)}
                global={global}
                activeUser={activeUser}
                onKey={(key) => claimAccount(key)}
              />
            </>
          ) : (
            <>
              <div className="claim-credit-title">{_t("rc-info.you-have-unclaimed-rc")}</div>
              <Button
                size="sm"
                className="p-1 pl-2 d-flex align-items-center"
                onClick={() => setIsKeySetting(true)}
              >
                <span className="mr-2">{account.pending_claimed_accounts}</span>
                {plusCircle}
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ClaimAccountCredit;
