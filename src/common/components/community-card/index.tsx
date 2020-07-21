import React, {Component} from "react";

import {History} from "history";

import isEqual from "react-fast-compare";

import {Button} from "react-bootstrap";

import {Account} from "../../store/accounts/types";
import {Community} from "../../store/community/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType, UI} from "../../store/ui/types";
import {Subscription} from "../../store/subscriptions/types";

import ProfileLink from "../profile-link";
import DownloadTrigger from "../download-trigger";
import SubscriptionBtn from "../subscription-btn";

import ln2list from "../../util/nl2list";
import formattedNumber from "../../util/formatted-number";

import {_t} from "../../i18n";

import {accountGroupSvg} from "../../img/svg";


interface Props {
    history: History;
    users: User[];
    activeUser: ActiveUser | null;
    community: Community;
    ui: UI;
    subscriptions: Subscription[];
    addAccount: (data: Account) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
    updateSubscriptions: (list: Subscription[]) => void;
}

export default class CommunityCard extends Component<Props> {
    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return !isEqual(this.props.community, nextProps.community) ||
            !isEqual(this.props.subscriptions, nextProps.subscriptions) ||
            !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username)
    }

    render() {
        const {community} = this.props;

        const subscribers = formattedNumber(community.subscribers, {fractionDigits: 0});
        const rewards = formattedNumber(community.sum_pending, {fractionDigits: 0});
        const authors = formattedNumber(community.num_authors, {fractionDigits: 0});

        return (
            <div className="community-card">
                <h2 className="community-title">
                    {accountGroupSvg} {community.title}
                </h2>
                <div className="community-panel">
                    <div className="section-about">{community.about}</div>
                    <div className="section-stats">
                        <div className="stat">{_t("community.n-subscribers", {n: subscribers})}</div>
                        <div className="stat">
                            {"$"} {_t("community.n-rewards", {n: rewards})}
                        </div>
                        <div className="stat">{_t("community.n-authors", {n: authors})}</div>
                    </div>
                    <div className="section-controls">
                        <SubscriptionBtn {...this.props} buttonProps={{block: true}}/>
                        <DownloadTrigger>
                            <Button variant="primary" block={true}>
                                {_t("community.post")}
                            </Button>
                        </DownloadTrigger>
                    </div>
                    <div className="section-team">
                        <h4 className="section-header">{_t("community.team")}</h4>
                        {community.team.map((m, i) => {
                            if (m[0].startsWith("hive-")) {
                                return null;
                            }
                            return (
                                <div className="team-member" key={i}>
                                    <ProfileLink {...this.props} username={m[0]}>
                                        <a className="username">{`@${m[0]}`}</a>
                                    </ProfileLink>
                                    <span className="role">{m[1]}</span>
                                    {m[2] !== "" && <span className="extra">{m[2]}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="community-panel">
                    {community.description.trim() !== "" && (
                        <div className="section-description">
                            <h4 className="section-header">{_t("community.description")}</h4>
                            {ln2list(community.description).map((x, i) => (
                                <p key={i}>{x}</p>
                            ))}
                        </div>
                    )}

                    {community.flag_text.trim() !== "" && (
                        <div className="section-rules">
                            <h4 className="section-header">{_t("community.rules")}</h4>
                            <ol>
                                {ln2list(community.flag_text).map((x, i) => (
                                    <li key={i}>{x}</li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {community.lang.trim() !== "" && (
                        <div className="section-lang">
                            <h4 className="section-header">{_t("community.lang")}</h4>
                            {community.lang}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
