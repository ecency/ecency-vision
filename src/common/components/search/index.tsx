import React, { Component } from "react";

import { History } from "history";

import { FormControl } from "react-bootstrap";

import { Community } from "../../store/community/types";

import SearchBox from "../search-box";
import UserAvatar from "../user-avatar";
import { makePath as makePathTag } from "../tag-link";
import { makePath as makePathProfile } from "../profile-link";

import { _t } from "../../i18n";

import defaults from "../../constants/defaults.json";

import { getTrendingTags, lookupAccounts } from "../../api/hive";
import { getCommunities } from "../../api/bridge";

interface Props {
  history: History;
}

interface State {
  query: string;
  suggestions: string[] | Community[];
  tags: string[];
  loading: boolean;
  hasFocus: boolean;
  mode: string;
}

export default class Search extends Component<Props, State> {
  state = {
    query: "",
    suggestions: [],
    tags: [],
    loading: false,
    hasFocus: false,
    mode: "",
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

  onFocus = () => {
    this.stateSet({ hasFocus: true });
  };

  onBlur = () => {
    setTimeout(() => {
      this.stateSet({ hasFocus: false });
    }, 500);
  };

  onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const { query } = this.state;
      window.location.href = `https://search.esteem.app/search?q=${decodeURIComponent(query)}`;
    }
  };

  userSelected = (name: string) => {
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
    const { query, suggestions, hasFocus, mode } = this.state;

    return (
      <div className="autocomplete-search">
        <SearchBox
          placeholder={_t("g.search")}
          value={query}
          onChange={this.queryChanged}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
        />
        {hasFocus && suggestions.length > 0 && (
          <div className="autocomplete-list">
            <div className="list-header">
              {mode === "tag" && <span>Tags</span>}
              {mode === "account" && <span>Users</span>}
              {mode === "comm" && <span>Communities</span>}
            </div>
            <div className="list-body">
              {(() => {
                if (mode === "account") {
                  return suggestions.map((x: string, i) => {
                    const name = x.replace("@", "");
                    return (
                      <div
                        key={i}
                        className="list-item"
                        onClick={() => {
                          this.userSelected(name);
                        }}
                      >
                        {x.startsWith("@") && <UserAvatar username={name} size="small" />}
                        <span className="item-label">{name}</span>
                      </div>
                    );
                  });
                }

                if (mode === "tag") {
                  return suggestions.map((x: string, i) => {
                    const tag = x.replace("#", "");
                    return (
                      <div
                        key={i}
                        className="list-item"
                        onClick={() => {
                          this.tagSelected(tag);
                        }}
                      >
                        <span className="item-label">{tag}</span>
                      </div>
                    );
                  });
                }

                if (mode === "comm") {
                  return suggestions.map((x: Community, i) => {
                    return (
                      <div
                        key={i}
                        className="list-item"
                        onClick={() => {
                          this.communitySelected(x);
                        }}
                      >
                        <span className="item-label">{x.title}</span>
                      </div>
                    );
                  });
                }

                return null;
              })()}
            </div>
          </div>
        )}
      </div>
    );
  }
}
