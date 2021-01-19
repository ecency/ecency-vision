import React from "react";

import {History, Location} from "history";

import queryString from "query-string";

import {Account} from "../../store/accounts/types";
import {Global} from "../../store/global/types";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";

import SearchQuery from "../../helper/search-query";
import {TrendingTags} from "../../store/trending-tags/types";

import {_t} from "../../i18n";

interface Props {
    history: History;
    location: Location;
    global: Global;
    trendingTags: TrendingTags;
    addAccount: (data: Account) => void;
}

interface State {
    search: string;
    results: string[],
    loading: boolean
}

const grabSearch = (location: Location) => {
    const qs = queryString.parse(location.search);
    const q = qs.q as string;

    return new SearchQuery(q).search.split(" ")[0].replace("@", "");
}

export class SearchTopics extends BaseComponent<Props, State> {
    state: State = {
        search: grabSearch(this.props.location),
        results: [],
        loading: false,
    };

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        const search = grabSearch(this.props.location);
        if (search !== grabSearch(prevProps.location)) {
            this.stateSet({search});
        }
    }

    render() {
        const {trendingTags} = this.props;

        const {loading, search} = this.state;

        const results = trendingTags.list.filter(x => x.startsWith(search.toLocaleLowerCase()));


        return <div className="card search-topics">
            <div className="card-header">
                {_t("search-topics.title")}
            </div>
            <div className="card-body">
                {(() => {
                    if (loading) {
                        return <LinearProgress/>;
                    }

                    if (results.length === 0) {
                        return _t("g.no-matches");
                    }

                    return <div className="topic-list">
                        {results.map(x => {
                            return <a className="list-item" key={x}>{x}</a>
                        })}
                    </div>
                })()}
            </div>
        </div>;
    }
}


export default (p: Props) => {
    const props = {
        history: p.history,
        location: p.location,
        global: p.global,
        trendingTags: p.trendingTags,
        addAccount: p.addAccount
    }

    return <SearchTopics {...props} />;
}
