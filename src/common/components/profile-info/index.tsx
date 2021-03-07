import moment from "moment";

import React, {Component} from "react";

import {OverlayTrigger, Tooltip} from "react-bootstrap";

import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";

import {_t} from "../../i18n"

import {informationVariantSvg, hiveSvg} from "../../img/svg";
import {votingPower, votingValue} from "../../api/hive";


interface Props {
    account: Account;
    dynamicProps: DynamicProps;
}

interface State {
    show: boolean;
}

export class ProfileInfo extends Component<Props, State> {
    state: State = {
        show: false
    }

    render() {
        const {account, dynamicProps} = this.props;
        if (!account.__loaded) {
            return null;
        }

        const vPower = votingPower(account, false);

        const vValue = votingValue(account, dynamicProps, vPower).toFixed(3)
        const vValueFull = votingValue(account, dynamicProps, 10000).toFixed(3)

        const created = moment.utc(account.created).format("LL");

        const lastVoteDate = moment.utc(account.last_vote_time);
        const lastPostDate = moment.utc(account.last_post);
        const lastActive = moment.max(lastVoteDate, lastPostDate);

        const tooltip = <Tooltip id="profile-tooltip" style={{zIndex: 1, marginTop: "6px"}}>
            <div className="profile-info-tooltip-content">
                <p>{_t("profile-info.joined", {n: created})}</p>
                <p>{_t("profile-info.last-active", {n: lastActive.fromNow()})}</p>
                <p>
                    {_t("profile-info.vote-value", {n: vValue})}
                    {hiveSvg}
                    {vValue !== vValueFull && <small>{_t("profile-info.vote-value-max", {n: vValueFull})}</small>}
                </p>
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
