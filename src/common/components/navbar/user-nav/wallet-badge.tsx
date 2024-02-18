import React, { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HiveWallet from "../../../helper/hive-wallet";
import { _t } from "../../../i18n";
import { creditCardSvg } from "../../../img/svg";
import ToolTip from "../../tooltip";
import { useMappedStore } from "../../../store/use-mapped-store";

export const WalletBadge = ({ icon }: { icon: ReactNode }) => {
  const { activeUser, dynamicProps } = useMappedStore();

  const [hasUnclaimedRewards, setHasUnclaimedRewards] = useState(false);

  useEffect(() => {
    if (activeUser?.data?.__loaded) {
      setHasUnclaimedRewards(new HiveWallet(activeUser.data, dynamicProps).hasUnclaimedRewards);
    }
  }, [activeUser]);
  return (
    <>
      <ToolTip
        content={
          hasUnclaimedRewards ? _t("user-nav.unclaimed-reward-notice") : _t("user-nav.wallet")
        }
      >
        <Link to={`/@${activeUser?.username}/wallet`} className="user-wallet">
          {hasUnclaimedRewards && <span className="reward-badge" />}
          {icon ?? creditCardSvg}
        </Link>
      </ToolTip>
    </>
  );
};
