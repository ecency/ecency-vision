import React from "react";
import { Global } from "../../store/global/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { ToggleType, UI } from "../../store/ui/types";
import { Account } from "../../store/accounts/types";

import BaseComponent from "../base";
import LoginRequired from "../login-required";
import KeyOrHotDialog from "../key-or-hot-dialog";
import { error } from "../feedback";

import { formatError, witnessProxy, witnessProxyHot, witnessProxyKc } from "../../api/operations";

import { _t } from "../../i18n";
import "./_index.scss";
import { Spinner } from "@ui/spinner";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";

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
  onDone: (username: string) => void;
}

interface State {
  username: string;
  inProgress: boolean;
}

export class WitnessesProxy extends BaseComponent<Props, State> {
  state: State = {
    username: "",
    inProgress: false
  };

  usernameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.stateSet({ username: e.target.value.trim() });
  };

  proxy = (fn: any, args: any[]) => {
    const { username } = this.state;
    const { onDone } = this.props;
    const fnArgs = [...args];
    const call = fn(...fnArgs);

    if (typeof call?.then === "function") {
      this.stateSet({ inProgress: true });

      call
        .then(() => {
          onDone(username);
        })
        .catch((e: any) => {
          error(...formatError(e));
        })
        .finally(() => {
          this.stateSet({ inProgress: false });
        });
    }
  };

  render() {
    const { activeUser } = this.props;
    const { username, inProgress } = this.state;

    const spinner = <Spinner className="mr-[6px] w-3.5 h-3.5" />;
    const btn = (
      <Button disabled={inProgress} icon={inProgress && spinner} iconPlacement="left">
        {_t("witnesses.proxy-btn-label")}
      </Button>
    );
    const theBtn = activeUser
      ? KeyOrHotDialog({
          ...this.props,
          activeUser: activeUser!,
          children: btn,
          onKey: (key) => {
            this.proxy(witnessProxy, [activeUser!.username, key, username]);
          },
          onHot: () => {
            this.proxy(witnessProxyHot, [activeUser!.username, username]);
          },
          onKc: () => {
            this.proxy(witnessProxyKc, [activeUser!.username, username]);
          }
        })
      : LoginRequired({
          ...this.props,
          children: btn
        });

    return (
      <div className="witnesses-proxy">
        <p className="description">{_t("witnesses.proxy-description")}</p>
        <div className="proxy-form">
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
          <div>{theBtn}</div>
        </div>
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
    onDone: p.onDone
  };

  return <WitnessesProxy {...props} />;
};
