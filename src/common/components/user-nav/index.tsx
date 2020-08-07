import React, {Component} from "react";
import {History, Location} from "history";
import {Link} from "react-router-dom";

import {Global} from "../../store/global/types";
import {User} from "../../store/users/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType, UI} from "../../store/ui/types";
import {NotificationFilter, Notifications} from "../../store/notifications/types";

import ToolTip from "../tooltip";
import UserAvatar from "../user-avatar";
import DropDown from "../dropdown";
import UserNotifications from "../notifications";

import {_t} from "../../i18n";

import {creditCardSvg, bellSvg} from "../../img/svg";

import parseAsset from "../../helper/parse-asset";


interface Props {
    global: Global;
    history: History;
    location: Location;
    users: User[];
    ui: UI;
    activeUser: ActiveUser;
    notifications: Notifications;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    addAccount: (data: Account) => void;
    fetchNotifications: (since: string | null) => void;
    fetchUnreadNotificationCount: () => void;
    setNotificationsFilter: (filter: NotificationFilter | null) => void;
    markNotifications: (id: string | null) => void;
    toggleUIProp: (what: ToggleType) => void;
}

export default class UserNav extends Component<Props> {
    toggleLogin = () => {
        const {toggleUIProp} = this.props;
        toggleUIProp('login');
    };

    toggleGallery = () => {
        const {toggleUIProp} = this.props;
        toggleUIProp('gallery');
    }

    toggleNotifications = () => {
        const {toggleUIProp} = this.props;
        toggleUIProp('notifications');
    }

    render() {
        const {activeUser, ui, notifications} = this.props;
        const {unread} = notifications;

        let hasUnclaimedRewards = false;
        const {data: account} = activeUser;

        if (account.__loaded) {
            const rewardHiveBalance = parseAsset(account.reward_steem_balance || account.reward_hive_balance).amount;
            const rewardHbdBalance = parseAsset(account.reward_sbd_balance || account.reward_hbd_balance).amount;
            const rewardVestingHive = parseAsset(account.reward_vesting_steem || account.reward_vesting_hive).amount;
            hasUnclaimedRewards = rewardHiveBalance > 0 || rewardHbdBalance > 0 || rewardVestingHive > 0;
        }

        const dropDownConfig = {
            history: this.props.history,
            label: UserAvatar({...this.props, username: activeUser.username, size: "medium"}),
            items: [
                {
                    label: _t('user-nav.profile'),
                    href: `/@${activeUser.username}`,
                },
                {
                    label: _t('user-nav.gallery'),
                    onClick: this.toggleGallery,
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

                    <ToolTip content={_t("user-nav.notifications")}>
                        <span className="notifications" onClick={this.toggleNotifications}>
                             {unread > 0 && (
                                 <span className="notifications-badge">
                                     {unread.toString().length < 3 ? unread : '...'}
                                 </span>
                             )}
                            {bellSvg}
                        </span>
                    </ToolTip>

                    <DropDown {...dropDownConfig} float="right" header={`@${activeUser.username}`}/>
                </div>
                {ui.notifications && <UserNotifications {...this.props} />}
            </>
        );
    }
}
