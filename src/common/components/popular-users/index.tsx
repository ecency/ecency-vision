import React from "react";

import { History } from "history";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";

import LinearProgress from "../linear-progress";
import UserAvatar from "../user-avatar";
import ProfileLink from "../profile-link";
import BaseComponent from "../base";

import { searchAccount, AccountSearchResult } from "../../api/search-api";

import _c from "../../util/fix-class-names";

import { _t } from "../../i18n";

import { syncSvg } from "../../img/svg";
import "./_index.scss";

interface Props {
  global: Global;
  history: History;
  addAccount: (data: Account) => void;
}

interface State {
  list: AccountSearchResult[];
  loading: boolean;
}

export class PopularUsers extends BaseComponent<Props, State> {
  state: State = {
    list: [],
    loading: true
  };

  componentDidMount() {
    this.fetch();
  }

  fetch = () => {
    this.stateSet({ loading: true, list: [] });

    searchAccount()
      .then((resp) => {
        this.stateSet({ list: resp });
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  render() {
    const { list, loading } = this.state;

    return (
      <div className={_c(`popular-users-list ${loading ? "loading" : ""}`)}>
        <div className="list-header">
          <h1>
            <div className="list-title">{_t("popular-users.title")}</div>
          </h1>
          <div className={_c(`list-refresh ${loading ? "disabled" : ""}`)} onClick={this.fetch}>
            {syncSvg}
          </div>
        </div>
        {loading && <LinearProgress />}

        {list.length > 0 && (
          <div className="list-body">
            {list.map((r, i) => {
              return (
                <div className="list-item" key={i}>
                  {ProfileLink({
                    ...this.props,
                    username: r.name,
                    children: (
                      <span>
                        <UserAvatar username={r.name} size="medium" />
                      </span>
                    )
                  })}
                  <div className="user-info">
                    {ProfileLink({
                      ...this.props,
                      username: r.name,
                      children: <span className="display-name">{r.full_name}</span>
                    })}
                    {ProfileLink({
                      ...this.props,
                      username: r.name,
                      children: (
                        <span className="name notranslate">
                          {" "}
                          {"@"}
                          {r.name}
                        </span>
                      )
                    })}
                    <div className="about">{r.about}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    global: p.global,
    history: p.history,
    addAccount: p.addAccount
  };

  return <PopularUsers {...props} />;
};
