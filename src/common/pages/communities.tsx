import React, { Fragment } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Community } from "../store/communities/types";
import BaseComponent from "../components/base";
import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import LinearProgress from "../components/linear-progress";
import CommunityListItem from "../components/community-list-item";
import SearchBox from "../components/search-box";
import ScrollToTop from "../components/scroll-to-top";
import { _t } from "../i18n";
import { getCommunities, getSubscriptions } from "../api/bridge";
import defaults from "../constants/defaults.json";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import "./communities.scss";
import { FormControl } from "@ui/input";

interface State {
  list: Community[];
  loading: boolean;
  query: string;
  sort: string;
}

class CommunitiesPage extends BaseComponent<PageProps, State> {
  state: State = {
    list: [],
    loading: true,
    query: "",
    sort: "hot"
  };

  _timer: any = null;

  componentDidMount() {
    this.fetch();

    const { activeUser, subscriptions, updateSubscriptions } = this.props;
    if (activeUser && subscriptions.length === 0) {
      getSubscriptions(activeUser.username).then((r) => {
        if (r) updateSubscriptions(r);
      });
    }
  }

  componentDidUpdate(prevProps: Readonly<PageProps>) {
    const { activeUser, updateSubscriptions } = this.props;
    if (prevProps.activeUser?.username !== activeUser?.username) {
      if (activeUser) {
        getSubscriptions(activeUser.username).then((r) => {
          if (r) updateSubscriptions(r);
        });
      }
    }
  }

  fetch = () => {
    const { query, sort } = this.state;
    this.stateSet({ loading: true });

    getCommunities("", 100, query ? query : null, sort === "hot" ? "rank" : sort)
      .then((r) => {
        if (r) {
          const list = sort === "hot" ? r.sort(() => Math.random() - 0.5) : r;
          this.stateSet({ list });
        }
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  queryChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  sortChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.stateSet({ sort: e.target.value }, (): void => {
      this.fetch();
    });
  };

  render() {
    const { global } = this.props;
    const { list, loading, query, sort } = this.state;
    const noResults = !loading && list.length === 0;

    //  Meta config
    const metaProps = {
      title: _t("communities.title"),
      url: "/communities",
      canonical: `${defaults.base}/communities`,
      description: _t("communities.description")
    };

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <NavBar history={this.props.history} />
        <div className="app-content communities-page">
          <div className="community-list">
            <div className="list-header">
              <h1 className="list-title">{_t("communities.title")}</h1>
              <Link to="/communities/create" className="create-link">
                {_t("communities.create")}
              </Link>
            </div>
            <div className="list-form">
              <div className="search">
                <SearchBox
                  placeholder={_t("g.search")}
                  value={query}
                  onChange={this.queryChanged}
                  readOnly={loading}
                />
              </div>
              <div className="sort">
                <FormControl
                  type="select"
                  value={sort}
                  onChange={this.sortChanged}
                  disabled={loading}
                >
                  <option value="hot">{_t("communities.sort-hot")}</option>
                  <option value="rank">{_t("communities.sort-rank")}</option>
                  <option value="subs">{_t("communities.sort-subs")}</option>
                  <option value="new">{_t("communities.sort-new")}</option>
                </FormControl>
              </div>
            </div>
            {loading && <LinearProgress />}
            <div className="list-items">
              {noResults && <div className="no-results">{_t("communities.no-results")}</div>}
              {list.map((x, i) => (
                <Fragment key={i}>
                  {CommunityListItem({
                    ...this.props,
                    community: x
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(CommunitiesPage);
