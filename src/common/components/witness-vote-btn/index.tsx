import React from "react";

import { ActiveUser } from "../../store/active-user/types";
import { User } from "../../store/users/types";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { ToggleType, UI } from "../../store/ui/types";

import BaseComponent from "../base";
import LoginRequired from "../login-required";
import KeyOrHotDialog from "../key-or-hot-dialog";
import { error } from "../feedback";

import { witnessVote, witnessVoteHot, witnessVoteKc, formatError } from "../../api/operations";

import _c from "../../util/fix-class-names";

import { chevronUpSvg } from "../../img/svg";
import "./_index.scss";

interface Props {
  global: Global;
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  signingKey: string;
  voted: boolean;
  witness: string;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  setSigningKey: (key: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onSuccess: (approve: boolean) => void;
}

interface State {
  inProgress: boolean;
}

export class WitnessVoteBtn extends BaseComponent<Props, State> {
  state: State = {
    inProgress: false
  };

  vote = (fn: any, args: any[]) => {
    const { voted, onStart, onEnd, onSuccess } = this.props;
    const approve = !voted;
    const fnArgs = [...args, approve];
    const call = fn(...fnArgs);

    if (typeof call?.then === "function") {
      if (onStart) onStart();
      this.stateSet({ inProgress: true });

      call
        .then(() => {
          onSuccess(approve);
        })
        .catch((e: any) => {
          error(...formatError(e));
        })
        .finally(() => {
          this.stateSet({ inProgress: false });
          if (onEnd) onEnd();
        });
    }
  };

  render() {
    const { activeUser, voted, witness } = this.props;
    const { inProgress } = this.state;

    const cls = _c(
      `btn-witness-vote btn-up-vote ${inProgress ? "in-progress" : ""} ${voted ? "voted" : ""} ${
        witness === "" ? "disabled" : ""
      }`
    );
    const btn = (
      <div className="witness-vote-btn">
        <div className={cls}>
          <span className="btn-inner">{chevronUpSvg}</span>
        </div>
      </div>
    );

    if (!activeUser) {
      return LoginRequired({
        ...this.props,
        children: btn
      });
    }

    return KeyOrHotDialog({
      ...this.props,
      activeUser: activeUser!,
      children: btn,
      onKey: (key) => {
        this.vote(witnessVote, [activeUser!.username, key, witness]);
      },
      onHot: () => {
        this.vote(witnessVoteHot, [activeUser!.username, witness]);
      },
      onKc: () => {
        this.vote(witnessVoteKc, [activeUser!.username, witness]);
      }
    });
  }
}

export default (p: Props) => {
  const props: Props = {
    global: p.global,
    users: p.users,
    activeUser: p.activeUser,
    ui: p.ui,
    signingKey: p.signingKey,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    toggleUIProp: p.toggleUIProp,
    setSigningKey: p.setSigningKey,
    voted: p.voted,
    witness: p.witness,
    onStart: p.onStart,
    onEnd: p.onEnd,
    onSuccess: p.onSuccess
  };

  return <WitnessVoteBtn {...props} />;
};
