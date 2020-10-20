import React, {Component} from "react";

import {History, Location} from "history";

import {FormControl} from "react-bootstrap";

import numeral from "numeral";

import {Global} from "../../store/global/types";
import {Community} from "../../store/communities/types";
import {TrendingTags} from "../../store/trending-tags/types";

import SearchBox from "../search-box";
import UserAvatar from "../user-avatar";
import SuggestionList from "../suggestion-list";
import {makePath as makePathTag} from "../tag";
import {makePath as makePathProfile} from "../profile-link";

import {_t} from "../../i18n";

import defaults from "../../constants/defaults.json";

import formattedNumber from "../../util/formatted-number";

import {lookupAccounts} from "../../api/hive";
import {getCommunities} from "../../api/bridge";
import queryString from "query-string";

interface Props {
    history: History;
    location: Location;
    global: Global;
    trendingTags: TrendingTags;
    fetchTrendingTags: () => void;
}

interface State {
    query: string;
    suggestions: string[] | Community[];
    loading: boolean;
    mode: string;
}

export class Search extends Component<Props, State> {
    state: State = {
        query: "",
        suggestions: [],
        loading: false,
        mode: "",
    };

    _timer: any = null;
    _mounted: boolean = true;

    componentDidMount() {
        const {fetchTrendingTags} = this.props;
        fetchTrendingTags();

        const {location} = this.props;

        if (location.pathname.startsWith('/search')) {
            const qs = queryString.parse(location.search);
            const query = (qs.q as string) || '';
            this.stateSet({query});
        }
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            // Reset state when location change
            this.stateSet({
                query: "",
                suggestions: [],
                loading: false,
                mode: "",
            });
        }
    }

    stateSet = (obj: {}, cb: () => void = () => {
    }) => {
        if (this._mounted) {
            this.setState(obj, cb);
        }
    };

    fetchSuggestions = () => {
        const {query, loading} = this.state;
        const {trendingTags} = this.props;

        if (loading) {
            return;
        }

        // # Tags
        if (query.startsWith("#")) {
            const tag = query.replace("#", "");
            const suggestions = trendingTags.list
                .filter((x: string) => x.toLowerCase().indexOf(tag.toLowerCase()) === 0)
                .filter((x: string) => x.indexOf("hive-") === -1)
                .map((x) => `#${x}`)
                .slice(0, 20);

            this.stateSet({mode: "tag", suggestions});

            return;
        }

        // Account
        if (query.startsWith("@")) {
            const name = query.replace("@", "");
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
        if (query.startsWith("$")) {
            const q = query.replace("$", "");
            getCommunities("", 20, q)
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

    queryChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        const query = e.target.value;
        this.stateSet({query}, () => {
            this._timer = setTimeout(() => {
                this.fetchSuggestions();
            }, 1000);
        });
    };

    onKeyDown = (e: React.KeyboardEvent) => {
        if (e.keyCode === 13) {
            const {history} = this.props;
            const {query} = this.state;

            history.push(`/search/?q=${encodeURIComponent(query)}`);
        }
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
        const {global} = this.props;
        const {query, suggestions, mode} = this.state;

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
                        this.stateSet({query: ""});
                    },
                };
                break;
            case "tag":
                suggestionProps = {
                    header: _t("search.header-tag"),
                    onSelect: (i: string) => {
                        this.tagSelected(i.replace("#", ""));
                        this.stateSet({query: ""});
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
                        this.stateSet({query: ""});
                    },
                };
                break;
        }

        const placeholder = global.searchIndexCount > 0 ?
            _t("search.placeholder-count", {n: numeral(global.searchIndexCount).format('0,0')}) :
            _t("search.placeholder");

        return (
            <>
                <SuggestionList items={suggestions} {...suggestionProps}>
                    <SearchBox
                        placeholder={placeholder}
                        value={query}
                        onChange={this.queryChanged}
                        onKeyDown={this.onKeyDown}
                        autoComplete="off"
                    />
                </SuggestionList>
            </>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        location: p.location,
        global: p.global,
        trendingTags: p.trendingTags,
        fetchTrendingTags: p.fetchTrendingTags
    }

    return <Search {...props} />
}
