import React, {Component} from "react";
import {History, Location} from "history";
import {Link} from "react-router-dom";

import {User} from "../../store/users/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";

import ToolTip from "../tooltip";
import UserAvatar from "../user-avatar";
import DropDown from "../dropdown";
import Login from "../login";

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
}

interface State {
    login: boolean;
}

export default class UserNav extends Component<Props, State> {
    state: State = {
        login: false,
    };

    toggleLogin = () => {
        const {login} = this.state;
        this.setState({login: !login});
    };

    render() {
        const {activeUser} = this.props;
        const {login} = this.state;

        let hasUnclaimedRewards = false;
        const {data: account} = activeUser;

        if (account.__loaded) {
            const rewardHiveBalance = parseAsset(account.reward_steem_balance).amount;
            const rewardHbdBalance = parseAsset(account.reward_sbd_balance).amount;
            const rewardVestingHive = parseAsset(account.reward_vesting_steem).amount;
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
                {login && <Login {...this.props} onHide={this.toggleLogin} onLogin={this.toggleLogin}/>}
            </>
        );
    }
}
