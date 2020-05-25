import React, {Component} from 'react';

import {State as GlobalState} from '../../store/global/types';
import {Location, History} from 'history';
import {State as CommunitiesState} from '../../store/communities/types';

export const makePath = (filter: string, tag: string): string => {
    return `/${filter}/${tag}`;
};

interface Props {
    global: GlobalState,
    communities: CommunitiesState,
    history: History,
    location: Location,
    tag: string,
    children: JSX.Element,
    fetchCommunity: (name: string) => void
}

export default class TagLink extends Component<Props> {
    componentDidMount() {
        const {communities, tag} = this.props;

        if (tag.startsWith('hive-') && !communities.list[tag]) {
            this.props.fetchCommunity(tag);
        }
    }

    clicked = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();

        const {tag, global, location, history} = this.props;
        const {filter} = global;

        const newLoc = makePath(filter, tag);

        if (location.pathname === newLoc) {
            // document.querySelector('#app-content').scrollTop = 0;
            // return;
        }

        history.push(newLoc);
    };

    render() {
        const {children, global, tag, communities} = this.props;

        const {filter} = global;

        const href = makePath(filter, tag);

        const props = Object.assign({}, children.props, {href, onClick: this.clicked});

        const communityTitle = communities.list[tag]?.title;
        if (communityTitle) {
            props.children = communityTitle;
        }

        return React.createElement('a', props);
    }
}
