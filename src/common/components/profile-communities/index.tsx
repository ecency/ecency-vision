import React from "react";

import { History } from "history";

import isEqual from "react-fast-compare";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";
import { Subscription } from "../../store/subscriptions/types";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import Tag from "../tag";
import { error } from "../feedback";

import { getSubscriptions } from "../../api/bridge";

import { _t } from "../../i18n";
import { Link } from "react-router-dom";
import { SortCommunities } from "../sort-profile-communities";
import "./_index.scss";

interface Props {
  global: Global;
  history: History;
  activeUser: ActiveUser | null;
  account: Account;
}

interface State {
  loading: boolean;
  items: Subscription[];
}

export class ProfileCommunities extends BaseComponent<Props, State> {
  state: State = {
    loading: true,
    items: []
  };

  componentDidMount() {
    const { account } = this.props;
    getSubscriptions(account.name)
      .then((items) => {
        if (items) {
          this.stateSet({ items });
        }
      })
      .catch(() => error(_t("g.server-error")))
      .finally(() => this.stateSet({ loading: false }));
  }

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
    return (
      !isEqual(this.props.account, nextProps.account) ||
      !isEqual(this.props.activeUser, nextProps.activeUser) ||
      !isEqual(this.state, nextState) ||
      this.state.items === nextState.items
    );
  }

  sortCommunitiesInAsc = () => {
    const communitiesInAsc = this.state.items.sort((a: any, b: any) => {
      if (a[1] > b[1]) return 1;
      if (a[1] < b[1]) return -1;
      return 0;
    });

    this.setState({ items: communitiesInAsc });
  };

  sortCommunitiesInDsc = () => {
    const communitiesInDsc = this.state.items.sort((a: any, b: any) => {
      if (b[1] < a[1]) return -1;
      if (b[1] > a[1]) return 1;
      return 0;
    });

    this.setState({ items: communitiesInDsc });
  };

  render() {
    const { activeUser, account } = this.props;
    const { items, loading } = this.state;

    const showCreateLink = activeUser && activeUser.username === account.name;

    return (
      <div className="profile-communities">
        {(() => {
          if (loading) {
            return <LinearProgress />;
          }

          if (items.length === 0) {
            return (
              <>
                <h2>{_t("profile.communities-title")}</h2>
                <p className="text-gray-600">{_t("g.empty-list")}</p>
                {showCreateLink && (
                  <p>
                    <Link to="/communities/create" className="create-link">
                      {_t("profile.create-community")}
                    </Link>
                  </p>
                )}
              </>
            );
          }

          return (
            <>
              <h2>{_t("profile.communities-title")}</h2>

              {items.length >= 3 && (
                <SortCommunities
                  sortCommunitiesInAsc={this.sortCommunitiesInAsc}
                  sortCommunitiesInDsc={this.sortCommunitiesInDsc}
                />
              )}

              <ul className="community-list">
                {items.map((i, k) => {
                  return (
                    <li key={k}>
                      {Tag({
                        ...this.props,
                        tag: i[0],
                        type: "link",
                        children: <span>{i[1]}</span>
                      })}{" "}
                      <span className="user-role">{i[2]}</span>
                    </li>
                  );
                })}
              </ul>
              {showCreateLink && (
                <p>
                  <Link to="/communities/create" className="create-link">
                    {_t("profile.create-community")}
                  </Link>
                </p>
              )}
            </>
          );
        })()}
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    global: p.global,
    history: p.history,
    activeUser: p.activeUser,
    account: p.account
  };

  return <ProfileCommunities {...props} />;
};
