import React, {Component} from "react";

import {Link} from "react-router-dom";

import {History, Location} from "history";

import isEqual from "react-fast-compare";

import {ProfileFilter, Global} from "../../store/global/types";

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
    toggleListStyle: () => void;
}

export class ProfileMenu extends Component<Props> {
    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return !isEqual(this.props.location, nextProps.location);
    }

    render() {
        const {username, section} = this.props;

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
                    {["communities", "points", "wallet"].map((s, k) => {
                        return (
                            <Link key={k} className={_c(`profile-menu-item ${section === s && "selected-item"}`)} to={`/@${username}/${s}`}>
                                {_t(`profile.section-${s}`)}
                            </Link>
                        );
                    })}
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
        toggleListStyle: p.toggleListStyle,
    }

    return <ProfileMenu {...props} />
}
