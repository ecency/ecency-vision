import { _t } from '../../i18n';
import Tooltip from '../tooltip';
import { plusCircle } from '../../img/svg';
import React from 'react';

interface Props {
  claim: number;
  isActiveUserWallet: boolean;
  claiming: boolean;
  onClaim: () => void;
}

export const WalletSpkUnclaimedPoints = ({ claim, isActiveUserWallet, claiming, onClaim }: Props) => {
  return <div className="unclaimed-rewards">
    <div className="title">{_t("points.unclaimed-points")}</div>
    <div className="rewards">
      <span className="reward-type">{`${claim}`}</span>
      {isActiveUserWallet && (
        <Tooltip content={_t("points.claim-reward-points")}>
          <a className={`claim-btn ${claiming ? "in-progress" : ""}`} onClick={onClaim}>
            {plusCircle}
          </a>
        </Tooltip>
      )}
    </div>
  </div>
}