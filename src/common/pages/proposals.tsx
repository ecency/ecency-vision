import React, {Component, Fragment} from "react";

import {connect} from "react-redux";

import {match} from "react-router";

import defaults from "../constants/defaults.json";

import {
    renderPostBody,
    setProxyBase,
    catchPostImage,
    postBodySummary,
    // @ts-ignore
} from "@ecency/render-helper";

setProxyBase(defaults.imageServer);

import {Entry} from "../store/entries/types";

import Meta from "../components/meta";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import LinearProgress from "../components/linear-progress";
import ProposalListItem from "../components/proposal-list-item";


import {_t} from "../i18n";

import {getProposals, Proposal, getPost} from "../api/hive";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";
import NotFound from "../components/404";

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

        const {global, dynamicProps} = this.props;
        const {loading, proposals} = this.state;

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

                        return <>
                            <div className="page-header">
                                <div className="main-title">
                                    {_t('proposals.page-title')}
                                </div>
                            </div>
                            <div className="proposal-list">
                                {proposals.map((p, i) =>
                                    <Fragment key={i}>
                                        {ProposalListItem({
                                            ...this.props,
                                            proposal: p
                                        })}
                                    </Fragment>
                                )}
                            </div>
                        </>
                    })()}
                </div>
            </>
        )
    }
}

export const ProposalsIndexContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(ProposalsPage);

interface MatchParams {
    id: string;
}

interface DetailProps extends PageProps {
    match: match<MatchParams>;
}

interface DetailState {
    loading: boolean;
    proposal: Proposal | null;
    entry: Entry | null;
}

class ProposalDetailPage extends Component<DetailProps, DetailState> {
    state: DetailState = {
        loading: true,
        proposal: null,
        entry: null
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
        const {match} = this.props;
        const proposalId = Number(match.params.id);

        this.stateSet({loading: true});
        getProposals()
            .then(proposals => {
                const proposal = proposals.find(x => x.id === proposalId);
                if (proposal) {
                    this.stateSet({proposal});
                    return getPost(proposal.creator, proposal.permlink);
                }

                return null;
            })
            .then(entry => {
                if (entry) {
                    this.stateSet({entry})
                }
            })
            .finally(() => {
                this.stateSet({loading: false});
            });
    }

    render() {
        //  Meta config
        const metaProps = {
            title: _t("proposals.page-title")
        };

        const {global, activeUser, dynamicProps} = this.props;
        const {hivePerMVests} = dynamicProps;
        const {loading, proposal, entry} = this.state;

        const navBar = global.isElectron ?
            NavBarElectron({
                ...this.props,
            }) :
            NavBar({...this.props});


        if (loading) {
            return <>{navBar}<LinearProgress/></>;
        }

        if (!proposal || !entry) {
            return <NotFound/>;
        }

        const renderedBody = {__html: renderPostBody(entry.body, false, global.canUseWebp)};

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                <Feedback/>
                {navBar}
                <div className="app-content proposals-page">
                    <div className="page-header">
                        <div className="main-title">
                            {_t('proposals.page-title')}
                        </div>
                    </div>
                    <div className="proposal-list">
                        {ProposalListItem({
                            ...this.props,
                            proposal
                        })}
                    </div>
                    <div className="the-entry">
                        <div className="entry-body markdown-view user-selectable" dangerouslySetInnerHTML={renderedBody}/>
                    </div>
                </div>
            </>
        )
    }
}

export const ProposalDetailContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(ProposalDetailPage);
