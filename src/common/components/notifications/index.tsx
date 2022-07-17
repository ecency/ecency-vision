import React, { Component, Fragment } from 'react';
import { Button, Modal } from 'react-bootstrap';
import moment from 'moment';
import { History } from 'history';
import { hiveNotifySetLastRead } from '../../api/operations';
import { history } from '../../store';
import { Global } from '../../store/global/types';
import { Account } from '../../store/accounts/types';
import { ToggleType } from '../../store/ui/types';
import { NotificationFilter, Notifications } from '../../store/notifications/types';
import { DynamicProps } from '../../store/dynamic-props/types';
import { ActiveUser } from '../../store/active-user/types';
import LinearProgress from '../linear-progress';
import DropDown from '../dropdown';
import Tooltip from '../tooltip';
import { _t } from '../../i18n';
import _c from '../../util/fix-class-names'
import { bellCheckSvg, bellOffSvg, checkSvg, settingsSvg, syncSvg } from '../../img/svg';
import { NotifyTypes } from '../../enums';
import NotificationListItem from './notification-list-item';
import { updateNotificationsSettings } from '../../store/notifications';


export const date2key = (s: string): string => {
  if (s === 'Yesterday') {
    return moment().subtract(1, 'days').fromNow();
  }

  if (s.indexOf('hours') > -1) {
    const h = parseInt(s, 10);
    return moment().subtract(h, 'hours').fromNow();

  }

  if (s.split('-').length === 3) {
    return moment.utc(s).fromNow()
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
}

export class DialogContent extends Component<NotificationProps> {
  componentDidMount() {
    const { notifications, fetchNotifications } = this.props;

    if (notifications.list.length === 0) {
      fetchNotifications(null);
    }
  }

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
  }

  refresh = () => {
    const { fetchNotifications, fetchUnreadNotificationCount } = this.props;
    fetchNotifications(null);
    fetchUnreadNotificationCount();
  }

  markAsRead = () => {
    const { markNotifications, activeUser } = this.props;
    markNotifications(null);
    hiveNotifySetLastRead(activeUser.username).then();
  }

  hide = () => {
    const { toggleUIProp } = this.props;
    toggleUIProp('login');
  }

  mute = () => {
    const { muteNotifications } = this.props;
    muteNotifications();
  }

  unMute = () => {
    const { unMuteNotifications } = this.props;
    unMuteNotifications();
  }

  saveSettings = (type: NotifyTypes) => {
    const { updateNotificationsSettings, activeUser, notifications } = this.props;
    const { settings } = notifications;
    const types = [...(settings?.notify_types || [])];
    updateNotificationsSettings(
      activeUser.username,
      types.includes(type) ? types.filter(t => t !== type) : [...types, type]
    );
  }

  muteAll = () => {
    const { updateNotificationsSettings, activeUser } = this.props;
    updateNotificationsSettings(activeUser.username, []);
  }

  enableAll = () => {
    const { updateNotificationsSettings, activeUser } = this.props;
    updateNotificationsSettings(activeUser.username, [
      NotifyTypes.COMMENT,
      NotifyTypes.FOLLOW,
      NotifyTypes.MENTION,
      NotifyTypes.VOTE,
      NotifyTypes.RE_BLOG,
      NotifyTypes.TRANSFERS,
    ]);
  }

  render() {
    const { settings } = this.props.notifications;

    const filters = Object.values(NotificationFilter);
    const menuItems = [
      {
        label: _t('notifications.type-all-short'),
        onClick: () => {
          const { setNotificationsFilter, fetchNotifications } = this.props;
          setNotificationsFilter(null);
          fetchNotifications(null);
        }
      },
      ...filters.map((f => {
        return {
          label: _t(`notifications.type-${f}`),
          onClick: () => {
            const { setNotificationsFilter, fetchNotifications } = this.props;
            setNotificationsFilter(f);
            fetchNotifications(null);
          }
        }
      }))
    ];

    const getNotificationSettingsItem = (title: string, type: NotifyTypes) => ({
      label: title,
      onClick: () => this.saveSettings(type),
      icon: <>{(settings?.notify_types || []).includes(type) ? bellOffSvg : bellCheckSvg}</>
    });
    const notificationSettingsItems = [
      getNotificationSettingsItem('Votes', NotifyTypes.VOTE),
      getNotificationSettingsItem('Comments', NotifyTypes.COMMENT),
      getNotificationSettingsItem('Mentions', NotifyTypes.MENTION),
      getNotificationSettingsItem('Re-blogs', NotifyTypes.RE_BLOG),
      getNotificationSettingsItem('Follows', NotifyTypes.FOLLOW),
      getNotificationSettingsItem('Transfers', NotifyTypes.TRANSFERS),
      ...((settings?.notify_types || []).length > 0 ?
        [{ label: 'Mute all', onClick: () => this.muteAll() }] :
        [{ label: 'Enable all', onClick: () => this.enableAll() }]),
    ];
    const dropDownConfig = {
      history: this.props.history || history,
      label: '',
      items: menuItems
    };

    const { notifications, global } = this.props;
    const { list, loading, filter, hasMore, unread } = notifications;

    return (
      <div className="notification-list">
        <div className="list-header">
          <div className="list-filter">
            <span>{filter ? _t(`notifications.type-${filter}`) : _t('notifications.type-all')}</span>
            <DropDown {...dropDownConfig} float="left"/>
          </div>
          <div className="list-actions">
            <DropDown
              header="Notification filters"
              items={notificationSettingsItems}
              history={this.props.history || history}
              label={<span className={_c(`list-action ${loading ? 'disabled' : ''}`)}>{settingsSvg}</span>}
              float="right"
            />
            {global.notifications && (
              <Tooltip content={_t('notifications.mute')}>
                <span className={_c(`list-action ${loading ? 'disabled' : ''}`)} onClick={this.mute}>{bellOffSvg}</span>
              </Tooltip>
            )}
            {!global.notifications && (
              <Tooltip content={_t('notifications.unmute')}>
                <span className={_c(`list-action ${loading ? 'disabled' : ''}`)}
                      onClick={this.unMute}>{bellCheckSvg}</span>
              </Tooltip>
            )}
            <Tooltip content={_t('notifications.refresh')}>
              <span className={_c(`list-action ${loading ? 'disabled' : ''}`)} onClick={this.refresh}>{syncSvg}</span>
            </Tooltip>
            <Tooltip content={_t('notifications.mark-all-read')}>
              <span className={_c(`list-action ${loading || unread === 0 ? 'disabled' : ''}`)}
                    onClick={this.markAsRead}>{checkSvg}</span>
            </Tooltip>
          </div>
        </div>

        {loading && <LinearProgress/>}

        {!loading && list.length === 0 && (
          <div className="list-body empty-list">
                        <span className="empty-text">
                            {_t('g.empty-list')}
                        </span>
          </div>
        )}

        {list.length > 0 && (
          <div className="list-body">
            {list.map(n => (
              <Fragment key={n.id}>
                {n.gkf && (<div className="group-title">{date2key(n.gk)}</div>)}
                <NotificationListItem {...this.props} notification={n}/>
              </Fragment>
            ))}

            {hasMore && (
              <div className="load-more">
                <Button disabled={loading} block={true} onClick={this.loadMore}>Load More</Button>
              </div>
            )}
          </div>
        )}
        {loading && list.length > 0 && <LinearProgress/>}
      </div>
    );
  }
}

export default class NotificationsDialog extends Component<NotificationProps> {

  hide = () => {
    const { toggleUIProp } = this.props;
    toggleUIProp('notifications');
  }

  render() {
    return (
      <Modal show={true} centered={true} onHide={this.hide} className="notifications-modal drawer">
        <Modal.Body>
          <DialogContent {...this.props}/>
        </Modal.Body>
      </Modal>
    );
  }
}