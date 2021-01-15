import React, {Fragment} from "react";

import {Button, Col, Form, FormControl, Row} from "react-bootstrap";

import {History, Location} from "history";

import queryString from "query-string";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";

import BaseComponent from "../base";
import SearchListItem from "../search-list-item";

import SearchQuery, {SearchType} from "../../helper/search-query";

import {search, SearchResult} from "../../api/private";

import {_t} from "../../i18n";


enum SearchSort {
    POPULARITY = "popularity",
    NEWEST = "newest",
    RELEVANCE = "relevance"
}

interface Props {
    history: History;
    location: Location;
    global: Global;
    addAccount: (data: Account) => void;
}

interface State {
    author: string;
    type: SearchType;
    category: string;
    tags: string;
    sort: SearchSort;
    hideLow: boolean;
    advanced: boolean;
    inProgress: boolean;
    hits: number;
    results: SearchResult[];
    scrollId: string;
}

const pureState = (props: Props): State => {
    const {location} = props;
    const qs = queryString.parse(location.search);

    const q = qs.q as string;
    const sort = (qs.sort as SearchSort) || SearchSort.NEWEST;
    const hideLow = !(qs.hd && qs.hd === "0");
    const advanced = !!(qs.adv && qs.adv === "1");
    const sq = new SearchQuery(q);

    return {
        author: sq.author,
        type: sq.type || SearchType.ALL,
        category: sq.category,
        tags: sq.tags.join(","),
        sort,
        hideLow,
        advanced,
        inProgress: false,
        hits: 0,
        results: [],
        scrollId: ""
    }
}

class SearchComment extends BaseComponent<Props, State> {
    state = pureState(this.props);

    componentDidMount() {
        this.doSearch();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
        if (this.props.location !== prevProps.location) {
            this.setState(pureState(this.props), this.doSearch);
        }
    }

    toggleAdvanced = () => {
        const {advanced} = this.state;
        this.stateSet({advanced: !advanced});
    }

    authorChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.stateSet({author: e.target.value.trim()});
    }

    typeChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.stateSet({type: e.target.value as SearchType});
    }

    categoryChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.stateSet({category: e.target.value.trim()});
    }

    tagsChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.stateSet({tags: e.target.value.trim()});
    }

    sortChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.stateSet({sort: e.target.value as SearchSort});
    }

    hideLowChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.stateSet({hideLow: e.target.checked});
    }

    buildQuery = () => {
        const {location} = this.props;
        const qs = queryString.parse(location.search);
        const q = qs.q as string;

        const {author, type, category, tags} = this.state;
        const tagsArr = tags.split(",").map(x => x.trim()).filter(x => x.length > 0);

        const sq = new SearchQuery(q);

        sq.author = author;
        sq.type = type;
        sq.category = category;
        sq.tags = tagsArr;

        return sq.rebuild();
    }

    apply = () => {
        const {history} = this.props;
        const {sort, hideLow, advanced} = this.state;

        const q = this.buildQuery();

        const uqObj: { q: string, sort: string, adv: string, hd?: string, } = {q, sort, adv: "1"}

        if (!hideLow) uqObj.hd = "0";

        const uq = queryString.stringify(uqObj);

        history.push(`/search/?${uq}`);
    }

    doSearch = () => {
        const {sort, hideLow, results, scrollId} = this.state;
        const q = this.buildQuery();

        const hideLow_ = (hideLow ? "1" : "0");
        const scrollId_ = (results.length > 0 && scrollId ? scrollId : undefined);

        this.stateSet({inProgress: true});
        search(q, sort, hideLow_, scrollId_).then(r => {
            const newResults = [...results, ...r.results]
            this.stateSet({
                hits: r.hits,
                results: newResults,
                scrollId: r.scroll_id || ""
            });
        }).finally(() => {
            this.stateSet({
                inProgress: false,
            })
        });
    }

    render() {
        const {author, type, category, tags, sort, hideLow, advanced, hits, results} = this.state;

        const advancedForm = advanced ?
            <>
                <Row>
                    <Form.Group as={Col} sm="5" controlId="form-author">
                        <Form.Label>{_t("search-comment.author")}</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={_t("search-comment.author-placeholder")}
                            value={author}
                            onChange={this.authorChanged}/>
                    </Form.Group>
                    <Form.Group as={Col} sm="3" controlId="form-type">
                        <Form.Label>{_t("search-comment.type")}</Form.Label>
                        <Form.Control as="select" value={type} onChange={this.typeChanged}>
                            {Object.values(SearchType).map(x => <option value={x} key={x}>{_t(`search-comment.type-${x}`)}</option>)}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} sm="4" controlId="form-category">
                        <Form.Label>{_t("search-comment.category")}</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={_t("search-comment.category-placeholder")}
                            value={category}
                            onChange={this.categoryChanged}
                        />
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} sm="8" controlId="form-tag">
                        <Form.Label>{_t("search-comment.tags")}</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={_t("search-comment.tags-placeholder")}
                            value={tags}
                            onChange={this.tagsChanged}
                        />
                    </Form.Group>
                    <Form.Group as={Col} sm="4" controlId="form-type">
                        <Form.Label>{_t("search-comment.sort")}</Form.Label>
                        <Form.Control as="select" value={sort} onChange={this.sortChanged}>
                            {Object.values(SearchSort).map(x => <option value={x} key={x}>{_t(`search-comment.sort-${x}`)}</option>)}
                        </Form.Control>
                    </Form.Group>
                </Row>
                <div className="d-flex justify-content-between align-items-center">
                    <Form.Check id="hide-low"
                                type="checkbox"
                                label={_t("search-comment.hide-low")}
                                checked={hideLow}
                                onChange={this.hideLowChanged}/>
                    <Button type="button" onClick={this.apply}>{_t("g.apply")}</Button>
                </div>
            </> : null;

        return <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <strong>{_t("search-comment.title")}</strong>
                <Button size="sm" onClick={this.toggleAdvanced} variant={advanced ? "outline-primary" : "primary"}>
                    {_t("search-comment.advanced")}
                </Button>
            </div>
            <div className="card-body">
                {advancedForm}

                {results.length > 0 && (
                    <div className="search-list">
                        {results.map(res => <Fragment key={`${res.author}-${res.permlink}`}>
                            {SearchListItem({...this.props, res: res})}
                        </Fragment>)}
                    </div>
                )}
            </div>
        </div>
    }
}

export default (p: Props) => {
    const props = {
        history: p.history,
        location: p.location,
        global: p.global,
        addAccount: p.addAccount
    }

    return <SearchComment {...props} />
}
