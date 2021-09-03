import React from "react";

import {History, Location} from "history";

import {Global} from "../../store/global/types";
import {Community} from "../../store/communities/types";
import {TrendingTags} from "../../store/trending-tags/types";

import BaseComponent from "../base";
import UserAvatar from "../user-avatar";
import SuggestionList from "../suggestion-list";
import {makePath as makePathTag} from "../tag";
import {makePath as makePathProfile} from "../profile-link";

import {_t} from "../../i18n";

import defaults from "../../constants/defaults.json";


import {lookupAccounts} from "../../api/hive";
import {dataLimit, getCommunities} from "../../api/bridge";

interface Props {
    history: History;
    location: Location;
    global: Global;
    trendingTags: TrendingTags;
    value: string;
    children: JSX.Element;
    containerClassName?: string;
}

interface State {
    suggestions: string[] | Community[];
    loading: boolean;
    mode: string;
}

export class SearchSuggester extends BaseComponent<Props, State> {
    state: State = {
        suggestions: [],
        loading: false,
        mode: "",
    };

    _timer: any = null;

    componentDidUpdate(prevProps: Readonly<Props>): void {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.stateSet({
                suggestions: [],
                loading: false,
                mode: "",
            });
            return;
        }

        if (this.props.value !== prevProps.value) {
            this.trigger();
        }
    }

    fetchSuggestions = () => {
        const {value, trendingTags} = this.props;
        const {loading} = this.state;

        if (loading) {
            return;
        }

        // # Tags
        if (value.startsWith("#")) {
            const tag = value.replace("#", "");
            const suggestions = trendingTags.list
                .filter((x: string) => x.toLowerCase().indexOf(tag.toLowerCase()) === 0)
                .filter((x: string) => x.indexOf("hive-") === -1)
                .map((x) => `#${x}`)
                .slice(0, 20);

            this.stateSet({mode: "tag", suggestions});

            return;
        }

        // Account
        if (value.startsWith("@")) {
            const name = value.replace("@", "");
            this.stateSet({loading: true});
            lookupAccounts(name, 20)
                .then((r) => {
                    const suggestions = r.map((x) => `@${x}`);
                    this.stateSet({mode: "account", suggestions});
                })
                .finally(() => {
                    this.stateSet({loading: false});
                });

            return;
        }

        // Community
        if (value.startsWith("$")) {
            const q = value.replace("$", "");
            getCommunities("", dataLimit, q)
                .then((r) => {
                    if (r) {
                        this.stateSet({mode: "comm", suggestions: r});
                    }
                })
                .finally(() => {
                    this.stateSet({loading: false});
                });

            return;
        }

        this.stateSet({suggestions: [], mode: ""});
    };


    trigger = () => {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        this._timer = setTimeout(() => {
            this.fetchSuggestions();
        }, 1000);
    };

    accountSelected = (name: string) => {
        const loc = makePathProfile(name);
        const {history} = this.props;
        history.push(loc);
    };

    tagSelected = (tag: string) => {
        const loc = makePathTag(defaults.filter, tag);
        const {history} = this.props;
        history.push(loc);
    };

    communitySelected = (item: Community) => {
        const loc = makePathTag(defaults.filter, item.name);
        const {history} = this.props;
        history.push(loc);
    };

    render() {
        const {global, value, children, containerClassName} = this.props;
        const {suggestions, mode} = this.state;

        let suggestionProps = {};

        switch (mode) {
            case "account":
                suggestionProps = {
                    header: _t("search.header-account"),
                    renderer: (i: string) => {
                        const name = i.replace("@", "");
                        return (
                            <>
                                {UserAvatar({...this.props, username: name, size: "medium"})}
                                <span style={{marginLeft: "8px"}}>{name}</span>
                            </>
                        );
                    },
                    onSelect: (i: string) => {
                        this.accountSelected(i.replace("@", ""));
                    },
                };
                break;
            case "tag":
                suggestionProps = {
                    header: _t("search.header-tag"),
                    onSelect: (i: string) => {
                        this.tagSelected(i.replace("#", ""));
                    },
                };
                break;
            case "comm":
                suggestionProps = {
                    header: _t("search.header-community"),
                    renderer: (i: Community) => {
                        return i.title;
                    },
                    onSelect: (i: Community) => {
                        this.communitySelected(i);
                    },
                };
                break;
        }

        
        return (
            <>
                <SuggestionList items={suggestions} {...suggestionProps} containerClassName={containerClassName}>{children}</SuggestionList>
            </>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        location: p.location,
        global: p.global,
        value: p.value,
        trendingTags: p.trendingTags,
        children: p.children,
        containerClassName: p.containerClassName
    }

    return <SearchSuggester {...props} />
}
