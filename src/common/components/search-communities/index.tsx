import React from "react";

import {History, Location} from "history";

import queryString from "query-string";

import {Link} from "react-router-dom";

import {Account} from "../../store/accounts/types";
import {Global} from "../../store/global/types";
import {Community} from "../../store/communities/types";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import UserAvatar from "../user-avatar";
import {makePath} from "../tag";

import SearchQuery from "../../helper/search-query";

import {getCommunities} from "../../api/bridge";

import {_t} from "../../i18n";

import defaults from "../../constants/defaults.json";


interface Props {
    history: History;
    location: Location;
    global: Global;
}

interface State {
    search: string;
    results: Community[],
    loading: boolean
}

const grabSearch = (location: Location) => {
    const qs = queryString.parse(location.search);
    const q = qs.q as string;

    return new SearchQuery(q).search.split(" ")[0].replace("@", "");
}

export class SearchCommunities extends BaseComponent<Props, State> {
    state: State = {
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

        this.stateSet({results: [], loading: true});
        getCommunities("", 6, search, "rank").then(results => {
            if (results) {
                this.stateSet({results: results});
            }
        }).finally(() => {
            this.stateSet({loading: false});
        });
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
                        {results.map(community => <div key={community.name} className="list-item">
                            <h3 className="item-title">
                                {UserAvatar({...this.props, username: community.name, size: "small"})}
                                <Link to={makePath(defaults.filter, community.name)}>{community.title}</Link>
                            </h3>
                            <div className="item-about">{community.about}</div>
                        </div>)}
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
    }

    return <SearchCommunities {...props} />;
}
