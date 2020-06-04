import React, { Component } from "react";

import { Account } from "../../store/accounts/types";

interface Props {
  account: Account;
}

export default class ProfilePage extends Component<Props> {
  render() {
    const { account } = this.props;
    
    if (!account.__loaded) {
      return null;
    }

    return "wallet";
  }
}
