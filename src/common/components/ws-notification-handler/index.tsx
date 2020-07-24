import React, {Component} from "react";

import {ActiveUser} from "../../store/active-user/types";
import {WsNotification} from "../../store/notifications/types";

import defaults from "../../constants/defaults.json"

import {_t} from "../../i18n";

interface NwsWindow extends Window {
    nws?: WebSocket | undefined;
}

declare var window: NwsWindow;

export const notificationBody = (data: WsNotification): string => {
    const {source} = data;

    switch (data.type) {
        case 'vote':
            return _t('notification.voted', {source});
        case 'mention':
            return data.extra.is_post === 1
                ? _t('notification.mention-post', {source})
                : _t('notification.mention-comment', {source});
        case 'follow':
            return _t('notification.followed', {source});
        case 'reply':
            return _t('notification.replied', {source});
        case 'reblog':
            return _t('notification.reblogged', {source});
        case 'transfer':
            return _t('notification.transfer', {source, amount: data.extra.amount});
        default:
            return '';
    }
};


interface Props {
    activeUser: ActiveUser | null;
    fetchUnreadNotificationCount: () => void;
}

export default class NotificationHandler extends Component<Props> {
    componentDidMount() {
        this.nwsConnect();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        const {activeUser, fetchUnreadNotificationCount} = this.props;

        if (activeUser?.username !== prevProps.activeUser?.username) {
            this.nwsDisconnect();
            this.nwsConnect();

            if (activeUser) {
                fetchUnreadNotificationCount();
            }
        }
    }

    nwsConnect = () => {
        const {activeUser} = this.props;
        if (!activeUser) {
            this.nwsDisconnect();
            return;
        }

        if (window.nws !== undefined) {
            return;
        }

        if ('Notification' in window) {
            Notification.requestPermission().then();
        }

        window.nws = new WebSocket(`${defaults.nwsServer}/ws?user=${activeUser.username}`);

        window.nws.onopen = () => {
            console.log("nws connected");
        }

        window.nws.onmessage = (evt: MessageEvent) => {
            const data = JSON.parse(evt.data);
            const msg = notificationBody(data);

            if (msg) {
                new Notification(_t('notification.popup-title'), {
                    body: msg
                }).onclick = () => {
                    // Open activities here
                };
            }

        }

        window.nws.onclose = (evt: CloseEvent) => {
            console.log('nws disconnected');

            window.nws = undefined;

            if (!evt.wasClean) {
                // Disconnected due connection error
                console.log('nws trying to reconnect');

                setTimeout(() => {
                    this.nwsConnect();
                }, 2000);
            }
        };
    }

    nwsDisconnect = () => {
        if (window.nws !== undefined) {
            window.nws.close();
            window.nws = undefined;
        }
    }

    render() {
        return null;
    }
}
