import React from "react";
import { Subscription } from "../../store/subscriptions/types";
import { Community } from "../../store/communities";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { ToggleType, UI } from "../../store/ui/types";
import { Account } from "../../store/accounts/types";
import BaseComponent from "../base";
import LoginRequired from "../login-required";
import { error } from "../feedback";
import { formatError, subscribe, unSubscribe } from "../../api/operations";
import { _t } from "../../i18n";
import { Spinner } from "@ui/spinner";
import { Button, ButtonProps } from "@ui/button";

interface Props {
  users: User[];
  activeUser: ActiveUser | null;
  community: Community;
  ui: UI;
  subscriptions: Subscription[];
  buttonProps?: ButtonProps;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  updateSubscriptions: (list: Subscription[]) => void;
}

interface State {
  hover: boolean;
  inProgress: boolean;
}

export default class SubscriptionBtn extends BaseComponent<Props, State> {
  state: State = {
    hover: false,
    inProgress: false
  };

  subscribe = () => {
    const { community, activeUser, subscriptions, updateSubscriptions } = this.props;
    this.stateSet({ inProgress: true });
    subscribe(activeUser?.username!, community.name)
      .then(() => {
        const s: Subscription = [community.name, community.title, "guest", ""];
        updateSubscriptions([...subscriptions, s]);
        this.stateSet({ inProgress: false });
      })
      .catch((e) => {
        error(...formatError(e));
        this.stateSet({ inProgress: false });
      });
  };

  unSubscribe = () => {
    const { community, activeUser, subscriptions, updateSubscriptions } = this.props;
    this.stateSet({ inProgress: true });
    unSubscribe(activeUser?.username!, community.name)
      .then(() => {
        const s: Subscription[] = subscriptions.filter((x) => x[0] !== community.name);
        updateSubscriptions([...s]);
        this.stateSet({ inProgress: false });
      })
      .catch((e) => {
        error(...formatError(e));
        this.stateSet({ inProgress: false });
      });
  };

  toggleHover = () => {
    const { hover } = this.state;
    this.stateSet({ hover: !hover });
  };

  render() {
    const { hover, inProgress } = this.state;
    const { subscriptions, community, buttonProps } = this.props;
    const subscribed = subscriptions.find((x) => x[0] === community.name) !== undefined;

    if (inProgress) {
      return (
        <Button disabled={true} {...buttonProps}>
          <Spinner className="w-3.5 h-3.5" />
        </Button>
      );
    }

    if (subscribed) {
      return (
        <Button
          onMouseEnter={this.toggleHover}
          onMouseLeave={this.toggleHover}
          onClick={this.unSubscribe}
          outline={true}
          appearance={hover ? "danger" : "primary"}
          {...buttonProps}
        >
          {hover ? _t("community.unsubscribe") : _t("community.subscribed")}
        </Button>
      );
    }

    return LoginRequired({
      ...this.props,
      children: (
        <Button onClick={this.subscribe} {...buttonProps}>
          {_t("community.subscribe")}
        </Button>
      )
    });
  }
}
