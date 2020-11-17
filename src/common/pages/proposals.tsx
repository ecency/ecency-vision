import React, {Component} from "react";

import {connect} from "react-redux";

import Meta from "../components/meta";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import LinearProgress from "../components/linear-progress";

import {_t} from "../i18n";

import {getProposals, Proposal} from "../api/hive";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";


interface State {
    proposals: Proposal[],
    loading: boolean;
}

class ProposalsPage extends Component<PageProps, State> {
    state: State = {
        loading: true,
        proposals: []
    }

    _mounted: boolean = true;

    componentDidMount() {
        this.load();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    load = () => {
        this.fetchProposals();
    };

    fetchProposals = () => {
        getProposals().then(proposals => {
            this.stateSet({proposals});
        }).finally(() => {
            this.stateSet({loading: false});
        });
    }

    render() {
        //  Meta config
        const metaProps = {
            title: _t("proposals.page-title")
        };

        const {global, activeUser} = this.props;

        const {loading} = this.state;

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                <Feedback/>
                {global.isElectron ?
                    NavBarElectron({
                        ...this.props,
                    }) :
                    NavBar({...this.props})}
                <div className="app-content proposals-page">
                    {(() => {
                        if (loading) {
                            return <>
                                <div className="page-header loading">
                                    <div className="main-title">
                                        {_t('proposals.page-title')}
                                    </div>
                                </div>
                                <LinearProgress/>
                            </>
                        }

                        return null;
                    })()}
                </div>
            </>
        )
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(ProposalsPage);
