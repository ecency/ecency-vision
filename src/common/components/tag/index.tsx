import React, {Component, createElement} from "react";
import {History} from "history";

import isEqual from "react-fast-compare";

import {Global} from "../../store/global/types";
import {EntryFilter} from "../../store/global/types";
import {Community, Communities} from "../../store/communities/types";

import {getCommunity} from "../../api/bridge";

import defaults from "../../constants/defaults.json";

import isCommunity from "../../helper/is-community";

export const makePath = (filter: string, tag: string): string => {
    // created is default filter for community pages
    if (isCommunity(tag)) {
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
    communities?: Communities;
    tag: string;
    children: JSX.Element;
    type?: "link" | "span";
}

// some tags are special community tags.
// we keep community titles for that tags inside this variable
// the reason we keep that data inside a variable is to
// avoid re-render all application with a reducer.
const cache = {};

export class TagLink extends Component<Props> {
    public static defaultProps: Partial<Props> = {
        type: "link",
    };

    _mounted: boolean = true;

    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return !isEqual(this.props.children, nextProps.children);
    }

    componentDidMount() {
        this.detectCommunity().then();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    detectCommunity = async () => {
        const {tag} = this.props;

        // tag is not community tag or already added to cache
        if (!isCommunity(tag) || cache[tag] !== undefined) {
            return;
        }

        const {communities} = this.props;

        // find community from reducer
        let community: Community | null = (communities && communities.find(x => x.name === tag)) || null;

        // or fetch it from api
        if (!community) {
            community = await getCommunity(tag)
        }

        if (community) {
            cache[tag] = community.title;

            if (this._mounted) {
                this.forceUpdate(); // trigger render
            }
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
        communities: p.communities,
        tag: p.tag,
        children: p.children,
        type: p.type
    }

    return <TagLink {...props} />;
}
