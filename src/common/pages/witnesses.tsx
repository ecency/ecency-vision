import React, {Component} from "react";

import {connect} from "react-redux";

import {pathToRegexp} from "path-to-regexp";

import Meta from "../components/meta";
import Feedback from "../components/feedback";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import LinearProgress from "../components/linear-progress";
import ProfileLink from "../components/profile-link";
import UserAvatar from "../components/user-avatar";
import EntryLink, {PartialEntry} from "../components/entry-link";
import WitnessVoteBtn from "../components/witness-vote-btn";
import WitnessesExtra from "../components/witnesses-extra"
import WitnessesProxy from "../components/witnesses-proxy"
import WitnessesActiveProxy from "../components/witnesses-active-proxy";

import routes from "../../common/routes";

import {getAccount, getWitnessesByVote, Witness} from "../api/hive";

import {_t} from "../i18n";

import {linkSvg, openInNewSvg} from "../img/svg";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

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

const transform = (list: Witness[]): WitnessTransformed[] => {
    return list.map((x, i) => {
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

    componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<State>, snapshot?: any) {
        // active user changed
        if (this.props.activeUser?.username !== prevProps.activeUser?.username) {
            this.stateSet({loading: true}, () => {
                this.load();
            })
        }
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
            this.stateSet({witnesses: transform(resp)});
        }).finally(() => {
            this.stateSet({loading: false});
        });
    }

    fetchVotedWitnesses = () => {
        const {activeUser} = this.props;
        if (activeUser) {
            getAccount(activeUser.username).then(resp => {
                const {witness_votes: witnessVotes, proxy} = resp;
                this.stateSet({witnessVotes: witnessVotes || [], proxy: proxy || null});
            });

            return;
        }

        this.stateSet({witnessVotes: [], proxy: null});
    };

    addWitness = (name: string) => {
        const {witnessVotes} = this.state;
        const newVotes = [...witnessVotes, name]
        this.stateSet({witnessVotes: newVotes});
    }

    deleteWitness = (name: string) => {
        const {witnessVotes} = this.state;
        const newVotes = witnessVotes.filter(x => x !== name)
        this.stateSet({witnessVotes: newVotes});
    }

    render() {
        //  Meta config
        const metaProps = {
            title: _t("witnesses-page.title"),
        };

        const {global, activeUser} = this.props;
        const {witnesses, loading, witnessVotes, proxy} = this.state;
        const extraWitnesses = witnessVotes.filter(w => !witnesses.find(y => y.name === w));

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
                                    if (approve) {
                                        this.addWitness(row.name);
                                    } else {
                                        this.deleteWitness(row.name);
                                    }
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
                <Feedback/>
                {global.isElectron ?
                    NavBarElectron({
                        ...this.props,
                    }) :
                    NavBar({...this.props})}
                <div className="app-content witnesses-page">
                    {(() => {
                        if (loading) {
                            return <>
                                <div className="page-header loading">
                                    <div className="main-title">
                                        {_t('witnesses-page.title')}
                                    </div>
                                </div>
                                <LinearProgress/>
                            </>
                        }

                        if (proxy) {
                            return <>
                                <div className="page-header">
                                    <div className="main-title">
                                        {_t('witnesses-page.title')}
                                    </div>
                                </div>
                                <WitnessesActiveProxy
                                    {...this.props}
                                    username={proxy}
                                    onDone={() => {
                                        this.stateSet({proxy: null});
                                    }}
                                />
                            </>
                        }

                        return <>
                            <div className="page-header">
                                <div className="main-title">
                                    {_t('witnesses-page.title')}
                                </div>
                                {activeUser && (
                                    <div className="remaining">
                                        {_t('witnesses-page.remaining', {n: 30 - witnessVotes.length, max: 30})}
                                    </div>
                                )}
                            </div>
                            <div className="table-responsive witnesses-table">{table}</div>
                            <div className="witnesses-controls">
                                {WitnessesExtra({
                                    ...this.props,
                                    list: extraWitnesses,
                                    onAdd: (name) => {
                                        this.addWitness(name);
                                    },
                                    onDelete: (name) => {
                                        this.deleteWitness(name);
                                    }
                                })}
                                <div className="flex-spacer"/>
                                {WitnessesProxy({
                                    ...this.props,
                                    onDone: (username) => {
                                        this.stateSet({proxy: username});
                                    }
                                })}
                            </div>
                        </>
                    })()}
                </div>
            </>
        );
    }
}


export default connect(pageMapStateToProps, pageMapDispatchToProps)(WitnessesPage);
