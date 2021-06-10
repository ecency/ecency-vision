import React, {Component} from "react";

import {History} from "history";

import {Link} from "react-router-dom";

import {EntryFilter, Global} from "../../store/global/types";
import {ActiveUser} from "../../store/active-user/types";

import DropDown, {MenuItem} from "../dropdown";
import ListStyleToggle from "../list-style-toggle";

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names"

interface Props {
    history: History;
    global: Global;
    activeUser: ActiveUser | null;
    toggleListStyle: () => void;
}

export const isMyPage = (global: Global, activeUser: ActiveUser | null) => {
    const {filter, tag} = global;
    return activeUser !== null &&
        (
            (activeUser.username === tag.replace("@", "") && filter === "feed") ||
            tag === "my"
        );
}

export class EntryIndexMenu extends Component<Props> {
    render() {
        const {activeUser, global} = this.props;
        const {filter, tag} = global;

        const isMy = isMyPage(global, activeUser);

        const menuConfig: {
            history: History,
            label: string,
            items: MenuItem[]
        } = {
            history: this.props.history,
            label: isMy ? _t("entry-filter.filter-feed") : _t(`entry-filter.filter-${filter}`),
            items: [
                ...[EntryFilter.trending, EntryFilter.hot, EntryFilter.created].map((x) => {
                    return {
                        label: _t(`entry-filter.filter-${x}`),
                        href: (tag && tag !== "my" && filter !== "feed") ? `/${x}/${tag}` : `/${x}`,
                        active: !isMy && filter === x,
                        id: x
                    };
                }),
            ],
        };

        return <div className="entry-index-menu">
            <div className="the-menu">
                    <div className="sub-menu">
                        <ul className="nav nav-pills nav-fill">
                            <li className="nav-item">
                                <Link to={`/@${activeUser?.username}/feed`} className={_c(`nav-link link-my ${filter === "feed" ? "active" : ""}`)}>
                                    {_t("entry-filter.filter-feed-friends")}
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to={`/${EntryFilter.created}/my`} className={_c(`nav-link link-my ${tag === "my" ? "active" : ""}`)}>
                                    {_t("entry-filter.filter-feed-subscriptions")}
                                </Link>
                            </li>
                        </ul>
                    </div>
                
                <div className="main-menu">
                    <div className="sm-menu">
                        <DropDown {...menuConfig} float="left"/>
                    </div>
                    <div className="lg-menu">
                        <ul className="nav nav-pills nav-fill">
                            {menuConfig.items.map((i, k) => {
                                return <li key={k} className="nav-item">
                                    <Link to={i.href!} className={_c(`nav-link link-${i.id} ${i.active ? "active" : ""}`)}>{i.label}</Link>
                                </li>
                            })}
                        </ul>
                    </div>
                </div>
            </div>

            <ListStyleToggle global={this.props.global} toggleListStyle={this.props.toggleListStyle}/>
        </div>;
    }
}

export default (p: Props) => {
    const props = {
        history: p.history,
        global: p.global,
        activeUser: p.activeUser,
        toggleListStyle: p.toggleListStyle
    }

    return <EntryIndexMenu {...props} />
}
