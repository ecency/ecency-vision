import React, { Component } from "react";

import { History } from "history";

import { Modal, Table, Button, Spinner } from "react-bootstrap";

import { State as GlobalState } from "../../store/global/types";
import { Entry } from "../../store/entries/types";
import { Account } from "../../store/accounts/types";

import UserAvatar from "../user-avatar/index";
import FormattedCurrency from "../formatted-currency";
import ProfileLink from "../profile-link/index";
import Tooltip from "../tooltip";

import { getPost } from "../../api/bridge";

import parseAsset from "../../helper/parse-asset";

import { _t } from "../../i18n";

import { peopleSvg, chevronLeftSvg, chevronRightSvg } from "../../img/svg";

interface Vote {
  voter: string;
  rshares: string;
  reward?: number;
}

export const prepareVotes = (entry: Entry, votes: Vote[]): Vote[] => {
  const totalPayout =
    parseAsset(entry.pending_payout_value).value +
    parseAsset(entry.author_payout_value).value +
    parseAsset(entry.curator_payout_value).value;

  const voteRshares = votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
  const ratio = totalPayout / voteRshares;

  return votes
    .map((a) => {
      const rew = parseFloat(a.rshares) * ratio;

      return Object.assign({}, a, {
        reward: rew,
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
  page: number;
}

export class EntryVotesDetail extends Component<DetailProps, DetailState> {
  state: DetailState = {
    loading: false,
    votes: [],
    page: 0,
  };

  componentDidMount() {
    const { entry } = this.props;

    this.setState({ loading: true });
    getPost(entry.author, entry.permlink)
      .then((r) => {
        if (r) {
          this.setVotes(r.active_votes);
        }
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  setVotes = (votes: Vote[]) => {
    const { entry } = this.props;

    this.setState({ votes: prepareVotes(entry, votes), loading: false });
  };

  prev = () => {
    const { page } = this.state;
    this.setState({ page: page - 1 });
  };

  next = () => {
    const { page } = this.state;
    this.setState({ page: page + 1 });
  };

  render() {
    const { loading, votes, page } = this.state;

    return (
      <>
        <div className="votes-dialog-content">
          {(() => {
            if (loading) {
              return <Spinner animation="grow" variant="primary" />;
            }

            const { page } = this.state;

            const pageSize = 6;
            const totalPages = Math.ceil(votes.length / pageSize);

            const start = page * pageSize;

            const hasPrev = page !== 0;
            const hasNext = page + 1 !== totalPages;

            const list = votes.slice(start, start + pageSize);

            return (
              <>
                <Table borderless={true} striped={true}>
                  <thead>
                    <tr>
                      <th>{_t("entry-votes.voter")}</th>
                      <th>{_t("entry-votes.reward")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((v, i) => (
                      <tr key={i}>
                        <td className="voter-cell">
                          <ProfileLink {...this.props} username={v.voter}>
                            <span className="account">
                              <UserAvatar username={v.voter} size="small" />{" "}
                              {v.voter}
                            </span>
                          </ProfileLink>
                        </td>
                        <td className="reward-cell">
                          <FormattedCurrency
                            {...this.props}
                            value={v.reward}
                            fixAt={3}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="votes-pagination">
                  <Button size="sm" disabled={!hasPrev} onClick={this.prev}>
                    {chevronLeftSvg}
                  </Button>
                  <div className="page-numbers">
                    <span className="current-page"> {page + 1}</span> /{" "}
                    {totalPages}
                  </div>
                  <Button size="sm" disabled={!hasNext} onClick={this.next}>
                    {chevronRightSvg}
                  </Button>
                </div>
              </>
            );
          })()}
        </div>
      </>
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

    const child = (
      <>
        {peopleSvg} {entry.stats.total_votes}
      </>
    );

    if (entry.stats.total_votes === 0) {
      return (
        <Tooltip content={_t("entry-votes.title-empty")}>
          <span className="inner-btn no-data">{child}</span>
        </Tooltip>
      );
    }

    return (
      <>
        <Tooltip
          content={_t("entry-votes.title", { n: entry.stats.total_votes })}
        >
          <span className="inner-btn" onClick={this.toggle}>
            {child}
          </span>
        </Tooltip>
        {visible && (
          <Modal onHide={this.toggle} show={true} centered={true}>
            <Modal.Header closeButton={true}>
              <Modal.Title>
                {_t("entry-votes.title", { n: entry.stats.total_votes })}
              </Modal.Title>
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
