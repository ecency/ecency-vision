import React, { Component } from "react";

import { Entry } from "../../store/entries/types";
import { Account } from "../../store/accounts/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { Reblog } from "../../store/reblogs/types";

import Tooltip from "../tooltip";
import LoginRequired from "../login-required";
import PopoverConfirm from "../popover-confirm";

import { reblog } from "../../api/operations";

import { _t } from "../../i18n/index";

import { repeatSvg } from "../../img/svg";

interface Props {
  text: boolean;
  entry: Entry;
  users: User[];
  activeUser: ActiveUser | null;
  reblogs: Reblog[];
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data: Account) => void;
  deleteUser: (username: string) => void;
  addReblog: (account: string, author: string, permlink: string) => void;
}

export default class EntryReblogBtn extends Component<Props> {
  reblog = () => {
    const { entry, users, activeUser, addReblog } = this.props;
    const user = users.find((x) => x.username === activeUser?.username)!;
    reblog(user, entry.author, entry.permlink).then(() => {
      addReblog(activeUser?.username!, entry.author, entry.permlink);
    }).catch((e)=>{
      
    })
  };

  render() {
    const { text, activeUser, reblogs } = this.props;

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
