import React, { Component } from "react";

import { FormControl } from "react-bootstrap";

import SearchBox from "../search-box";
import UserAvatar from "../user-avatar";

import { _t } from "../../i18n";

import { getTrendingTags, lookupAccounts } from "../../api/hive";
import { getCommunities } from "../../api/bridge";

interface Props {}

interface State {
  query: string;
  suggestions: string[];
  tags: string[];
  loading: boolean;
  hasFocus: boolean;
}

export default class Search extends Component<Props, State> {
  state = {
    query: "",
    suggestions: [],
    tags: [],
    loading: false,
    hasFocus: false,
  };

  _timer: any = null;
  _mounted: boolean = true;

  componentWillUnmount() {
    this._mounted = false;
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

    this.stateSet({ suggestions });
  };

  fetchSuggestions = () => {
    const { query, tags, loading } = this.state;

    if (loading) {
      return;
    }

    this.stateSet({ suggestions: [] });

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
    }

    // Account
    if (query.startsWith("@")) {
      const name = query.replace("@", "");
      this.stateSet({ loading: true });
      lookupAccounts(name, 20)
        .then((r) => {
          const suggestions = r.map((x) => `@${x}`);
          this.stateSet({ suggestions });
        })
        .finally(() => {
          this.stateSet({ loading: false });
        });
    }

    // Community
    if (query.startsWith("$")) {
      const q = query.replace("$", "");
      getCommunities("", 20, q)
        .then((r) => {
          if (r) {
            const suggestions = r.map((x) => `$${x.title}`);
            this.stateSet({ suggestions });
          }
        })
        .finally(() => {
          this.stateSet({ loading: false });
        });
    }
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

  render() {
    const { query, suggestions, hasFocus } = this.state;

    return (
      <div className="autocomplete-search">
        <SearchBox
          placeholder={_t("g.search")}
          value={query}
          onChange={this.queryChanged}
          onFocus={() => {
            this.stateSet({ hasFocus: true });
          }}
          onBlur={() => {
            this.stateSet({ hasFocus: false });
          }}
        />

        {hasFocus && suggestions.length > 0 && (
          <div className="autocomplete-list">
            {suggestions.map((x: string, i) => {
              return (
                <div key={i} className="list-item">
                  {x.startsWith("@") && <UserAvatar username={x.replace("@", "")} size="small" />}
                  <span className="item-label">{x}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
