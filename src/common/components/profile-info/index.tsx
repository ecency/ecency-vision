import React from "react";
import moment from "moment";
import { RCAccount } from "@hiveio/dhive/lib/chain/rc";
import { Account, FullAccount } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import BaseComponent from "../base";
import {
  downVotingPower,
  findRcAccounts,
  powerRechargeTime,
  rcPower,
  votingPower,
  votingValue
} from "../../api/hive";
import { _t } from "../../i18n";
import { hiveSvg, informationVariantSvg } from "../../img/svg";
import formattedNumber from "../../util/formatted-number";
import "./_index.scss";

interface ContentProps {
  account: FullAccount;
  dynamicProps: DynamicProps;
  rcAccount: RCAccount;
}

export class InfoContent extends BaseComponent<ContentProps> {
  render() {
    const { account, dynamicProps, rcAccount } = this.props;

    // Voting power
    const vPower = votingPower(account);
    const vPowerFixed = vPower.toFixed(2);
    const vPowerRecharge = powerRechargeTime(vPower);
    const vPowerRechargeDate = moment().add(vPowerRecharge, "seconds");

    // Voting value
    const vValue = votingValue(account, dynamicProps, vPower * 100).toFixed(3);
    const vValueFull = votingValue(account, dynamicProps, 10000).toFixed(3);

    // Join date
    const created = moment.utc(account.created).format("LL");

    // Last active
    const lastVoteDate = moment.utc(account.last_vote_time);
    const lastPostDate = moment.utc(account.last_post);
    const createdDate = moment.utc(account.created);
    const lastActive = moment.max(lastVoteDate, lastPostDate, createdDate);

    // Down vote power
    const dvPower = downVotingPower(account);

    // Resource credits
    const rcp = rcPower(rcAccount);
    const rcpFixed = rcp.toFixed(2);
    const rcpRecharge = powerRechargeTime(rcp);
    const rcpRechargeDate = moment().add(rcpRecharge, "seconds");

    return (
      <div className="profile-info-tooltip-content">
        <p>{_t("profile-info.joined", { n: created })}</p>
        <p>
          {_t("profile-info.post-count", {
            n: formattedNumber(account.post_count!, { fractionDigits: 0 })
          })}
        </p>
        <p>{_t("profile-info.last-active", { n: lastActive.fromNow() })}</p>
        <p>
          {_t("profile-info.vote-value", { n: vValue })}
          {hiveSvg}
          {vValue !== vValueFull && (
            <small>{_t("profile-info.vote-value-max", { n: vValueFull })}</small>
          )}
        </p>
        <p>
          {_t("profile-info.vote-power", { n: vPowerFixed })}
          {vPowerFixed !== "100.00" && (
            <small>{_t("profile-info.recharge-time", { n: vPowerRechargeDate.fromNow() })}</small>
          )}
        </p>
        <p>{_t("profile-info.down-vote-power", { n: dvPower.toFixed(2) })}</p>
        <p>
          {_t("profile-info.rc-power", { n: rcpFixed })}
          {rcpFixed !== "100.00" && (
            <small>{_t("profile-info.recharge-time", { n: rcpRechargeDate.fromNow() })}</small>
          )}
        </p>
      </div>
    );
  }
}

interface Props {
  account: Account;
  dynamicProps: DynamicProps;
}

interface State {
  rcAccount: null | RCAccount;
}

export class ProfileInfo extends BaseComponent<Props, State> {
  state: State = {
    rcAccount: null
  };

  componentDidMount() {
    const { account } = this.props;

    findRcAccounts(account.name).then((r) => {
      this.stateSet({ rcAccount: r[0] });
    });
  }

  render() {
    const { account } = this.props;
    const { rcAccount } = this.state;
    if (account?.__loaded && rcAccount) {
      const tooltip = (
        <Tooltip id="profile-tooltip" style={{ zIndex: 10 }}>
          <InfoContent {...this.props} account={account} rcAccount={rcAccount} />
        </Tooltip>
      );

      return (
        <span className="profile-info">
          <OverlayTrigger placement="bottom" overlay={tooltip}>
            {informationVariantSvg}
          </OverlayTrigger>
        </span>
      );
    }

    return <span className="profile-info">{informationVariantSvg}</span>;
  }
}

export default (p: Props) => {
  const props: Props = {
    account: p.account,
    dynamicProps: p.dynamicProps
  };

  return <ProfileInfo {...props} />;
};
