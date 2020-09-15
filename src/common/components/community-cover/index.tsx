import React, {Component} from "react";

import {History} from "history";

import isEqual from "react-fast-compare";

import {Global} from "../../store/global/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Account} from "../../store/accounts/types";
import {UI, ToggleType} from "../../store/ui/types";
import {Community} from "../../store/communities/types";
import {Subscription} from "../../store/subscriptions/types";

import defaults from "../../constants/defaults.json";

import {
    proxifyImageSrc,
    setProxyBase,
    // @ts-ignore
} from "@esteemapp/esteem-render-helpers";

setProxyBase(defaults.imageServer);

import SubscriptionBtn from "../subscription-btn";
import CommunityPostBtn from "../community-post-btn";

import formattedNumber from "../../util/formatted-number";

import {_t} from "../../i18n";

const coverFallbackDay = require("../../img/cover-fallback-day.png");
const coverFallbackNight = require("../../img/cover-fallback-night.png");

interface Props {
    history: History;
    global: Global;
    community: Community;
    account: Account;
    users: User[];
    activeUser: ActiveUser | null;
    subscriptions: Subscription[];
    ui: UI;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
    updateSubscriptions: (list: Subscription[]) => void;
}

export class CommunityCover extends Component<Props> {

    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return !isEqual(this.props.global, nextProps.global)
            || !isEqual(this.props.community, nextProps.community)
            || !isEqual(this.props.subscriptions, nextProps.subscriptions)
            || !isEqual(this.props.account, nextProps.account)
            || !isEqual(this.props.users, nextProps.users)
            || !isEqual(this.props.activeUser, nextProps.activeUser)
            || !isEqual(this.props.ui, nextProps.ui)
    }

    render() {
        const {global, account, community} = this.props;
        let bgImage = "";

        if (account.__loaded) {
            bgImage = global.theme === "day" ? coverFallbackDay : coverFallbackNight;
            if (account.profile?.cover_image) {
                bgImage = proxifyImageSrc(account.profile.cover_image, 0, 0, global.canUseWebp ? 'webp' : 'match');
            }
        }

        let style = {};
        if (bgImage) {
            style = {backgroundImage: `url('${bgImage}')`};
        }

        const subscribers = formattedNumber(community.subscribers, {fractionDigits: 0});
        const rewards = formattedNumber(community.sum_pending, {fractionDigits: 0});
        const authors = formattedNumber(community.num_authors, {fractionDigits: 0});

        return (
            <div className="community-cover">
                <div className="cover-image" style={style}/>
                <div className="controls-holder">
                    <SubscriptionBtn {...this.props} />
                    {CommunityPostBtn({...this.props})}
                </div>
                <div className="community-stats">
                    <div className="community-stat">
                        <div className="stat-value">{subscribers}</div>
                        <div className="stat-label">{_t('community.subscribers')}</div>
                    </div>
                    <div className="community-stat">
                        <div className="stat-value">{"$"} {rewards}</div>
                        <div className="stat-label">{_t('community.rewards')}</div>
                    </div>
                    <div className="community-stat">
                        <div className="stat-value">{authors}</div>
                        <div className="stat-label">{_t('community.authors')}</div>
                    </div>
                    {community.lang.trim() !== "" && (
                        <div className="community-stat">
                            <div className="stat-value">
                                {community.lang.toUpperCase()}
                            </div>
                            <div className="stat-label">
                                {_t('community.lang')}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        global: p.global,
        community: p.community,
        account: p.account,
        users: p.users,
        activeUser: p.activeUser,
        subscriptions: p.subscriptions,
        ui: p.ui,
        setActiveUser: p.setActiveUser,
        updateActiveUser: p.updateActiveUser,
        deleteUser: p.deleteUser,
        toggleUIProp: p.toggleUIProp,
        updateSubscriptions: p.updateSubscriptions
    }

    return <CommunityCover {...props} />
}
