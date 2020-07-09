import React, { Component } from "react";
import { History, Location } from "history";

import isEqual from "react-fast-compare";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { Entry } from "../../store/entries/types";
import { Community } from "../../store/community/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { Reblog } from "../../store/reblogs/types";

import EntryListItem from "../entry-list-item/index";

interface Props {
  history: History;
  location: Location;
  global: Global;
  dynamicProps: DynamicProps;
  entries: Entry[];
  community?: Community | null;
  users: User[];
  activeUser: ActiveUser | null;
  reblogs: Reblog[];
  addAccount: (data: Account) => void;
  updateEntry: (entry: Entry) => void;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data: Account) => void;
  deleteUser: (username: string) => void;
  addReblog: (account: string, author: string, permlink: string) => void;
}

export default class EntryListContent extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
    return (
      !isEqual(this.props.entries, nextProps.entries) ||
      !isEqual(this.props.community, nextProps.community) ||
      !isEqual(this.props.global, nextProps.global) ||
      !isEqual(this.props.dynamicProps, nextProps.dynamicProps) ||
      !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username) ||
      !isEqual(this.props.reblogs, nextProps.reblogs)
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
