import React, {Component} from "react";

import {connect} from "react-redux";

import queryString from "query-string";

import {History} from "history";

import {Form, FormControl} from "react-bootstrap";

import moment from "moment";

import {Global} from "../store/global/types";
import {Account} from "../store/accounts/types";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NavBarElectron from "../../desktop/app/components/navbar";
import LinearProgress from "../components/linear-progress";
import ScrollToTop from "../components/scroll-to-top";
import EntryLink from "../components/entry-link";
import ProfileLink from "../components/profile-link";
import UserAvatar from "../components/user-avatar";
import Tag from "../components/tag";
import FormattedCurrency from "../components/formatted-currency";

import defaults from "../constants/defaults.json";

import {
    catchPostImage,
    postBodySummary,
    setProxyBase,
    // @ts-ignore
} from "@esteemapp/esteem-render-helpers";

setProxyBase(defaults.imageServer);

import {search, SearchResult} from "../api/private";

import {_t} from "../i18n";

import {commentSvg, peopleSvg} from "../img/svg";

const fallbackImage = require("../../common/img/fallback.png");
const noImage = require("../../common/img/noimage.png");

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

interface ItemProps {
    history: History;
    global: Global;
    addAccount: (data: Account) => void;
    res: SearchResult;
}

class SearchListItem extends Component<ItemProps> {
    render() {
        const {global, res} = this.props;

        const entry = {
            category: res.category,
            author: res.author,
            permlink: res.permlink
        }

        const summary: string = postBodySummary(res.body, 200);
        const img: string = (global.canUseWebp ? catchPostImage(res.body, 600, 500, 'webp') : catchPostImage(res.body, 600, 500)) || noImage;

        let thumb = (
            <img src={img} alt={res.title} onError={(e: React.SyntheticEvent) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackImage;
            }}/>
        );

        const date = moment(res.created_at);
        const dateRelative = date.fromNow(true);
        const dateFormatted = date.format("LLLL");

        return <div className="search-list-item">
            <div className="item-header">
                <div className="author-part">
                    {ProfileLink({
                        ...this.props,
                        username: res.author,
                        children: <a className="author-avatar">{UserAvatar({...this.props, username: res.author, size: "small"})}</a>
                    })}
                    {ProfileLink({
                        ...this.props,
                        username: res.author,
                        children: <div className="author">{res.author}
                            <span className="author-reputation">{res.author_rep.toFixed(0)}</span>
                        </div>
                    })}
                </div>
                {Tag({
                    ...this.props,
                    tag: res.category,
                    type: "link",
                    children: <a className="category">{res.category}</a>
                })}

                <span className="date" title={dateFormatted}>{dateRelative}</span>
            </div>
            <div className="item-body">
                <div className="item-image">
                    {EntryLink({
                        ...this.props,
                        entry,
                        children: <div>
                            {thumb}
                        </div>
                    })}
                </div>
                <div className="item-summary">
                    {EntryLink({
                        ...this.props,
                        entry,
                        children: <div className="item-title">{res.title}</div>
                    })}
                    {EntryLink({
                        ...this.props,
                        entry,
                        children: <div className="item-body">{summary}</div>
                    })}
                </div>
                <div className="item-controls">
                    {EntryLink({
                        ...this.props,
                        entry,
                        children: <div className="entry-payout">
                            <FormattedCurrency {...this.props} value={res.payout}/>
                        </div>
                    })}
                    {EntryLink({
                        ...this.props,
                        entry,
                        children: <div className="entry-votes">
                            <span className="inner-btn no-data"> {peopleSvg} {res.total_votes}</span>
                        </div>
                    })}
                    {EntryLink({
                        ...this.props,
                        entry,
                        children: <a className="replies">
                            <span className="inner">{commentSvg} {res.children}</span>
                        </a>
                    })}
                    <div className="app">{res.app}</div>
                </div>
            </div>
        </div>
    }
}


interface State {
    q: string;
    sort: string;
    inProgress: boolean;
    hits: number;
    results: SearchResult[];
    scroll_id: string;
}

const pureState = (props: PageProps): State => {
    const {location} = props;
    const qs = queryString.parse(location.search);

    const q = (qs.q as string) || '';
    const sort = (qs.sort as string) || "relevance";

    return {
        q,
        sort,
        inProgress: false,
        hits: -1,
        results: [],
        scroll_id: ""
    }
}

class SearchPage extends Component<PageProps, State> {
    state: State = pureState(this.props);

    _mounted: boolean = true;

    componentDidMount() {
        const {q} = this.state;
        if (!q) {
            const {history} = this.props;
            history.push("/");
            return;
        }

        this.doSearch();
    }

    componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<State>) {
        if (this.props.location !== prevProps.location) {
            this.setState(pureState(this.props), this.doSearch);
        }
    }

    doSearch = () => {
        const {q, sort, results, scroll_id, inProgress} = this.state;

        if (inProgress) {
            return;
        }

        this.stateSet({inProgress: true});
        search(q, sort, (results.length > 0 && scroll_id ? scroll_id : undefined)).then(r => {
            this.stateSet({
                hits: r.hits,
                results: r.results,
                scroll_id: r.scroll_id
            })
        }).finally(() => {
            this.stateSet({
                inProgress: false,
            })
        })
    }

    sortChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        const {history} = this.props;
        const {q} = this.state;
        const sort = e.target.value;

        history.push(`/search/?q=${encodeURIComponent(q)}&sort=${sort}`);
    };

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    render() {
        //  Meta config
        const metaProps = {
            title: _t("search-page.title"),
        };

        const {global} = this.props;
        const {q, hits, results, inProgress, sort} = this.state;

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                {global.isElectron ?
                    NavBarElectron({
                        ...this.props,
                    }) :
                    NavBar({...this.props})}
                <div className="app-content search-page">
                    {(() => {
                        if (hits === -1) {
                            return null;
                        }

                        if (hits === 0) {
                            return <div className="search-info">
                                <div className="result-count">
                                    {_t("search-page.n-results-for-q", {n: hits, q})}
                                </div>
                            </div>
                        }

                        return <div className="search-info">
                            <div className="result-count">
                                {_t("search-page.n-results-for-q", {n: hits, q})}
                            </div>
                            <div className="sort-by">
                                <span className="label">{_t("search-page.sort-by")}</span>
                                <Form.Control as="select" value={sort} onChange={this.sortChanged}>
                                    {["popularity", "relevance", "newest"].map(s => {
                                        return <option value={s} key={s}> {_t(`search-page.sort-${s}`)}</option>
                                    })}
                                </Form.Control>
                            </div>
                        </div>
                    })()}

                    {results.length > 0 && (
                        <div className="search-list">
                            {results.map(res => <SearchListItem
                                key={res.permlink}
                                history={this.props.history}
                                global={this.props.global}
                                addAccount={this.props.addAccount}
                                res={res}
                            />)}
                        </div>
                    )}

                    {inProgress && <LinearProgress/>}
                </div>
            </>
        );
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SearchPage);
