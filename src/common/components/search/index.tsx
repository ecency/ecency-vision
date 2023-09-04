import React from "react";
import { History, Location } from "history";
import numeral from "numeral";
import { Global } from "../../store/global/types";
import { TrendingTags } from "../../store/trending-tags/types";

import BaseComponent from "../base";
import SearchBox from "../search-box";

import SearchSuggester from "../search-suggester";

import { _t } from "../../i18n";

import queryString from "query-string";
import { useMappedStore } from "../../store/use-mapped-store";
import { useLocation } from "react-router";
import "./_index.scss";

interface Props {
  history: History;
  location: Location;
  global: Global;
  trendingTags: TrendingTags;
  fetchTrendingTags: () => void;
  containerClassName?: string;
}

interface State {
  query: string;
}

export class Search extends BaseComponent<Props, State> {
  state: State = {
    query: ""
  };

  componentDidMount() {
    const { fetchTrendingTags } = this.props;
    // fetchTrendingTags();

    // this.grabSearchQuery();
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { location } = this.props;

    if (location.pathname !== prevProps.location.pathname) {
      this.stateSet({
        query: ""
      });
      return;
    }

    // if (this.isSearchPage() && location.search !== prevProps.location.search) {
    //   this.grabSearchQuery();
    // }
  }

  grabSearchQuery = () => {
    const { location } = this.props;

    if (this.isSearchPage()) {
      const qs = queryString.parse(location.search);
      const query = (qs.q as string) || "";
      this.stateSet({ query });
    }
  };

  isSearchPage = () => this.props.location.pathname.startsWith("/search");

  queryChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    this.stateSet({ query });
  };

  onKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) {
      const { history, location } = this.props;
      const { query } = this.state;
      if (["/search-more", "/search-more/"].includes(location.pathname)) {
        history.push(`/search-more/?q=${encodeURIComponent(query)}`);
      } else {
        history.push(`/search/?q=${encodeURIComponent(query)}`);
      }
    }
  };

  render() {
    const { global, containerClassName } = this.props;
    const { query } = this.state;

    const placeholder =
      global.searchIndexCount > 0
        ? _t("search.placeholder-count", {
            n: numeral(global.searchIndexCount).format("0,0")
          })
        : _t("search.placeholder");

    return (
      <>
        <SearchSuggester
          {...this.props}
          value={query}
          containerClassName={containerClassName}
          changed={true}
        >
          <SearchBox
            placeholder={placeholder}
            value={query}
            onChange={this.queryChanged}
            onKeyDown={this.onKeyDown}
            autoComplete="off"
          />
        </SearchSuggester>
      </>
    );
  }
}

export default (p: Pick<Props, "history" | "containerClassName">) => {
  const { global, trendingTags, fetchTrendingTags } = useMappedStore();
  const location = useLocation();

  const props: Props = {
    history: p.history,
    location,
    global,
    trendingTags,
    fetchTrendingTags,
    containerClassName: p.containerClassName
  };
  return <Search {...props} />;
};
