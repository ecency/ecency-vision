import React from "react";

import { Button } from "react-bootstrap";

import { History } from "history";

import { Global } from "../../store/global/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { ToggleType, UI } from "../../store/ui/types";
import { Account, FullAccount } from "../../store/accounts/types";

import BaseComponent from "../base";
import KeyOrHotDialog from "../key-or-hot-dialog";
import LoginRequired from "../login-required";
import ProfileLink from "../profile-link";
import { error } from "../feedback";

import { getAccount } from "../../api/hive";

import { formatError, witnessProxy, witnessProxyHot, witnessProxyKc } from "../../api/operations";

import { _t } from "../../i18n";
import "./_index.scss";
import { Spinner } from "@ui/spinner";

interface Props {
  history: History;
  global: Global;
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  signingKey: string;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  addAccount: (data: Account) => void;
  toggleUIProp: (what: ToggleType) => void;
  setSigningKey: (key: string) => void;
  username: string;
  onDone: () => void;
  isProxy: boolean;
}
interface State {
  account: FullAccount | null;
  inProgress: boolean;
}
export class WitnessesActiveProxy extends BaseComponent<Props, State> {
  state: State = {
    account: null,
    inProgress: false
  };
  componentDidMount() {
    const { username } = this.props;
    getAccount(username).then((account) => {
      this.stateSet({ account });
    });
  }
  proxy = (fn: any, args: any[]) => {
    const { onDone } = this.props;
    const fnArgs = [...args];
    const call = fn(...fnArgs);
    if (typeof call?.then === "function") {
      this.stateSet({ inProgress: true });
      call
        .then(() => {
          onDone();
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
    const { inProgress, account } = this.state;
    const { activeUser, username } = this.props;
    const spinner = <Spinner className="mr-[6px] w-3.5 h-3.5" />;
    const btn = (
      <Button disabled={inProgress}>
        {inProgress && spinner}
        {_t("witnesses.proxy-active-btn-label")}
      </Button>
    );
    const theBtn = activeUser
      ? KeyOrHotDialog({
          ...this.props,
          activeUser: activeUser!,
          children: btn,
          onKey: (key) => {
            this.proxy(witnessProxy, [activeUser!.username, key, ""]);
          },
          onHot: () => {
            this.proxy(witnessProxyHot, [activeUser!.username, ""]);
          },
          onKc: () => {
            this.proxy(witnessProxyKc, [activeUser!.username, ""]);
          }
        })
      : LoginRequired({
          ...this.props,
          children: btn
        });

    return (
      <div className="witnesses-active-proxy" style={{ marginBottom: "50px" }}>
        {this.props.isProxy ? (
          <>
            <p className="description">{_t("witnesses.proxy-active-description")}</p>
            <div className="proxy-form">
              <div className="current-proxy">
                {_t("witnesses.proxy-active-current")}{" "}
                {ProfileLink({
                  ...this.props,
                  username,
                  children: <span>{`@${username}`}</span>
                })}
              </div>

              {theBtn}

              <p className="description">{_t("witnesses.proxy-active-highlighted")}</p>
            </div>
          </>
        ) : (
          <div className="current-proxy">
            {ProfileLink({
              ...this.props,
              username,
              children: <span>{`@${username}'s`}</span>
            })}{" "}
            {_t("witnesses.check-witness-highlighted")}
          </div>
        )}
      </div>
    );
  }
}
export default (p: Props) => {
  const props: Props = {
    history: p.history,
    global: p.global,
    users: p.users,
    activeUser: p.activeUser,
    ui: p.ui,
    signingKey: p.signingKey,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    addAccount: p.addAccount,
    toggleUIProp: p.toggleUIProp,
    setSigningKey: p.setSigningKey,
    username: p.username,
    onDone: p.onDone,
    isProxy: p.isProxy
  };
  return <WitnessesActiveProxy {...props} />;
};
