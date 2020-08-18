import React, {Component} from "react";

import {History} from "history";

import {Community} from "../../store/community/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType, UI} from "../../store/ui/types";
import {Subscription} from "../../store/subscriptions/types";
import {Account} from "../../store/accounts/types";

import SubscriptionBtn from "../subscription-btn";
import CommunityPostBtn from "../community-post-btn";

import {_t} from "../../i18n";

import formattedNumber from "../../util/formatted-number";

import {accountGroupSvg} from "../../img/svg";

interface Props {
    history: History;
    users: User[];
    activeUser: ActiveUser | null;
    community: Community;
    ui: UI;
    subscriptions: Subscription[];
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
    updateSubscriptions: (list: Subscription[]) => void;
}

export class CommunityCardSm extends Component<Props> {
    render() {
        const {community} = this.props;

        const subscribers = formattedNumber(community.subscribers, {fractionDigits: 0});
        const rewards = formattedNumber(community.sum_pending, {fractionDigits: 0});
        const authors = formattedNumber(community.num_authors, {fractionDigits: 0});

        return (
            <div className="community-card-sm">
                <h2 className="community-title">
                    {accountGroupSvg} {community.title}
                </h2>
                <div className="community-panel">
                    <div className="infromation">
                        <div className="section-about">{community.about}</div>
                        <div className="section-stats">
                            <div className="stat">{_t("community.n-subscribers", {n: subscribers})}</div>
                            <div className="stat">
                                {"$"} {_t("community.n-rewards", {n: rewards})}
                            </div>
                            <div className="stat">{_t("community.n-authors", {n: authors})}</div>
                        </div>
                    </div>
                    <div className="controls">
                        <SubscriptionBtn {...this.props} />
                        {CommunityPostBtn({...this.props})}
                    </div>
                </div>
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        users: p.users,
        activeUser: p.activeUser,
        community: p.community,
        ui: p.ui,
        subscriptions: p.subscriptions,
        setActiveUser: p.setActiveUser,
        updateActiveUser: p.updateActiveUser,
        deleteUser: p.deleteUser,
        toggleUIProp: p.toggleUIProp,
        updateSubscriptions: p.updateSubscriptions
    };

    return <CommunityCardSm {...props} />;
}
