import React, {Component} from 'react';
import {History} from 'history';

import isEqual from 'react-fast-compare';

import {State as GlobalState} from '../../store/global/types';

import {getCommunity} from '../../api/hive';

export const makePath = (filter: string, tag: string): string => {
    return `/${filter}/${tag}`;
};

interface Props {
    global: GlobalState,
    history: History,
    tag: string,
    children: JSX.Element
}

interface State {
    comTitle: string
}

export default class TagLink extends Component<Props, State> {
    state: State = {
        comTitle: ''
    };

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>, nextContext: any): boolean {
        return !isEqual(this.props.children, nextProps.children) ||
            !isEqual(this.state, nextState);
    }

    componentDidMount(): void {
        const {tag} = this.props;

        if (tag.startsWith('hive-')) {
            getCommunity(tag).then(c => {
                if (c) {
                    this.setState({comTitle: c.title});
                }
            })
        }
    }

    clicked = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();

        const {tag, global, history} = this.props;
        const {filter} = global;

        const newLoc = makePath(filter, tag);

        history.push(newLoc);
    };

    render() {
        const {children, global, tag} = this.props;
        const {comTitle} = this.state;

        const {filter} = global;

        const href = makePath(filter, tag);

        const props = Object.assign({}, children.props, {href, onClick: this.clicked});


        if (comTitle) {
            props.children = comTitle;
        }

        return React.createElement('a', props);
    }
}
