import React, {Component} from "react";

import {History} from "history";

import isEqual from "react-fast-compare";


import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {Community} from "../../store/communities/types";

import UserAvatar from "../user-avatar";

import ProfileLink from "../profile-link";

import ln2list from "../../util/nl2list";

import {_t} from "../../i18n";

import {
    informationOutlineSvg,
    scriptTextOutlineSvg,
    earthSvg,
    accountGroupSvg
} from "../../img/svg";

interface Props {
    history: History;
    global: Global;
    community: Community;
    addAccount: (data: Account) => void;
}

export class CommunityCard extends Component<Props> {
    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return !isEqual(this.props.community, nextProps.community);
    }

    render() {
        const {community} = this.props;

        return (
            <div className="community-card">
                <div className="community-avatar">
                    {UserAvatar({
                        ...this.props,
                        username: community.name,
                        size: "xLarge"
                    })}
                </div>
                <div className="community-info">
                    <div className="title">
                        {community.title}
                    </div>
                    <div className="about">
                        {community.about}
                    </div>
                </div>
                {community.description.trim() !== "" && (
                    <div className="community-section">
                        <div className="section-header">
                            {informationOutlineSvg} {_t('community.description')}
                        </div>
                        <div className="section-content">
                            {ln2list(community.description).map((x, i) => (
                                <p key={i}>{x}</p>
                            ))}
                        </div>
                    </div>
                )}
                {community.flag_text.trim() !== "" && (
                    <div className="community-section">
                        <div className="section-header">
                            {scriptTextOutlineSvg} {_t('community.rules')}
                        </div>
                        <div className="section-content">
                            {ln2list(community.flag_text).map((x, i) => (
                                <p key={i}>{'- '}{x}</p>
                            ))}
                        </div>
                    </div>
                )}

                <div className="community-section section-team">
                    <div className="section-header">
                        {accountGroupSvg} {_t('community.team')}
                    </div>
                    <div className="section-content">
                        {community.team.map((m, i) => {
                            if (m[0].startsWith("hive-")) {
                                return null;
                            }
                            return (
                                <div className="team-member" key={i}>
                                    {ProfileLink({...this.props, username: m[0], children: <a className="username">{`@${m[0]}`}</a>})}
                                    <span className="role">{m[1]}</span>
                                    {m[2] !== "" && <span className="extra">{m[2]}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {community.lang.trim() !== "" && (
                    <div className="community-section">
                        <div className="section-header">
                            {earthSvg}  {_t('community.lang')}
                        </div>
                        <div className="section-content">
                            {community.lang.toUpperCase()}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        global: p.global,
        community: p.community,
        addAccount: p.addAccount
    }

    return <CommunityCard {...props} />;
}

