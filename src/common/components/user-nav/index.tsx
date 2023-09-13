import React, { Component } from "react";
import { History, Location } from "history";
import { Link } from "react-router-dom";

import { Global } from "../../store/global/types";
import { User } from "../../store/users/types";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";
import { ToggleType, UI } from "../../store/ui/types";
import { NotificationFilter, Notifications } from "../../store/notifications/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import ToolTip from "../tooltip";
import UserAvatar from "../user-avatar";
import DropDown from "../dropdown";
import UserNotifications from "../notifications";
import Gallery from "../gallery";
import Drafts from "../drafts";
import Bookmarks from "../bookmarks";
import Schedules from "../schedules";
import Fragments from "../fragments";

import { _t } from "../../i18n";

import HiveWallet from "../../helper/hive-wallet";

import {
  creditCardSvg,
  gifCardSvg,
  bellSvg,
  bellOffSvg,
  chevronUpSvg,
  rocketSvg,
  messangerSvg
} from "../../img/svg";

import { votingPower, downVotingPower } from "../../api/hive";
import {
  updateNotificationsSettings,
  setNotificationsSettingsItem
} from "../../store/notifications";
import { PurchaseQrDialog } from "../purchase-qr";
import { useMappedStore } from "../../store/use-mapped-store";
import { useLocation } from "react-router";
import "./_index.scss";

export class WalletBadge extends Component<{
  activeUser: ActiveUser;
  dynamicProps: DynamicProps;
  icon?: JSX.Element;
}> {
  render() {
    const { activeUser, dynamicProps } = this.props;

    let hasUnclaimedRewards = false;
    const { data: account } = activeUser;

    if (account.__loaded) {
      hasUnclaimedRewards = new HiveWallet(account, dynamicProps).hasUnclaimedRewards;
    }

    return (
      <>
        <ToolTip
          content={
            hasUnclaimedRewards ? _t("user-nav.unclaimed-reward-notice") : _t("user-nav.wallet")
          }
        >
          <Link to={`/@${activeUser.username}/wallet`} className="user-wallet">
            {hasUnclaimedRewards && <span className="reward-badge" />}
            {this.props.icon ?? creditCardSvg}
          </Link>
        </ToolTip>
      </>
    );
  }
}

class PointsBadge extends Component<{ activeUser: ActiveUser }> {
  render() {
    const { activeUser } = this.props;

    let hasUnclaimedPoints = activeUser.points.uPoints !== "0.000";

    return (
      <>
        <ToolTip
          content={
            hasUnclaimedPoints ? _t("user-nav.unclaimed-points-notice") : _t("user-nav.points")
          }
        >
          <Link to={`/@${activeUser.username}/points`} className="user-points">
            {hasUnclaimedPoints && <span className="reward-badge" />}
            {gifCardSvg}
          </Link>
        </ToolTip>
      </>
    );
  }
}

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  history: History;
  location: Location;
  users: User[];
  ui: UI;
  activeUser: ActiveUser;
  notifications: Notifications;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  addAccount: (data: Account) => void;
  fetchNotifications: (since: string | null) => void;
  fetchUnreadNotificationCount: () => void;
  setNotificationsFilter: (filter: NotificationFilter | null) => void;
  markNotifications: (id: string | null) => void;
  toggleUIProp: (what: ToggleType) => void;
  muteNotifications: () => void;
  unMuteNotifications: () => void;
  updateNotificationsSettings: typeof updateNotificationsSettings;
  setNotificationsSettingsItem: typeof setNotificationsSettingsItem;
}

interface State {
  gallery: boolean;
  drafts: boolean;
  bookmarks: boolean;
  schedules: boolean;
  fragments: boolean;
  showPurchaseDialog: boolean;
}

class UserNav extends Component<Props, State> {
  state: State = {
    gallery: false,
    drafts: false,
    bookmarks: false,
    schedules: false,
    fragments: false,
    showPurchaseDialog: false
  };

  toggleLogin = () => {
    const { toggleUIProp } = this.props;
    toggleUIProp("login");
  };

  toggleDrafts = () => {
    const { drafts } = this.state;
    this.setState({ drafts: !drafts });
  };

  toggleGallery = () => {
    const { gallery } = this.state;
    this.setState({ gallery: !gallery });
  };

  toggleBookmarks = () => {
    const { bookmarks } = this.state;
    this.setState({ bookmarks: !bookmarks });
  };

  toggleSchedules = () => {
    const { schedules } = this.state;
    this.setState({ schedules: !schedules });
  };

  toggleFragments = () => {
    const { fragments } = this.state;
    this.setState({ fragments: !fragments });
  };

  toggleNotifications = () => {
    const { toggleUIProp } = this.props;
    toggleUIProp("notifications");
  };

  goToSettings = () => {
    const { activeUser, history } = this.props;
    history.push(`/@${activeUser.username}/settings`);
  };

  render() {
    const { gallery, drafts, bookmarks, schedules, fragments } = this.state;
    const { activeUser, ui, notifications, global, dynamicProps } = this.props;
    const { unread } = notifications;

    const preDropDownElem = activeUser.data.__loaded ? (
      <div className="drop-down-menu-power">
        <div className="label">{_t("user-nav.vote-power")}</div>
        <div className="power">
          <div className="voting">
            {chevronUpSvg}
            {votingPower(activeUser.data).toFixed(0)}
            {"%"}
          </div>
          <div className="downVoting">
            {chevronUpSvg}
            {downVotingPower(activeUser.data).toFixed(0)}
            {"%"}
          </div>
        </div>
      </div>
    ) : undefined;

    const dropDownItems = [
      {
        label: _t("user-nav.profile"),
        href: `/@${activeUser.username}`
      },
      ...(global.usePrivate
        ? [
            {
              label: _t("user-nav.drafts"),
              onClick: this.toggleDrafts
            },
            {
              label: _t("user-nav.gallery"),
              onClick: this.toggleGallery
            },
            {
              label: _t("user-nav.bookmarks"),
              onClick: this.toggleBookmarks
            },
            {
              label: _t("user-nav.schedules"),
              onClick: this.toggleSchedules
            },
            {
              label: _t("user-nav.fragments"),
              onClick: this.toggleFragments
            }
          ]
        : []),
      {
        label: _t("user-nav.settings"),
        onClick: this.goToSettings
      },
      {
        label: _t("g.login-as"),
        onClick: this.toggleLogin
      },
      {
        label: _t("user-nav.logout"),
        onClick: () => {
          const { setActiveUser } = this.props;
          setActiveUser(null);
        }
      }
    ];

    const dropDownConfig = {
      history: this.props.history,
      label: <UserAvatar username={activeUser.username} size="medium" />,
      items: dropDownItems,
      preElem: preDropDownElem
    };

    return (
      <>
        <div className="user-nav">
          {global.usePrivate && (
            <div
              onClick={() => this.setState({ showPurchaseDialog: true })}
              className="user-points cursor-pointer"
            >
              {rocketSvg}
            </div>
          )}
          <WalletBadge activeUser={activeUser} dynamicProps={dynamicProps} />

          {global.usePrivate && (
            <>
              <ToolTip content={_t("user-nav.notifications")}>
                <span className="notifications" onClick={this.toggleNotifications}>
                  {unread > 0 && (
                    <span className="notifications-badge notranslate">
                      {unread.toString().length < 3 ? unread : "..."}
                    </span>
                  )}
                  {global.notifications ? bellSvg : bellOffSvg}
                </span>
              </ToolTip>
              <ToolTip content={_t("user-nav.chats")}>
                <Link to={`/chats`}>
                  <span className="chats">{messangerSvg}</span>
                </Link>
              </ToolTip>
            </>
          )}

          <DropDown {...dropDownConfig} float="right" header={`@${activeUser.username}`} />
        </div>
        {ui.notifications && <UserNotifications {...this.props} />}
        {gallery && <Gallery {...this.props} onHide={this.toggleGallery} />}
        {drafts && <Drafts {...this.props} onHide={this.toggleDrafts} />}
        {bookmarks && <Bookmarks {...this.props} onHide={this.toggleBookmarks} />}
        {schedules && <Schedules {...this.props} onHide={this.toggleSchedules} />}
        {fragments && <Fragments {...this.props} onHide={this.toggleFragments} />}
        <PurchaseQrDialog
          show={this.state.showPurchaseDialog}
          setShow={(v) => this.setState({ showPurchaseDialog: v })}
          activeUser={activeUser}
          location={this.props.location}
        />
      </>
    );
  }
}

export default ({ history }: Pick<Props, "history">) => {
  const {
    global,
    dynamicProps,
    users,
    ui,
    activeUser,
    notifications,
    setActiveUser,
    updateActiveUser,
    deleteUser,
    addAccount,
    fetchNotifications,
    fetchUnreadNotificationCount,
    setNotificationsFilter,
    markNotifications,
    toggleUIProp,
    muteNotifications,
    unMuteNotifications,
    updateNotificationsSettings,
    setNotificationsSettingsItem
  } = useMappedStore();
  const location = useLocation();

  return (
    <UserNav
      global={global}
      dynamicProps={dynamicProps}
      history={history}
      location={location}
      users={users}
      ui={ui}
      activeUser={activeUser!!}
      notifications={notifications}
      setActiveUser={setActiveUser}
      updateActiveUser={updateActiveUser}
      deleteUser={deleteUser}
      addAccount={addAccount}
      fetchNotifications={fetchNotifications}
      fetchUnreadNotificationCount={fetchUnreadNotificationCount}
      setNotificationsFilter={setNotificationsFilter}
      markNotifications={markNotifications}
      toggleUIProp={toggleUIProp}
      muteNotifications={muteNotifications}
      unMuteNotifications={unMuteNotifications}
      updateNotificationsSettings={updateNotificationsSettings}
      setNotificationsSettingsItem={setNotificationsSettingsItem}
    />
  );
};
