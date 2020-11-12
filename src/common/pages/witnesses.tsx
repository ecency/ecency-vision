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

        const tableProps = {
            bordered: false,
            keyField: "rank",
            data: witnesses,
            columns: [
                {
                    dataField: "rank",
                    classes: "col-rank",
                    text: _t("witnesses-page.rank"),
                    formatter: (cell: any, row: WitnessTransformed) => {
                        return <span className="witness-rank">{row.rank}</span>
                    }
                },
                {
                    dataField: "name",
                    text: _t("witnesses-page.witness"),
                    formatter: (cell: any, row: WitnessTransformed) => {
                        return ProfileLink({
                            ...this.props,
                            username: row.name,
                            children: <span className="witness-card notranslate"> {UserAvatar({...this.props, username: row.name, size: "medium"})} {row.name}</span>
                        })
                    },
                },
                {
                    dataField: "miss",
                    classes: "col-miss",
                    text: _t("witnesses-page.miss"),
                    formatter: (cell: any, row: WitnessTransformed) => {
                        return <span className="witness-miss">{row.miss}</span>
                    }
                },
                {
                    dataField: "url",
                    classes: "col-url",
                    text: _t("witnesses-page.url"),
                    formatter: (cell: any, row: WitnessTransformed) => {
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
                    }
                },
                {
                    dataField: "fee",
                    classes: "col-fee",
                    text: _t("witnesses-page.fee"),
                    formatter: (cell: any, row: WitnessTransformed) => {
                        return <span className="witness-fee">{row.fee}</span>
                    }
                },
                {
                    dataField: "feed",
                    classes: "col-feed",
                    text: _t("witnesses-page.feed"),
                    formatter: (cell: any, row: WitnessTransformed) => {
                        return <div className="witness-feed"><span className="inner">{row.feed}</span></div>
                    }
                },
                {
                    dataField: "version",
                    classes: "col-version",
                    text: _t("witnesses-page.version"),
                    formatter: (cell: any, row: WitnessTransformed) => {
                        return <div className="witness-version"><span className="inner">{row.version}</span></div>
                    }
                }
            ]
        };

        const table = <BootstrapTable {...tableProps} />;

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

                            {!proxy && (<div className="table-responsive witnesses-table">{table}</div>)}
                        </>
                    })()}
                </div>
            </>
        );
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(WitnessesPage);
