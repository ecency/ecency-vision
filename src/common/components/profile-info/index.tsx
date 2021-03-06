import React, {Component} from "react";

import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {Account} from "../../store/accounts/types";

import {_t} from "../../i18n"
import {informationVariantSvg} from "../../img/svg";
import moment from "moment";

import {votingPower} from "../../api/hive";

interface InfoProps {
    account: Account;
}

interface InfoState {
    show: boolean;
}


export default class ProfileInfo extends Component<InfoProps, InfoState> {
    state: InfoState = {
        show: false
    }

    render() {
        const {account} = this.props;
        if (!account.__loaded) {
            return null;
        }

        const created = moment.utc(account.created).format("LL");

        const lastVoteDate = moment.utc(account.last_vote_time);
        const lastPostDate = moment.utc(account.last_post);
        const lastActive = moment.max(lastVoteDate, lastPostDate);

        const voteMana = votingPower(account);

        console.log(voteMana);

        const tooltip = <Tooltip id="profile-tooltip" style={{zIndex: 1, marginTop: "6px"}}>
            <div className="profile-info-tooltip-content">
                <p>{_t("profile-info.joined", {n: created})}</p>
                <p>{_t("profile-info.last-active", {n: lastActive.fromNow()})}</p>
            </div>
        </Tooltip>

        return <span className="profile-info">
            <OverlayTrigger placement="bottom" overlay={tooltip}>{informationVariantSvg}</OverlayTrigger>
        </span>
    }

}
