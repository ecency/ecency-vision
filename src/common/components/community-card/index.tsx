import React, {Component} from "react";

import {Modal} from "react-bootstrap";

import {History} from "history";

import {Link} from "react-router-dom";

import isEqual from "react-fast-compare";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {Community, roleMap} from "../../store/communities/types";
import {ActiveUser} from "../../store/active-user/types";

import UserAvatar from "../user-avatar";
import ProfileLink from "../profile-link";

import {_t} from "../../i18n";

import ln2list from "../../util/nl2list";

import {
    informationOutlineSvg,
    scriptTextOutlineSvg,
    accountGroupSvg
} from "../../img/svg";

interface Props {
    history: History;
    global: Global;
    community: Community;
    activeUser: ActiveUser | null;
    addAccount: (data: Account) => void;
}

interface DialogInfo {
    title: string;
    content: JSX.Element | null;
}

interface State {
    info: DialogInfo | null;
}

export class CommunityCard extends Component<Props, State> {
    state: State = {
        info: null
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return !isEqual(this.props.community, nextProps.community)
            || !isEqual(this.state, nextState)
            || !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username)
    }

    toggleInfo = (info: DialogInfo | null) => {
        this.setState({info});
    }

    render() {
        const {info} = this.state;
        const {community, activeUser} = this.props;

        const description: JSX.Element | null = community.description.trim() !== "" ?
            <>{ln2list(community.description).map((x, i) => (
                <p key={i}>{x}</p>
            ))}</> : null;

        const rules: JSX.Element | null = community.flag_text.trim() !== "" ?
            <>{ln2list(community.flag_text).map((x, i) => (
                <p key={i}>{'- '}{x}</p>
            ))}</> : null;

        const role = community.team.find(x => x[0] === activeUser?.username);
        const roleInTeam = role ? role[1] : null;
        const canEditTeam = !!(roleInTeam && roleMap[roleInTeam]);

        const team: JSX.Element = <>{
            community.team.map((m, i) => {
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
            })}{canEditTeam && <p><Link to={`/roles/${community.name}`}>{_t('community.edit-roles')}</Link></p>}</>;

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
                    <div className="title">{community.title}</div>
                    <div className="about">{community.about}</div>
                </div>
                <div className="community-sections">
                    {description && (
                        <div className="community-section">
                            <div className="section-header" onClick={() => {
                                this.toggleInfo({title: _t('community.description'), content: description});
                            }}>
                                {informationOutlineSvg} {_t('community.description')}
                            </div>
                            <div className="section-content">{description}</div>
                        </div>
                    )}
                    {rules && (
                        <div className="community-section">
                            <div className="section-header" onClick={() => {
                                this.toggleInfo({title: _t('community.rules'), content: rules});
                            }}>
                                {scriptTextOutlineSvg} {_t('community.rules')}
                            </div>
                            <div className="section-content">{rules}</div>
                        </div>
                    )}
                    <div className="community-section section-team">
                        <div className="section-header" onClick={() => {
                            this.toggleInfo({title: _t('community.team'), content: team});
                        }}>
                            {accountGroupSvg} {_t('community.team')}
                        </div>
                        <div className="section-content">{team}</div>
                    </div>
                </div>

                {info && (
                    <Modal show={true} centered={true} onHide={() => {
                        this.toggleInfo(null);
                    }} animation={false} className="community-info-dialog">
                        <Modal.Header closeButton={true}>
                            <Modal.Title>{info.title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>{info.content}</Modal.Body>
                    </Modal>
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
        activeUser: p.activeUser,
        addAccount: p.addAccount
    }

    return <CommunityCard {...props} />;
}

