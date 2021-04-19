import React, {Component, Fragment} from "react";

import {Button, Modal} from "react-bootstrap";

import moment from "moment";

import {History} from "history";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {ToggleType} from "../../store/ui/types";
import {NotificationFilter, Notifications} from "../../store/notifications/types";

import {ApiNotification} from "../../store/notifications/types";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import EntryLink from "../entry-link";
import LinearProgress from "../linear-progress";
import DropDown from "../dropdown";
import Tooltip from "../tooltip";

import {postBodySummary} from "@ecency/render-helper";

import {_t} from "../../i18n";

import _c from '../../util/fix-class-names'

import {syncSvg, checkSvg, bellOffSvg, bellCheckSvg} from "../../img/svg";

import {hiveNotifySetLastRead} from "../../api/operations";
import {ActiveUser} from "../../store/active-user/types";

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

export class NotificationListItem extends Component<{
    global: Global;
    history: History;
    notification: ApiNotification;
    markNotifications: (id: string | null) => void;
    addAccount: (data: Account) => void;
    toggleUIProp: (what: ToggleType) => void;
}> {

    markAsRead = () => {
        const {notification, markNotifications} = this.props;

        if (notification.read === 0) {
            markNotifications(notification.id);
        }
    }

    afterClick = () => {
        const {toggleUIProp} = this.props;
        toggleUIProp("notifications");
        this.markAsRead();
    }

    render() {
        const {notification} = this.props;
        const sourceLinkMain = ProfileLink({
            ...this.props,
            username: notification.source,
            afterClick: this.afterClick,
            children: <a className="source-avatar">{UserAvatar({...this.props, username: notification.source, size: "medium"})}</a>
        });

        const sourceLink = ProfileLink({
            ...this.props,
            username: notification.source,
            afterClick: this.afterClick,
            children: <a className="source-name"> {notification.source}</a>
        });

        return <>
            <div className={_c(`list-item ${notification.read === 0 ? 'not-read' : ' '}`)}>
                <div className="item-inner">
                    <div className="item-control">
                        {notification.read === 0 && (
                            <Tooltip content={_t('notifications.mark-read')}>
                                <span onClick={this.markAsRead} className="mark-read"/>
                            </Tooltip>
                        )}
                    </div>

                    <div className="source">
                        {sourceLinkMain}
                    </div>

                    {/* Votes */}
                    {(notification.type === 'vote' || notification.type === 'unvote') && (
                        <div className="item-content">
                            <div className="first-line">
                                {sourceLink}
                                <span className="item-action">
                                    {_t('notifications.vote-str', {p: notification.weight / 100})}
                                </span>
                            </div>
                            <div className="second-line">
                                {EntryLink({
                                    ...this.props,
                                    entry: {category: 'category', author: notification.author, permlink: notification.permlink},
                                    afterClick: this.afterClick,
                                    children: <a className="post-link">{notification.permlink}</a>
                                })}
                            </div>
                        </div>
                    )}

                    {/* Replies */}
                    {notification.type === 'reply' && (
                        <div className="item-content">
                            <div className="first-line">
                                {sourceLink}
                                <span className="item-action">{_t('notifications.reply-str')}</span>
                                <div className="vert-separator"/>
                                {EntryLink({
                                    ...this.props,
                                    entry: {category: 'category', author: notification.parent_author, permlink: notification.parent_permlink},
                                    afterClick: this.afterClick,
                                    children: <a className="post-link">{notification.parent_permlink}</a>
                                })}
                            </div>
                            <div className="second-line">
                                {EntryLink({
                                    ...this.props,
                                    entry: {category: 'category', author: notification.author, permlink: notification.permlink},
                                    afterClick: this.afterClick,
                                    children: <div className="markdown-view mini-markdown reply-body">
                                        {postBodySummary(notification.body, 100)}
                                    </div>
                                })}
                            </div>
                        </div>
                    )}

                    {/* Mentions */}
                    {notification.type === 'mention' && (
                        <div className="item-content">
                            <div className="first-line">
                                {sourceLink}
                                <span className="item-action">{_t('notifications.mention-str')}</span>
                            </div>
                            <div className="second-line">
                                {EntryLink({
                                    ...this.props,
                                    entry: {category: 'category', author: notification.author, permlink: notification.permlink},
                                    afterClick: this.afterClick,
                                    children: <a className="post-link">{notification.permlink}</a>
                                })}
                            </div>
                        </div>
                    )}

                    {/* Follows */}
                    {(notification.type === 'follow' || notification.type === 'unfollow' || notification.type === 'ignore') && (
                        <div className="item-content">
                            <div className="first-line">
                                {sourceLink}
                            </div>
                            <div className="second-line">
                                {notification.type === 'follow' && (<span className="follow-label">{_t('notifications.followed-str')}</span>)}
                                {notification.type === 'unfollow' && (<span className="unfollow-label">{_t('notifications.unfollowed-str')}</span>)}
                                {notification.type === 'ignore' && (<span className="ignore-label">{_t('notifications.ignored-str')}</span>)}
                            </div>
                        </div>
                    )}

                    {/* Reblogs */}
                    {notification.type === 'reblog' && (
                        <div className="item-content">
                            <div className="first-line">
                                {sourceLink}
                                <span className="item-action">{_t('notifications.reblog-str')}</span>
                            </div>
                            <div className="second-line">
                                {EntryLink({
                                    ...this.props,
                                    entry: {category: 'category', author: notification.author, permlink: notification.permlink},
                                    afterClick: this.afterClick,
                                    children: <a className="post-link">{notification.permlink}</a>
                                })}
                            </div>
                        </div>
                    )}

                    {/* Transfer */}
                    {notification.type === 'transfer' && (
                        <div className="item-content">
                            <div className="first-line">
                                {sourceLink}
                                <span className="item-action">
                                    {_t('notifications.transfer-str')} {' '}
                                    <span className="transfer-amount">{notification.amount}</span>
                                </span>
                            </div>
                            {notification.memo && (
                                <div className="second-line">
                                    <div className="transfer-memo">
                                        {notification.memo.substring(0, 120)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Spin */}
                    {notification.type === 'spin' && (
                        <div className="item-content">
                            <div className="first-line">
                                {sourceLink}
                                <span className="item-action">{_t('notifications.spin-str')}</span>
                            </div>
                        </div>
                    )}

                    {/* Inactive */}
                    {notification.type === 'inactive' && (
                        <div className="item-content">
                            <div className="first-line">
                                {sourceLink}
                                <span className="item-action">
                                    {_t('notifications.inactive-str')}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Referral */}
                    {notification.type === 'referral' && (
                        <div className="item-content">
                            <div className="first-line">
                                {sourceLink}
                                <span className="item-action">{_t('notifications.referral-str')}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    }
}

interface NotificationProps {
    global: Global;
    history: History;
    activeUser: ActiveUser;
    notifications: Notifications;
    fetchNotifications: (since: string | null) => void;
    fetchUnreadNotificationCount: () => void;
    setNotificationsFilter: (filter: NotificationFilter | null) => void;
    markNotifications: (id: string | null) => void;
    toggleUIProp: (what: ToggleType) => void;
    addAccount: (data: Account) => void;
    muteNotifications: () => void;
    unMuteNotifications: () => void;
}

export class DialogContent extends Component<NotificationProps> {
    componentDidMount() {
        const {notifications, fetchNotifications} = this.props;

        if (notifications.list.length === 0) {
            fetchNotifications(null);
        }
    }

    loadMore = () => {
        const {notifications, fetchNotifications} = this.props;
        if (!notifications.hasMore || notifications.loading) {
            return;
        }

        const last = [...notifications.list].pop();
        if (!last) {
            return;
        }

        const {id: since} = last;

        fetchNotifications(since);
    }

    refresh = () => {
        const {fetchNotifications, fetchUnreadNotificationCount} = this.props;
        fetchNotifications(null);
        fetchUnreadNotificationCount();
    }

    markAsRead = () => {
        const {markNotifications, activeUser} = this.props;
        markNotifications(null);
        hiveNotifySetLastRead(activeUser.username).then();
    }

    hide = () => {
        const {toggleUIProp} = this.props;
        toggleUIProp('login');
    }

    mute = () => {
        const {muteNotifications} = this.props;
        muteNotifications();
    }

    unMute = () => {
        const {unMuteNotifications} = this.props;
        unMuteNotifications();
    }

    render() {
        const filters = Object.values(NotificationFilter);
        const menuItems = [
            {
                label: _t("notifications.type-all-short"),
                onClick: () => {
                    const {setNotificationsFilter, fetchNotifications} = this.props;
                    setNotificationsFilter(null);
                    fetchNotifications(null);
                }
            },
            ...filters.map((f => {
                return {
                    label: _t(`notifications.type-${f}`),
                    onClick: () => {
                        const {setNotificationsFilter, fetchNotifications} = this.props;
                        setNotificationsFilter(f);
                        fetchNotifications(null);
                    }
                }
            }))
        ]

        const dropDownConfig = {
            history: this.props.history,
            label: '',
            items: menuItems
        };

        const {notifications, global} = this.props;
        const {list, loading, filter, hasMore, unread} = notifications;

        return (
            <div className="notification-list">
                <div className="list-header">
                    <div className="list-filter">
                        <span>{filter ? _t(`notifications.type-${filter}`) : _t('notifications.type-all')}</span>
                        <DropDown {...dropDownConfig} float="left"/>
                    </div>
                    <div className="list-actions">
                        {global.notifications && (
                            <Tooltip content={_t("notifications.mute")}>
                                <span className={_c(`list-action ${loading ? 'disabled' : ''}`)} onClick={this.mute}>{bellOffSvg}</span>
                            </Tooltip>
                        )}
                        {!global.notifications && (
                            <Tooltip content={_t("notifications.unmute")}>
                                <span className={_c(`list-action ${loading ? 'disabled' : ''}`)} onClick={this.unMute}>{bellCheckSvg}</span>
                            </Tooltip>
                        )}
                        <Tooltip content={_t("notifications.refresh")}>
                            <span className={_c(`list-action ${loading ? 'disabled' : ''}`)} onClick={this.refresh}>{syncSvg}</span>
                        </Tooltip>
                        <Tooltip content={_t("notifications.mark-all-read")}>
                            <span className={_c(`list-action ${loading || unread === 0 ? 'disabled' : ''}`)} onClick={this.markAsRead}>{checkSvg}</span>
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

interface Props {
    global: Global;
    history: History;
    activeUser: ActiveUser;
    notifications: Notifications;
    fetchNotifications: (since: string | null) => void;
    fetchUnreadNotificationCount: () => void;
    setNotificationsFilter: (filter: NotificationFilter | null) => void;
    markNotifications: (id: string | null) => void;
    toggleUIProp: (what: ToggleType) => void;
    addAccount: (data: Account) => void;
    muteNotifications: () => void;
    unMuteNotifications: () => void;
}

export default class NotificationsDialog extends Component<Props> {

    hide = () => {
        const {toggleUIProp} = this.props;
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
