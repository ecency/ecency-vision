import React, { Component } from "react";

import { Modal, Form, FormControl } from "react-bootstrap";

import { Account } from "../../store/accounts/types";
import { Entry } from "../../store/entries/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import FormattedCurrency from "../formatted-currency";
import LoginRequired from "../login-required";
import { error } from "../feedback";

import { getActiveVotes, Vote, vpMana } from "../../api/hive";
import { vote, formatError } from "../../api/operations";

import parseAsset from "../../helper/parse-asset";

import * as ls from "../../util/local-storage";

import _c from "../../util/fix-class-names";

import { chevronUpSvg } from "../../img/svg";

const setVoteValue = (type: "up" | "down", username: string, value: number) => {
  ls.set(`vote-value-${type}-${username}`, value);
};

const getVoteValue = (type: "up" | "down", username: string, def: number): number => {
  return ls.get(`vote-value-${type}-${username}`, def);
};

type Mode = "up" | "down";

interface VoteDialogProps {
  activeUser: ActiveUser | null;
  dynamicProps: DynamicProps;
  entry: Entry;
  onClick: (percent: number) => void;
  onHide: () => void;
}

interface VoteDialogState {
  upSliderVal: number;
  downSliderVal: number;
  estimated: number;
  mode: Mode;
}

export class VoteDialog extends Component<VoteDialogProps, VoteDialogState> {
  state: VoteDialogState = {
    upSliderVal: getVoteValue("up", this.props.activeUser?.username!, 100),
    downSliderVal: getVoteValue("down", this.props.activeUser?.username!, -100),
    estimated: 0,
    mode: "up",
  };

  estimate = (percent: number): number => {
    const { entry, activeUser, dynamicProps } = this.props;
    if (!activeUser) {
      return 0;
    }

    const { fundRecentClaims, fundRewardBalance, base, quote } = dynamicProps;
    const { data: account } = activeUser;

    const sign = percent < 0 ? -1 : 1;
    const postRshares = entry.net_rshares;

    const totalVests =
      parseAsset(account.vesting_shares).amount +
      parseAsset(account.received_vesting_shares).amount -
      parseAsset(account.delegated_vesting_shares).amount;

    const userVestingShares = totalVests * 1e6;

    const userVotingPower = vpMana(account) * Math.abs(percent);
    const voteEffectiveShares = userVestingShares * (userVotingPower / 10000) * 0.02;

    // reward curve algorithm (no idea whats going on here)
    const CURVE_CONSTANT = 2000000000000;
    const CURVE_CONSTANT_X4 = 4 * CURVE_CONSTANT;
    const SQUARED_CURVE_CONSTANT = CURVE_CONSTANT * CURVE_CONSTANT;

    const postRsharesNormalized = postRshares + CURVE_CONSTANT;
    const postRsharesAfterVoteNormalized = postRshares + voteEffectiveShares + CURVE_CONSTANT;
    const postRsharesCurve =
      (postRsharesNormalized * postRsharesNormalized - SQUARED_CURVE_CONSTANT) / (postRshares + CURVE_CONSTANT_X4);
    const postRsharesCurveAfterVote =
      (postRsharesAfterVoteNormalized * postRsharesAfterVoteNormalized - SQUARED_CURVE_CONSTANT) /
      (postRshares + voteEffectiveShares + CURVE_CONSTANT_X4);

    const voteClaim = postRsharesCurveAfterVote - postRsharesCurve;

    const proportion = voteClaim / fundRecentClaims;
    const fullVote = proportion * fundRewardBalance;

    const voteValue = fullVote * (base / quote);

    if (sign > 0) {
      return Math.max(voteValue * sign, 0);
    }

    return voteValue * sign;
  };

  upSliderChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
    const upSliderVal = Number(e.target.value);
    this.setState({ upSliderVal });

    const { activeUser } = this.props;
    setVoteValue("up", activeUser?.username!, upSliderVal);
  };

  downSliderChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
    const downSliderVal = Number(e.target.value);
    this.setState({ downSliderVal });

    const { activeUser } = this.props;
    setVoteValue("down", activeUser?.username!, downSliderVal);
  };

  changeMode = (m: Mode) => {
    this.setState({ mode: m });
  };

  upVoteClicked = () => {
    const { onClick, onHide } = this.props;
    const { upSliderVal } = this.state;
    onClick(upSliderVal);
    onHide();
  };

  downVoteClicked = () => {
    const { onClick, onHide } = this.props;
    const { downSliderVal } = this.state;
    onClick(downSliderVal);
    onHide();
  };

  render() {
    const { onHide } = this.props;
    const { upSliderVal, downSliderVal, mode } = this.state;

    return (
      <Modal className="vote-modal" onHide={onHide} show={true} centered={true} animation={false}>
        {mode === "up" && (
          <div className="voting-controls voting-controls-up">
            <div className="btn-vote btn-up-vote vote-btn-lg" onClick={this.upVoteClicked}>
              <span className="btn-inner">{chevronUpSvg}</span>
            </div>
            <div className="estimated">
              <FormattedCurrency {...this.props} value={this.estimate(upSliderVal)} fixAt={3} />
            </div>

            <div className="slider slider-up">
              <Form.Control
                type="range"
                custom={true}
                step={0.1}
                min={0.1}
                max={100}
                value={upSliderVal}
                onChange={this.upSliderChanged}
              />
            </div>
            <div className="percentage">{`${upSliderVal.toFixed(1)}%`}</div>
            <div
              className="btn-vote btn-down-vote vote-btn-lg"
              onClick={() => {
                this.changeMode("down");
              }}
            >
              <span className="btn-inner">{chevronUpSvg}</span>
            </div>
          </div>
        )}

        {mode === "down" && (
          <div className="voting-controls voting-controls-down">
            <div
              className="btn-vote btn-up-vote vote-btn-lg"
              onClick={() => {
                this.changeMode("up");
              }}
            >
              <span className="btn-inner">{chevronUpSvg}</span>
            </div>
            <div className="estimated">
              <FormattedCurrency {...this.props} value={this.estimate(downSliderVal)} fixAt={3} />
            </div>
            <div className="slider slider-down">
              <Form.Control
                type="range"
                custom={true}
                step={0.1}
                min={-100}
                max={-0.1}
                value={downSliderVal}
                onChange={this.downSliderChanged}
              />
            </div>
            <div className="percentage">{`${downSliderVal.toFixed(1)}%`}</div>
            <div className="btn-vote btn-down-vote vote-btn-lg" onClick={this.downVoteClicked}>
              <span className="btn-inner">{chevronUpSvg}</span>
            </div>
          </div>
        )}
      </Modal>
    );
  }
}

interface Props {
  dynamicProps: DynamicProps;
  entry: Entry;
  users: User[];
  activeUser: ActiveUser | null;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data: Account) => void;
  deleteUser: (username: string) => void;
  afterVote: (firstTime: boolean) => void;
}

interface State {
  votes: Vote[];
  dialog: boolean;
  inProgress: boolean;
}

export default class EntryVoteBtn extends Component<Props, State> {
  state: State = {
    votes: [],
    dialog: false,
    inProgress: false,
  };

  _mounted: boolean = true;

  fetchVotes = () => {
    const { activeUser, entry, users } = this.props;

    if (activeUser) {
      const usernames = users.map((x) => x.username);

      getActiveVotes(entry.author, entry.permlink).then((resp) => {
        const votes = resp.filter((x) => usernames.includes(x.voter));
        this.stateSet({ votes });
      });
    }
  };

  componentDidMount = () => {
    // wait to load active user on page load
    setTimeout(this.fetchVotes, 200);
  };

  componentWillUnmount() {
    this._mounted = false;
  }

  stateSet = (obj: {}, cb: () => void = () => {}) => {
    if (this._mounted) {
      this.setState(obj, cb);
    }
  };

  vote = (percent: number) => {
    const { upVoted, downVoted } = this.isVoted();
    const { entry, users, activeUser, afterVote } = this.props;
    const user = users.find((x) => x.username === activeUser?.username)!;
    const weight = percent * 100;

    this.stateSet({ inProgress: true });

    vote(user, entry.author, entry.permlink, weight)
      .then(() => {
        this.fetchVotes();
        this.stateSet({ inProgress: false });
        afterVote(!(upVoted || downVoted));
      })
      .catch((e) => {
        this.stateSet({ inProgress: false });
        error(formatError(e));
      });
  };

  isVoted = () => {
    const { activeUser } = this.props;

    if (!activeUser) {
      return { upVoted: false, downVoted: false };
    }

    const { votes } = this.state;

    const upVoted = votes.some((v) => v.voter === activeUser.username && v.percent > 0);

    const downVoted = votes.some((v) => v.voter === activeUser.username && v.percent < 0);

    return { upVoted, downVoted };
  };

  toggleDialog = () => {
    const { dialog } = this.state;
    this.stateSet({ dialog: !dialog });
  };

  render() {
    const { dialog, inProgress } = this.state;
    const { upVoted, downVoted } = this.isVoted();

    let cls = _c(`btn-vote btn-up-vote ${inProgress ? "in-progress" : ""}`);

    if (upVoted || downVoted) {
      cls = _c(`btn-vote ${upVoted ? "btn-up-vote" : "btn-down-vote"} ${inProgress ? "in-progress" : ""} voted`);
    }

    return (
      <>
        <LoginRequired {...this.props}>
          <div className="entry-vote-btn" onClick={this.toggleDialog}>
            <div className={cls}>
              <span className="btn-inner">{chevronUpSvg}</span>
            </div>
          </div>
        </LoginRequired>

        {dialog && <VoteDialog {...this.props} onHide={this.toggleDialog} onClick={this.vote} />}
      </>
    );
  }
}
