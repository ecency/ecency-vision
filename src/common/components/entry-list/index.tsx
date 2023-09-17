import React, { Component } from "react";
import { History, Location } from "history";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { Entry } from "../../store/entries/types";
import { Community } from "../../store/communities";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { Reblogs } from "../../store/reblogs/types";
import { ToggleType, UI } from "../../store/ui/types";

import EntryListItem from "../entry-list-item/index";
import MessageNoData from "../message-no-data";
import { _t } from "../../i18n";
import LinearProgress from "../linear-progress";
import { getFollowing } from "../../api/hive";
import isCommunity from "../../helper/is-community";
import { match } from "react-router-dom";
import "./_index.scss";

interface Props {
  history: History;
  location: Location;
  global: Global;
  dynamicProps: DynamicProps;
  entries: Entry[];
  promotedEntries: Entry[];
  community?: Community | null;
  users: User[];
  activeUser: ActiveUser | null;
  reblogs: Reblogs;
  loading: boolean;
  ui: UI;
  signingKey: string;
  account?: Account;
  match?: match<any>;
  addAccount: (data: Account) => void;
  updateEntry: (entry: any) => void;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  fetchReblogs: () => void;
  addReblog: (author: string, permlink: string) => void;
  deleteReblog: (author: string, permlink: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  setSigningKey: (key: string) => void;
  pinEntry?: (entry: Entry | null) => void;
}

interface State {
  mutedUsers: string[];
  loadingMutedUsers: boolean;
}

export class EntryListContent extends Component<Props, State> {
  state = {
    mutedUsers: [] as string[],
    loadingMutedUsers: false
  };

  fetchMutedUsers = () => {
    const { activeUser } = this.props;
    const { loadingMutedUsers } = this.state;
    if (!loadingMutedUsers) {
      if (activeUser) {
        this.setState({ loadingMutedUsers: true });
        getFollowing(activeUser.username, "", "ignore", 100)
          .then((r) => {
            if (r) {
              let filterList = r.map((user) => user.following);
              this.setState({ mutedUsers: filterList });
            }
          })
          .catch(console.log)
          .finally(() => {
            this.setState({ loadingMutedUsers: false });
          });
      }
    }
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.activeUser?.username !== this.props.activeUser?.username) {
      this.fetchMutedUsers();
    }
    if (prevProps.activeUser !== this.props.activeUser && !this.props.activeUser) {
      this.setState({ mutedUsers: [] });
    }
  }

  componentDidMount() {
    this.fetchMutedUsers();
  }

  render() {
    const { entries, promotedEntries, global, activeUser, loading, location, match } = this.props;
    const { filter, tag } = global;
    const { mutedUsers, loadingMutedUsers } = this.state;
    const section = match?.params.section;
    let dataToRender = entries;
    if (location.pathname.includes("/promoted")) {
      dataToRender = promotedEntries;
    }

    let mutedList: string[] = [];
    if (mutedUsers && mutedUsers.length > 0 && activeUser && activeUser.username) {
      mutedList = mutedList.concat(mutedUsers);
    }
    const isMyProfile =
      activeUser && tag.includes("@") && activeUser.username === tag.replace("@", "");

    return (
      <>
        {loadingMutedUsers ? (
          <LinearProgress />
        ) : dataToRender.length > 0 ? (
          <>
            {dataToRender.map((e, i) => {
              const l = [];

              if (i % 4 === 0 && i > 0) {
                const ix = i / 4 - 1;

                if (promotedEntries[ix]) {
                  const p = promotedEntries[ix];
                  let isPostMuted =
                    (activeUser && activeUser.username && mutedList.includes(p.author)) || false;
                  if (
                    !dataToRender.find((x) => x.author === p.author && x.permlink === p.permlink)
                  ) {
                    l.push(
                      <EntryListItem
                        key={`${p.author}-${p.permlink}`}
                        {...Object.assign({}, this.props, { entry: p })}
                        promoted={true}
                        order={4}
                        muted={isPostMuted}
                      />
                    );
                  }
                }
              }

              let isPostMuted =
                (activeUser && activeUser.username && mutedList.includes(e.author)) || false;
              if (location.pathname.includes("/promoted")) {
                l.push(
                  <EntryListItem
                    key={`${e.author}-${e.permlink}`}
                    {...Object.assign({}, { ...this.props }, { entry: e })}
                    promoted={true}
                    order={i}
                    muted={isPostMuted}
                  />
                );
              } else {
                l.push(
                  <EntryListItem
                    key={`${e.author}-${e.permlink}`}
                    {...this.props}
                    entry={e}
                    order={i}
                    muted={isPostMuted}
                  />
                );
              }
              return [...l];
            })}
          </>
        ) : (
          !loading &&
          (isMyProfile && section !== "trail" ? (
            <MessageNoData
              title={
                filter == "feed"
                  ? `${_t("g.nothing-found-in")} ${_t(`g.${filter}`)}`
                  : _t("profile-info.no-posts")
              }
              description={
                filter == "feed"
                  ? _t("g.fill-feed")
                  : `${_t("g.nothing-found-in")} ${_t(`g.${filter}`)}`
              }
              buttonText={
                filter == "feed" ? _t("navbar.discover") : _t("profile-info.create-posts")
              }
              buttonTo={filter == "feed" ? "/discover" : "/submit"}
              global={global}
            />
          ) : isCommunity(tag) ? (
            <MessageNoData
              title={_t("profile-info.no-posts-community")}
              description={`${_t("g.no")} ${_t(`g.${filter}`)} ${_t("g.found")}.`}
              buttonText={_t("profile-info.create-posts")}
              buttonTo="/submit"
              global={global}
            />
          ) : tag == "my" ? (
            <MessageNoData
              title={_t("g.no-matches")}
              description={_t("g.fill-community-feed")}
              buttonText={_t("navbar.discover")}
              buttonTo="/communities"
              global={global}
            />
          ) : (
            <MessageNoData
              title={_t("profile-info.no-posts-user")}
              description={`${_t("g.nothing-found-in")} ${
                section === "trail"
                  ? _t(`g.trail`) + " " + _t(`g.past-few-days`)
                  : _t(`g.${filter}`)
              }.`}
              buttonText={isMyProfile ? _t("profile-info.create-posts") : ""}
              buttonTo="/submit"
              global={global}
            />
          ))
        )}
      </>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    location: p.location,
    global: p.global,
    dynamicProps: p.dynamicProps,
    entries: p.entries,
    promotedEntries: p.promotedEntries,
    community: p.community,
    users: p.users,
    activeUser: p.activeUser,
    reblogs: p.reblogs,
    ui: p.ui,
    signingKey: p.signingKey,
    addAccount: p.addAccount,
    updateEntry: p.updateEntry,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    fetchReblogs: p.fetchReblogs,
    addReblog: p.addReblog,
    deleteReblog: p.deleteReblog,
    toggleUIProp: p.toggleUIProp,
    setSigningKey: p.setSigningKey,
    loading: p.loading,
    account: p.account,
    match: p.match,
    pinEntry: p.pinEntry
  };

  return <EntryListContent {...props} />;
};
