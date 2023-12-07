import React from "react";

import { History, Location } from "history";

import queryString from "query-string";

import { Link } from "react-router-dom";

import { Global } from "../../store/global/types";
import { Community } from "../../store/communities/types";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import UserAvatar from "../user-avatar";
import { makePath } from "../tag";

import SearchQuery from "../../helper/search-query";

import { getCommunities } from "../../api/bridge";

import { _t } from "../../i18n";

import truncate from "../../util/truncate";
import formattedNumber from "../../util/formatted-number";

import defaults from "../../constants/defaults.json";
import "./_index.scss";

interface Props {
  history: History;
  location: Location;
  global: Global;
}

interface State {
  search: string;
  results: Community[];
  loading: boolean;
}

const grabSearch = (location: Location) => {
  const qs = queryString.parse(location.search);
  const q = qs.q as string;

  return new SearchQuery(q).search.split(" ")[0].replace("@", "");
};

export class SearchCommunities extends BaseComponent<Props, State> {
  state: State = {
    search: grabSearch(this.props.location),
    results: [],
    loading: false
  };

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
    const search = grabSearch(this.props.location);
    if (search !== grabSearch(prevProps.location)) {
      this.stateSet({ search }, this.fetch);
    }
  }

  fetch = () => {
    const { search } = this.state;

    this.stateSet({ results: [], loading: true });
    getCommunities("", 4, search, "rank")
      .then((results) => {
        if (results) {
          this.stateSet({ results: results });
        }
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  render() {
    const { loading, results } = this.state;

    return (
      <div className="border border-[--border-color] bg-white rounded search-communities">
        <div className="bg-gray-100 dark:bg-dark-default border-b border-[--border-color] p-3">
          <strong>{_t("search-communities.title")}</strong>
        </div>
        <div className="p-3">
          {(() => {
            if (loading) {
              return <LinearProgress />;
            }

            if (results.length === 0) {
              return <span className="text-gray-600">{_t("g.no-matches")}</span>;
            }

            return (
              <div className="community-list">
                {results.map((community) => {
                  const link = makePath(defaults.filter, community.name);

                  const nOpts = { fractionDigits: 0 };
                  const subscribers = formattedNumber(community.subscribers, nOpts);

                  return (
                    <div key={community.name} className="list-item">
                      <div className="item-header">
                        <Link to={link}>
                          <UserAvatar username={community.name} size="medium" />
                        </Link>
                        <div className="item-title">
                          <Link to={link}>{community.title}</Link>

                          <div className="item-sub-title">
                            {_t("communities.n-subscribers", { n: subscribers })}
                          </div>
                        </div>
                      </div>
                      <div className="item-about">{truncate(community.about, 120)}</div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    );
  }
}

export default (p: Props) => {
  const props = {
    history: p.history,
    location: p.location,
    global: p.global
  };

  return <SearchCommunities {...props} />;
};
