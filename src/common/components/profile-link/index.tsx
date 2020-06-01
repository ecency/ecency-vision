import React, { Component } from "react";
import { History } from "history";

import { Profile } from "../../store/profiles/types";

import { getProfile } from "../../api/hive";

export const makePath = (username: string) => `/@${username}`;

interface Props {
  history: History;
  children: JSX.Element;
  username: string;
  addProfile: (data: Profile) => void;
}

export default class ProfileLink extends Component<Props> {
  public static defaultProps = {};

  goProfile = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const { username, history, addProfile } = this.props;

    let profile;

    try {
      profile = await getProfile(username);
    } catch (err) {
      return;
    }

    addProfile(profile!);

    // TODO: set user reducer here
    //  setVisitingAccount(account);

    // history.push(makePath(username));
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
