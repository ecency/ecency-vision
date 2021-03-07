import moment from "moment";

import {RCAccount} from "@hiveio/dhive/lib/chain/rc";

import React from "react";

import {OverlayTrigger, Tooltip} from "react-bootstrap";

import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";

import BaseComponent from "../base";

import {findRcAccounts, votingPower, votingValue, powerRechargeTime, rcPower} from "../../api/hive";

import {_t} from "../../i18n";

import {informationVariantSvg, hiveSvg} from "../../img/svg";

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
    }

    componentDidMount() {
        const {account} = this.props;
        findRcAccounts(account.name).then(r => {
            this.stateSet({rcAccount: r[0]});
        })
    }

    render() {
        const {account, dynamicProps} = this.props;
        if (!account.__loaded) {
            return null;
        }


        const vPower = votingPower(account, false);
        const vPowerFixed = (vPower / 100).toFixed(2);
        const vPowerRecharge = powerRechargeTime(vPower);
        const vPowerRechargeDate = moment().add(vPowerRecharge, "seconds");

        const vValue = votingValue(account, dynamicProps, vPower).toFixed(3)
        const vValueFull = votingValue(account, dynamicProps, 10000).toFixed(3)

        const created = moment.utc(account.created).format("LL");

        const lastVoteDate = moment.utc(account.last_vote_time);
        const lastPostDate = moment.utc(account.last_post);
        const lastActive = moment.max(lastVoteDate, lastPostDate);

        const tooltip = <Tooltip id="profile-tooltip" style={{zIndex: 10}}>
            <div className="profile-info-tooltip-content">
                <p>{_t("profile-info.joined", {n: created})}</p>
                <p>{_t("profile-info.last-active", {n: lastActive.fromNow()})}</p>
                <p>
                    {_t("profile-info.vote-value", {n: vValue})}
                    {hiveSvg}
                    {vValue !== vValueFull && <small>{_t("profile-info.vote-value-max", {n: vValueFull})}</small>}
                </p>
                <p>{_t("profile-info.vote-power", {n: vPowerFixed})}
                    {vPowerFixed !== "100.00" && <small>
                        {_t("profile-info.recharge-time", {n: vPowerRechargeDate.fromNow()})}
                    </small>}
                </p>
                {(() => {
                    const {rcAccount} = this.state;
                    if (!rcAccount) {
                        return null;
                    }

                    const rcp = rcPower(rcAccount);
                    const rcpFixed = rcp.toFixed(2);
                    const rcpRecharge = powerRechargeTime(rcp);
                    const rcpRechargeDate = moment().add(rcpRecharge, "seconds");

                    return <p>
                        {_t("profile-info.rc-power", {n: rcp})}
                        {rcpFixed !== "100.00" && <small>
                            {_t("profile-info.recharge-time", {n: rcpRechargeDate.fromNow()})}
                        </small>}
                    </p>;
                })()}
            </div>
        </Tooltip>

        return <span className="profile-info">
            <OverlayTrigger placement="bottom" overlay={tooltip}>{informationVariantSvg}</OverlayTrigger>
        </span>
    }

}

export default (p: Props) => {
    const props: Props = {
        account: p.account,
        dynamicProps: p.dynamicProps
    }

    return <ProfileInfo {...props} />
}
