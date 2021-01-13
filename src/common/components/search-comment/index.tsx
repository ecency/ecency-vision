import React, {Component, Fragment} from "react";

import queryString from "query-string";

import {Button, Form, Col, Row, FormControl} from "react-bootstrap";

import SearchQuery, {SearchType} from "../../helper/search-query";

type SearchSort = "popularity" | "newest" | "relevance";

interface Props {

    search: string;
}

interface State {
    author: string;
    type: SearchType;
    category: string;
    tags: string;
    sort: SearchSort;
    hideLow: boolean;
    advanced: boolean;
}

const pureState = (props: Props): State => {
    const q = new SearchQuery(props.search);

    return {
        author: q.author,
        type: q.type || "post",
        category: q.category,
        tags: q.tags.join(","),
        sort: "newest",
        hideLow: true,
        advanced: false
    }
}


class SearchComment extends Component<Props, State> {
    state = pureState(this.props);

    componentDidMount() {
        console.log(this.state);
    }

    toggleAdvanced = () => {
        const {advanced} = this.state;
        this.setState({advanced: !advanced});
    }

    authorChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.setState({author: e.target.value.trim()});
    }

    typeChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.setState({type: e.target.value as SearchType});
    }

    categoryChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.setState({category: e.target.value.trim()});
    }

    tagsChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.setState({tags: e.target.value.trim()});
    }

    sortChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.setState({sort: e.target.value as SearchSort});
    }

    hideLowChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.setState({hideLow: e.target.checked});
    }

    render() {
        const {author, type, category, tags, sort, hideLow, advanced} = this.state;

        const advancedForm = advanced ?
            <>
                <Row>
                    <Form.Group as={Col} sm="5" controlId="form-author">
                        <Form.Label>Author</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="username"
                            value={author}
                            onChange={this.authorChanged}/>
                    </Form.Group>
                    <Form.Group as={Col} sm="3" controlId="form-type">
                        <Form.Label>Type</Form.Label>
                        <Form.Control as="select" value={type} onChange={this.typeChanged}>
                            <option value="post">Post</option>
                            <option value="comment">Comment</option>
                            <option value="">All</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} sm="4" controlId="form-category">
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="category tag"
                            value={category}
                            onChange={this.categoryChanged}
                        />
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} sm="8" controlId="form-tag">
                        <Form.Label>Tags</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="comma separated tags"
                            value={tags}
                            onChange={this.tagsChanged}
                        />
                    </Form.Group>
                    <Form.Group as={Col} sm="4" controlId="form-type">
                        <Form.Label>Sort</Form.Label>
                        <Form.Control as="select" value={sort} onChange={this.sortChanged}>
                            {["popularity", "newest", "relevance"].map(x => <option key={x}>{x}</option>)}
                        </Form.Control>
                    </Form.Group>
                </Row>
                <div className="d-flex justify-content-between align-items-center">
                    <Form.Check id="hide-low"
                                type="checkbox"
                                label="Hide low quality content"
                                checked={hideLow}
                                onChange={this.hideLowChanged}/>
                    <Button type="button">Apply</Button>
                </div>
            </> : null;


        return <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <strong>Results</strong>
                <Button size="sm" onClick={this.toggleAdvanced}>Advanced</Button>
            </div>
            <div className="card-body">
                {advancedForm}
            </div>
        </div>
    }
}

export default (p: Props) => {
    const props = {

        search: p.search
    }

    return <SearchComment {...props} />
}
