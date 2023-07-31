import React, { Component, Fragment } from "react";
import { Button, Form } from "react-bootstrap";
import moment from "moment";
import { History } from "history";
import { hiveNotifySetLastRead } from "../../api/operations";
import { history } from "../../store";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { ToggleType } from "../../store/ui/types";
import { NotificationFilter, Notifications } from "../../store/notifications/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { ActiveUser } from "../../store/active-user/types";
import LinearProgress from "../linear-progress";
import DropDown from "../dropdown";
import Tooltip from "../tooltip";
import { _t } from "../../i18n";
import _c from "../../util/fix-class-names";
import { checkSvg, playListAddCheck, settingsSvg, syncSvg } from "../../img/svg";
import { NotificationViewType, NotifyTypes } from "../../enums";
import NotificationListItem from "./notification-list-item";
import {
  fetchNotifications,
  setNotificationsSettingsItem,
  updateNotificationsSettings
} from "../../store/notifications";
import { useMappedStore } from "../../store/use-mapped-store";
import "./_index.scss";
import { useLocation } from "react-router";
import { Modal, ModalBody } from "../modal";

export const date2key = (s: string): string => {
  if (s === "Yesterday") {
    return moment().subtract(1, "days").fromNow();
  }

  if (s.indexOf("hours") > -1) {
    const h = parseInt(s, 10);
    return moment().subtract(h, "hours").fromNow();
  }

  if (s.split("-").length === 3) {
    return moment.utc(s).fromNow();
  }

  const gt = _t(`notifications.group-title-${s.toLowerCase()}`);
  if (gt) {
    return gt;
  }

  return s;
};

interface NotificationProps {
  global: Global;
  history: History;
  activeUser: ActiveUser;
  dynamicProps: DynamicProps;
  notifications: Notifications;
  fetchNotifications: (since: string | null) => void;
  fetchUnreadNotificationCount: () => void;
  setNotificationsFilter: (filter: NotificationFilter | null) => void;
  markNotifications: (id: string | null) => void;
  toggleUIProp: (what: ToggleType) => void;
  addAccount: (data: Account) => void;
  muteNotifications: () => void;
  unMuteNotifications: () => void;
  updateNotificationsSettings: typeof updateNotificationsSettings;
  setNotificationsSettingsItem: typeof setNotificationsSettingsItem;
  className: string;
  openLinksInNewTab?: boolean;
}

export class DialogContent extends Component<NotificationProps, any> {
  constructor(props: NotificationProps) {
    super(props);
    this.state = {
      settings: {
        [NotifyTypes.COMMENT]: false,
        [NotifyTypes.FOLLOW]: false,
        [NotifyTypes.MENTION]: false,
        [NotifyTypes.FAVORITES]: false,
        [NotifyTypes.BOOKMARKS]: false,
        [NotifyTypes.VOTE]: false,
        [NotifyTypes.RE_BLOG]: false,
        [NotifyTypes.TRANSFERS]: false,
        [NotifyTypes.ALLOW_NOTIFY]: false
      },
      saveSettingsWithDebounce: null,
      currentStatus: "All",
      select: false,
      isSelectIcon: false,
      selectedNotifications: [],
      inProgress: false
    };
  }

  componentDidMount() {
    const { notifications, fetchNotifications } = this.props;

    if (notifications.list.length === 0) {
      fetchNotifications(null);
    } else if (this.props.notifications.unread > 0) {
      const unreadCount = notifications.list.filter((n) => n.read === 0).length;

      if (unreadCount !== this.props.notifications.unread) {
        fetchNotifications(null);
      }
    }

    this.prepareSettings();
  }

  componentDidUpdate(
    prevProps: Readonly<NotificationProps>,
    prevState: Readonly<{ settings: { [p: number]: boolean } }>,
    snapshot?: any
  ) {
    this.prepareSettings();

    if (
      this.props.notifications.unread > 0 &&
      this.props.notifications.unread !== prevProps.notifications.unread
    ) {
      fetchNotifications(null);
    }
    if (prevProps.notifications.settings !== this.props.notifications.settings) {
      const { notifications } = this.props;
      notifications.settings?.allows_notify === 0 ? this.mute() : this.unMute();
    }
  }

  setIsSelectIcon = () => {
    const { selectedNotifications } = this.state;
    this.setState({ isSelectIcon: selectedNotifications.length > 0 });
  };

  setSelectedNotifications = (id: string) => {
    const { selectedNotifications } = this.state;
    const index = selectedNotifications.indexOf(id);
    if (index === -1) {
      this.setState(
        { selectedNotifications: [...this.state.selectedNotifications, id] },
        this.setIsSelectIcon
      );
    } else {
      const newSelectedNotifications = [...selectedNotifications];
      newSelectedNotifications.splice(index, 1);
      this.setState({ selectedNotifications: newSelectedNotifications }, this.setIsSelectIcon);
    }
  };

  prepareSettings = () => {
    const { notifications } = this.props;
    if (notifications.settings) {
      const settings = {
        [NotifyTypes.ALLOW_NOTIFY]: notifications.settings.allows_notify === 1
      };
      Object.keys(this.state.settings)
        .filter((key) => key !== NotifyTypes.ALLOW_NOTIFY)
        .forEach((type) => {
          const isTurnedOn = (notifications.settings?.notify_types || []).includes(+type);
          if (isTurnedOn !== this.state.settings[type]) {
            settings[type] = isTurnedOn;
          }
        });
      const hasAtLeastOneChange =
        Object.keys(settings).filter((key) => key !== NotifyTypes.ALLOW_NOTIFY).length > 0;
      const allowsNotifyChanged =
        (notifications.settings.allows_notify === 1) !==
        this.state.settings[NotifyTypes.ALLOW_NOTIFY];
      if (hasAtLeastOneChange || allowsNotifyChanged) {
        this.setState({
          settings: {
            ...this.state.settings,
            ...settings
          }
        });
      }
    }
  };

  loadMore = () => {
    const { notifications, fetchNotifications } = this.props;
    if (!notifications.hasMore || notifications.loading) {
      return;
    }

    const last = [...notifications.list].pop();
    if (!last) {
      return;
    }

    const { id: since } = last;

    fetchNotifications(since);
  };

  refresh = () => {
    const { fetchNotifications, fetchUnreadNotificationCount } = this.props;
    fetchNotifications(null);
    fetchUnreadNotificationCount();
  };

  markAsRead = () => {
    const { markNotifications, activeUser } = this.props;
    markNotifications(null);
    hiveNotifySetLastRead(activeUser.username).then();
  };

  hide = () => {
    const { toggleUIProp } = this.props;
    toggleUIProp("login");
  };

  mute = () => {
    const { muteNotifications } = this.props;
    muteNotifications();
  };

  unMute = () => {
    const { unMuteNotifications } = this.props;
    unMuteNotifications();
  };

  saveSettings = () => {
    const { updateNotificationsSettings, activeUser } = this.props;
    updateNotificationsSettings(activeUser.username);
  };

  saveSettingsWithDebounce = (type: NotifyTypes) => {
    const { setNotificationsSettingsItem } = this.props;

    setNotificationsSettingsItem(type, !this.state.settings[type]);

    if (this.state.saveSettingsWithDebounce) {
      clearTimeout(this.state.saveSettingsWithDebounce);
    }

    this.setState({
      saveSettingsWithDebounce: setTimeout(() => {
        this.saveSettings();
        this.setState({
          saveSettingsWithDebounce: null
        });
      }, 1000)
    });
  };

  statusClicked = (status: string) => {
    this.setState({
      currentStatus: status,
      select: false,
      isSelectIcon: false,
      selectedNotifications: []
    });
  };

  handleScroll = (event: React.UIEvent<HTMLElement>) => {
    const { notifications } = this.props;
    const { hasMore } = notifications;
    var element = event.currentTarget;
    let scrollHeight: number = (element.scrollHeight / 100) * 75;
    if (element.scrollTop >= scrollHeight && hasMore) {
      this.loadMore();
    }
  };

  selectClicked = () => {
    this.setState({ select: !this.state.select }, this.handleSelectedNotifications);
  };

  handleSelectedNotifications = () => {
    if (!this.state.select) {
      this.setState({ selectedNotifications: [], isSelectIcon: false });
    }
  };

  markNotifications = () => {
    this.setState({ inProgress: true });
    const { selectedNotifications } = this.state;
    const { markNotifications } = this.props;
    for (const id of selectedNotifications) {
      markNotifications(id);
    }
    this.setState({ inProgress: false, isSelectIcon: false, select: false });
  };

  render() {
    const filters = Object.values(NotificationFilter);
    const menuItems = [
      {
        label: _t("notifications.type-all-short"),
        onClick: () => {
          const { setNotificationsFilter, fetchNotifications } = this.props;
          setNotificationsFilter(null);
          fetchNotifications(null);
        }
      },
      ...filters.map((f) => {
        return {
          label: _t(`notifications.type-${f}`),
          onClick: () => {
            const { setNotificationsFilter, fetchNotifications } = this.props;
            setNotificationsFilter(f);
            fetchNotifications(null);
          }
        };
      })
    ];

    const getNotificationSettingsItem = (title: string, type: NotifyTypes) => ({
      label: _t(title),
      content: (
        <Form.Check
          type="switch"
          checked={this.state.settings[type]}
          onChange={() => this.saveSettingsWithDebounce(type)}
        />
      ),
      onClick: () => this.saveSettingsWithDebounce(type)
    });
    const dropDownConfig = {
      history: this.props.history || history,
      label: "",
      items: menuItems
    };

    const { notifications } = this.props;
    const { inProgress, select, currentStatus } = this.state;
    const { list, loading, filter, unread } = notifications;

    return (
      <div className="notification-list">
        <div className="list-header">
          <div className="list-filter list-actions">
            <span>
              {filter ? _t(`notifications.type-${filter}`) : _t("notifications.type-all")}
            </span>
            <DropDown {...dropDownConfig} float="left" />
          </div>
          <div className="list-actions">
            {!this.props.global.isMobile ? (
              <>
                <Tooltip content={_t("notifications.mark-all-read")}>
                  <span
                    className={_c(`list-action ${loading || unread === 0 ? "disabled" : ""}`)}
                    onClick={() => this.markAsRead()}
                  >
                    {checkSvg}
                  </span>
                </Tooltip>
                <Tooltip content={_t("notifications.refresh")}>
                  <span
                    className={_c(`list-action ${loading ? "disabled" : ""}`)}
                    onClick={() => this.refresh()}
                  >
                    {syncSvg}
                  </span>
                </Tooltip>
              </>
            ) : (
              <></>
            )}

            <DropDown
              className={"settings"}
              header={_t(`notifications.settings`)}
              withPadding={true}
              items={[
                ...(this.props.global.isMobile
                  ? [
                      {
                        label: _t(`notifications.mark-all-read`),
                        isStatic: true,
                        content: (
                          <div className="list-actions">
                            <Tooltip content={_t("notifications.mark-all-read")}>
                              <span
                                className={_c(
                                  `list-action ${loading || unread === 0 ? "disabled" : ""}`
                                )}
                              >
                                {checkSvg}
                              </span>
                            </Tooltip>
                          </div>
                        ),
                        onClick: () => this.markAsRead()
                      },
                      {
                        label: _t(`notifications.refresh`),
                        isStatic: true,
                        content: (
                          <div className="list-actions">
                            <Tooltip content={_t("notifications.refresh")}>
                              <span className={_c(`list-action ${loading ? "disabled" : ""}`)}>
                                {syncSvg}
                              </span>
                            </Tooltip>
                          </div>
                        ),
                        onClick: () => this.refresh()
                      }
                    ]
                  : []),
                // getNotificationSettingsItem(_t(`notifications.type-all-short`), NotifyTypes.ALLOW_NOTIFY),
                getNotificationSettingsItem(_t(`notifications.type-rvotes`), NotifyTypes.VOTE),
                getNotificationSettingsItem(_t(`notifications.type-replies`), NotifyTypes.COMMENT),
                getNotificationSettingsItem(_t(`notifications.type-mentions`), NotifyTypes.MENTION),
                getNotificationSettingsItem(
                  _t(`notifications.type-nfavorites`),
                  NotifyTypes.FAVORITES
                ),
                getNotificationSettingsItem(
                  _t(`notifications.type-nbookmarks`),
                  NotifyTypes.BOOKMARKS
                ),
                getNotificationSettingsItem(_t(`notifications.type-reblogs`), NotifyTypes.RE_BLOG),
                getNotificationSettingsItem(_t(`notifications.type-follows`), NotifyTypes.FOLLOW),
                getNotificationSettingsItem(
                  _t(`notifications.type-transfers`),
                  NotifyTypes.TRANSFERS
                )
              ]}
              menuHide={false}
              history={this.props.history || history}
              label={
                <span className={_c(`list-action ${loading ? "disabled" : ""}`)}>
                  {settingsSvg}
                </span>
              }
              float="right"
            />
          </div>
        </div>

        <div className="status-button-container">
          <div className="status-btn">
            {Object.values(NotificationViewType).map((status: string, k: number) => {
              return (
                <Button
                  className={`status-button ${
                    this.state.currentStatus === status ? "active" : ""
                  } shadow-none`}
                  variant="outline-primary"
                  key={k}
                  type="button"
                  tabIndex={-1}
                  onClick={() => this.statusClicked(status)}
                >
                  {status}
                </Button>
              );
            })}
          </div>

          <div className="select-buttons">
            {this.state.isSelectIcon && (
              <Tooltip content={_t("notifications.mark-selected-read")}>
                <span className="mark-svg" onClick={() => this.markNotifications()}>
                  {playListAddCheck}
                </span>
              </Tooltip>
            )}

            <Tooltip
              content={
                this.state.select ? _t("notifications.unselect") : _t("notifications.select")
              }
            >
              <span
                className={`select-svg ${this.state.select ? "active" : ""} shadow-none`}
                onClick={this.selectClicked}
              >
                {checkSvg}
              </span>
            </Tooltip>
          </div>
        </div>

        {loading || inProgress ? <LinearProgress /> : <></>}

        {!loading && list.length === 0 && (
          <div className="list-body empty-list">
            <span className="empty-text">{_t("g.empty-list")}</span>
          </div>
        )}

        {list.length > 0 && (
          <div className="list-body" onScroll={this.handleScroll}>
            {list.map((n) => (
              <Fragment key={n.id}>
                {this.state.currentStatus === NotificationViewType.ALL && (
                  <>
                    {n.gkf && <div className="group-title">{date2key(n.gk)}</div>}
                    <NotificationListItem
                      {...this.props}
                      notification={n}
                      isSelect={select}
                      currentStatus={currentStatus}
                      setSelectedNotifications={this.setSelectedNotifications}
                      openLinksInNewTab={this.props.openLinksInNewTab}
                    />
                  </>
                )}
                {this.state.currentStatus === NotificationViewType.READ && n.read === 1 && (
                  <>
                    {n.gkf && <div className="group-title">{date2key(n.gk)}</div>}
                    <NotificationListItem
                      {...this.props}
                      notification={n}
                      isSelect={select}
                      currentStatus={currentStatus}
                      setSelectedNotifications={this.setSelectedNotifications}
                      openLinksInNewTab={this.props.openLinksInNewTab}
                    />
                  </>
                )}
                {this.state.currentStatus === NotificationViewType.UNREAD && n.read === 0 && (
                  <>
                    {n.gkf && <div className="group-title">{date2key(n.gk)}</div>}
                    <NotificationListItem
                      {...this.props}
                      notification={n}
                      isSelect={select}
                      currentStatus={currentStatus}
                      setSelectedNotifications={this.setSelectedNotifications}
                      openLinksInNewTab={this.props.openLinksInNewTab}
                    />
                  </>
                )}
              </Fragment>
            ))}
          </div>
        )}
        {loading && list.length > 0 && <LinearProgress />}
      </div>
    );
  }
}

class NotificationsDialog extends Component<NotificationProps> {
  hide = () => {
    const { toggleUIProp } = this.props;
    toggleUIProp("notifications");
  };

  render() {
    return (
      <Modal
        show={true}
        centered={true}
        onHide={this.hide}
        className={"notifications-modal drawer " + this.props.className}
      >
        <ModalBody>
          <DialogContent {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}

export default ({
  history,
  openLinksInNewTab
}: Pick<NotificationProps, "history" | "openLinksInNewTab">) => {
  const {
    global,
    activeUser,
    dynamicProps,
    notifications,
    fetchNotifications,
    fetchUnreadNotificationCount,
    setNotificationsFilter,
    markNotifications,
    toggleUIProp,
    addAccount,
    muteNotifications,
    unMuteNotifications,
    updateNotificationsSettings,
    setNotificationsSettingsItem
  } = useMappedStore();
  const location = useLocation();

  return (
    <NotificationsDialog
      className={location.pathname === "/decks" ? "in-decks-page" : ""}
      global={global}
      history={history}
      activeUser={activeUser!!}
      dynamicProps={dynamicProps}
      notifications={notifications}
      fetchNotifications={fetchNotifications}
      fetchUnreadNotificationCount={fetchUnreadNotificationCount}
      setNotificationsFilter={setNotificationsFilter}
      markNotifications={markNotifications}
      toggleUIProp={toggleUIProp}
      addAccount={addAccount}
      muteNotifications={muteNotifications}
      unMuteNotifications={unMuteNotifications}
      updateNotificationsSettings={updateNotificationsSettings}
      setNotificationsSettingsItem={setNotificationsSettingsItem}
      openLinksInNewTab={openLinksInNewTab}
    />
  );
};
