import React, { Component } from 'react';
import { Global } from '../../store/global/types';
import { ActiveUser } from '../../store/active-user/types';
import { ToggleType, UI } from '../../store/ui/types';
import { Notifications } from '../../store/notifications/types';

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  ui: UI;
  notifications: Notifications;
  fetchNotifications: (since: string | null) => void;
  fetchUnreadNotificationCount: () => void;
  toggleUIProp: (what: ToggleType) => void;
  fetchNotificationsSettings: (username: string) => void;
}

export default class NotificationHandler extends Component<Props> {
  componentDidMount() {
    const { activeUser, notifications, fetchUnreadNotificationCount, fetchNotificationsSettings } = this.props;
    if (activeUser) {
      fetchNotificationsSettings(activeUser!!.username);
    }
    if (activeUser && notifications.unreadFetchFlag) {
      fetchUnreadNotificationCount();
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
    const { activeUser, fetchUnreadNotificationCount, fetchNotificationsSettings } = this.props;
    if (!prevProps.activeUser && activeUser && activeUser.username) {
      fetchUnreadNotificationCount();
    }

    if (activeUser?.username !== prevProps.activeUser?.username) {
      if (activeUser) {
        fetchNotificationsSettings(activeUser!!.username);
        fetchUnreadNotificationCount();
      }
    }
  }

  render() {
    return <></>
  }
}
