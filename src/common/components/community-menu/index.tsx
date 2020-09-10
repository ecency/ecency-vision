import React, {Component} from "react";

import {History, Location} from "history";

import isEqual from "react-fast-compare";

import {EntryFilter, Global} from "../../store/global/types";
import {Community} from "../../store/communities/types";
import {Account} from "../../store/accounts/types";

import ListStyleToggle from "../list-style-toggle/index";
import Subscribers from "../community-subscribers";
import Activities from "../community-activities";

import {_t} from "../../i18n";

import DropDown, {MenuItem} from "../dropdown";


interface Props {
    history: History;
    location: Location;
    global: Global;
    community: Community;
    addAccount: (data: Account) => void;
    toggleListStyle: () => void;
}

interface State {
    subscribers: boolean;
    activities: boolean;
}

export class CommunityMenu extends Component<Props, State> {
    state: State = {
        subscribers: false,
        activities: false
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return !isEqual(this.props.location, nextProps.location)
            || !isEqual(this.props.global, nextProps.global)
            || !isEqual(this.state, nextState);
    }

    toggleSubscribers = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();

        const {subscribers} = this.state;
        this.setState({subscribers: !subscribers});
    }

    toggleActivities = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();

        const {activities} = this.state;
        this.setState({activities: !activities});
    }

    render() {
        const {community, global} = this.props;
        const {subscribers, activities} = this.state;

        const {filter} = global;

        const menuConfig: {
            history: History,
            label: string,
            items: MenuItem[]
        } = {
            history: this.props.history,
            label: _t(`entry-filter.filter-${filter}`),
            items: [
                ...[EntryFilter.trending, EntryFilter.hot, EntryFilter.created].map((x) => {
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
                    <a href={`/${filter}/${community.name}`} className="menu-item selected-item">
                        {_t('community.posts')}
                    </a>
                    <a href="#" className="menu-item" onClick={this.toggleSubscribers}>
                        {_t('community.subscribers')}
                    </a>
                    <a href="#" className="menu-item" onClick={this.toggleActivities}>
                        {_t('community.activities')}
                    </a>
                </div>
                <div className="section-filter">
                    <DropDown {...menuConfig} float="right"/>
                </div>
                <div className="page-tools"><ListStyleToggle global={this.props.global} toggleListStyle={this.props.toggleListStyle}/></div>
                {subscribers && <Subscribers {...this.props} onHide={this.toggleSubscribers}/>}
                {activities && <Activities {...this.props} onHide={this.toggleActivities}/>}
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
        toggleListStyle: p.toggleListStyle,
        addAccount: p.addAccount
    }

    return <CommunityMenu {...props} />
}
