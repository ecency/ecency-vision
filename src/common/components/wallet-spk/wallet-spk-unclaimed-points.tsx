import { _t } from "../../i18n";
import Tooltip from "../tooltip";
import { plusCircle } from "../../img/svg";
import React from "react";

interface Props {
  claim: string;
  asset: string;
  isActiveUserWallet: boolean;
  claiming: boolean;
  onClaim: () => void;
}

export const WalletSpkUnclaimedPoints = ({
  claim,
  asset,
  isActiveUserWallet,
  claiming,
  onClaim
}: Props) => {
  return (
    <div className="unclaimed-rewards">
      <div className="title">{_t("wallet.spk.claim.unclaimed-rewards")}</div>
      <div className="rewards">
        {Number(claim) > 0 && <span className="reward-type">{`${claim} ${asset}`}</span>}
        {isActiveUserWallet && (
          <Tooltip content={_t("points.claim-reward-points")}>
            <a className={`claim-btn ${claiming ? "in-progress" : ""}`} onClick={onClaim}>
              {plusCircle}
            </a>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
