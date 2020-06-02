import React, { Component } from "react";

import { Account } from "../../store/accounts/types";
import UserAvatar from "../user-avatar";

import accountReputation from "../../helper/account-reputation";

interface Props {
  account: Account;
}

export default class ProfileCard extends Component<Props> {
  render() {
    const { account } = this.props;

    console.log(typeof account.reputation);

    return (
      <div className="profile-card">
        <div className="profile-avatar">
          <UserAvatar {...this.props} username={account.name} size="xLarge" />
          <div className="reputation">{accountReputation(account.reputation)}</div>
        </div>

        <div className="username">{account.name}</div>
      </div>
    );
  }
}
