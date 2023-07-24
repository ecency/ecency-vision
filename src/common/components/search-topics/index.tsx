import React from "react";

import { History, Location } from "history";

import { Link } from "react-router-dom";

import queryString from "query-string";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import { makePath } from "../tag";

import SearchQuery from "../../helper/search-query";

import { searchTag, TagSearchResult } from "../../api/search-api";

import { _t } from "../../i18n";

import defaults from "../../constants/defaults.json";
import "./_index.scss";

interface Props {
  history: History;
  location: Location;
}

interface State {
  search: string;
  results: TagSearchResult[];
  loading: boolean;
}

const grabSearch = (location: Location) => {
  const qs = queryString.parse(location.search);
  const q = qs.q as string;

  return new SearchQuery(q).search.split(" ")[0].replace("@", "");
};

export class SearchTopics extends BaseComponent<Props, State> {
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

    searchTag(search, 10)
      .then((results) => {
        this.stateSet({ results });
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  render() {
    const { results, loading } = this.state;

    return (
      <div className="border bg-white rounded  search-topics">
        <div className="bg-gray-100 border-b p-3">
          <strong>{_t("search-topics.title")}</strong>
        </div>
        <div className="p-3">
          {(() => {
            if (loading) {
              return <LinearProgress />;
            }

            if (results.length === 0) {
              return <span className="text-muted">{_t("g.no-matches")}</span>;
            }

            return (
              <div className="topic-list">
                {results.map((x) => {
                  return (
                    <Link to={makePath(defaults.filter, x.tag)} className="list-item" key={x.tag}>
                      {x.tag}
                    </Link>
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
    location: p.location
  };

  return <SearchTopics {...props} />;
};
