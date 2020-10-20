import React, {Component} from "react";

import {History, Location} from "history";

import {FormControl} from "react-bootstrap";

import numeral from "numeral";

import {Global} from "../../store/global/types";
import {TrendingTags} from "../../store/trending-tags/types";

import SearchBox from "../search-box";

import SearchSuggester from "../search-suggester";

import {_t} from "../../i18n";

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
}

export class Search extends Component<Props, State> {
    state: State = {
        query: "",
    };

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
            this.stateSet({
                query: "",
            });
        }
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    queryChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        const query = e.target.value;
        this.stateSet({query});
    };

    onKeyDown = (e: React.KeyboardEvent) => {
        if (e.keyCode === 13) {
            const {history} = this.props;
            const {query} = this.state;

            history.push(`/search/?q=${encodeURIComponent(query)}`);
        }
    };

    render() {
        const {global} = this.props;
        const {query} = this.state;

        const placeholder = global.searchIndexCount > 0 ?
            _t("search.placeholder-count", {n: numeral(global.searchIndexCount).format('0,0')}) :
            _t("search.placeholder");

        return (
            <>
                <SearchSuggester {...this.props} value={query}>
                    <SearchBox
                        placeholder={placeholder}
                        value={query}
                        onChange={this.queryChanged}
                        onKeyDown={this.onKeyDown}
                        autoComplete="off"
                    />
                </SearchSuggester>
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
