import React, { Component } from "react";
import { History, Location } from "history";

import isEqual from "react-fast-compare";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { Entry } from "../../store/entries/types";
import { Community } from "../../store/community/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";

import EntryListItem from "../entry-list-item/index";

interface Props {
  history: History;
  location: Location;
  global: Global;
  entries: Entry[];
  community?: Community | null;
  users: User[];
  activeUser: ActiveUser | null;
  addAccount: (data: Account) => void;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data: Account) => void;
  deleteUser: (username: string) => void;
}

export default class EntryListContent extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
    return (
      !isEqual(this.props.entries, nextProps.entries) ||
      !isEqual(this.props.community, nextProps.community) ||
      !isEqual(this.props.global, nextProps.global)||
      !isEqual(this.props.activeUser, nextProps.activeUser)
    );
  }

  render() {
    const { entries } = this.props;

    return (
      <>
        {entries.map((e) => (
          <EntryListItem key={`${e.author}-${e.permlink}`} {...this.props} entry={e} />
        ))}
      </>
    );
  }
}
