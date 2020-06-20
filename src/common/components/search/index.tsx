import React, { Component } from "react";

import { History, Location } from "history";

import isEqual from "react-fast-compare";

import { FormControl } from "react-bootstrap";

import { Community } from "../../store/community/types";

import SearchBox from "../search-box";
import UserAvatar from "../user-avatar";
import SuggestionList from "../suggestion-list";
import { makePath as makePathTag } from "../tag";
import { makePath as makePathProfile } from "../profile-link";

import { _t } from "../../i18n";

import defaults from "../../constants/defaults.json";

import { getTrendingTags, lookupAccounts } from "../../api/hive";
import { getCommunities } from "../../api/bridge";

interface Props {
  history: History;
  location: Location;
}

interface State {
  query: string;
  suggestions: string[] | Community[];
  tags: string[];
  loading: boolean;
  mode: string;
}

export default class Search extends Component<Props, State> {
  state: State = {
    query: "",
    suggestions: [],
    tags: [],
    loading: false,
    mode: "",
  };

  _timer: any = null;
  _mounted: boolean = true;

  componentWillUnmount() {
    this._mounted = false;
  }

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
    return !isEqual(this.state, nextState) || !isEqual(this.props.location.pathname, nextProps.location.pathname);
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      // Reset state when location change
      this.stateSet({
        query: "",
        suggestions: [],
        tags: [],
        loading: false,
        mode: "",
      });
    }
  }

  stateSet = (obj: {}, cb: () => void = () => {}) => {
    if (this._mounted) {
      this.setState(obj, cb);
    }
  };

  suggestTags = () => {
    const { query, tags } = this.state;
    const tag = query.replace("#", "");
    const suggestions = tags
      .filter((x: string) => x.toLowerCase().indexOf(tag.toLowerCase()) === 0)
      .filter((x: string) => x.indexOf("hive-") === -1)
      .map((x) => `#${x}`)
      .slice(0, 20);

    this.stateSet({ mode: "tag", suggestions });
  };

  fetchSuggestions = () => {
    const { query, tags, loading } = this.state;

    if (loading) {
      return;
    }

    // # Tags
    if (query.startsWith("#")) {
      if (tags.length === 0) {
        this.stateSet({ loading: true });
        getTrendingTags("", 250)
          .then((tags) => {
            this.stateSet({ tags }, this.suggestTags);
          })
          .finally(() => {
            this.stateSet({ loading: false });
          });
      } else {
        this.suggestTags();
      }

      return;
    }

    // Account
    if (query.startsWith("@")) {
      const name = query.replace("@", "");
      this.stateSet({ loading: true });
      lookupAccounts(name, 20)
        .then((r) => {
          const suggestions = r.map((x) => `@${x}`);
          this.stateSet({ mode: "account", suggestions });
        })
        .finally(() => {
          this.stateSet({ loading: false });
        });

      return;
    }

    // Community
    if (query.startsWith("$")) {
      const q = query.replace("$", "");
      getCommunities("", 20, q)
        .then((r) => {
          if (r) {
            this.stateSet({ mode: "comm", suggestions: r });
          }
        })
        .finally(() => {
          this.stateSet({ loading: false });
        });

      return;
    }

    this.stateSet({ suggestions: [], mode: "" });
  };

  queryChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    const query = e.target.value;
    this.stateSet({ query }, () => {
      this._timer = setTimeout(() => {
        this.fetchSuggestions();
      }, 1000);
    });
  };

  onKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) {
      const { query } = this.state;
      window.location.href = `https://search.esteem.app/search?q=${decodeURIComponent(query)}`;
    }
  };

  accountSelected = (name: string) => {
    const loc = makePathProfile(name);
    const { history } = this.props;
    history.push(loc);
  };

  tagSelected = (tag: string) => {
    const loc = makePathTag(defaults.filter, tag);
    const { history } = this.props;
    history.push(loc);
  };

  communitySelected = (item: Community) => {
    const loc = makePathTag(defaults.filter, item.name);
    const { history } = this.props;
    history.push(loc);
  };

  render() {
    const { query, suggestions, mode } = this.state;

    let suggestionProps = {};

    switch (mode) {
      case "account":
        suggestionProps = {
          header: _t("search.header-account"),
          renderer: (i: string) => {
            const name = i.replace("@", "");
            return (
              <>
                <UserAvatar username={name} size="small" />
                <span style={{ marginLeft: "8px" }}>{name}</span>
              </>
            );
          },
          onSelect: (i: string) => {
            this.accountSelected(i.replace("@", ""));
            this.stateSet({ query: "" });
          },
        };
        break;
      case "tag":
        suggestionProps = {
          header: _t("search.header-tag"),
          onSelect: (i: string) => {
            this.tagSelected(i.replace("#", ""));
            this.stateSet({ query: "" });
          },
        };
        break;
      case "comm":
        suggestionProps = {
          header: _t("search.header-community"),
          renderer: (i: Community) => {
            return i.title;
          },
          onSelect: (i: Community) => {
            this.communitySelected(i);
            this.stateSet({ query: "" });
          },
        };
        break;
    }

    return (
      <>
        <SuggestionList items={suggestions} {...suggestionProps}>
          <SearchBox
            placeholder={_t("g.search")}
            value={query}
            onChange={this.queryChanged}
            onKeyDown={this.onKeyDown}
            autoComplete="off"
          />
        </SuggestionList>
      </>
    );
  }
}
