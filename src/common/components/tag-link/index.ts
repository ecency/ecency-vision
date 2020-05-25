import React, {Component} from 'react';

import {State as GlobalState} from '../../store/global/types';
import {Location, History} from 'history';
import {State as CommunitiesState} from "../../store/communities/types";

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

interface State {
    label: string
}

export default class TagLink extends Component<Props, State> {
    state: State = {
        label: ''
    };

    componentDidMount() {
        const {tag} = this.props;

        if (tag.startsWith('hive-')) {
            this.props.fetchCommunity(tag);
        }
    }

    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        const {label} = this.state;
        const {tag, children} = this.props;

        // tag changed.
        if (children.props.className !== nextProps.children.props.className) {
            return true;
        }

        // already got label. skip.
        if (label !== '') {
            return false;
        }

        // if the tag in communities store
        return !!nextProps.communities.list[tag];
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
        const {label} = this.state;
        if (label !== '') {
            return;
        }

        const {tag} = this.props;
        const {communities} = this.props;

        if (communities.list[tag]) {
            this.setState({label: communities.list[tag].title})
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
        const {children, global, tag} = this.props;
        const {label} = this.state;

        const {filter} = global;

        const href = makePath(filter, tag);

        const props = Object.assign({}, children.props, {href, onClick: this.clicked});

        if (label) {
            props.children = label;
        }

        return React.createElement('a', props);
    }
}
