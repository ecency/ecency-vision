import React, { Component } from "react";

import { Link } from "react-router-dom";

import isEqual from "react-fast-compare";

import { History, Location } from "history";

import moment from "moment";

import numeral from "numeral";

import { getProposalVotes, Proposal } from "../../api/hive";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { ToggleType, UI } from "../../store/ui/types";

import EntryLink from "../entry-link";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import ProposalVotes from "../proposal-votes";
import ProposalVoteBtn from "../proposal-vote-btn";

import now from "../../util/now";

import _c from "../../util/fix-class-names";

import { _t } from "../../i18n";

import { linkSvg } from "../../img/svg";
import { Skeleton } from "../skeleton";
import "./_index.scss";

interface Props {
  history: History;
  location: Location;
  global: Global;
  dynamicProps: DynamicProps;
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  signingKey: string;
  addAccount: (data: Account) => void;
  proposal: Proposal;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  setSigningKey: (key: string) => void;
  isReturnProposalId?: number;
  thresholdProposalId?: number | null;
}

interface State {
  votes: boolean;
  votedByVoter: boolean;
  loadingSearchResult: boolean;
}

export class ProposalListItem extends Component<Props, State> {
  state: State = {
    votes: false,
    votedByVoter: false,
    loadingSearchResult: false
  };

  componentDidMount() {
    this.loadProposalByVoter();
  }

  shouldComponentUpdate(
    nextProps: Readonly<Props>,
    nextState: Readonly<{}>,
    nextContext: any
  ): boolean {
    return (
      !isEqual(this.state, nextState) ||
      !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username) ||
      !isEqual(this.props.location, nextProps.location) ||
      !isEqual(this.props.dynamicProps.hivePerMVests, nextProps.dynamicProps.hivePerMVests)
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.location !== this.props.location) {
      this.loadProposalByVoter();
      this.setState({ loadingSearchResult: true });
    }
  }

  loadProposalByVoter = () => {
    const { proposal, location } = this.props;

    const params = new URLSearchParams(location.search);
    const voterParams = (params as URLSearchParams).get("voter");

    if (!!voterParams) {
      getProposalVotes(proposal.id, voterParams as string, 1)
        .then((r) => {
          const votedByVoter = r.length > 0 && r[0].voter === voterParams;
          this.setState({ votedByVoter, loadingSearchResult: false });
        })
        .finally();
    }
  };

  toggleVotes = () => {
    const { votes } = this.state;
    this.setState({ votes: !votes });
  };

  render() {
    const { votes, votedByVoter, loadingSearchResult } = this.state;

    const { dynamicProps, proposal, isReturnProposalId, thresholdProposalId } = this.props;

    const startDate = moment(new Date(proposal.start_date));
    const endDate = moment(new Date(proposal.end_date));
    const duration = endDate.diff(startDate, "days");

    const votesHP = (Number(proposal.total_votes) / 1e12) * dynamicProps.hivePerMVests;
    const strVotes = numeral(votesHP).format("0.00,") + " HP";

    const dailyPayment = Number(proposal.daily_pay.amount) / 1e3;
    const strDailyHdb = numeral(dailyPayment).format("0.0a");

    const allPayment = dailyPayment * duration;
    const strAllPayment = numeral(allPayment).format("0.0a");
    const diff = endDate.diff(moment(now()), "days");
    const remaining = diff < 0 ? 0 : diff;

    return loadingSearchResult ? (
      <Skeleton className="w-full loadingSearch mb-3 shadow" />
    ) : (
      <div className={_c(`proposal-list-item ${!!votedByVoter ? "voted-by-voter" : ""}`)}>
        <div className="item-content">
          <div className="left-side">
            <div className="proposal-users-card">
              <UserAvatar username={proposal.creator} size="small" />
              <span className="users">
                {_t("proposals.by")}{" "}
                {ProfileLink({
                  ...this.props,
                  username: proposal.creator,
                  children: <span> {proposal.creator}</span>
                })}
                {proposal.receiver && proposal.receiver !== proposal.creator && (
                  <>
                    {" "}
                    {_t("proposals.for")}{" "}
                    {ProfileLink({
                      ...this.props,
                      username: proposal.receiver,
                      children: <span> {proposal.receiver}</span>
                    })}
                  </>
                )}
              </span>
            </div>
            <div className="proposal-title">
              <Link to={`/proposals/${proposal.id}`}>
                {proposal.subject} <span className="proposal-id">#{proposal.id}</span>
              </Link>
            </div>
            <div className="status-duration-payment">
              <div className={`proposal-status ${proposal.status}`}>
                {_t(`proposals.status-${proposal.status}`)}
              </div>
              <div className="proposal-duration">
                {startDate.format("ll")} {"-"} {endDate.format("ll")} (
                {_t("proposals.duration-days", { n: duration })})
              </div>
              <div className="proposal-payment">
                <span className="all-pay">{`${strAllPayment} HBD`}</span>
                <span className="daily-pay">
                  ({_t("proposals.daily-pay", { n: strDailyHdb })} {"HBD"})
                </span>
              </div>
            </div>
            <div className="permlink">
              {EntryLink({
                ...this.props,
                entry: {
                  category: "proposal",
                  author: proposal.creator,
                  permlink: proposal.permlink
                },
                children: (
                  <a>
                    {linkSvg} {"/"}
                    {proposal.creator}
                    {"/"}
                    {proposal.permlink}
                  </a>
                )
              })}
            </div>
            <div className="votes">
              <a
                href="#"
                className="btn-votes"
                onClick={(e) => {
                  e.preventDefault();
                  this.toggleVotes();
                }}
              >
                {_t("proposals.votes", { n: strVotes })}
              </a>
            </div>
          </div>
          <div className="right-side">
            <div className="voting">
              <ProposalVoteBtn {...this.props} proposal={proposal.id} />
            </div>
            <div className="remaining-days">{_t("proposals.remaining-days", { n: remaining })}</div>
          </div>
        </div>
        {proposal.id !== isReturnProposalId && thresholdProposalId === proposal.id && (
          <div className="return-proposal">{_t("proposals.threshold-description")}</div>
        )}
        {proposal.id === isReturnProposalId && (
          <div className="return-proposal">{_t("proposals.return-description")}</div>
        )}
        {votes && <ProposalVotes {...this.props} onHide={this.toggleVotes} />}
      </div>
    );
  }
}

export default (p: Props) => {
  const props = {
    global: p.global,
    history: p.history,
    location: p.location,
    dynamicProps: p.dynamicProps,
    users: p.users,
    activeUser: p.activeUser,
    ui: p.ui,
    signingKey: p.signingKey,
    addAccount: p.addAccount,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    toggleUIProp: p.toggleUIProp,
    setSigningKey: p.setSigningKey,
    proposal: p.proposal,
    isReturnProposalId: p.isReturnProposalId,
    thresholdProposalId: p.thresholdProposalId
  };

  return <ProposalListItem {...props} />;
};
