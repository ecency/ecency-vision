import React, {Fragment} from "react";

import {Link} from "react-router-dom";

import {connect} from "react-redux";

import {match} from "react-router";

import numeral from "numeral";

import moment from "moment";

import defaults from "../constants/defaults.json";

import {renderPostBody, setProxyBase, catchPostImage} from "@ecency/render-helper";

setProxyBase(defaults.imageServer);

import {Entry} from "../store/entries/types";

import BaseComponent from "../components/base";
import Meta from "../components/meta";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import LinearProgress from "../components/linear-progress";
import ProposalListItem from "../components/proposal-list-item";
import NotFound from "../components/404";

import {_t} from "../i18n";
import {Tsx} from "../i18n/helper";

import {getProposals, Proposal, getPost, getAccount} from "../api/hive";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

import parseAsset from "../helper/parse-asset";
import parseDate from "../helper/parse-date";

import {closeSvg} from "../img/svg";

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

class ProposalsPage extends BaseComponent<PageProps, State> {
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

    componentDidMount() {
        this.load();
    }

    load = () => {
        this.stateSet({loading: true});
        getProposals()
            .then(proposals => {
                // put expired proposals in the end of the list
                const expired = proposals.filter(x => x.status === "expired");
                const others = proposals.filter(x => x.status !== "expired");

                return [...others, ...expired];
            })
            .then(proposals => {
                // get return proposal's total votes
                const minVotes = Number(proposals.find(x => x.id === 0)?.total_votes || 0);
                // find eligible proposals and
                const eligible = proposals.filter(x => x.id > 0 && Number(x.total_votes) >= minVotes && x.status !== 'expired');
                //  add up total votes
                const dailyFunded = eligible.reduce((a, b) => a + Number(b.daily_pay.amount), 0) / 1000;

                this.stateSet({proposals, proposals_: proposals, dailyFunded});

                return getAccount("hive.fund");
            })
            .then(fund => {
                const totalBudget = parseAsset(fund.hbd_balance).amount;
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
                proposals = [...proposals_.filter(x => ["ecency", "good-karma", "hivesearcher", "hivesigner"].includes(x.creator) && x.status === "active")];
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
            title: _t("proposals.page-title"),
            description: _t("proposals.page-description")
        };

        const {global} = this.props;
        const {loading, proposals, totalBudget, dailyBudget, dailyFunded, filter, inProgress} = this.state;

        const navBar = global.isElectron ?
            NavBarElectron({
                ...this.props,
                reloadFn: this.load,
                reloading: loading,
            }) :
            NavBar({...this.props});

        if (loading) {
            return <>{navBar}<LinearProgress/></>;
        }
        let containerClasses = global.isElectron ? "app-content proposals-page mt-0 pt-6" : "app-content proposals-page";

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                <Feedback/>
                {navBar}
                <div className={containerClasses}>
                    <div className="page-header mt-5">
                        <h1 className="header-title">
                            {_t("proposals.page-title")}
                        </h1>
                        <Tsx k="proposals.page-description"><div className="header-description" /></Tsx>
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

class ProposalDetailPage extends BaseComponent<DetailProps, DetailState> {
    state: DetailState = {
        loading: true,
        proposal: null,
        entry: null
    }

    componentDidMount() {
        this.load();
    }

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
        const {global} = this.props;
        const {loading, proposal, entry} = this.state;

        const navBar = global.isElectron ?
            NavBarElectron({
                ...this.props,
                reloadFn: this.load,
                reloading: loading,
            }) :
            NavBar({...this.props});

        if (loading) {
            return <>{navBar}<LinearProgress/></>;
        }

        if (!proposal || !entry) {
            return NotFound({...this.props});
        }

        const renderedBody = {__html: renderPostBody(entry.body, false, global.canUseWebp)};

        //  Meta config
        const metaProps = {
            title: `${_t("proposals.page-title")} | ${proposal.subject}`,
            description: `${proposal.subject} by @${proposal.creator}`,
            url: `/proposals/${proposal.id}`,
            canonical: `/proposals/${proposal.id}`,
            published: moment(parseDate(entry.created)).toISOString(),
            modified: moment(parseDate(entry.updated)).toISOString(),
            image: catchPostImage(entry.body, 600, 500, global.canUseWebp ? 'webp' : 'match'),
        };
        let containerClasses = global.isElectron ? "app-content proposals-page proposals-detail-page mt-0 pt-6" : "app-content proposals-page proposals-detail-page";

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                <Feedback/>
                {navBar}
                <div className={containerClasses}>
                    <div className="page-header mt-5">
                        <h1 className="header-title">
                            {_t('proposals.page-title')}
                        </h1>
                        <p className="see-all">
                            <Link to="/proposals">{_t('proposals.see-all')}</Link>
                        </p>
                    </div>
                    <div className="proposal-list">
                        <Link to="/proposals" className="btn-dismiss">{closeSvg}</Link>
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
