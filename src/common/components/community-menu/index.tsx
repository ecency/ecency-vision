import React, {Component} from "react";

import {History, Location} from "history";

import isEqual from "react-fast-compare";

import {EntryFilter, Global} from "../../store/global/types";
import {Community} from "../../store/communities/types";

import ListStyleToggle from "../list-style-toggle/index";

import {_t} from "../../i18n";

import DropDown, {MenuItem} from "../dropdown";


interface Props {
    history: History;
    location: Location;
    global: Global;
    community: Community;
    toggleListStyle: () => void;
}

export class CommunityMenu extends Component<Props> {
    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return !isEqual(this.props.location, nextProps.location)
            || !isEqual(this.props.global, nextProps.global)
    }

    render() {
        const {community, global} = this.props;

        const {filter} = global;

        const menuConfig: {
            history: History,
            label: string,
            items: MenuItem[]
        } = {
            history: this.props.history,
            label: filter === EntryFilter.trending ? _t('community.posts') : _t(`entry-filter.filter-${filter}`),
            items: [
                ...[EntryFilter.trending, EntryFilter.hot, EntryFilter.created, EntryFilter.payout].map((x) => {
                    return {
                        label: _t(`entry-filter.filter-${x}`),
                        href: `/${x}/${community.name}`,
                        active: filter === x,
                    };
                }),
            ],
        };

        return (
            <div className="community-menu">
                <div className="menu-items">
                    <span className="community-menu-item selected-item">
                        <DropDown {...menuConfig} float="left"/>
                    </span>
                    <span className="community-menu-item">
                        {_t('community.subscribers')}
                    </span>
                    <span className="community-menu-item">
                        {_t('community.activities')}
                    </span>
                </div>

                <div className="page-tools"><ListStyleToggle global={this.props.global} toggleListStyle={this.props.toggleListStyle}/></div>
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        location: p.location,
        global: p.global,
        community: p.community,
        toggleListStyle: p.toggleListStyle
    }

    return <CommunityMenu {...props} />
}
