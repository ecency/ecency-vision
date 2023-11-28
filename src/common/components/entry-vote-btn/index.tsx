import React, { Component } from "react";

import { Form, FormControl } from "react-bootstrap";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { Entry, EntryVote } from "../../store/entries/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { UI, ToggleType } from "../../store/ui/types";

import BaseComponent from "../base";
import FormattedCurrency from "../formatted-currency";
import LoginRequired from "../login-required";
import { error } from "../feedback";

import { votingPower } from "../../api/hive";
import { vote, formatError } from "../../api/operations";

import parseAsset from "../../helper/parse-asset";

import * as ls from "../../util/local-storage";

import _c from "../../util/fix-class-names";

import { chevronDownSvgForSlider, chevronUpSvgForSlider, chevronUpSvgForVote } from "../../img/svg";
import ClickAwayListener from "../clickaway-listener";
import { _t } from "../../i18n";
import { updateUserPoints } from "../../api/breakaway";

const setVoteValue = (type: "up" | "down" | "downPrevious" | "upPrevious", username: string, value: number) => {
  ls.set(`vote-value-${type}-${username}`, value);
};

const getVoteValue = (
  type: "up" | "down" | "downPrevious" | "upPrevious",
  username: string,
  def: number
): number => {
  return ls.get(`vote-value-${type}-${username}`, def);
};

type Mode = "up" | "down";

interface VoteDialogProps {
  global: Global;
  activeUser: ActiveUser;
  dynamicProps: DynamicProps;
  entry: Entry;
  downVoted: boolean;
  upVoted: boolean;
  onClick: (percent: number, estimated: number) => void;
}

interface VoteDialogState {
  upSliderVal: number;
  downSliderVal: number;
  estimated: number;
  mode: Mode;
  wrongValueUp: boolean;
  showWarning: boolean;
  showRemove: boolean;
  wrongValueDown: boolean;
  initialVoteValues: { up: any; down: any };
}

export class VoteDialog extends Component<VoteDialogProps, VoteDialogState> {
  state: VoteDialogState = {
    upSliderVal: getVoteValue("up", this.props.activeUser?.username! + '-' + this.props.entry.post_id, getVoteValue("upPrevious", this.props.activeUser?.username!, 100)),
    downSliderVal: getVoteValue("down", this.props.activeUser?.username! + '-' + this.props.entry.post_id,  getVoteValue("downPrevious", this.props.activeUser?.username!, -1)),
    estimated: 0,
    mode: this.props.downVoted ? "down" : "up",
    wrongValueUp: false,
    wrongValueDown: false,
    showWarning: false,
    showRemove: false,
    initialVoteValues: {
      up: getVoteValue("up", this.props.activeUser?.username! + '-' + this.props.entry.post_id,  getVoteValue("upPrevious", this.props.activeUser?.username!, 100)),
      down: getVoteValue("down", this.props.activeUser?.username!+ '-' + this.props.entry.post_id,  getVoteValue("downPrevious", this.props.activeUser?.username!, -1)),
    },
  };

  estimate = (percent: number): number => {
    const { entry, activeUser, dynamicProps } = this.props;
    if (!activeUser) {
      return 0;
    }

    const { fundRecentClaims, fundRewardBalance, base, quote } = dynamicProps;
    const { data: account } = activeUser;

    if (!account.__loaded) {
      return 0;
    }

    const sign = percent < 0 ? -1 : 1;
    const postRshares = entry.net_rshares;

    const totalVests =
      parseAsset(account.vesting_shares).amount +
      parseAsset(account.received_vesting_shares).amount -
      parseAsset(account.delegated_vesting_shares).amount;

    const userVestingShares = totalVests * 1e6;

    const userVotingPower = votingPower(account) * Math.abs(percent);
    const voteEffectiveShares =
      userVestingShares * (userVotingPower / 10000) * 0.02;

    // reward curve algorithm (no idea whats going on here)
    const CURVE_CONSTANT = 2000000000000;
    const CURVE_CONSTANT_X4 = 4 * CURVE_CONSTANT;
    const SQUARED_CURVE_CONSTANT = CURVE_CONSTANT * CURVE_CONSTANT;

    const postRsharesNormalized = postRshares + CURVE_CONSTANT;
    const postRsharesAfterVoteNormalized =
      postRshares + voteEffectiveShares + CURVE_CONSTANT;
    const postRsharesCurve =
      (postRsharesNormalized * postRsharesNormalized - SQUARED_CURVE_CONSTANT) /
      (postRshares + CURVE_CONSTANT_X4);
    const postRsharesCurveAfterVote =
      (postRsharesAfterVoteNormalized * postRsharesAfterVoteNormalized -
        SQUARED_CURVE_CONSTANT) /
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

  upSliderChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { target: { id, value} } = e;
    const upSliderVal = Number(value);
    const { initialVoteValues } = this.state;
    const { upVoted } = this.props;
    this.setState({
      upSliderVal,
      wrongValueUp: upSliderVal === initialVoteValues.up && upVoted,
      showRemove: upSliderVal === 0 && upVoted,
      showWarning: (upSliderVal < initialVoteValues.up || upSliderVal > initialVoteValues.up) && upSliderVal > 0 && upVoted
    });
  };

  downSliderChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { target: { id, value} } = e;
    const downSliderVal = Number(value);
    const { initialVoteValues } = this.state;
    const { upVoted, downVoted } = this.props;
    this.setState({
      downSliderVal,
      wrongValueDown: downSliderVal === initialVoteValues.up,
      showRemove: downSliderVal === 0 && downVoted,
      showWarning: (downSliderVal > initialVoteValues.down || downSliderVal < initialVoteValues.down) && downSliderVal < 0 && downVoted
    });
  };

  changeMode = (m: Mode) => {
    this.setState({ mode: m });
  };

  isVoted = () => {
    const { activeUser } = this.props;

    if (!activeUser) {
      return { upVoted: false, downVoted: false };
    }

    const { active_votes: votes } = this.props.entry;

    const upVoted = votes.some(
      (v) => v.voter === activeUser.username && v.rshares > 0
    );

    const downVoted = votes.some(
      (v) => v.voter === activeUser.username && v.rshares < 0
    );

    return { upVoted, downVoted };
  };

  upVoteClicked = () => {
    const { onClick, activeUser, entry : { post_id } } = this.props;
    const { upSliderVal, initialVoteValues } = this.state;
    const { upVoted } = this.isVoted();
    
    if (!upVoted || (upVoted && initialVoteValues.up !== upSliderVal)) {
      const estimated = Number(this.estimate(upSliderVal).toFixed(3));
      onClick(upSliderVal, estimated);
      setVoteValue("up", `${activeUser?.username!}-${post_id}`, upSliderVal);
      setVoteValue("upPrevious", `${activeUser?.username!}-${post_id}`, upSliderVal);
      this.setState({ wrongValueUp: false, wrongValueDown: false });
    } else if(upVoted && initialVoteValues.up === upSliderVal){
      this.setState({ wrongValueUp: true, wrongValueDown: false });
    }
  };

  downVoteClicked = () => {
    const { onClick, activeUser, entry : { post_id } } = this.props;
    const { downSliderVal, initialVoteValues } = this.state;
    const { downVoted } = this.isVoted();

    if (!downVoted || (downVoted && initialVoteValues.down !== downSliderVal)) {
      const estimated = Number(this.estimate(downSliderVal).toFixed(3));
      onClick(downSliderVal, estimated);
      this.setState({ wrongValueDown: false, wrongValueUp: false });
      setVoteValue("down", `${activeUser?.username!}-${post_id}`, downSliderVal);
      setVoteValue("downPrevious", `${activeUser?.username!}-${post_id}`, downSliderVal);
    } else if(downVoted && initialVoteValues.down === downSliderVal){
      this.setState({ wrongValueDown: true, wrongValueUp: false });
    }
  };

  render() {
    const { upSliderVal, downSliderVal, mode, wrongValueUp, wrongValueDown, showWarning, showRemove } = this.state;
    const { entry: { post_id } } = this.props;

    return (
      <>
        {mode === "up" && (
          <>
            <div className="voting-controls voting-controls-up">
              <div
                className="btn-vote btn-up-vote vote-btn-lg primary-btn-vote"
                onClick={this.upVoteClicked}
              >
                <span className="btn-inner">{chevronUpSvgForSlider}</span>
              </div>
              <div className="estimated">
                <FormattedCurrency
                  {...this.props}
                  value={this.estimate(upSliderVal)}
                  fixAt={3}
                />
              </div>
              <div className="slider slider-up">
                <Form.Control
                  autoFocus={true}
                  type="range"
                  custom={true}
                  step={0.1}
                  min={0}
                  max={100}
                  value={upSliderVal}
                  onChange={this.upSliderChanged}
                  id={post_id.toString()}
                />
              </div>
              <div className="percentage">{`${
                upSliderVal && upSliderVal.toFixed(1)
              }%`}</div>
              <div
                className="btn-vote btn-down-vote vote-btn-lg secondary-btn-vote"
                onClick={() => {
                  this.changeMode("down");
                }}
              >
                <span className="btn-inner">{chevronDownSvgForSlider}</span>
              </div>
            </div>
            {wrongValueUp && (
              <div className="vote-error">
                <p>{_t('entry-list-item.vote-error')}</p>
              </div>
            )}
            {showWarning && (
              <div className="vote-warning">
                <p>{_t('entry-list-item.vote-warning')}</p>
              </div>
            )}
            {showRemove && (
              <div className="vote-remove">
                <p>{_t('entry-list-item.vote-remove')}</p>
              </div>
            )}
          </>
        )}

        {mode === "down" && (
          <>
            <div className="voting-controls voting-controls-down">
              <div
                className="btn-vote btn-up-vote vote-btn-lg primary-btn-vote"
                onClick={() => {
                  this.changeMode("up");
                }}
              >
                <span className="btn-inner no-rotate">{chevronUpSvgForSlider}</span>
              </div>
              <div className="estimated">
                <FormattedCurrency
                  {...this.props}
                  value={this.estimate(downSliderVal)}
                  fixAt={3}
                />
              </div>
              <div className="slider slider-down">
                <Form.Control
                  type="range"
                  custom={true}
                  step={0.1}
                  min={-100}
                  max={-1}
                  value={downSliderVal}
                  onChange={this.downSliderChanged}
                  id={post_id.toString()}
                  className="reverse-range"
                />
              </div>
              <div className="percentage">{`${downSliderVal.toFixed(1)}%`}</div>
              <div
                className="btn-vote btn-down-vote vote-btn-lg secondary-btn-vote"
                onClick={this.downVoteClicked}
              >
                <span className="btn-inner">{chevronDownSvgForSlider}</span>
              </div>
            </div>
          
            {wrongValueDown && (
              <div className="vote-error">
              <p>{_t('entry-list-item.vote-error')}</p>
              </div>
            )}
            {showWarning && (
              <div className="vote-warning">
                <p>{_t('entry-list-item.vote-warning')}</p>
              </div>
            )}
            {showRemove && (
              <div className="vote-remove">
                <p>{_t('entry-list-item.vote-remove')}</p>
              </div>
            )}
          </>
        )}
      </>
    );
  }
}

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  entry: Entry;
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  afterVote: (votes: EntryVote[], estimated: number) => void;
}

interface State {
  dialog: boolean;
  inProgress: boolean;
}

export class EntryVoteBtn extends BaseComponent<Props, State> {
  state: State = {
    dialog: false,
    inProgress: false,
  };

  vote = (percent: number, estimated: number) => {
    this.toggleDialog();

    const { entry, activeUser, afterVote, updateActiveUser } = this.props;
    const weight = Math.ceil(percent * 100);

    this.stateSet({ inProgress: true });
    const username = activeUser?.username!;

    vote(username, entry.author, entry.permlink, weight)
      .then(async () => {
        const votes: EntryVote[] = [
          ...entry.active_votes.filter((x) => x.voter !== username),
          { rshares: weight, voter: username },
        ];

        afterVote(votes, estimated);
        updateActiveUser(); // refresh voting power

        const baResponse = await updateUserPoints(activeUser!.username, "Hive Rally", "upvote")
        console.log("Voted")
        console.log(baResponse);
      })
      .catch((e) => {
        error(formatError(e));
      })
      .finally(() => {
        this.stateSet({ inProgress: false });
      });
  };

  isVoted = () => {
    const { activeUser } = this.props;

    if (!activeUser) {
      return { upVoted: false, downVoted: false };
    }

    const { active_votes: votes } = this.props.entry;

    const upVoted = votes.some(
      (v) => v.voter === activeUser.username && v.rshares > 0
    );

    const downVoted = votes.some(
      (v) => v.voter === activeUser.username && v.rshares < 0
    );
    
    return { upVoted, downVoted };
  };

  toggleDialog = () => {
    const { dialog } = this.state;
    this.stateSet({ dialog: !dialog });
  };

  handleClickAway = () => {
    this.stateSet({ dialog: false });
  };

  render() {
    const { activeUser } = this.props;
    const { dialog, inProgress } = this.state;
    const { upVoted, downVoted } = this.isVoted();

    let cls = _c(`btn-vote btn-up-vote ${inProgress ? "in-progress" : ""}`);

    if (upVoted || downVoted) {
      cls = _c(
        `btn-vote ${
          upVoted ? "btn-up-vote primary-btn-done" : "btn-down-vote secondary-btn-done"
        } ${inProgress ? "in-progress" : ""} voted`
      );
    }
    let tooltipClass = "";
    if (dialog) {
      if (!upVoted || !downVoted) {
        cls = cls + " primary-btn secondary-btn";
      }
      tooltipClass = "tooltip-vote";
    }

    const voteBtnClass = `btn-inner ${
      tooltipClass.length > 0
        ? upVoted ? "primary-btn-done" : downVoted
          ? "secondary-btn-done"
          : "primary-btn"
        : ""
    }`;

    return (
      <>
        {LoginRequired({
          ...this.props,
          children: (
            <div>
            <ClickAwayListener onClickAway={()=>{dialog && this.setState({dialog:false})}}>
              <div className="entry-vote-btn" onClick={this.toggleDialog}>
                <div className={cls}>
                  <div className={tooltipClass}>
                    <span className={voteBtnClass}>{chevronUpSvgForVote}</span>
                    {activeUser && tooltipClass.length > 0 && (
                      <div>
                        <span
                          className="tooltiptext"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <VoteDialog
                            {...this.props}
                            activeUser={activeUser as any}
                            onClick={this.vote}
                            upVoted={upVoted}
                            downVoted={downVoted}
                          />
                        </span>
                      </div>)}
                  </div>
                </div>
              </div>
            </ClickAwayListener>
            </div>
          ),
        })}
      </>
    );
  }
}

export default (p: Props) => {
  const props = {
    global: p.global,
    dynamicProps: p.dynamicProps,
    entry: p.entry,
    users: p.users,
    activeUser: p.activeUser,
    ui: p.ui,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    toggleUIProp: p.toggleUIProp,
    afterVote: p.afterVote,
  };

  return <EntryVoteBtn {...props} />;
};
