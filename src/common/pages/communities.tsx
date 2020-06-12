import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";

import { Form, FormControl, Button } from "react-bootstrap";

import { AppState } from "../store";
import { State as GlobalState } from "../store/global/types";
import { Account } from "../store/accounts/types";
import { Community } from "../store/community/types";

import { hideIntro, toggleTheme } from "../store/global/index";
import { addAccount } from "../store/accounts/index";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import ProfileLink from "../components/profile-link";
import DownloadTrigger from "../components/download-trigger";
import LinearProgress from "../components/linear-progress";
import { makePath } from "../components/tag-link";

import defaults from "../constants/defaults.json";

import { _t } from "../i18n";

import _c from "../util/fix-class-names";

import formattedNumber from "../util/formatted-number";

import { getCommunities } from "../api/bridge";
import { threadId } from "worker_threads";

interface Props {
  history: History;
  location: Location;
  global: GlobalState;
  toggleTheme: () => void;
  addAccount: (data: Account) => void;
}

interface State {
  list: Community[];
  loading: boolean;
  query: string;
  sort: string;
}

class EntryIndexPage extends Component<Props> {
  state: State = {
    list: [],
    loading: false,
    query: "",
    sort: "rank",
  };

  _timer: any = null;
  _mounted: boolean = true;

  componentDidMount() {
    this.fetch();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  stateSet = (obj: {}, cb: () => void = () => {}) => {
    if (this._mounted) {
      this.setState(obj, cb);
    }
  };

  fetch = () => {
    const { query, sort } = this.state;

    this.stateSet({ loading: true });
    getCommunities("", 100, query, sort)
      .then((r) => {
        if (r) {
          this.stateSet({ list: r });
        }
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  queryChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    this.stateSet({ query: e.target.value }, () => {
      this._timer = setTimeout(() => {
        this.fetch();
      }, 1000);
    });
  };

  sortChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
    this.stateSet({ sort: e.target.value }, (): void => {
      this.fetch();
    });
  };

  render() {
    const { list, loading, query, sort } = this.state;

    //  Meta config
    const metaProps = {
      title: _t("communities.title"),
    };

    return (
      <>
        <Meta {...metaProps} />
        <Theme {...this.props} />
        <NavBar {...this.props} />

        <div className="app-content communities-page">
          <div className="community-list">
            <div className="list-header">
              <h1 className="list-title">{_t("communities.title")}</h1>
            </div>
            <div className="list-form">
              <div className="search-box">
                <FormControl placeholder={_t("g.search")} value={query} onChange={this.queryChanged} />
              </div>
              <div className="sort-box">
                <Form.Control as="select" value={sort} onChange={this.sortChanged} disabled={loading}>
                  <option value="rank">{_t("communities.sort-rank")}</option>
                  <option value="subs">{_t("communities.sort-subs")}</option>
                  <option value="new">{_t("communities.sort-new")}</option>
                </Form.Control>
              </div>
            </div>
            {loading && <LinearProgress />}
            <div className="list-items">
              {list.map((x, i) => {
                const nOpts = { fractionDigits: 0 };
                const subscribers = formattedNumber(x.subscribers, nOpts);
                const authors = formattedNumber(x.num_authors, nOpts);
                const posts = formattedNumber(x.num_pending, nOpts);

                return (
                  <div key={i} className="list-item">
                    <div className="item-content">
                      <h2 className="item-title">
                        <a href={makePath(defaults.filter, x.name)}>{x.title}</a>
                      </h2>
                      <div className="item-about">{x.about}</div>
                      <div className="item-stats">
                        <div className="stat">{_t("communities.n-subscribers", { n: subscribers })}</div>
                        <div className="stat">{_t("communities.n-authors", { n: authors })}</div>
                        <div className="stat">{_t("communities.n-posts", { n: posts })}</div>
                      </div>
                      {x.admins && (
                        <div className="item-admins">
                          {_t("communities.admins")}
                          {x.admins.map((x, i) => (
                            <ProfileLink key={i} {...this.props} username={x}>
                              <a className="admin">{x}</a>
                            </ProfileLink>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="item-controls">
                      <DownloadTrigger>
                        <Button>{_t("communities.subscribe")}</Button>
                      </DownloadTrigger>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      toggleTheme,
      hideIntro,
      addAccount,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EntryIndexPage);
