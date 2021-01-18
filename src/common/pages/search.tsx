import React, {Component} from "react";

import {connect} from "react-redux";

import {Row, Col} from "react-bootstrap";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NavBarElectron from "../../desktop/app/components/navbar";
import SearchComment from "../components/search-comment";
import SearchPeople from "../components/search-people";
import FullHeight from "../components/full-height";

import {_t} from "../i18n";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";


class MainSearchPage extends Component<PageProps> {
    render() {
        //  Meta config
        const metaProps = {
            title: _t("search-page.title"),
            description: _t("search-page.description"),
        };

        const {global} = this.props;

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
                <div className="app-content main-search-page">
                    <Row>
                        <Col md="8" className="col-section-holder">
                            <SearchComment {...this.props} limit={8}/>
                        </Col>
                        <Col md="4" className="col-section-holder">
                            <Row className="row-side">
                                <Col xs="12" className="col-section">
                                    <SearchPeople {...this.props} />
                                </Col>
                                <Col xs="12" className="col-section">
                                    <div className="card">
                                        <div className="card-header">
                                            Communities
                                        </div>
                                        <div className="card-body"/>
                                    </div>
                                </Col>
                                <Col xs="12" className="col-section">
                                    <div className="card">
                                        <div className="card-header">
                                            Topics
                                        </div>
                                        <div className="card-body"/>
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

const MainSearchPageContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(MainSearchPage);
export {MainSearchPageContainer};

class SearchPage extends Component<PageProps> {
    render() {
        //  Meta config
        const metaProps = {
            title: _t("search-page.title"),
            description: _t("search-page.description"),
        };

        const {global} = this.props;

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                {global.isElectron ?
                    NavBarElectron({
                        ...this.props,
                    }) :
                    NavBar({...this.props})}
                <div className="app-content search-page">
                    <SearchComment {...this.props}/>
                </div>
            </>
        );
    }
}

const SearchPageContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(SearchPage);
export {SearchPageContainer};
