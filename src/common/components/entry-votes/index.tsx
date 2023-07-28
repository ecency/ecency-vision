import React, { Component } from "react";

import { Alert, Form, FormControl, Modal } from "react-bootstrap";

import { History } from "history";

import { Global } from "../../store/global/types";
import { Entry } from "../../store/entries/types";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";

import BaseComponent from "../base";
import UserAvatar from "../user-avatar/index";
import FormattedCurrency from "../formatted-currency";
import ProfileLink from "../profile-link/index";
import Tooltip from "../tooltip";
import Pagination from "../pagination";

import { getActiveVotes, Vote } from "../../api/hive";

import parseAsset from "../../helper/parse-asset";
import parseDate, { dateToFormatted, dateToFullRelative } from "../../helper/parse-date";
import accountReputation from "../../helper/account-reputation";

import formattedNumber from "../../util/formatted-number";
import _c from "../../util/fix-class-names";

import { _t } from "../../i18n";

import { heartSvg } from "../../img/svg";
import "./_index.scss";
import { useMappedStore } from "../../store/use-mapped-store";
import { Spinner } from "../spinner";

export const prepareVotes = (entry: Entry, votes: Vote[]): Vote[] => {
  // const totalPayout =
  //     parseAsset(entry.pending_payout_value).amount +
  //     parseAsset(entry.author_payout_value).amount +
  //     parseAsset(entry.curator_payout_value).amount;

  let totalPayout = 0;

  const { pending_payout_value, author_payout_value, curator_payout_value, payout } = entry;

  if (pending_payout_value && author_payout_value && curator_payout_value) {
    totalPayout =
      parseAsset(entry.pending_payout_value).amount +
      parseAsset(entry.author_payout_value).amount +
      parseAsset(entry.curator_payout_value).amount;
  }

  if (payout && Number(totalPayout.toFixed(3)) !== payout) {
    totalPayout += payout;
  }
  const voteRshares = votes && votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
  const ratio = totalPayout / voteRshares;

  return votes.map((a) => {
    const rew = parseFloat(a.rshares) * ratio;

    return Object.assign({}, a, {
      reward: rew,
      timestamp: parseDate(a.time).getTime(),
      percent: a.percent / 100
    });
  });
};

type SortOption = "reward" | "timestamp" | "voter" | "percent";

interface DetailProps {
  history: History;
  global: Global;
  entry: Entry;
  addAccount: (data: Account) => void;
  updateInputDisable: (value: boolean) => void;
  searchText: string;
}

interface DetailState {
  loading: boolean;
  votes: Vote[];
  originalVotes: Vote[];
  page: number;
  sort: SortOption;
}

export class EntryVotesDetail extends BaseComponent<DetailProps, DetailState> {
  state: DetailState = {
    loading: false,
    votes: [],
    originalVotes: [],
    page: 1,
    sort: "reward"
  };

  componentDidMount() {
    const { entry, updateInputDisable } = this.props;

    this.stateSet({ loading: true });
    getActiveVotes(entry.author, entry.permlink)
      .then((r) => {
        this.setVotes(r);
      })
      .finally(() => {
        this.stateSet({ loading: false });
        updateInputDisable(false);
      });
  }

  setVotes = (data: Vote[]) => {
    const { entry } = this.props;
    this.stateSet({
      votes: prepareVotes(entry, data),
      loading: false,
      originalVotes: prepareVotes(entry, data)
    });
  };

  sortChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    this.stateSet({ sort: e.target.value as SortOption });
  };

  componentDidUpdate(prevProps: DetailProps) {
    if (prevProps.searchText !== this.props.searchText) {
      this.setState({
        votes: this.state.originalVotes.filter((item) =>
          item.voter.toLocaleLowerCase().includes(this.props.searchText.toLocaleLowerCase())
        ),
        page: 1
      });
    }
  }

  render() {
    const { loading, votes, page, sort } = this.state;

    if (loading) {
      return (
        <div className="dialog-loading">
          <Spinner className="w-4 h-4" />
        </div>
      );
    }

    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const sliced = votes
      .sort((a, b) => {
        const keyA = a[sort]!;
        const keyB = b[sort]!;

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;
        return 0;
      })
      .slice(start, end);
    const totalVotes =
      (this.props.entry.active_votes && this.props.entry.active_votes.length) ||
      this.props.entry.total_votes ||
      0;

    return (
      <>
        {totalVotes !== votes.length && (
          <Alert variant="warning">{_t("entry-votes.pending-message")}</Alert>
        )}
        <div className="voters-list">
          <div className="list-body">
            {sliced && sliced.length > 0
              ? sliced.map((x) => {
                  return (
                    <div className="list-item" key={x.voter}>
                      <div className="item-main">
                        <ProfileLink {...this.props} username={x.voter}>
                          <UserAvatar username={x.voter} size="small" />
                        </ProfileLink>

                        <div className="item-info">
                          {ProfileLink({
                            ...this.props,
                            username: x.voter,
                            children: <span className="item-name notranslate">{x.voter}</span>
                          })}
                          <span className="item-reputation">{accountReputation(x.reputation)}</span>
                        </div>
                      </div>
                      <div className="item-extra">
                        <FormattedCurrency {...this.props} value={x.reward} fixAt={3} />
                        <span className="separator" />
                        {formattedNumber(x.percent, { fractionDigits: 1, suffix: "%" })}
                        <span className="separator" />
                        <Tooltip content={dateToFormatted(x.time)}>
                          <span>{dateToFullRelative(x.time)}</span>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })
              : _t("communities.no-results")}
          </div>
        </div>

        <div className="list-tools">
          <div className="pages">
            {votes.length > pageSize && (
              <Pagination
                dataLength={votes.length}
                pageSize={pageSize}
                maxItems={4}
                page={page}
                onPageChange={(page) => {
                  this.stateSet({ page });
                }}
              />
            )}
          </div>
          <div className="sorter">
            <span className="label">{_t("entry-votes.sort")}</span>
            <Form.Control as="select" onChange={this.sortChanged} value={sort}>
              <option value="reward">{_t("entry-votes.sort-reward")}</option>
              <option value="timestamp">{_t("entry-votes.sort-timestamp")}</option>
              <option value="reputation">{_t("entry-votes.sort-reputation")}</option>
              <option value="percent">{_t("entry-votes.sort-percent")}</option>
            </Form.Control>
          </div>
        </div>
      </>
    );
  }
}

interface Props {
  history: History;
  global: Global;
  activeUser: ActiveUser | null;
  entry: Entry;
  addAccount: (data: Account) => void;
  icon?: JSX.Element;
}

interface State {
  visible: boolean;
  searchText: string;
  searchTextDisabled: boolean;
  vote: boolean;
}

export class EntryVotes extends Component<Props, State> {
  state: State = {
    visible: false,
    searchText: "",
    searchTextDisabled: true,
    vote: false
  };

  toggle = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible, searchText: "" });
  };

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.entry?.active_votes?.length !== this.props.entry?.active_votes?.length) {
      this.setState({ vote: true });
    }
  }

  isVoted = () => {
    const { activeUser } = this.props;

    if (!activeUser) {
      return { voted: false };
    }
    const { active_votes: votes } = this.props.entry;

    const voted = votes && votes.some((v) => v.voter === activeUser.username);

    return { voted };
  };

  render() {
    const { entry } = this.props;
    const { visible, searchText, searchTextDisabled, vote } = this.state;
    const totalVotes = (entry.active_votes && entry.active_votes.length) || entry.total_votes || 0;
    const { voted } = this.isVoted();
    let cls = _c(`heart-icon ${voted ? "voted" : ""} ${vote ? "vote-done" : ""} `);

    const title =
      totalVotes === 0
        ? _t("entry-votes.title-empty")
        : totalVotes === 1
        ? _t("entry-votes.title")
        : _t("entry-votes.title-n", { n: totalVotes });

    const child = (
      <>
        <div className={cls}>{this.props.icon ?? heartSvg}</div>
        {totalVotes}
      </>
    );

    if (totalVotes === 0) {
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
          <Modal
            onHide={this.toggle}
            show={true}
            centered={true}
            size="lg"
            animation={false}
            className="entry-votes-modal px-3"
          >
            <Modal.Header closeButton={true} className="align-items-center px-0">
              <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Form.Group className="w-100 mb-3">
              <Form.Control
                type="text"
                placeholder={_t("friends.search-placeholder")}
                value={searchText}
                onChange={(e) => {
                  this.setState({ searchText: e.target.value });
                }}
                disabled={searchTextDisabled}
              />
            </Form.Group>
            <Modal.Body className="px-0">
              <EntryVotesDetail
                {...this.props}
                entry={entry}
                searchText={searchText}
                updateInputDisable={(value: boolean) =>
                  this.setState({ searchTextDisabled: value })
                }
              />
            </Modal.Body>
          </Modal>
        )}
      </>
    );
  }
}

export default (p: Pick<Props, "entry" | "history" | "icon">) => {
  const { global, activeUser, addAccount } = useMappedStore();

  const props = {
    history: p.history,
    global,
    entry: p.entry,
    activeUser,
    addAccount,
    icon: p.icon
  };

  return <EntryVotes {...props} />;
};
