import React, {Component} from "react";
import {AnyAction, bindActionCreators, Dispatch} from "redux";
import {connect} from "react-redux";
import {History, Location} from "history";

import {AppState} from "../store";
import {EntryFilter, ListStyle, Global} from "../store/global/types";
import {Account} from "../store/accounts/types";
import {DynamicProps} from "../store/dynamic-props/types";
import {TrendingTags} from "../store/trending-tags/types";
import {Entries, Entry} from "../store/entries/types";
import {Community} from "../store/community/types";
import {User} from "../store/users/types";
import {ActiveUser} from "../store/active-user/types";
import {Reblog} from "../store/reblogs/types";
import {UI, ToggleType} from "../store/ui/types";
import {Subscription} from "../store/subscriptions/types";
import {Notifications, NotificationFilter} from "../store/notifications/types";

import {hideIntro, toggleListStyle, toggleTheme} from "../store/global";
import {makeGroupKey, fetchEntries} from "../store/entries";
import {fetchCommunity, resetCommunity} from "../store/community";
import {fetchTrendingTags} from "../store/trending-tags";
import {addAccount} from "../store/accounts";
import {updateEntry} from "../store/entries";
import {setActiveUser, updateActiveUser} from "../store/active-user";
import {deleteUser, addUser} from "../store/users";
import {addReblog} from "../store/reblogs";
import {toggleUIProp} from "../store/ui";
import {updateSubscriptions} from "../store/subscriptions";
import {fetchNotifications, fetchUnreadNotificationCount, setNotificationsFilter} from "../store/notifications";

import Meta from "../components/meta";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import Intro from "../components/intro";
import DropDown from "../components/dropdown";
import ListStyleToggle from "../components/list-style-toggle";
import LinearProgress from "../components/linear-progress";
import EntryListLoadingItem from "../components/entry-list-loading-item";
import DetectBottom from "../components/detect-bottom";
import EntryListContent from "../components/entry-list";
import TrendingTagsCard from "../components/trending-tags-card";
import CommunityCard from "../components/community-card";
import CommunityCardSm from "../components/community-card-sm";

import { _t } from "../i18n";

import _c from "../util/fix-class-names";

import capitalize from "../util/capitalize";

import defaults from "../constants/defaults.json";
import {getSubscriptions} from "../api/bridge";


interface Props {
  history: History;
  location: Location;
  global: Global;
  trendingTags: TrendingTags;
  dynamicProps: DynamicProps;
  entries: Entries;
  community: Community | null;
  users: User[];
  activeUser: ActiveUser | null;
  reblogs: Reblog[];
  ui: UI;
  subscriptions: Subscription[];
  notifications: Notifications;
  toggleTheme: () => void;
  hideIntro: () => void;
  toggleListStyle: () => void;
  fetchEntries: (what: string, tag: string, more: boolean) => void;
  fetchCommunity: () => void;
  resetCommunity: () => void;
  fetchTrendingTags: () => void;
  addAccount: (data: Account) => void;
  updateEntry: (entry: Entry) => void;
  addUser: (user: User) => void;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data: Account) => void;
  deleteUser: (username: string) => void;
  addReblog: (account: string, author: string, permlink: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  updateSubscriptions: (list: Subscription[]) => void;
  fetchNotifications: (since: number | null) => void;
  fetchUnreadNotificationCount: () => void;
  setNotificationsFilter: (filter: NotificationFilter | null) => void;
}

class EntryIndexPage extends Component<Props> {
  componentDidMount() {
    const { global, fetchEntries, fetchCommunity } = this.props;
    fetchEntries(global.filter, global.tag, false);
    fetchCommunity();
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { global, activeUser, fetchEntries, fetchCommunity, updateSubscriptions } = this.props;
    const { global: pGlobal } = prevProps;

    // page changed.
    if (!global.filter) {
      return;
    }

    if (!(global.filter === pGlobal.filter && global.tag === pGlobal.tag)) {
      fetchEntries(global.filter, global.tag, false);
    }

    if (global.tag !== pGlobal.tag) {
      fetchCommunity();
    }

    if (prevProps.activeUser?.username !== activeUser?.username) {
      if (activeUser) {
        getSubscriptions(activeUser.username).then(r => {
          if (r) updateSubscriptions(r);
        });
      }
    }
  }

  componentWillUnmount() {
    const { resetCommunity } = this.props;
    resetCommunity();
  }

  bottomReached = () => {
    const { global, entries, fetchEntries } = this.props;
    const { filter, tag } = global;
    const groupKey = makeGroupKey(filter, tag);

    const data = entries[groupKey];
    const { loading, hasMore } = data;

    if (!loading && hasMore) {
      fetchEntries(filter, tag, true);
    }
  };

  render() {
    const { global, entries, community, activeUser } = this.props;
    const { filter, tag } = global;

    const groupKey = makeGroupKey(filter, tag);

    const data = entries[groupKey];
    if (data === undefined) {
      return null;
    }

    const entryList = data.entries;
    const loading = data.loading;

    const dropDownConfig = {
      label: _t(`entry-index.filter-${filter}`),
      items: [
        ...(activeUser
          ? [
              {
                label: _t("entry-index.feed"),
                href: `/@${activeUser.username}/feed`,
                active: filter === "feed" && activeUser.username === tag.replace("@", ""),
              },
            ]
          : []),
        ...[EntryFilter.trending, EntryFilter.hot, EntryFilter.created].map((x) => {
          return {
            label: _t(`entry-index.filter-${x}`),
            href: tag && filter !== "feed" ? `/${x}/${tag}` : `/${x}`,
            active: filter === x,
          };
        }),
      ],
    };

    //  Meta config
    const fC = capitalize(filter);
    let title = _t("entry-index.title", { f: fC });
    let description = _t("entry-index.description", { f: fC });
    let url = `${defaults.base}/${filter}`;
    let rss = "";

    if (tag) {
      if (tag.startsWith('@')) {
        title = `${tag} / ${filter}`;
        description = _t("entry-index.description-user-feed", {u: tag});
      } else {
        url = `${defaults.base}/${filter}/${tag}`;
        rss = `${defaults.base}/${filter}/${tag}/rss.xml`;

        if (community) {
          title = `${community.title.trim()} / ${filter}`;
          description = _t("entry-index.description", {f: `${fC} ${community.title.trim()}`});
        } else {
          title = `#${tag} / ${filter}`;
          description = _t("entry-index.description-tag", {f: fC, t: tag});
        }
      }
    }

    const metaProps = { title, description, url, rss };

    const promoted = entries['__promoted__'] ? entries['__promoted__'].entries : [];

    return (
      <>
        <Meta {...metaProps} />

        <Theme {...this.props} />
        <Feedback />
        <NavBar {...this.props} />
        <Intro {...this.props} />
        <div className="app-content entry-index-page">
          <div className="tags-side">
            <TrendingTagsCard {...this.props} />
          </div>
          <div className={_c(`entry-page-content ${loading ? "loading" : ""}`)}>
            {community && (
              <div className="community-sm">
                <CommunityCardSm {...this.props} community={community} />
              </div>
            )}
            <div className="page-tools">
              <DropDown {...{ ...this.props, ...dropDownConfig }} float="left" />
              <ListStyleToggle {...this.props} />
            </div>
            {loading && entryList.length === 0 ? <LinearProgress /> : ""}
            <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
              <div className={_c(`entry-list-body ${global.listStyle === ListStyle.grid ? "grid-view" : ""}`)}>
                {loading && entryList.length === 0 && <EntryListLoadingItem />}
                <EntryListContent {...this.props} entries={entryList} promotedEntries={promoted} />
              </div>
            </div>
            {loading && entryList.length > 0 ? <LinearProgress /> : ""}
          </div>
          {community && (
            <div className="community-side">
              <CommunityCard {...this.props} community={community} />
            </div>
          )}
        </div>
        <DetectBottom onBottom={this.bottomReached} />
      </>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global,
  trendingTags: state.trendingTags,
  dynamicProps: state.dynamicProps,
  entries: state.entries,
  community: state.community,
  users: state.users,
  activeUser: state.activeUser,
  reblogs: state.reblogs,
  ui: state.ui,
  subscriptions: state.subscriptions,
  notifications: state.notifications
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      toggleTheme,
      hideIntro,
      toggleListStyle,
      fetchEntries,
      fetchCommunity,
      resetCommunity,
      fetchTrendingTags,
      addAccount,
      updateEntry,
      addUser,
      setActiveUser,
      updateActiveUser,
      deleteUser,
      addReblog,
      toggleUIProp,
      updateSubscriptions,
      fetchNotifications,
      fetchUnreadNotificationCount,
      setNotificationsFilter
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EntryIndexPage);
