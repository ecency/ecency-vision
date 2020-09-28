import React, {Component} from "react";

import {History} from "history";

import moment from "moment";

import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";

import {Modal, Spinner} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {Entry} from "../../store/entries/types";
import {Account} from "../../store/accounts/types";

import UserAvatar from "../user-avatar/index";
import FormattedCurrency from "../formatted-currency";
import ProfileLink from "../profile-link/index";
import Tooltip from "../tooltip";

import {Vote, getActiveVotes} from "../../api/hive";

import parseAsset from "../../helper/parse-asset";

import parseDate from "../../helper/parse-date";

import formattedNumber from "../../util/formatted-number";

import {_t} from "../../i18n";

import {peopleSvg, chevronUpSvg, chevronDownSvg} from "../../img/svg";

export const prepareVotes = (entry: Entry, votes: Vote[]): Vote[] => {
    const totalPayout =
        parseAsset(entry.pending_payout_value).amount +
        parseAsset(entry.author_payout_value).amount +
        parseAsset(entry.curator_payout_value).amount;

    const voteRshares = votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
    const ratio = totalPayout / voteRshares;

    return votes
        .map((a) => {
            const rew = parseFloat(a.rshares) * ratio;

            return Object.assign({}, a, {
                reward: rew,
                timestamp: parseDate(a.time).getTime(),
                percent: a.percent / 100,
            });
        })
        .sort((a, b) => {
            const keyA = a.reward;
            const keyB = b.reward;

            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
            return 0;
        });
};

interface DetailProps {
    history: History;
    global: Global;
    entry: Entry;
    addAccount: (data: Account) => void;
}

interface DetailState {
    loading: boolean;
    votes: Vote[];
}

export class EntryVotesDetail extends Component<DetailProps, DetailState> {
    state: DetailState = {
        loading: false,
        votes: [],
    };

    _mounted: boolean = true;

    componentDidMount() {
        const {entry} = this.props;

        this.stateSet({loading: true});
        getActiveVotes(entry.author, entry.permlink)
            .then((r) => {
                this.setVotes(r);
            })
            .finally(() => {
                this.stateSet({loading: false});
            });
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (obj: {}, cb: () => void = () => {
    }) => {
        if (this._mounted) {
            this.setState(obj, cb);
        }
    };

    setVotes = (votes: Vote[]) => {
        const {entry} = this.props;

        this.stateSet({votes: prepareVotes(entry, votes), loading: false});
    };

    sortCaret = (order: string) => {
        if (!order)
            return (
                <span className="table-sort-caret">
          {chevronDownSvg} {chevronUpSvg}
        </span>
            );
        else if (order === "asc") return <span className="table-sort-caret active">{chevronUpSvg}</span>;
        else if (order === "desc") return <span className="table-sort-caret active">{chevronDownSvg}</span>;
        return null;
    };

    render() {
        const {loading, votes} = this.state;

        if (loading) {
            return (
                <div className="dialog-loading">
                    <Spinner animation="grow" variant="primary"/>
                </div>
            );
        }

        const columns = [
            {
                dataField: "voter",
                text: _t("entry-votes.voter"),
                classes: "voter-cell",
                formatter: (cell: any, row: Vote) => {
                    return ProfileLink({
                        ...this.props,
                        username: row.voter,
                        children: <span className="account notranslate"> {UserAvatar({...this.props, username: row.voter, size:"medium" })} {row.voter}</span>
                    })
                },
            },
            {
                dataField: "reward",
                text: _t("entry-votes.reward"),
                classes: "reward-cell",
                sort: true,
                sortCaret: this.sortCaret,
                formatter: (cell: any, row: Vote) => {
                    return <FormattedCurrency {...this.props} value={row.reward} fixAt={3}/>;
                },
            },
            {
                dataField: "percent",
                text: _t("entry-votes.percent"),
                classes: "percent-cell",
                sort: true,
                sortCaret: this.sortCaret,
                formatter: (cell: any, row: Vote) => {
                    return formattedNumber(row.percent, {fractionDigits: 1, suffix: "%"});
                },
            },
            {
                dataField: "timestamp",
                text: _t("entry-votes.time"),
                classes: "time-cell",
                sort: true,
                sortCaret: this.sortCaret,
                formatter: (cell: any, row: Vote) => {
                    return (
                        <Tooltip content={moment(row.timestamp).format("LLLL")}>
                            <span>{moment(row.timestamp).fromNow()}</span>
                        </Tooltip>
                    );
                },
            },
        ];

        const sort = {
            dataField: "reward",
            order: "desc",
        };

        const pagination = {
            sizePerPage: 8,
            hideSizePerPage: true,
        };

        const tableProps = {
            bordered: false,
            defaultSorted: [sort],
            keyField: "voter",
            data: votes,
            columns,
            pagination: votes.length > pagination.sizePerPage ? paginationFactory(pagination) : undefined,
        };

        // @ts-ignore this is about the library's defaultSorted typing issue
        const table = <BootstrapTable {...tableProps} />;

        return (
            <div className="votes-dialog-content">
                <div className="table-responsive">{table}</div>
            </div>
        );
    }
}

interface Props {
    history: History;
    global: Global;
    entry: Entry;
    addAccount: (data: Account) => void;
}

interface State {
    visible: boolean;
}

export class EntryVotes extends Component<Props, State> {
    state: State = {
        visible: false,
    };

    toggle = () => {
        const {visible} = this.state;
        this.setState({visible: !visible});
    };

    render() {
        const {entry} = this.props;
        const {visible} = this.state;

        const title =
            entry.stats.total_votes === 0
                ? _t("entry-votes.title-empty")
                : entry.stats.total_votes === 1
                ? _t("entry-votes.title")
                : _t("entry-votes.title-n", {n: entry.stats.total_votes});

        const child = (
            <>
                {peopleSvg} {entry.stats.total_votes}
            </>
        );

        if (entry.stats.total_votes === 0) {
            return (
                <div className="entry-votes notranslate">
                    <Tooltip content={title}>
                        <span className="inner-btn no-data">{child}</span>
                    </Tooltip>
                </div>
            );
        }

        return (
            <>
                <div className="entry-votes notranslate">
                    <Tooltip content={title}>
            <span className="inner-btn" onClick={this.toggle}>
              {child}
            </span>
                    </Tooltip>
                </div>
                {visible && (
                    <Modal onHide={this.toggle} show={true} centered={true} size="lg" animation={false}>
                        <Modal.Header closeButton={true}>
                            <Modal.Title>{title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <EntryVotesDetail {...this.props} entry={entry}/>
                        </Modal.Body>
                    </Modal>
                )}
            </>
        );
    }
}

export default (p: Props) => {
    const props = {
        history: p.history,
        global: p.global,
        entry: p.entry,
        addAccount: p.addAccount
    }

    return <EntryVotes {...props} />;
}
