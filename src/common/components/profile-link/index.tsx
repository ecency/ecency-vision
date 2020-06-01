import React, { Component } from "react";
import { History } from "history";

import { getProfile } from "../../api/hive";

export const makePath = (username: string) => `/@${username}`;

interface Props {
  history: History;
  children: JSX.Element;
  username: string;
}

export default class ProfileLink extends Component<Props> {
  public static defaultProps = {};

  goProfile = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const { username, history } = this.props;

    let profile;

    try {
      profile = await getProfile(username);
    } catch (err) {
      return;
    }

    // TODO: set user reducer here
    //  setVisitingAccount(account);

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
