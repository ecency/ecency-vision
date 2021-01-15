import React, {Component} from "react";

import {connect} from "react-redux";

import {Row, Col} from "react-bootstrap";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NavBarElectron from "../../desktop/app/components/navbar";
import SearchComment from "../components/search-comment";
import FullHeight from "../components/full-height";

import {_t} from "../i18n";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";


class SearchPage extends Component<PageProps> {
    /*
    bottomReached = () => {
        const {inProgress, scroll_id} = this.state;
        if (inProgress || !scroll_id) {
            return;
        }

        this.doSearch();
    }
    */

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
                <div className="app-content search-page">
                    <Row>
                        <Col md="8" className="col-section-holder">
                            <SearchComment {...this.props} limit={8}/>
                        </Col>
                        <Col md="4" className="col-section-holder">
                            <Row className="row-side">
                                <Col xs="12" className="col-section">
                                    <div className="card">
                                        <div className="card-header">
                                            People
                                        </div>
                                        <div className="card-body"/>
                                    </div>
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

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SearchPage);
