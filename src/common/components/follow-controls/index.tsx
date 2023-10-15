import React from "react";
import { Account } from "../../store/accounts/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { ToggleType, UI } from "../../store/ui/types";
import BaseComponent from "../base";
import LoginRequired from "../login-required";
import { error } from "../feedback";
import { getRelationshipBetweenAccounts } from "../../api/bridge";
import { follow, formatError, ignore, unFollow } from "../../api/operations";
import { _t } from "../../i18n";
import * as ls from "../../util/local-storage";
import { Button } from "@ui/button";

interface Props {
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  targetUsername: string;
  where?: string;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
}

interface State {
  fetching: boolean;
  inProgress: boolean;
  following: boolean;
  muted: boolean;
}

export default class FollowControls extends BaseComponent<Props, State> {
  state: State = {
    fetching: false,
    inProgress: false,
    following: false,
    muted: false
  };

  componentDidMount() {
    this.fetch().then();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (
      // active user changed
      prevProps.activeUser?.username !== this.props.activeUser?.username ||
      // or target account username changed
      prevProps.targetUsername !== this.props.targetUsername
    ) {
      this.fetch().then();
    }
  }

  fetch = async () => {
    this.stateSet({
      fetching: true,
      inProgress: false,
      following: false,
      muted: false
    });

    const { activeUser, targetUsername } = this.props;

    if (!activeUser) {
      this.stateSet({ fetching: false });
      return;
    }

    getRelationshipBetweenAccounts(activeUser.username, targetUsername)
      .then((r) => {
        if (r) {
          this.stateSet({ following: r.follows, muted: r.ignores });
        }
      })
      .finally(() => {
        this.stateSet({ fetching: false });
      });
  };

  follow = async () => {
    const { activeUser, targetUsername } = this.props;

    this.stateSet({ inProgress: true });
    try {
      await follow(activeUser?.username!, targetUsername);
      this.stateSet({ following: true, muted: false });
    } catch (err) {
      error(...formatError(err));
    } finally {
      this.stateSet({ inProgress: false });
    }
  };

  unFollow = async () => {
    const { activeUser, targetUsername } = this.props;

    this.stateSet({ inProgress: true });
    try {
      await unFollow(activeUser?.username!, targetUsername);
      let muted_list = ls.get("muted-list");
      if (muted_list) {
        muted_list = muted_list.filter((item: string) => item !== targetUsername);
      }
      ls.set("muted-list", muted_list);
      this.stateSet({ following: false, muted: false });
    } catch (err) {
      error(...formatError(err));
    } finally {
      this.stateSet({ inProgress: false });
    }
  };

  mute = async () => {
    const { activeUser, targetUsername } = this.props;

    this.stateSet({ inProgress: true });
    try {
      await ignore(activeUser?.username!, targetUsername);
      let muted_list = [targetUsername];
      if (ls.get("muted-list")) {
        muted_list = ls.get("muted-list").concat(muted_list);
      }
      ls.set("muted-list", muted_list);
      this.stateSet({ following: false, muted: true });
    } catch (err) {
      error(...formatError(err));
    } finally {
      this.stateSet({ inProgress: false });
    }
  };

  render() {
    const { following, muted, fetching, inProgress } = this.state;
    const { where } = this.props;
    const followMsg = _t("follow-controls.follow");
    const unFollowMsg = _t("follow-controls.unFollow");
    const muteMsg = _t("follow-controls.mute");
    const unMuteMsg = _t("follow-controls.unMute");

    const btnFollow = LoginRequired({
      ...this.props,
      children: (
        <Button style={{ marginRight: "5px" }} disabled={inProgress} onClick={this.follow}>
          {followMsg}
        </Button>
      )
    });

    const btnUnfollow = LoginRequired({
      ...this.props,
      children: (
        <Button style={{ marginRight: "5px" }} disabled={inProgress} onClick={this.unFollow}>
          {unFollowMsg}
        </Button>
      )
    });

    const btnMute = LoginRequired({
      ...this.props,
      children: (
        <Button disabled={inProgress} onClick={this.mute}>
          {muteMsg}
        </Button>
      )
    });

    const btnUnMute = LoginRequired({
      ...this.props,
      children: (
        <Button disabled={inProgress} onClick={this.unFollow}>
          {unMuteMsg}
        </Button>
      )
    });

    if (where && where === "chat-box" && following) {
      return <>{btnUnfollow}</>;
    }

    if (where && where === "chat-box" && !following) {
      return <>{btnFollow}</>;
    }

    if (fetching) {
      return (
        <>
          <Button disabled={true} className="mr-2">
            {followMsg}
          </Button>
          <Button disabled={true}>{muteMsg}</Button>
        </>
      );
    }

    if (where && where === "author-card" && following) {
      return <></>;
    }
    if (following) {
      return (
        <>
          {btnUnfollow}
          {btnMute}
        </>
      );
    }

    if (muted) {
      return (
        <>
          {btnFollow}
          {btnUnMute}
        </>
      );
    }

    if (where && where === "author-card") {
      return <>{btnFollow}</>;
    }

    return (
      <>
        {btnFollow}
        {btnMute}
      </>
    );
  }
}
