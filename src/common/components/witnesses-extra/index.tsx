import React from "react";
import { Global } from "../../store/global/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { ToggleType, UI } from "../../store/ui/types";
import { Account } from "../../store/accounts/types";

import BaseComponent from "../base";
import WitnessVoteBtn from "../witness-vote-btn";

import { _t } from "../../i18n";
import "./_index.scss";
import { FormControl } from "@ui/input";

interface Props {
  global: Global;
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  signingKey: string;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  setSigningKey: (key: string) => void;
  list: string[];
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
}

interface State {
  username: string;
  inProgress: boolean;
}

export class WitnessesExtra extends BaseComponent<Props, State> {
  state: State = {
    username: "",
    inProgress: false
  };

  usernameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ username: e.target.value.trim() });
  };

  render() {
    const { onAdd, onDelete, list } = this.props;
    const { username, inProgress } = this.state;

    return (
      <div className="extra-witnesses">
        <p className="description">{_t("witnesses.extra-description")}</p>
        <div className="vote-form">
          <div className="txt-username">
            <FormControl
              type="text"
              placeholder={_t("witnesses.username-placeholder")}
              value={username}
              maxLength={20}
              onChange={this.usernameChanged}
              disabled={inProgress}
            />
          </div>
          <div>
            {WitnessVoteBtn({
              ...this.props,
              voted: false,
              witness: username,
              onStart: () => {
                this.stateSet({ inProgress: true });
              },
              onEnd: () => {
                this.stateSet({ inProgress: false });
              },
              onSuccess: (approve) => {
                onAdd(username);
                this.stateSet({ username: "" });
              }
            })}
          </div>
        </div>
        {list.length > 0 && (
          <div className="witnesses-list">
            {list.map((i) => (
              <div className="item" key={i}>
                <span className="username">{i}</span>
                <div>
                  {WitnessVoteBtn({
                    ...this.props,
                    voted: true,
                    witness: i,
                    onSuccess: (approve) => {
                      onDelete(i);
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
    list: p.list,
    onAdd: p.onAdd,
    onDelete: p.onDelete
  };

  return <WitnessesExtra {...props} />;
};
