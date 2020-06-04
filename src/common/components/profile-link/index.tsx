import React, { Component } from "react";
import { History } from "history";

import { Account } from "../../store/accounts/types";

import { getAccountFull } from "../../api/hive";

export const makePath = (username: string) => `/@${username}`;

interface Props {
  history: History;
  children: JSX.Element;
  username: string;
  addAccount: (data: Account) => void;
}

export default class ProfileLink extends Component<Props> {
  public static defaultProps = {};

  goProfile = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const { username, history, addAccount } = this.props;

    /*
    let profile;

    try {
      profile = await getAccountFull(username);
    } catch (err) {
      return;
    }
    */

    addAccount({ name: username });

    history.push(makePath(username));
  };

  render() {
    const { children, username } = this.props;
    const href = makePath(username);

    const props = Object.assign({}, children.props, {
      href,
      onClick: this.goProfile,
    });

    return React.createElement("a", props);
  }
}
