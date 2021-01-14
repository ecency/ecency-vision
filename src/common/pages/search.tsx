import React, {Component, Fragment} from "react";

import {connect} from "react-redux";

import queryString from "query-string";

import {Form, FormControl, Row, Col} from "react-bootstrap";

import numeral from "numeral";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NavBarElectron from "../../desktop/app/components/navbar";
import LinearProgress from "../components/linear-progress";
import ScrollToTop from "../components/scroll-to-top";
import DetectBottom from "../components/detect-bottom";
import SearchListItem from "../components/search-list-item";
import SearchComment from "../components/search-comment";

import {search, SearchResult} from "../api/private";

import {_t} from "../i18n";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";
import FullHeight from "../components/full-height";

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
        return;
        /*
        const {q, sort, results, scroll_id, inProgress} = this.state;

        if (inProgress) {
            return;
        }

        this.stateSet({inProgress: true});
        search(q, sort, (results.length > 0 && scroll_id ? scroll_id : undefined)).then(r => {
            const newResults = [...results, ...r.results]
            this.stateSet({
                hits: r.hits,
                results: newResults,
                scroll_id: r.scroll_id
            })
        }).finally(() => {
            this.stateSet({
                inProgress: false,
            })
        })*/
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

    bottomReached = () => {
        const {inProgress, scroll_id} = this.state;
        if (inProgress || !scroll_id) {
            return;
        }

        this.doSearch();
    }

    render() {
        //  Meta config
        const metaProps = {
            title: _t("search-page.title"),
            description: _t("search-page.description"),
        };

        const {global} = this.props;
        const {q, hits, results, inProgress, sort} = this.state;

        return (
            <>
                <Meta {...metaProps} />
                <FullHeight/>
                <Theme global={this.props.global}/>
                {global.isElectron ?
                    NavBarElectron({
                        ...this.props,
                    }) :
                    NavBar({...this.props})}
                <div className="app-content search-page">

                    <Row>
                        <Col md="8" className="col-section-holder">
                            <SearchComment {...this.props}/>
                        </Col>
                        <Col md="4" className="col-section-holder">
                            <Row className="row-side">
                                <Col xs="12" className="col-section">
                                    <div className="card">
                                        <div className="card-header">
                                            People
                                        </div>
                                        <div className="card-body">

                                        </div>
                                    </div>
                                </Col>
                                <Col xs="12" className="col-section">
                                    <div className="card">
                                        <div className="card-header">
                                            Communities
                                        </div>
                                        <div className="card-body">

                                        </div>
                                    </div>
                                </Col>
                                <Col xs="12" className="col-section">
                                    <div className="card">
                                        <div className="card-header">
                                            Topics
                                        </div>
                                        <div className="card-body">

                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </>
        );
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SearchPage);
