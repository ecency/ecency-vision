import React from "react";

import { History, Location } from "history";

import { Global } from "../../store/global/types";
import { Community } from "../../store/communities/types";
import { TrendingTags } from "../../store/trending-tags/types";

import BaseComponent from "../base";
import UserAvatar from "../user-avatar";
import SuggestionList from "../suggestion-list";
import { makePath as makePathTag } from "../tag";
import { makePath as makePathProfile } from "../profile-link";

import { _t } from "../../i18n";

import defaults from "../../constants/defaults.json";

import { getAccountReputations, Reputations } from "../../api/hive";
import { dataLimit, getCommunities } from "../../api/bridge";
import accountReputation from "../../helper/account-reputation";

interface Props {
  history: History;
  location: Location;
  global: Global;
  trendingTags: TrendingTags;
  value: string;
  children: JSX.Element;
  containerClassName?: string;
  changed: boolean;
}

interface State {
  suggestions: string[] | Community[];
  loading: boolean;
  mode: string;
  suggestionWithMode: any[];
}

const MODE__ALL = "all";

export class SearchSuggester extends BaseComponent<Props, State> {
  state: State = {
    suggestions: [],
    loading: false,
    mode: "",
    suggestionWithMode: []
  };

  _timer: any = null;

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.stateSet({
        suggestions: [],
        loading: false,
        mode: ""
      });
      return;
    }

    if (this.props.value !== prevProps.value && this.props.changed) {
      this.trigger();
    }
  }

  fetchSuggestions = async () => {
    const { value, trendingTags } = this.props;
    const { loading } = this.state;

    if (loading) {
      return;
    }

    // # Tags
    if (value.startsWith("#")) {
      const tag = value.replace("#", "");
      const suggestions = trendingTags.list
        .filter((x: string) => x.toLowerCase().indexOf(tag.toLowerCase()) === 0)
        .filter((x: string) => x.indexOf("hive-") === -1)
        .map((x) => `#${x}`)
        .slice(0, 20);

      const suggestionWithMode = [
        {
          header: _t("search.header-tag"),
          onSelect: (i: string) => {
            this.tagSelected(i.replace("#", ""));
          },
          items: suggestions
        }
      ];
      this.stateSet({ mode: "tag", suggestions, suggestionWithMode });

      return;
    }

    // Account
    if (value.startsWith("@")) {
      const name = value.replace("@", "");
      this.stateSet({ loading: true });
      getAccountReputations(name, 20)
        .then((r) => {
          const suggestions = r.map((x) => `${x.account}`);
          const suggestionWithMode = [
            {
              header: _t("search.header-account"),
              renderer: (i: Reputations) => {
                return (
                  <>
                    <UserAvatar username={i.account} size="medium" />
                    <span style={{ marginLeft: "8px" }}>{i.account}</span>
                    <span style={{ marginLeft: "8px" }}>({accountReputation(i.reputation)})</span>
                  </>
                );
              },
              onSelect: (i: Reputations) => {
                this.accountSelected(i.account);
              },
              items: r
            }
          ];
          this.stateSet({ mode: "account", suggestions, suggestionWithMode });
        })
        .finally(() => {
          this.stateSet({ loading: false });
        });

      return;
    }

    // Community
    if (value.startsWith("$")) {
      const q = value.replace("$", "");
      getCommunities("", dataLimit, q)
        .then((r) => {
          if (r) {
            const suggestionWithMode = [
              {
                header: _t("search.header-community"),
                renderer: (i: Community) => {
                  return i.title;
                },
                onSelect: (i: Community) => {
                  this.communitySelected(i);
                },
                items: r
              }
            ];
            this.stateSet({ mode: "comm", suggestions: r, suggestionWithMode });
          }
        })
        .finally(() => {
          this.stateSet({ loading: false });
        });

      return;
    }

    // Search ALL
    if (!!value) {
      // tags
      const tags_suggestions = trendingTags.list
        .filter((x: string) => x.toLowerCase().indexOf(value.toLowerCase()) === 0)
        .filter((x: string) => x.indexOf("hive-") === -1)
        .map((x) => `#${x}`)
        .slice(0, 2);
      // account
      const lookup_accounts = await getAccountReputations(value, 2);
      // Community
      const get_communities = await getCommunities("", 2, value);
      const communities_suggestions = get_communities || [];
      const suggestionWithMode = [
        {
          header: _t("search.header-tag"),
          onSelect: (i: string) => {
            this.tagSelected(i.replace("#", ""));
          },
          items: tags_suggestions
        },
        {
          header: _t("search.header-account"),
          renderer: (i: Reputations) => {
            return (
              <>
                <UserAvatar username={i.account} size="medium" />
                <span style={{ marginLeft: "8px" }}>{i.account}</span>
                <span style={{ marginLeft: "8px" }}>({accountReputation(i.reputation)})</span>
              </>
            );
          },
          onSelect: (i: Reputations) => {
            this.accountSelected(i.account);
          },
          items: lookup_accounts
        },
        {
          header: _t("search.header-community"),
          renderer: (i: Community) => {
            return i.title;
          },
          onSelect: (i: Community) => {
            this.communitySelected(i);
          },
          items: communities_suggestions
        }
      ];
      this.stateSet({ loading: false, mode: MODE__ALL, suggestions: [], suggestionWithMode });
    } else {
      this.stateSet({ suggestions: [], mode: "", suggestionWithMode: [] });
    }
  };

  trigger = () => {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    this._timer = setTimeout(() => {
      this.fetchSuggestions();
    }, 1000);
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
    const { global, value, children, containerClassName } = this.props;
    const { suggestions, mode, suggestionWithMode } = this.state;
    return (
      <>
        <SuggestionList
          {...this.props}
          searchValue={value}
          items={suggestions}
          modeItems={suggestionWithMode}
          containerClassName={containerClassName}
        >
          {children}
        </SuggestionList>
      </>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    location: p.location,
    global: p.global,
    value: p.value,
    trendingTags: p.trendingTags,
    children: p.children,
    containerClassName: p.containerClassName,
    changed: p.changed
  };

  return <SearchSuggester {...props} />;
};
