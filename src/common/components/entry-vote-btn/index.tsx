import React, { Component } from "react";

import { Popover, OverlayTrigger, Button, Modal, Form, FormControl } from "react-bootstrap";

import { Entry } from "../../store/entries/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import FormattedCurrency from "../formatted-currency";

import { getActiveVotes, Vote, vpMana } from "../../api/hive";

import parseAsset from "../../helper/parse-asset";
import isEmptyDate from "../../helper/is-empty-date";
import { vestsToRshares } from "../../helper/vesting";

import _c from "../../util/fix-class-names";

import { chevronUpSvg } from "../../img/svg";

type Mode = "up" | "down";

interface VoteDialogProps {
  activeUser: ActiveUser | null;
  dynamicProps: DynamicProps;
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
    upSliderVal: 100,
    downSliderVal: 100,
    estimated: 0,
    mode: "up",
  };

  /*
  estimate = (w: number): number => {
    const { activeUser, dynamicProps } = this.props;
    if (!activeUser) {
      return 0;
    }

    const { fundRecentClaims, fundRewardBalance, base, quote } = dynamicProps;
    const { data: account } = activeUser;

    const votingPower = vpMana(account);

    const totalVests =
      parseAsset(account.vesting_shares).amount +
      parseAsset(account.received_vesting_shares).amount -
      parseAsset(account.delegated_vesting_shares).amount;

    const votePct = w * 100;

    const rShares = vestsToRshares(totalVests, votingPower, votePct);
    return (rShares / fundRecentClaims) * fundRewardBalance * (base / quote);
  };
  */

  componentDidMount() {
    // console.log(this.estimate(1000));
  }

  upSliderChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
    const upSliderVal = Number(e.target.value);
    this.setState({ upSliderVal });
  };

  downSliderChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
    const downSliderVal = Number(e.target.value);
    this.setState({ downSliderVal });
  };

  changeMode = (m: Mode) => {
    this.setState({ mode: m });
  };

  render() {
    const { onHide } = this.props;
    const { upSliderVal, downSliderVal, mode } = this.state;

    return (
      <Modal className="vote-modal" onHide={onHide} show={true} centered={true} animation={false}>
        {mode === "up" && (
          <div className="voting-controls voting-controls-up">
            <div className="btn-vote btn-up-vote vote-btn-lg">
              <span className="btn-inner">{chevronUpSvg}</span>
            </div>
            <div className="slider slider-up">
              <Form.Control
                type="range"
                custom
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
            <div className="slider slider-down">
              <Form.Control
                type="range"
                custom
                step={0.1}
                min={0.1}
                max={100}
                value={downSliderVal}
                onChange={this.downSliderChanged}
              />
            </div>
            <div className="percentage">{`-${downSliderVal.toFixed(1)}%`}</div>
            <div className="btn-vote btn-down-vote vote-btn-lg">
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
}

interface State {
  votes: Vote[];
  dialog: boolean;
}

export default class EntryVoteBtn extends Component<Props, State> {
  state: State = {
    votes: [],
    dialog: false,
  };

  _mounted: boolean = true;

  componentDidMount = () => {
    const { activeUser, entry, users } = this.props;

    if (activeUser) {
      const usernames = users.map((x) => x.username);

      getActiveVotes(entry.author, entry.permlink).then((resp) => {
        const votes = resp.filter((x) => usernames.includes(x.voter));
        this.stateSet({ votes });
      });
    }
  };

  componentWillUnmount() {
    this._mounted = false;
  }

  stateSet = (obj: {}, cb: () => void = () => {}) => {
    if (this._mounted) {
      this.setState(obj, cb);
    }
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
    const { dialog } = this.state;
    const { upVoted, downVoted } = this.isVoted();

    return (
      <>
        <div className="entry-vote-btn" onClick={this.toggleDialog}>
          <div className="btn-vote btn-up-vote">
            <span className="btn-inner">{chevronUpSvg}</span>
          </div>
        </div>

        {dialog && <VoteDialog {...this.props} onHide={this.toggleDialog} />}
      </>
    );
  }
}
