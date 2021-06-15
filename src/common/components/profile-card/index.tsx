import React, {Component} from "react";

import {History} from "history";

import {Link} from "react-router-dom";

import isEqual from "react-fast-compare";

import moment from "moment";

import {Global} from "../../store/global/types";
import {Account, FullAccount} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";

import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";
import {Followers, Following} from "../friends";

import accountReputation from "../../helper/account-reputation";

import formattedNumber from "../../util/formatted-number";

import defaults from "../../constants/defaults.json";

import {votingPower} from "../../api/hive";

import {_t} from "../../i18n";

import {
    formatListBulledttedSvg,
    accountMultipleSvg,
    accountPlusSvg,
    nearMeSvg,
    earthSvg,
    calendarRangeSvg,
    rssSvg,
} from "../../img/svg";

import { EditPic } from '../community-card'

interface Props {
    global: Global;
    history: History;
    activeUser: ActiveUser | null;
    account: any;
    addAccount: (data: Account) => void;
    updateActiveUser: (data?: Account) => void;
}

interface State {
    followersList: boolean;
    followingList: boolean;
}

export class ProfileCard extends Component<Props, State> {
    state: State = {
        followersList: false,
        followingList: false
    };

    componentDidUpdate(prevProps: Readonly<Props>): void {
        // Hide dialogs when account change
        if (this.props.account.name !== prevProps.account.name) {
            this.setState({followersList: false});
            this.setState({followingList: false});
        }
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return !isEqual(this.props.account, nextProps.account)
            || !isEqual(this.props.activeUser, nextProps.activeUser)
            || !isEqual(this.state, nextState);
    }

    toggleFollowers = () => {
        const {followersList} = this.state;
        this.setState({followersList: !followersList});
    };

    toggleFollowing = () => {
        const {followingList} = this.state;
        this.setState({followingList: !followingList});
    };
    
    render() {
        const {account, activeUser} = this.props;
        if (!account.__loaded) {
            return <div className="profile-card">
                <div className="profile-avatar">
                    {UserAvatar({...this.props, username: account.name, size: "xLarge"})}
                </div>

                <h1>
                    <div className="username">{account.name}</div>
                </h1>
            </div>
        }

        const vPower = votingPower(account);

        const isMyProfile = activeUser && activeUser.username === account.name && activeUser.data.__loaded && activeUser.data.profile;

        return (
            <div className="profile-card">
                <div className="profile-avatar">
                    {UserAvatar({...this.props, username: account.name, size: "xLarge", src: account.profile?.profile_image})}
                    {isMyProfile && <EditPic {...this.props} account={account as FullAccount} activeUser={activeUser!}/>}
                    {account.__loaded && <div className="reputation">{accountReputation(account.reputation!)}</div>}
                </div>

                <h1>
                    <div className="username">{account.name}</div>
                </h1>

                <div className="vpower-line">
                    <div className="vpower-line-inner" style={{width: `${vPower}%`}}/>
                </div>

                <div className="vpower-percentage">
                    <Tooltip content={_t("profile.voting-power")}>
                        <span>{vPower.toFixed(2)}</span>
                    </Tooltip>
                </div>

                {(account.profile?.name || account.profile?.about) && (
                    <div className="basic-info">
                        {account.profile?.name && <div className="full-name">{account.profile.name}</div>}
                        {account.profile?.about && <div className="about">{account.profile.about}</div>}
                    </div>
                )}

                {account.__loaded && (
                    <div className="stats">
                        <div className="stat">
                            <Tooltip content={_t("profile.post-count")}>
                                <span>
                                    {formatListBulledttedSvg} {formattedNumber(account.post_count!, {fractionDigits: 0})}
                                </span>
                            </Tooltip>
                        </div>

                        {account.follow_stats?.follower_count !== undefined && (
                            <div className="stat followers">
                                <Tooltip content={_t("profile.followers")}>
                                    <span onClick={this.toggleFollowers}>
                                        {accountMultipleSvg} {formattedNumber(account.follow_stats.follower_count, {fractionDigits: 0})}
                                    </span>
                                </Tooltip>
                            </div>
                        )}

                        {account.follow_stats?.following_count !== undefined && (
                            <div className="stat following">
                                <Tooltip content={_t("profile.following")}>
                                    <span onClick={this.toggleFollowing}>
                                        {accountPlusSvg} {formattedNumber(account.follow_stats.following_count, {fractionDigits: 0})}
                                    </span>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                )}

                <div className="extra-props">
                    {account.profile?.location && (
                        <div className="prop">
                            {nearMeSvg} {account.profile.location}
                        </div>
                    )}

                    {account.profile?.website && (
                        <div className="prop">
                            {earthSvg}
                            <a target="_external" className="website-link" href={`https://${account.profile.website.replace(/^(https?|ftp):\/\//,"")}`}>
                                {account.profile.website}
                            </a>
                        </div>
                    )}

                    {account.created && (
                        <div className="prop">
                            {calendarRangeSvg} {moment(new Date(account.created)).format("LL")}
                        </div>
                    )}

                    <div className="prop">
                        {rssSvg}
                        <a target="_external" href={`${defaults.base}/@${account.name}/rss.xml`}>
                            RSS feed
                        </a>
                    </div>
                </div>

                {isMyProfile && (
                    <div className="btn-controls">
                        <Link className="btn btn-sm btn-primary" to="/witnesses">{_t("profile.witnesses")}</Link>
                        <Link className="btn btn-sm btn-primary" to="/proposals">{_t("profile.proposals")}</Link>
                    </div>
                )}

                {this.state.followersList && <Followers {...this.props} account={account} onHide={this.toggleFollowers}/>}
                {this.state.followingList && <Following {...this.props} account={account} onHide={this.toggleFollowing}/>}
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        global: p.global,
        history: p.history,
        activeUser: p.activeUser,
        account: p.account,
        addAccount: p.addAccount,
        updateActiveUser: p.updateActiveUser
    }

    return <ProfileCard {...props} />;
}

