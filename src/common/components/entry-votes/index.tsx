import React, { Component } from "react";

import { History } from "history";

import moment from "moment";

import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";

import { Modal, Spinner } from "react-bootstrap";

import { State as GlobalState } from "../../store/global/types";
import { Entry } from "../../store/entries/types";
import { Account } from "../../store/accounts/types";

import UserAvatar from "../user-avatar/index";
import FormattedCurrency from "../formatted-currency";
import ProfileLink from "../profile-link/index";
import Tooltip from "../tooltip";

import { Vote, getActiveVotes } from "../../api/hive";

import parseAsset from "../../helper/parse-asset";

import parseDate from "../../helper/parse-date";

import formattedNumber from "../../util/formatted-number";

import { _t } from "../../i18n";

import { peopleSvg, chevronUpSvg, chevronDownSvg } from "../../img/svg";

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
        time: parseDate(a.time),
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
  global: GlobalState;
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

  componentDidMount() {
    const { entry } = this.props;

    this.setState({ loading: true });
    getActiveVotes(entry.author, entry.permlink)
      .then((r) => {
        this.setVotes(r);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  setVotes = (votes: Vote[]) => {
    const { entry } = this.props;

    this.setState({ votes: prepareVotes(entry, votes), loading: false });
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
    const { loading, votes } = this.state;

    if (loading) {
      return (
        <div className="votes-dialog-content">
          <Spinner animation="grow" variant="primary" />
        </div>
      );
    }

    const columns = [
      {
        dataField: "voter",
        text: _t("entry-votes.voter"),
        classes: "voter-cell",
        formatter: (cell: any, row: Vote) => {
          return (
            <ProfileLink {...this.props} username={row.voter}>
              <span className="account">
                <UserAvatar username={row.voter} size="small" /> {row.voter}
              </span>
            </ProfileLink>
          );
        },
      },
      {
        dataField: "reward",
        text: _t("entry-votes.reward"),
        classes: "reward-cell",
        sort: true,
        sortCaret: this.sortCaret,
        formatter: (cell: any, row: Vote) => {
          return <FormattedCurrency {...this.props} value={row.reward} fixAt={3} />;
        },
      },
      {
        dataField: "percent",
        text: _t("entry-votes.percent"),
        classes: "percent-cell",
        sort: true,
        sortCaret: this.sortCaret,
        formatter: (cell: any, row: Vote) => {
          return formattedNumber(row.percent, { fractionDigits: 1, suffix: "%" });
        },
      },
      {
        dataField: "time",
        text: _t("entry-votes.time"),
        classes: "time-cell",
        sort: true,
        sortCaret: this.sortCaret,
        formatter: (cell: any, row: Vote) => {
          return (
            <Tooltip content={moment(row.time).format("LLLL")}>
              <span>{moment(row.time).fromNow()}</span>
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

    return (
      <div className="votes-dialog-content">
        <div className="table-responsive">
          <BootstrapTable
            bordered={false}
            // @ts-ignore this is about the library
            defaultSorted={[sort]}
            keyField="voter"
            data={votes}
            columns={columns}
            pagination={paginationFactory(pagination)}
          />
        </div>
      </div>
    );
  }
}

interface Props {
  history: History;
  global: GlobalState;
  entry: Entry;
  addAccount: (data: Account) => void;
}

interface State {
  visible: boolean;
}

export default class EntryVotes extends Component<Props, State> {
  state: State = {
    visible: false,
  };

  toggle = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  render() {
    const { entry } = this.props;
    const { visible } = this.state;

    const title =
      entry.stats.total_votes === 0
        ? _t("entry-votes.title-empty")
        : entry.stats.total_votes === 1
        ? _t("entry-votes.title")
        : _t("entry-votes.title-n", { n: entry.stats.total_votes });

    const child = (
      <>
        {peopleSvg} {entry.stats.total_votes}
      </>
    );

    if (entry.stats.total_votes === 0) {
      return (
        <div className="entry-votes">
          <Tooltip content={title}>
            <span className="inner-btn no-data">{child}</span>
          </Tooltip>
        </div>
      );
    }

    return (
      <>
        <div className="entry-votes">
          <Tooltip content={title}>
            <span className="inner-btn" onClick={this.toggle}>
              {child}
            </span>
          </Tooltip>
        </div>
        {visible && (
          <Modal onHide={this.toggle} show={true} centered={true} size="lg">
            <Modal.Header closeButton={true}>
              <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <EntryVotesDetail {...this.props} entry={entry} />
            </Modal.Body>
          </Modal>
        )}
      </>
    );
  }
}
