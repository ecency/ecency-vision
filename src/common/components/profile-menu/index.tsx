import React, {Component} from "react";

import {Link} from "react-router-dom";

import {History, Location} from "history";

import isEqual from "react-fast-compare";

import {ProfileFilter, Global} from "../../store/global/types";
import {ActiveUser} from "../../store/active-user/types";

import DropDown, {MenuItem} from "../dropdown";
import ListStyleToggle from "../list-style-toggle/index";

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names";

interface Props {
    history: History;
    location: Location;
    global: Global;
    username: string;
    section: string;
    activeUser: ActiveUser | null;
    toggleListStyle: () => void;
}

export class ProfileMenu extends Component<Props> {
    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return !isEqual(this.props.location, nextProps.location) ||
            !isEqual(this.props.global, nextProps.global) ||
            !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username)
    }

    render() {
        const {username, section, activeUser } = this.props;

        const menuConfig: {
            history: History,
            label: string,
            items: MenuItem[]
        } = {
            history: this.props.history,
            label: ProfileFilter[section] ? _t(`profile.section-${section}`) : '',
            items: [
                ...[ProfileFilter.blog, ProfileFilter.posts, ProfileFilter.comments, ProfileFilter.replies].map((x) => {
                    return {
                        label: _t(`profile.section-${x}`),
                        href: `/@${username}/${x}`,
                        active: section === x,
                    };
                }),
            ],
        };

        return (
            <div className="profile-menu">
                <div className="profile-menu-items">
                    {(() => {
                        if (ProfileFilter[section]) {
                            return <span className="profile-menu-item selected-item"><DropDown {...menuConfig} float="left"/></span>;
                        }

                        return <Link className="profile-menu-item" to={`/@${username}`}>
                            {_t(`profile.section-blog`)}
                        </Link>;
                    })()}
                    <Link className={_c(`profile-menu-item ${section === "communities" ? "selected-item" : ""}`)} to={`/@${username}/communities`}>
                        {_t(`profile.section-communities`)}
                    </Link>
                    <Link className={_c(`profile-menu-item ${["wallet", "points"].includes(section) ? "selected-item" : ""}`)} to={`/@${username}/wallet`}>
                        {_t(`profile.section-wallet`)}
                    </Link>
                    {(activeUser && activeUser.username === username) && (
                        <Link className={_c(`profile-menu-item ${section === "settings" ? "selected-item" : ""}`)} to={`/@${username}/settings`}>
                            {_t(`profile.section-settings`)}
                        </Link>
                    )}
                </div>

                <div className="page-tools">{ProfileFilter[section] && <ListStyleToggle global={this.props.global} toggleListStyle={this.props.toggleListStyle}/>}</div>
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        location: p.location,
        global: p.global,
        username: p.username,
        section: p.section,
        activeUser: p.activeUser,
        toggleListStyle: p.toggleListStyle,
    }

    return <ProfileMenu {...props} />
}
