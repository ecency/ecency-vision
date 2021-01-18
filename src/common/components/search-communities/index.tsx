import React from "react";

import {History, Location} from "history";

import queryString from "query-string";

import {Account} from "../../store/accounts/types";
import {Global} from "../../store/global/types";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";

import SearchQuery from "../../helper/search-query";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";

import {lookupAccounts} from "../../api/hive";

import {getCommunities} from "../../api/bridge";

import {_t} from "../../i18n";


interface Props {
    history: History;
    location: Location;
    global: Global;
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

export class SearchCommunities extends BaseComponent<Props, State> {
    state = {
        search: grabSearch(this.props.location),
        results: [],
        loading: false,
    };

    componentDidMount() {
        this.fetch();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        const search = grabSearch(this.props.location);
        if (search !== grabSearch(prevProps.location)) {
            this.stateSet({search}, this.fetch);
        }
    }

    fetch = () => {
        const {search} = this.state;


        getCommunities("", 20, search, "rank").then(r => {
            console.log(r);
        })
        /*
        this.stateSet({results: [], loading: true});
        lookupAccounts(search, 20).then(results => {
            this.stateSet({results});
        }).finally(() => {
            this.stateSet({loading: false});
        });*/
    }

    render() {
        const {loading, results} = this.state;

        return <div className="card search-communities">
            <div className="card-header">
                {_t("search-communities.title")}
            </div>
            <div className="card-body">
                {(() => {
                    if (loading) {
                        return <LinearProgress/>;
                    }

                    if (results.length === 0) {
                        return _t("g.no-matches");
                    }

                    return <div className="community-list">

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
        addAccount: p.addAccount
    }

    return <SearchCommunities {...props} />;
}
