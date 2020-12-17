import React, {Component, createElement} from "react";
import {History} from "history";

import isEqual from "react-fast-compare";

import {Global} from "../../store/global/types";
import {EntryFilter} from "../../store/global/types";

import {getCommunity} from "../../api/bridge";

import defaults from "../../constants/defaults.json";

export const makePath = (filter: string, tag: string): string => {
    // created is default filter for community pages
    if (/^hive-\d+/.test(tag)) {
        return `/${EntryFilter.created}/${tag}`;
    }

    if (EntryFilter[filter] === undefined) {
        return `/${defaults.filter}/${tag}`;
    }

    return `/${filter}/${tag}`;
};

interface Props {
    global: Global;
    history: History;
    tag: string;
    children: JSX.Element;
    type?: "link" | "span";
}

const cache = {};

export class TagLink extends Component<Props> {
    public static defaultProps: Partial<Props> = {
        type: "link",
    };

    _mounted: boolean = true;

    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return !isEqual(this.props.children, nextProps.children);
    }

    componentDidMount(): void {
        const {tag} = this.props;

        if (tag.match(/^hive-\d+/)) {
            if (cache[tag] === undefined) {
                getCommunity(tag).then((c) => {
                    if (c) {
                        cache[tag] = c.title;

                        if (this._mounted) {
                            this.forceUpdate(); // trigger render
                        }
                    }
                });
            }
        }
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    clicked = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();

        const {tag, global, history} = this.props;
        const {filter} = global;

        const newLoc = makePath(filter, tag);

        history.push(newLoc);
    };

    render() {
        const {children, global, tag, type} = this.props;

        const {filter} = global;

        const href = makePath(filter, tag);

        if (type === "link") {
            const props = Object.assign({}, children.props, {href, onClick: this.clicked});

            if (cache[tag]) {
                props.children = cache[tag];
            }

            return createElement("a", props);
        } else if (type === "span") {
            const props = Object.assign({}, children.props);

            if (cache[tag]) {
                props.children = cache[tag];
            }

            return createElement("span", props);
        } else {
            return null;
        }
    }
}


export default (p: Props) => {
    const props: Props = {
        global: p.global,
        history: p.history,
        tag: p.tag,
        children: p.children,
        type: p.type
    }

    return <TagLink {...props} />;
}
