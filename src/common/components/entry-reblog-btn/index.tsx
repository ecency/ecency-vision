import React, {Component} from "react";

import {Entry} from "../../store/entries/types";
import {Account} from "../../store/accounts/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Reblog} from "../../store/reblogs/types";
import {UI, ToggleType} from "../../store/ui/types";

import Tooltip from "../tooltip";
import LoginRequired from "../login-required";
import PopoverConfirm from "../popover-confirm";
import {error, success} from "../feedback";

import {reblog, formatError} from "../../api/operations";

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names";

import {repeatSvg} from "../../img/svg";

interface Props {
  text: boolean;
  entry: Entry;
  users: User[];
  activeUser: ActiveUser | null;
  reblogs: Reblog[];
  ui: UI;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data: Account) => void;
  deleteUser: (username: string) => void;
  addReblog: (account: string, author: string, permlink: string) => void;
  toggleUIProp: (what: ToggleType) => void;
}

interface State {
  inProgress: boolean;
}

export default class EntryReblogBtn extends Component<Props> {
  state: State = {
    inProgress: false,
  };

  _mounted: boolean = true;

  componentWillUnmount() {
    this._mounted = false;
  }

  stateSet = (obj: {}, cb: () => void = () => {}) => {
    if (this._mounted) {
      this.setState(obj, cb);
    }
  };

  reblog = () => {
    const { entry, users, activeUser, addReblog } = this.props;
    const user = users.find((x) => x.username === activeUser?.username)!;

    this.stateSet({ inProgress: true });
    reblog(user, entry.author, entry.permlink)
      .then(() => {
        addReblog(activeUser?.username!, entry.author, entry.permlink);
        success(_t("entry-reblog.success"));
      })
      .catch((e) => {
        error(formatError(e));
      })
      .finally(() => {
        this.stateSet({ inProgress: false });
      });
  };

  render() {
    const { text, activeUser, entry, reblogs } = this.props;
    const { inProgress } = this.state;

    const reblogged =
      activeUser &&
      reblogs.find(
        (x) => x.account === activeUser.username && x.author === entry.author && x.permlink === entry.permlink
      ) !== undefined;

    const content = (
      <div className={_c(`entry-reblog-btn ${reblogged ? "reblogged" : ""} ${inProgress ? "in-progress" : ""} `)}>
        <Tooltip content={_t("entry-reblog.reblog")}>
          <a className="inner-btn">
            {repeatSvg} {text ? _t("entry-reblog.reblog") : ""}
          </a>
        </Tooltip>
      </div>
    );

    if (!activeUser) {
      return <LoginRequired {...this.props}>{content}</LoginRequired>;
    }

    return (
      <PopoverConfirm
        onConfirm={this.reblog}
        titleText={_t("entry-reblog.confirm-title", { n: activeUser.username })}
        okText={_t("entry-reblog.confirm-ok")}
      >
        {content}
      </PopoverConfirm>
    );
  }
}
