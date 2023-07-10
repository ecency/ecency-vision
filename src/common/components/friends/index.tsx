import React, { Component } from "react";

import { History } from "history";

import { Modal, Button, FormControl } from "react-bootstrap";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";

import BaseComponent from "../base";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";

import { getFollowing, getFollowers, getAccounts, getAccount } from "../../api/hive";
import { searchFollowing, searchFollower, FriendSearchResult } from "../../api/search-api";

import { _t } from "../../i18n";

import accountReputation from "../../helper/account-reputation";
import formattedNumber from "../../util/formatted-number";
import "./_index.scss";
import { FilterFriends, FriendsActiveStats } from "../friends-filter";
import moment, { Moment } from "moment";

interface Friend {
  name: string;
  reputation: string | number;
}

interface ListProps {
  global: Global;
  history: History;
  account: Account;
  mode: "follower" | "following";
  addAccount: (data: Account) => void;
}

interface ListState {
  loading: boolean;
  data: Friend[];
  results: Friend[];
  filtered: Friend[];
  hasMore: boolean;
  isFiltered: boolean;
  search: string;
}

const loadLimit = 30;

export class List extends BaseComponent<ListProps, ListState> {
  state: ListState = {
    loading: false,
    data: [],
    results: [],
    filtered: [],
    hasMore: false,
    isFiltered: false,
    search: ""
  };

  _timer: any = null;

  componentDidMount() {
    this.fetchFirst().then();
  }

  fKey = () => {
    const { mode } = this.props;

    return mode === "following" ? "following" : "follower";
  };

  fetch = async (start = "", limit = loadLimit): Promise<Friend[]> => {
    const { account, mode } = this.props;

    const loadFn = mode === "following" ? getFollowing : getFollowers;

    return loadFn(account.name, start, "blog", limit)
      .then((resp) => {
        const accountNames = resp.map((e) => e[this.fKey()]);
        return getAccounts(accountNames).then((resp2) => resp2);
      })
      .then((accounts) =>
        accounts.map((a) => ({
          name: a.name,
          reputation: a.reputation!
        }))
      );
  };

  fetchFirst = async () => {
    this.stateSet({ loading: true, data: [], hasMore: false });
    let data: Friend[];

    try {
      data = await this.fetch();
    } catch (e) {
      data = [];
    }

    this.stateSet({
      data,
      hasMore: data.length >= loadLimit,
      loading: false
    });
  };

  fetchMore = async () => {
    const { data } = this.state;
    const lastItem = [...data].pop()!;
    const startUserName = lastItem.name;

    this.stateSet({ loading: true });

    let moreData: Friend[];

    try {
      moreData = await this.fetch(startUserName);
    } catch (e) {
      moreData = [];
    }

    const newData = [...data, ...moreData.filter((a) => !data.find((b) => b.name === a.name))];

    this.stateSet({
      data: newData,
      hasMore: moreData.length >= loadLimit,
      loading: false
    });
  };

  search = async () => {
    const { search } = this.state;

    if (search.length < 3) {
      this.stateSet({
        results: [],
        loading: false
      });
      return;
    }

    this.stateSet({ loading: true });

    const { account, mode } = this.props;

    let results: FriendSearchResult[];

    try {
      if (mode === "following") {
        results = await searchFollowing(account.name, search);
      } else {
        results = await searchFollower(account.name, search);
      }
    } catch (e) {
      results = [];
    }

    this.stateSet({
      results: results,
      loading: false
    });
  };

  searchChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    clearTimeout(this._timer);

    this.stateSet({ search: e.target.value.trim(), loading: true }, () => {
      this._timer = setTimeout(() => {
        this.search().then();
      }, 500);
    });
  };

  searchKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) {
      this.search();
    }
  };

  filterList = async (type: string) => {
      // filter data or results
    const { results, data } = this.state;
    console.log(type);
    // const allData = await this.fetch();
    const currentTime = moment();
  
    const filtered = [];
  
    for (const item of data) {
      const followerAccount = await getAccount(item.name);
      const lastActive = moment.max(
        moment(followerAccount?.last_vote_time),
        moment(followerAccount?.last_post),
        moment(followerAccount?.created)
      );
        // This should be properly constructed
      const diffInYears = currentTime.diff(lastActive, "years");
      const diffInMonths = currentTime.diff(lastActive, "months");
      const diffInWeeks = currentTime.diff(lastActive, "weeks");
      const diffInDays = currentTime.diff(lastActive, "days");
      console.log(diffInYears);
  
      const filter =
        type === "Over 2 years"
          ? diffInYears >= 2
          : type === "1 year ago"
          ? diffInYears >= 1 && diffInYears < 2
          : type === "6 months ago"
          ? lastActive.isAfter(moment().subtract(6, "months")) &&
            lastActive.isBefore(moment().subtract(6, "months").endOf("month"))
          : type === "Last month"
          ? lastActive.isAfter(moment().subtract(1, "month")) &&
            lastActive.isBefore(moment().subtract(1, "month").endOf("month"))
          : type === "Last week"
          ? lastActive.isAfter(moment().subtract(1, "week")) &&
            lastActive.isBefore(moment().subtract(1, "week").endOf("week"))
          : null;
  
      if (filter) {
        filtered.push(item);
      }
    }
  
    console.log("allData:", data);
    console.log("filtered:", filtered);
  
    this.stateSet({ filtered, isFiltered: true });
    console.log("this.state.filtered:", this.state.filtered);
  };
  

  renderList = (loading: boolean, list: Friend[]) => {
    return (
      <>
        {!loading && list.length === 0 && <div className="empty-list"> {_t("g.empty-list")}</div>}

        {list.map((item) => (
          <div className="list-item" key={item.name}>
            <div className="item-main">
              {ProfileLink({
                ...this.props,
                username: item.name,
                children: <UserAvatar username={item.name} size="small" />
              })}
              <div className="item-info">
                {ProfileLink({
                  ...this.props,
                  username: item.name,
                  children: <span className="item-name notranslate">{item.name}</span>
                })}
                {item?.reputation !== undefined && (
                  <span className="item-reputation">{accountReputation(item.reputation)}</span>
                )}
              </div>
            </div>
            <div className="last-seen mt-1">
              <FriendsActiveStats item={item}/>
            </div>
          </div>
        ))}
      </>
    );
  };

  render() {
    const { loading, data, results, hasMore, search, filtered, isFiltered } = this.state;

    const inSearch = search.length >= 3;

    return (
      <>
        <div className="friends-content">
          {loading && (
            <div className="loading">
              <LinearProgress />
            </div>
          )}

          <div>
            <FilterFriends data={data} filter={this.filterList}/>
          </div>

          <div className="friends-list">
            <div className="friend-search-box">
              <FormControl
                value={search}
                placeholder={_t("friends.search-placeholder")}
                onChange={this.searchChanged}
                onKeyDown={this.searchKeyDown}
              />
            </div>

            <div className="list-body">
              {inSearch && this.renderList(loading, results)}
              {!inSearch && !isFiltered && this.renderList(loading, data)}
              {isFiltered && this.renderList(loading, filtered)}
            </div>
          </div>

          {!inSearch && data.length > 1 && (
            <div className="load-more">
              <Button disabled={loading || !hasMore} onClick={this.fetchMore}>
                {_t("g.load-more")}
              </Button>
            </div>
          )}
        </div>
      </>
    );
  }
}

interface Props {
  global: Global;
  history: History;
  account: Account;
  addAccount: (data: Account) => void;
  onHide: () => void;
}

export class Followers extends Component<Props> {
  render() {
    const { account, onHide } = this.props;
    const title =
      account.__loaded && account.follow_stats
        ? _t("friends.followers", {
            n: formattedNumber(account.follow_stats.follower_count, { fractionDigits: 0 })
          })
        : "";

    return (
      <>
        <Modal onHide={onHide} show={true} centered={true} animation={false} size="lg">
          <Modal.Header closeButton={true}>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <List {...this.props} mode="follower" />
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

export class Following extends Component<Props> {
  render() {
    const { account, onHide } = this.props;
    const title =
      account.__loaded && account.follow_stats
        ? _t("friends.following", {
            n: formattedNumber(account.follow_stats.following_count, { fractionDigits: 0 })
          })
        : "";

    return (
      <>
        <Modal onHide={onHide} show={true} centered={true} animation={false} size="lg">
          <Modal.Header closeButton={true}>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <List {...this.props} mode="following" />
          </Modal.Body>
        </Modal>
      </>
    );
  }
}
