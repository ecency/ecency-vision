import React, {Component} from "react";

import {History} from "history";

import {Button} from "react-bootstrap";

import DownloadTrigger from "../download-trigger";

import moment from "moment";

import {Account} from "../../store/accounts/types";
import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";
import {Followers, Following} from "../friends";

import accountReputation from "../../helper/account-reputation";

import formattedNumber from "../../util/formatted-number";

import defaults from "../../constants/defaults.json";

import {vpMana} from "../../api/hive";

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

interface Props {
    history: History;
    account: Account;
    addAccount: (data: Account) => void;
}

interface State {
    followersList: boolean;
    followingList: boolean;
}

export class ProfileCard extends Component<Props, State> {
    state: State = {
        followersList: false,
        followingList: false,
    };

    componentDidUpdate(prevProps: Readonly<Props>): void {
        // Hide dialogs when account change
        if (this.props.account.name !== prevProps.account.name) {
            this.setState({followersList: false});
            this.setState({followingList: false});
        }
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
        const {account} = this.props;

        const vPower = account.__loaded ? vpMana(account) : 100;

        return (
            <div className="profile-card">
                <div className="follow-controls">
                    <DownloadTrigger>
                        <Button variant="primary">{accountPlusSvg}</Button>
                    </DownloadTrigger>
                </div>

                <div className="profile-avatar">
                    <UserAvatar username={account.name} size="xLarge"/>
                    {account.__loaded && <div className="reputation">{accountReputation(account.reputation!)}</div>}
                </div>

                <div className="username">{account.name}</div>

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
                            <a target="_external" className="website-link" href={account.profile.website}>
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
                {this.state.followersList && <Followers {...this.props} account={account} onHide={this.toggleFollowers}/>}
                {this.state.followingList && <Following {...this.props} account={account} onHide={this.toggleFollowing}/>}
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        account: p.account,
        addAccount: p.addAccount,
    }

    return <ProfileCard {...props} />;
}

