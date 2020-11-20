import React, {Component, Fragment} from "react";

import {connect} from "react-redux";

import {match} from "react-router";

import numeral from "numeral";

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
import parseAsset from "../helper/parse-asset"

import {_t} from "../i18n";

import {getProposals, Proposal, getPost, getAccount} from "../api/hive";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";
import NotFound from "../components/404";

enum Filter {
    ALL = "all",
    ACTIVE = "active",
    INACTIVE = "inactive",
    TEAM = "team"
}

interface State {
    proposals_: Proposal[];
    proposals: Proposal[];
    totalBudget: number;
    dailyBudget: number;
    dailyFunded: number;
    filter: Filter;
    loading: boolean;
    inProgress: boolean;
}

class ProposalsPage extends Component<PageProps, State> {
    state: State = {
        proposals_: [],
        proposals: [],
        totalBudget: 0,
        dailyBudget: 0,
        dailyFunded: 0,
        filter: Filter.ALL,
        loading: true,
        inProgress: false,
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
        this.stateSet({loading: true});
        getProposals()
            .then(proposals => {
                // get return proposal's total votes
                const minVotes = Number(proposals.find(x => x.id === 0)?.total_votes || 0);
                // find eligible proposals and
                const eligible = proposals.filter(x => x.id > 0 && Number(x.total_votes) >= minVotes);
                //  add up total votes
                const dailyFunded = eligible.reduce((a, b) => a + Number(b.daily_pay.amount), 0) / 1000;

                this.stateSet({proposals, proposals_: proposals, dailyFunded});

                return getAccount("hive.fund");
            })
            .then(fund => {
                const totalBudget = parseAsset(fund.sbd_balance).amount;
                const dailyBudget = totalBudget / 100;
                this.stateSet({totalBudget, dailyBudget})
            })
            .finally(() => {
                this.stateSet({loading: false});
            });
    }

    applyFilter = (filter: Filter) => {
        const {proposals_} = this.state;
        let proposals: Proposal[] = [];

        switch (filter) {
            case Filter.ALL:
                proposals = [...proposals_];
                break;
            case Filter.ACTIVE:
                proposals = proposals_.filter(x => x.status == "active");
                break;
            case Filter.INACTIVE:
                proposals = proposals_.filter(x => x.status == "inactive");
                break;
            case Filter.TEAM:
                proposals = [...proposals_.filter(x => ["ecency", "good-karma"].includes(x.creator))];
                break;
        }

        this.stateSet({proposals, filter, inProgress: true});

        setTimeout(() => {
            this.stateSet({inProgress: false});
        }, 500);
    }

    render() {
        //  Meta config
        const metaProps = {
            title: _t("proposals.page-title")
        };

        const {global} = this.props;
        const {loading, proposals, totalBudget, dailyBudget, dailyFunded, filter, inProgress} = this.state;

        const navBar = global.isElectron ?
            NavBarElectron({
                ...this.props,
            }) :
            NavBar({...this.props});

        if (loading) {
            return <>{navBar}<LinearProgress/></>;
        }

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                <Feedback/>
                {navBar}
                <div className="app-content proposals-page">
                    <div className="page-header">
                        <h1 className="header-title">
                            {_t('proposals.page-title')}
                        </h1>
                        <div className="funding-numbers">
                            <div className="funding-number">
                                <div className="value">
                                    {numeral(dailyFunded).format("0.00,")} {"HBD"}
                                </div>
                                <div className="label">daily funded</div>
                            </div>
                            <div className="funding-number">
                                <div className="value">
                                    {numeral(dailyBudget).format("0.00,")} {"HBD"}
                                </div>
                                <div className="label">daily budget</div>
                            </div>

                            <div className="funding-number">
                                <div className="value">
                                    {numeral(totalBudget).format("0.00,")} {"HBD"}
                                </div>
                                <div className="label">total budget</div>
                            </div>
                        </div>
                        <div className="filter-menu">
                            {Object.values(Filter).map(x => {
                                const cls = `menu-item ${filter === x ? "active-item" : ""}`
                                return <a key={x} href="#" className={cls} onClick={(e) => {
                                    e.preventDefault();
                                    this.applyFilter(x);
                                }}>
                                    {_t(`proposals.filter-${x}`)}
                                </a>
                            })}
                        </div>
                    </div>

                    {(() => {

                        if (inProgress) {
                            return <LinearProgress/>;
                        }

                        return <>
                            <div className="proposal-list">
                                {proposals.map((p) =>
                                    <Fragment key={p.id}>
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
