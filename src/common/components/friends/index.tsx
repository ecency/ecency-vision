import React, { Component } from "react";
import { History } from "history";
import { Button } from "react-bootstrap";
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
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import { FilterFriends } from "../friends-filter";
import moment from "moment";
import { FilterFriendsType } from "../../enums";
import { formatTimeDIfference } from "../../helper/parse-date";

interface Friend {
  name: string;
  reputation: string | number;
  lastSeen: string;
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
  filterType: string | FilterFriendsType;
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
    search: "",
    filterType: ""
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
        accounts.map((a) => {
          const lastActive = moment.max(
            moment(a?.last_vote_time),
            moment(a?.last_post),
            moment(a?.created)
          );
          return {
            name: a.name,
            reputation: a.reputation!,
            lastSeen: lastActive.fromNow()
          };
        })
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
        loading: false,
        isFiltered: true
      });
      return;
    }

    this.stateSet({ loading: true });

    const { account, mode } = this.props;

    let results: FriendSearchResult[];

    try {
      if (mode === "following") {
        const followingData = await searchFollowing(account.name, search);
        const followingAccountNames = followingData.map((following) => following.name);
        const accounts = await getAccounts(followingAccountNames);

        results = followingData.map((following) => {
          const isMatch = accounts.find((account) => account.name === following.name);
          if (!isMatch) {
            return following;
          }

          const lastActive = moment.max(
            moment(isMatch.last_vote_time),
            moment(isMatch.last_post),
            moment(isMatch.created)
          );

          return {
            ...following,
            lastSeen: lastActive.fromNow()
          };
        });
        this.stateSet({ isFiltered: false });
      } else {
        const followerData = await searchFollower(account.name, search);
        const followerAccountNames = followerData.map((follower) => follower.name);
        const accounts = await getAccounts(followerAccountNames);

        results = followerData.map((follower) => {
          const isMatch = accounts.find((account) => account.name === follower.name);
          if (!isMatch) {
            return follower;
          }

          const lastActive = moment.max(
            moment(isMatch.last_vote_time),
            moment(isMatch.last_post),
            moment(isMatch.created)
          );

          return {
            ...follower,
            lastSeen: lastActive.fromNow()
          };
        });
        this.stateSet({ isFiltered: false });
      }
    } catch (e) {
      results = [];
    }

    this.stateSet({
      results: results,
      loading: false
    });
  };

  searchChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  filterList = async (type: FilterFriendsType | string) => {
    this.stateSet({ loading: true, data: [], hasMore: false });
    let data: Friend[];

    try {
      data = await this.fetch("", 30);
    } catch (e) {
      data = [];
    }
    const currentTime = new Date();

    const filteredData = data.filter((item) => {
      const lastSeenTime = new Date(formatTimeDIfference(item.lastSeen));

      const timeDifference = currentTime.getTime() - lastSeenTime.getTime();

      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
      const yearsDifference = Math.ceil(daysDifference / 365);

      return (
        (type === FilterFriendsType.Recently && daysDifference < 7) ||
        (type === FilterFriendsType.ThisMonth && daysDifference > 7 && daysDifference < 30) ||
        (type === FilterFriendsType.ThisYear && daysDifference >= 30 && daysDifference < 360) ||
        (type === FilterFriendsType.OneYear && daysDifference === 365) ||
        (type === FilterFriendsType.MoreThanOneYear && yearsDifference > 1)
      );
    });

    if (type === FilterFriendsType.All) {
      this.stateSet({ filtered: data, isFiltered: true, loading: false });
    } else {
      this.stateSet({ filtered: filteredData, isFiltered: true, loading: false });
    }
  };

  filterMore = async (type: FilterFriendsType | string) => {
    const { filtered } = this.state;
    const lastItem = [...filtered].pop()!;
    const startUserName = lastItem.name;

    this.stateSet({ loading: true });

    let moreData: Friend[];

    try {
      moreData = await this.fetch(startUserName);
    } catch (e) {
      moreData = [];
    }

    const currentTime = new Date();

    const filteredData = moreData.filter((item) => {
      const lastSeenTime = new Date(formatTimeDIfference(item.lastSeen));

      const timeDifference = currentTime.getTime() - lastSeenTime.getTime();

      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
      const yearsDifference = Math.ceil(daysDifference / 365);

      return (
        (type === FilterFriendsType.Recently && daysDifference < 7) ||
        (type === FilterFriendsType.ThisMonth && daysDifference > 7 && daysDifference < 30) ||
        (type === FilterFriendsType.ThisYear && daysDifference >= 30 && daysDifference < 360) ||
        (type === FilterFriendsType.OneYear && daysDifference === 365) ||
        (type === FilterFriendsType.MoreThanOneYear && yearsDifference > 1)
      );
    });

    if (type === FilterFriendsType.All) {
      this.stateSet({
        filtered: [
          ...filtered,
          ...moreData.filter((a) => !filtered.find((b) => b.name === a.name))
        ],
        isFiltered: true,
        loading: false
      });
    } else {
      this.stateSet({
        filtered: [
          ...filtered,
          ...filteredData.filter((a) => !filtered.find((b) => b.name === a.name))
        ],
        hasMore: moreData.length >= loadLimit,
        loading: false
      });
    }
  };

  updateFilterType = (type: string) => {
    this.stateSet({ filterType: type });
  };

  renderList = (loading: boolean, list: Friend[]) => {
    return (
      <>
        {!loading && list?.length === 0 && <div className="empty-list"> {_t("g.empty-list")}</div>}

        {list?.map((item) => (
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
              <a href="#">{`${_t("friends.active")} ${item.lastSeen}`}</a>
            </div>
          </div>
        ))}
      </>
    );
  };

  render() {
    const { loading, data, results, hasMore, search, filtered, isFiltered, filterType } =
      this.state;

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
            <FilterFriends filterList={this.filterList} updateFilterType={this.updateFilterType} />
          </div>

          <div className="friends-list">
            <div className="friend-search-box">
              <FormControl
                type="text"
                value={search}
                placeholder={_t("friends.search-placeholder")}
                onChange={this.searchChanged}
                onKeyDown={this.searchKeyDown}
              />
            </div>

            <div className="list-body">
              {inSearch && !isFiltered && this.renderList(loading, results)}
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
          {!inSearch && filtered.length > 1 && (
            <div className="load-more">
              <Button onClick={() => this.filterMore(filterType)}>{_t("g.load-more")}</Button>
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
          <ModalHeader closeButton={true}>
            <ModalTitle>{title}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <List {...this.props} mode="follower" />
          </ModalBody>
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
          <ModalHeader closeButton={true}>
            <ModalTitle>{title}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <List {...this.props} mode="following" />
          </ModalBody>
        </Modal>
      </>
    );
  }
}
