import React from "react";
import i18next from "i18next";
import { Tooltip } from "@ui/tooltip";
import { plusCircle } from "@ui/svg";

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
      <div className="title">{i18next.t("wallet.spk.claim.unclaimed-rewards")}</div>
      <div className="rewards">
        {Number(claim) > 0 && <span className="reward-type">{`${claim} ${asset}`}</span>}
        {isActiveUserWallet && (
          <Tooltip content={i18next.t("points.claim-reward-points")}>
            <a className={`claim-btn ${claiming ? "in-progress" : ""}`} onClick={onClaim}>
              {plusCircle}
            </a>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
