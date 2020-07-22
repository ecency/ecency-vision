import React, {Component} from "react";
import {AnyAction, bindActionCreators, Dispatch} from "redux";
import {connect} from "react-redux";
import {History, Location} from "history";

import {FormControl} from "react-bootstrap";

import {AppState} from "../store";
import {Global} from "../store/global/types";
import {Account} from "../store/accounts/types";
import {Community} from "../store/community/types";
import {TrendingTags} from "../store/trending-tags/types";
import {User} from "../store/users/types";
import {ActiveUser} from "../store/active-user/types";
import {UI, ToggleType} from "../store/ui/types";
import {Subscription} from "../store/subscriptions/types";

import {hideIntro, toggleTheme} from "../store/global";
import {addAccount} from "../store/accounts";
import {fetchTrendingTags} from "../store/trending-tags";
import {setActiveUser, updateActiveUser} from "../store/active-user";
import {deleteUser, addUser} from "../store/users";
import {toggleUIProp} from "../store/ui";
import {updateSubscriptions} from "../store/subscriptions";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import LinearProgress from "../components/linear-progress";
import CommunityListItem from "../components/community-list-item";
import SearchBox from "../components/search-box";

import {_t} from "../i18n";

import {getCommunities, getSubscriptions} from "../api/bridge";

interface Props {
    history: History;
    location: Location;
    global: Global;
    trendingTags: TrendingTags;
    users: User[];
    activeUser: ActiveUser | null;
    ui: UI;
    subscriptions: Subscription[];
    toggleTheme: () => void;
    addAccount: (data: Account) => void;
    fetchTrendingTags: () => void;
    addUser: (user: User) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
    updateSubscriptions: (list: Subscription[]) => void;
}

interface State {
    list: Community[];
    loading: boolean;
    query: string;
    sort: string;
}

class CommunitiesPage extends Component<Props, State> {
    state: State = {
        list: [],
        loading: false,
        query: "",
        sort: "rank",
    };

    _timer: any = null;
    _mounted: boolean = true;

    componentDidMount() {
        this.fetch();
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
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

    stateSet = (obj: {}, cb: () => void = () => {
    }) => {
        if (this._mounted) {
            this.setState(obj, cb);
        }
    };

    fetch = () => {
        const {query, sort} = this.state;

        this.stateSet({loading: true});
        getCommunities("", 100, query, sort)
            .then((r) => {
                if (r) {
                    this.stateSet({list: r});
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
                <Theme {...this.props} />
                <NavBar {...this.props} />

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
                                <CommunityListItem {...this.props} key={i} community={x}/>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    global: state.global,
    trendingTags: state.trendingTags,
    users: state.users,
    activeUser: state.activeUser,
    ui: state.ui,
    subscriptions: state.subscriptions
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
    bindActionCreators(
        {
            toggleTheme,
            hideIntro,
            addAccount,
            fetchTrendingTags,
            addUser,
            setActiveUser,
            updateActiveUser,
            deleteUser,
            toggleUIProp,
            updateSubscriptions
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(CommunitiesPage);
