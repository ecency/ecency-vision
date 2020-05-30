import React, {Component} from 'react';
import {Location, History} from 'history';

import {State as GlobalState} from '../../store/global/types';

export const makePath = (filter: string, tag: string): string => {
    return `/${filter}/${tag}`;
};

interface Props {
    global: GlobalState,
    history: History,
    location: Location,
    tag: string,
    children: JSX.Element
}

export default class TagLink extends Component<Props> {
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
        const {children, global, tag} = this.props;

        const {filter} = global;

        const href = makePath(filter, tag);

        const props = Object.assign({}, children.props, {href, onClick: this.clicked});

        return React.createElement('a', props);
    }
}
