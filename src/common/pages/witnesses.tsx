import React, {Component} from "react";

import {connect} from "react-redux";

import {_t} from "../i18n";

import {pathToRegexp} from "path-to-regexp";

import routes from "../../common/routes";

import BootstrapTable from "react-bootstrap-table-next";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

import Meta from "../components/meta";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import NavBarElectron from "../../desktop/app/components/navbar";
import NavBar from "../components/navbar";
import LinearProgress from "../components/linear-progress";
import parseAsset, {Asset} from "../helper/parse-asset";

import {getWitnessesByVote, Vote} from "../api/hive";
import paginationFactory from "react-bootstrap-table2-paginator";
import ProfileLink from "../components/profile-link";
import UserAvatar from "../components/user-avatar";
import EntryLink, {PartialEntry} from "../components/entry-link";
import WitnessVoteBtn from "../components/witness-vote-btn";

import {linkSvg, openInNewSvg} from "../img/svg";

import {getAccount} from "../api/hive";


interface WitnessTransformed {
    rank: number;
    name: string;
    miss: number;
    fee: string;
    feed: string;
    blockSize: number;
    acAvail: number;
    acBudget: number;
    version: string;
    url: string;
    parsedUrl?: PartialEntry;
}

interface State {
    witnesses: WitnessTransformed[];
    witnessVotes: string[];
    proxy: string | null;
    loading: boolean;
}

class WitnessesPage extends Component<PageProps, State> {
    state: State = {
        witnesses: [],
        witnessVotes: [],
        proxy: null,
        loading: true
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
        this.fetchVotedWitnesses();
        this.fetchWitnesses();
    }

    fetchWitnesses = () => {
        getWitnessesByVote().then(resp => {
            const witnesses: WitnessTransformed[] = resp.map((x, i) => {
                const rank = i + 1;

                const {props} = x;

                const {total_missed: miss, url} = x;
                const fee = props.account_creation_fee;
                const feed = x.hbd_exchange_rate.base;
                const {maximum_block_size: blockSize} = props;
                const {available_witness_account_subsidies: acAvail} = x;
                const {account_subsidy_budget: acBudget} = props;
                const {running_version: version} = x;


                let parsedUrl;
                const oUrl = new URL(url, 'https://ecency.com');
                const ex = pathToRegexp(routes.ENTRY).exec(oUrl.pathname);

                if (ex) {
                    parsedUrl = {
                        category: ex[1],
                        author: ex[2].replace("@", ""),
                        permlink: ex[3]
                    }
                }

                return {
                    rank,
                    name: x.owner,
                    miss,
                    fee,
                    feed,
                    blockSize,
                    acAvail: Math.round(acAvail / 10000),
                    acBudget,
                    version,
                    url,
                    parsedUrl
                };
            });

            this.stateSet({witnesses});
        }).finally(() => {
            this.setState({loading: false});
        });
    }

    fetchVotedWitnesses = () => {
        const {activeUser} = this.props;
        if (activeUser) {
            getAccount(activeUser.username).then(resp => {
                const {witness_votes: witnessVotes, proxy} = resp;
                this.setState({witnessVotes: witnessVotes || [], proxy: proxy || null});
            });

            return;
        }

        this.setState({witnessVotes: [], proxy: null});
    };

    render() {
        //  Meta config
        const metaProps = {
            title: _t("witnesses-page.title"),
        };

        const {global, activeUser} = this.props;

        const {witnesses, loading, witnessVotes, proxy} = this.state;

        const table = <table className="table">
            <thead>
            <tr>
                <th className="col-rank">
                    {_t("witnesses-page.rank")}
                </th>
                <th>
                    {_t("witnesses-page.witness")}
                </th>
                <th className="col-miss">
                    {_t("witnesses-page.miss")}
                </th>
                <th className="col-url">
                    {_t("witnesses-page.url")}
                </th>
                <th className="col-fee">
                    {_t("witnesses-page.fee")}
                </th>
                <th className="col-feed">
                    {_t("witnesses-page.feed")}
                </th>
                <th className="col-version">
                    {_t("witnesses-page.version")}
                </th>
            </tr>
            </thead>
            <tbody>
            {witnesses.map((row, i) => {
                return <tr key={row.rank}>
                    <td>
                        <div className="witness-rank">
                            <span className="rank-number">{row.rank}</span>
                            {WitnessVoteBtn({
                                ...this.props,
                                voted: witnessVotes.includes(row.name),
                                witness: row.name,
                                onSuccess: (approve) => {
                                    const newVotes: string[] = approve ?
                                        [...witnessVotes, row.name] :
                                        witnessVotes.filter(x => x !== row.name);

                                    this.stateSet({witnessVotes: newVotes});
                                }
                            })}
                        </div>
                    </td>
                    <td>
                        {ProfileLink({
                            ...this.props,
                            username: row.name,
                            children: <span className="witness-card notranslate"> {UserAvatar({
                                ...this.props,
                                username: row.name,
                                size: "medium"
                            })} {row.name}</span>
                        })}
                    </td>
                    <td><span className="witness-miss">{row.miss}</span></td>
                    <td>
                        {(() => {
                            const {parsedUrl} = row;

                            if (parsedUrl) {
                                return (
                                    <EntryLink {...this.props} entry={parsedUrl}>
                                        <span className="witness-link">{linkSvg}</span>
                                    </EntryLink>
                                );
                            }

                            return (
                                <a target="_external" href={row.url} className="witness-link">{openInNewSvg}</a>
                            );
                        })()}
                    </td>
                    <td><span className="witness-fee">{row.fee}</span></td>
                    <td>
                        <div className="witness-feed"><span className="inner">{row.feed}</span></div>
                    </td>
                    <td>
                        <div className="witness-version"><span className="inner">{row.version}</span></div>
                    </td>
                </tr>
            })}
            </tbody>
        </table>;

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
                <div className="app-content witnesses-page">
                    {(() => {
                        if (loading) {
                            return <>
                                <div className={`page-header loading`}>
                                    <div className="main-title">
                                        {_t('witnesses-page.title')}
                                    </div>
                                </div>
                                <LinearProgress/>
                            </>
                        }

                        return <>
                            <div className="page-header">
                                <div className="main-title">
                                    {_t('witnesses-page.title')}
                                </div>
                                {(activeUser && !proxy) && (
                                    <div className="remaining">
                                        {_t('witnesses-page.remaining', {n: 30 - witnessVotes.length, max: 30})}
                                    </div>
                                )}
                            </div>

                            {!proxy && (
                                <div className="table-responsive witnesses-table">{table}</div>
                            )}
                        </>
                    })()}
                </div>
            </>
        );
    }
}


export default connect(pageMapStateToProps, pageMapDispatchToProps)(WitnessesPage);
