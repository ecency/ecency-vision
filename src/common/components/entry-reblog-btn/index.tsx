import React, { Component } from "react";

import { Account } from "../../store/accounts/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";

import Tooltip from "../tooltip";
import LoginRequired from "../login-required";
import PopoverConfirm from "../popover-confirm";

import { _t } from "../../i18n/index";

import { repeatSvg } from "../../img/svg";

interface Props {
  text: boolean;
  users: User[];
  activeUser: ActiveUser | null;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data: Account) => void;
  deleteUser: (username: string) => void;
}

export default class EntryReblogBtn extends Component<Props> {
  reblog = () => {
    console.log("reblogged");
  };

  render() {
    const { text, activeUser } = this.props;

    const content = (
      <div className="entry-reblog-btn">
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
