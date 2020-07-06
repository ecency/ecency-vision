import React, { Component } from "react";

import { History } from "history";

import { Entry } from "../../store/entries/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";

import PopoverConfirm from "../popover-confirm";
import { error, success } from "../feedback";

import { deleteComment, formatError } from "../../api/operations";

import { _t } from "../../i18n/index";

import _c from "../../util/fix-class-names";

import { deleteForeverSvg } from "../../img/svg";

interface Props {
  history: History;
  entry: Entry;
  users: User[];
  activeUser: ActiveUser | null;
}

interface State {
  inProgress: boolean;
}

export default class EntryDeleteBtn extends Component<Props> {
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

  delete = () => {
    const { entry, users, activeUser, history } = this.props;
    const user = users.find((x) => x.username === activeUser?.username)!;

    this.stateSet({ inProgress: true });
    deleteComment(user, entry.author, entry.permlink)
      .then(() => {
        success(_t("entry-delete.success"));
        history.push('/');
      })
      .catch((e) => {
        error(formatError(e));
      })
      .finally(() => {
        this.stateSet({ inProgress: false });
      });
  };

  render() {
    const { inProgress } = this.state;

    return (
      <PopoverConfirm onConfirm={this.delete}>
        <a className={_c(`entry-delete-btn ${inProgress ? "in-progress" : ""} `)}>{deleteForeverSvg} {_t("entry-delete.label")}</a>
      </PopoverConfirm>
    );
  }
}
