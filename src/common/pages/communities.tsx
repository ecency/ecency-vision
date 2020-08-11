import React, {Component, Fragment} from "react";

import {connect} from "react-redux";

import {FormControl} from "react-bootstrap";

import {Community} from "../store/community/types";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import LinearProgress from "../components/linear-progress";
import CommunityListItem from "../components/community-list-item";
import SearchBox from "../components/search-box";

import {_t} from "../i18n";

import {getCommunities, getSubscriptions} from "../api/bridge";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

interface State {
    list: Community[];
    loading: boolean;
    query: string;
    sort: string;
}

class CommunitiesPage extends Component<PageProps, State> {
    state: State = {
        list: [],
        loading: true,
        query: "",
        sort: "hot",
    };

    _timer: any = null;
    _mounted: boolean = true;

    componentDidMount() {
        this.fetch();

        const {activeUser, subscriptions, updateSubscriptions} = this.props;
        if (activeUser && subscriptions.length === 0) {
            getSubscriptions(activeUser.username).then(r => {
                if (r) updateSubscriptions(r);
            });
        }
    }

    componentDidUpdate(prevProps: Readonly<PageProps>) {
        const {activeUser, updateSubscriptions} = this.props;
        if (prevProps.activeUser?.username !== activeUser?.username) {
            if (activeUser) {
                getSubscriptions(activeUser.username).then(r => {
                    if (r) updateSubscriptions(r);
                });
            }
        }
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    fetch = () => {
        const {query, sort} = this.state;
        this.stateSet({loading: true});

        getCommunities("", 100, query, (sort === "hot" ? "rank" : sort))
            .then((r) => {
                if (r) {
                    const list = sort === "hot" ? r.sort(() => Math.random() - 0.5) : r;
                    this.stateSet({list});
                }
            })
            .finally(() => {
                this.stateSet({loading: false});
            });
    };

    queryChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        this.stateSet({query: e.target.value}, () => {
            this._timer = setTimeout(() => {
                this.fetch();
            }, 1000);
        });
    };

    sortChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        this.stateSet({sort: e.target.value}, (): void => {
            this.fetch();
        });
    };

    render() {
        const {list, loading, query, sort} = this.state;
        const noResults = !loading && list.length === 0;

        //  Meta config
        const metaProps = {
            title: _t("communities.title"),
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                {NavBar({...this.props})}

                <div className="app-content communities-page">
                    <div className="community-list">
                        <div className="list-header">
                            <h1 className="list-title">{_t("communities.title")}</h1>
                        </div>
                        <div className="list-form">
                            <div className="search">
                                <SearchBox placeholder={_t("g.search")} value={query} onChange={this.queryChanged} readOnly={loading}/>
                            </div>
                            <div className="sort">
                                <FormControl as="select" value={sort} onChange={this.sortChanged} disabled={loading}>
                                    <option value="hot">{_t("communities.sort-hot")}</option>
                                    <option value="rank">{_t("communities.sort-rank")}</option>
                                    <option value="subs">{_t("communities.sort-subs")}</option>
                                    <option value="new">{_t("communities.sort-new")}</option>
                                </FormControl>
                            </div>
                        </div>
                        {loading && <LinearProgress/>}
                        <div className="list-items">
                            {noResults && <div className="no-results">{_t("communities.no-results")}</div>}
                            {list.map((x, i) => (
                                <Fragment key={i}>
                                    {CommunityListItem({
                                        ...this.props,
                                        community: x
                                    })}
                                </Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(CommunitiesPage);
