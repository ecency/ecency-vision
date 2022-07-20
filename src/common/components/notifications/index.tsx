import React, { Component, Fragment } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
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
import { setNotificationsSettingsItem, updateNotificationsSettings } from '../../store/notifications';

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
  setNotificationsSettingsItem: typeof setNotificationsSettingsItem;
}

export class DialogContent extends Component<NotificationProps, any> {
  constructor(props: NotificationProps) {
    super(props);
    this.state = {
      settings: {
        [NotifyTypes.COMMENT]: false,
        [NotifyTypes.FOLLOW]: false,
        [NotifyTypes.MENTION]: false,
        [NotifyTypes.VOTE]: false,
        [NotifyTypes.RE_BLOG]: false,
        [NotifyTypes.TRANSFERS]: false
      },
      saveSettingsWithDebounce: null,
    };
  }

  componentDidMount() {
    const { notifications, fetchNotifications } = this.props;

    if (notifications.list.length === 0) {
      fetchNotifications(null);
    }

    this.prepareSettings();
  }

  componentDidUpdate(prevProps: Readonly<NotificationProps>, prevState: Readonly<{ settings: { [p: number]: boolean } }>, snapshot?: any) {
    this.prepareSettings();
  }

  prepareSettings = () => {
    const { notifications } = this.props;
    if (notifications.settings) {
      const settings = {};
      Object.keys(this.state.settings)
        .forEach(type => {
          const isTurnedOn = (notifications.settings?.notify_types || []).includes(+type);
          if (isTurnedOn !== this.state.settings[type]) {
            settings[type] = isTurnedOn;
          }
        });
      if (Object.keys(settings).length > 0) {
        this.setState({
          settings: {
            ...this.state.settings,
            ...settings,
          },
        });
      }
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

  saveSettings = () => {
    const { updateNotificationsSettings, activeUser } = this.props;
    updateNotificationsSettings(activeUser.username);
  }

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
          saveSettingsWithDebounce: null,
        });
      }, 500)
    });
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
      label: _t(title),
      content: <Form.Check
        type="switch"
        checked={this.state.settings[type]}
        onChange={() => this.saveSettingsWithDebounce(type)}
      />,
      onClick: () => this.saveSettingsWithDebounce(type)
    });
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
              className={'settings'}
              header="Settings"
              items={[
                getNotificationSettingsItem('Votes', NotifyTypes.VOTE),
                getNotificationSettingsItem('Comments', NotifyTypes.COMMENT),
                getNotificationSettingsItem('Mentions', NotifyTypes.MENTION),
                getNotificationSettingsItem('Re-blogs', NotifyTypes.RE_BLOG),
                getNotificationSettingsItem('Follows', NotifyTypes.FOLLOW),
                getNotificationSettingsItem('Transfers', NotifyTypes.TRANSFERS),
              ]}
              history={this.props.history || history}
              label={<span className={_c(`list-action ${loading ? 'disabled' : ''}`)}>{settingsSvg}</span>}
              float="right"
              notHideOnClick={true}
            />
            {/*{global.notifications && (*/}
            {/*  <Tooltip content={_t('notifications.mute')}>*/}
            {/*    <span className={_c(`list-action ${loading ? 'disabled' : ''}`)} onClick={this.mute}>{bellOffSvg}</span>*/}
            {/*  </Tooltip>*/}
            {/*)}*/}
            {/*{!global.notifications && (*/}
            {/*  <Tooltip content={_t('notifications.unmute')}>*/}
            {/*    <span className={_c(`list-action ${loading ? 'disabled' : ''}`)}*/}
            {/*          onClick={this.unMute}>{bellCheckSvg}</span>*/}
            {/*  </Tooltip>*/}
            {/*)}*/}
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