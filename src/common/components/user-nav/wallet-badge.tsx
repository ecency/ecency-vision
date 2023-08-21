import React from 'react';
import { Link } from 'react-router-dom';
import HiveWallet from '../../helper/hive-wallet';
import { _t } from '../../i18n';
import { creditCardSvg } from '../../img/svg';
import ToolTip from "../tooltip";
import { UserNavProps } from './types/usernav-types';

const WalletBadge = (props: UserNavProps) => {
  const { activeUser, dynamicProps, icon } = props;

  let hasUnclaimedRewards = false;
  const { data: account } = activeUser;

  if (account.__loaded) {
    hasUnclaimedRewards = new HiveWallet(account, dynamicProps).hasUnclaimedRewards;
  }

  return (
    <>
      <ToolTip
        content={
          hasUnclaimedRewards ? _t("user-nav.unclaimed-reward-notice") : _t("user-nav.wallet")
        }
      >
        <Link to={`/@${activeUser.username}/wallet`} className="user-wallet">
          {hasUnclaimedRewards && <span className="reward-badge" />}
          {icon ?? creditCardSvg}
        </Link>
      </ToolTip>
    </>
  );
}

export default WalletBadge;
