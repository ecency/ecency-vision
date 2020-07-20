import React, {Component} from "react";
import {History, Location} from "history";
import {Link} from "react-router-dom";

import {User} from "../../store/users/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType} from "../../store/ui/types";

import ToolTip from "../tooltip";
import UserAvatar from "../user-avatar";
import DropDown from "../dropdown";

import {_t} from "../../i18n";

import {creditCardSvg} from "../../img/svg";

import parseAsset from "../../helper/parse-asset";


interface Props {
    history: History;
    location: Location;
    users: User[];
    activeUser: ActiveUser;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
}

export default class UserNav extends Component<Props> {
    toggleLogin = () => {
        const {toggleUIProp} = this.props;
        toggleUIProp('login');
    };

    render() {
        const {activeUser} = this.props;

        let hasUnclaimedRewards = false;
        const {data: account} = activeUser;

        if (account.__loaded) {
            const rewardHiveBalance = parseAsset(account.reward_steem_balance || account.reward_hive_balance).amount;
            const rewardHbdBalance = parseAsset(account.reward_sbd_balance || account.reward_hbd_balance).amount;
            const rewardVestingHive = parseAsset(account.reward_vesting_steem || account.reward_vesting_hive).amount;
            hasUnclaimedRewards = rewardHiveBalance > 0 || rewardHbdBalance > 0 || rewardVestingHive > 0;
        }

        const dropDownConfig = {
            label: <UserAvatar username={activeUser.username} size="medium"/>,
            items: [
                {
                    label: _t('user-nav.profile'),
                    href: `/@${activeUser.username}`,
                },
                {
                    label: _t('g.login-as'),
                    onClick: this.toggleLogin,
                },
                {
                    label: _t('user-nav.logout'),
                    onClick: () => {
                        const {setActiveUser} = this.props;
                        setActiveUser(null);
                    },
                },
            ],
        };

        return (
            <>
                <div className="user-nav">
                    <ToolTip content={hasUnclaimedRewards ? _t("user-nav.unclaimed-points-notice") : _t("user-nav.wallet")}>
                        <Link to={`/@${activeUser.username}/wallet`} className="user-wallet">
                            {hasUnclaimedRewards && <span className="reward-badge"/>}
                            {creditCardSvg}
                        </Link>
                    </ToolTip>
                    <DropDown {...{...this.props, ...dropDownConfig}} float="right" header={`@${activeUser.username}`}/>
                </div>
            </>
        );
    }
}
