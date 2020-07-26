import React, {Component} from "react";

import {Modal} from "react-bootstrap";

import moment from "moment";

import {History} from "history";

import {User} from "../../store/users/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType} from "../../store/ui/types";
import {NotificationFilter, Notifications} from "../../store/notifications/types";

import {ApiNotification} from "../../store/notifications/types";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import EntryLink from "../entry-link";

import LinearProgress from "../linear-progress";

import {
    postBodySummary,
    // @ts-ignore
} from "@esteemapp/esteem-render-helpers";

import {_t} from "../../i18n";
import DropDown from "../dropdown";


class NotificationListItem extends Component<{
    history: History;
    notification: ApiNotification;
    addAccount: (data: Account) => void;
}> {
    date2key = (s: string) => {

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

        return s;
    };

    markAsRead = () => {
    }

    render() {
        const {notification} = this.props;
        return <>
            {notification.gkf && (
                <div className="group-title">{this.date2key(notification.gk)}</div>
            )}

            <div className={`notification-list-item ${notification.read === 0 ? 'not-read' : ' '}`}>
                <div className="notification-inner">
                    <div className="notification-control">
                        {notification.read === 0 && (
                            <span onClick={this.markAsRead} className="mark-read"/>
                        )}
                    </div>

                    <div className="source">
                        <ProfileLink {...this.props} username={notification.source}>
                            <a className="source-avatar">
                                <UserAvatar username={notification.source} size="medium"/>
                            </a>
                        </ProfileLink>
                    </div>

                    {/* Votes */}
                    {(notification.type === 'vote' || notification.type === 'unvote') && (
                        <div className="notification-content">
                            <div className="first-line">
                                <ProfileLink {...this.props} username={notification.source}>
                                    <a className="source-name"> {notification.source}</a>
                                </ProfileLink>
                                <span className="notification-action">
                                    {_t('user-notifications.vote-str', {p: notification.weight / 100})}
                                </span>
                            </div>
                            <div className="second-line">
                                <EntryLink
                                    {...this.props}
                                    entry={{category: 'category', author: notification.author, permlink: notification.permlink}}>
                                    <a className="post-link">{notification.permlink}</a>
                                </EntryLink>
                            </div>
                        </div>
                    )}

                    {/* Replies */}
                    {notification.type === 'reply' && (
                        <div className="notification-content ">
                            <div className="first-line">
                                <ProfileLink {...this.props} username={notification.source}>
                                    <a className="source-name"> {notification.source}</a>
                                </ProfileLink>
                                <span className="notification-action">{_t('user-notifications.reply-str')}</span>
                                <div className="vert-separator"/>
                                <EntryLink
                                    {...this.props}
                                    entry={{category: 'category', author: notification.parent_author, permlink: notification.parent_permlink}}>
                                    <a className="post-link">{notification.parent_permlink}</a>
                                </EntryLink>
                            </div>
                            <div className="second-line">
                                <EntryLink
                                    {...this.props}
                                    entry={{category: 'category', author: notification.author, permlink: notification.permlink}}>
                                    <div className="markdown-view mini-markdown reply-body">
                                        {postBodySummary(notification.body, 100)}
                                    </div>
                                </EntryLink>
                            </div>
                        </div>
                    )}

                    {/* Mentions */}
                    {notification.type === 'mention' && (
                        <div className="notification-content">
                            <div className="first-line">
                                <ProfileLink {...this.props} username={notification.source}>
                                    <a className="source-name"> {notification.source}</a>
                                </ProfileLink>
                                <span className="notification-action">{_t('user-notifications.mention-str')}</span>
                            </div>
                            <div className="second-line">
                                <EntryLink
                                    {...this.props}
                                    entry={{category: 'category', author: notification.author, permlink: notification.permlink}}>
                                    <a className="post-link">{notification.permlink}</a>
                                </EntryLink>
                            </div>
                        </div>
                    )}

                    {/* Follows */}
                    {(notification.type === 'follow' || notification.type === 'unfollow' || notification.type === 'ignore') && (
                        <div className="notification-content">
                            <div className="first-line">
                                <ProfileLink {...this.props} username={notification.source}>
                                    <a className="source-name"> {notification.source}</a>
                                </ProfileLink>
                            </div>
                            <div className="second-line">
                                {notification.type === 'follow' && (<span className="follow-label">{_t('user-notifications.followed-str')}</span>)}
                                {notification.type === 'unfollow' && (<span className="unfollow-label">{_t('user-notifications.unfollowed-str')}</span>)}
                                {notification.type === 'ignore' && (<span className="ignore-label">{_t('user-notifications.ignored-str')}</span>)}
                            </div>
                        </div>
                    )}

                    {/* Reblogs */}
                    {notification.type === 'reblog' && (
                        <div className="notification-content">
                            <div className="first-line">
                                <ProfileLink {...this.props} username={notification.source}>
                                    <a className="source-name"> {notification.source}</a>
                                </ProfileLink>
                                <span className="notification-action">{_t('user-notifications.reblog-str')}</span>
                            </div>
                            <div className="second-line">
                                <EntryLink
                                    {...this.props}
                                    entry={{category: 'category', author: notification.author, permlink: notification.permlink}}>
                                    <a className="post-link">{notification.permlink}</a>
                                </EntryLink>
                            </div>
                        </div>
                    )}

                    {/* Transfer */}
                    {notification.type === 'transfer' && (
                        <div className="notification-content">
                            <div className="first-line">
                                <ProfileLink {...this.props} username={notification.source}>
                                    <a className="source-name"> {notification.source}</a>
                                </ProfileLink>
                                <span className="notification-action">
                                    {_t('user-notifications.transfer-str')} {' '}
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
                        <div className="notification-content">
                            <div className="first-line">
                                <ProfileLink {...this.props} username={notification.source}>
                                    <a className="source-name"> {notification.source}</a>
                                </ProfileLink>
                                <span className="notification-action">{_t('user-notifications.spin-str')}</span>
                            </div>
                        </div>
                    )}

                    {/* Inactive */}
                    {notification.type === 'inactive' && (
                        <div className="notification-content">
                            <div className="first-line">
                                <ProfileLink {...this.props} username={notification.source}>
                                    <a className="source-name"> {notification.source}</a>
                                </ProfileLink>
                                <span className="notification-action">
                                    {_t('user-notifications.inactive-str')}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Referral */}
                    {notification.type === 'referral' && (
                        <div className="notification-content">
                            <div className="first-line">
                                <ProfileLink {...this.props} username={notification.source}>
                                    <a className="source-name"> {notification.source}</a>
                                </ProfileLink>
                                <span className="notification-action">{_t('user-notifications.referral-str')}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    }
}

interface NotificationProps {
    history: History;
    notifications: Notifications;
    fetchNotifications: (since: number | null) => void;
    fetchUnreadNotificationCount: () => void;
    setNotificationsFilter: (filter: NotificationFilter | null) => void;
    toggleUIProp: (what: ToggleType) => void;
    addAccount: (data: Account) => void;
}

export class DialogContent extends Component<NotificationProps> {

    componentDidMount() {
        const {notifications, fetchNotifications} = this.props;

        if (notifications.list.length === 0) {
            fetchNotifications(null);
        }
    }

    hide = () => {
        const {toggleUIProp} = this.props;
        toggleUIProp('login');
    }

    render() {

        const dropDownConfig = {
            label: '',
            items: ['votes', 'replies', 'mentions', 'follows', 'reblogs', 'transfers'].map((f => {
                return {
                    label: _t(`user-notifications.type-${f}`),
                    onClick: () => {
                        const { setNotificationsFilter, fetchNotifications} = this.props;
                        setNotificationsFilter(f as NotificationFilter);
                        fetchNotifications(null);
                    }
                }
            }))
        };

        const {notifications} = this.props;
        const {list, loading, filter} = notifications;

        return (
            <>
                <div className="notification-filter">
                    <span>{filter ? _t(`user-notifications.type-${filter}`) : _t('user-notifications.type-all')}</span>
                    <DropDown {...{...this.props, ...dropDownConfig}} float="left"/>
                </div>

                {loading && <LinearProgress/>}

                {!loading && list.length === 0 && (
                    <div className="user-notification-list empty-list">
                        <span className="empty-text">
                            {_t('activities.empty-list')}
                        </span>
                    </div>
                )}

                {list.length > 0 && (
                    <div className="user-notification-list">
                        {list.map(n => (
                            <NotificationListItem key={n.id} {...this.props} notification={n}/>
                        ))}
                    </div>
                )}
                {loading && list.length > 0 && <LinearProgress/>}
            </>
        );
    }
}

interface Props {
    history: History;
    notifications: Notifications;
    fetchNotifications: (since: number | null) => void;
    fetchUnreadNotificationCount: () => void;
    setNotificationsFilter: (filter: NotificationFilter | null) => void;
    toggleUIProp: (what: ToggleType) => void;
    addAccount: (data: Account) => void;
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
