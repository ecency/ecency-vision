import React, {Component} from "react";

import {AppWindow} from "../../../client/window";

import {Global} from "../../store/global/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType, UI} from "../../store/ui/types";
import {Notifications, WsNotification} from "../../store/notifications/types";

import defaults from "../../constants/defaults.json"

import {_t} from "../../i18n";

declare var window: AppWindow;

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
    global: Global;
    activeUser: ActiveUser | null;
    ui: UI;
    notifications: Notifications;
    fetchNotifications: (since: string | null) => void;
    fetchUnreadNotificationCount: () => void;
    toggleUIProp: (what: ToggleType) => void;
}

export default class NotificationHandler extends Component<Props> {
    componentDidMount() {
        this.nwsConnect();

        const {activeUser, notifications, fetchUnreadNotificationCount} = this.props;
        if (activeUser && notifications.unreadFetchFlag) {
            fetchUnreadNotificationCount();
        }
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
            Notification.requestPermission();
        }

        window.nws = new WebSocket(`${defaults.nwsServer}/ws?user=${activeUser.username}`);

        window.nws.onopen = () => {
            console.log("nws connected");
        }

        window.nws.onmessage = (evt: MessageEvent) => {
            const {global} = this.props;
            const logo = global.isElectron ? "./img/logo-circle.svg" :  require('../../img/logo-circle.svg');


            const data = JSON.parse(evt.data);
            const msg = notificationBody(data);

            if (msg) {
                const {fetchUnreadNotificationCount, fetchNotifications} = this.props;

                fetchUnreadNotificationCount();
                fetchNotifications(null);

                if (!global.notifications) {
                    return;
                }

                this.playSound();

                new Notification(_t('notification.popup-title'), {
                    body: msg,
                    icon: logo
                }).onclick = () => {
                    const {ui, toggleUIProp} = this.props;
                    if (!ui.notifications) {
                        toggleUIProp('notifications');
                    }
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

    playSound = () => {
        if ('Notification' in window) {
            const req = Notification.requestPermission();
            if (!req) {
                // safari may return undefined instead of promise
                return;
            }
            req.then((r) => {
                if (r !== 'granted') return;
                const el: HTMLAudioElement = document.getElementById('notification-audio')! as HTMLAudioElement;
                el.muted = false;
                el.play().then();
            })
        }
    }

    nwsDisconnect = () => {
        if (window.nws !== undefined) {
            window.nws.close();
            window.nws = undefined;
        }
    }

    render() {

        const notificationSound = this.props.global.isElectron ? "./img/notification.mp3" :  require("../../img/notification.mp3");
        
        return <audio id="notification-audio" autoPlay={false} src={notificationSound} muted={true} style={{display: 'none'}}/>;
    }
}
