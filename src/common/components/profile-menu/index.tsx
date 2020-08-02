import React, {Component} from "react";

import {Link} from "react-router-dom";

import {Global} from "../../store/global/types";

import ListStyleToggle from "../list-style-toggle/index";

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names";

interface Props {
    global: Global;
    username: string;
    section: string;
    toggleListStyle: () => void;
}

export class ProfileMenu extends Component<Props> {
    render() {
        const {username, section} = this.props;
        return (
            <div className="profile-menu">
                <div className="profile-menu-items">
                    {["posts", "comments", "replies", "wallet"].map((s, k) => {
                        return (
                            <Link key={k} className={_c(`menu-item ${section === s && "selected-item"}`)} to={`/@${username}/${s}`}>
                                {_t(`profile.section-${s}`)}
                            </Link>
                        );
                    })}
                </div>

                <div className="page-tools">{section !== "wallet" && <ListStyleToggle global={this.props.global} toggleListStyle={this.props.toggleListStyle}/>}</div>
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        global: p.global,
        username: p.username,
        section: p.section,
        toggleListStyle: p.toggleListStyle,
    }

    return <ProfileMenu {...props} />
}
