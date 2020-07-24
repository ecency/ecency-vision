import React, {Component} from "react";

import {Modal} from "react-bootstrap";

import {User} from "../../store/users/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType} from "../../store/ui/types";
import {Notifications} from "../../store/notifications/types";

interface NotificationProps {
    notifications: Notifications;
    fetchNotifications: (since: number | null) => void;
    fetchUnreadNotificationCount: () => void;
    setNotificationsFilter: () => void;
    resetNotifications: () => void;
    toggleUIProp: (what: ToggleType) => void;
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

        return (
            <>Henlo</>
        );
    }
}

interface Props {
    notifications: Notifications;
    fetchNotifications: (since: number | null) => void;
    fetchUnreadNotificationCount: () => void;
    setNotificationsFilter: () => void;
    resetNotifications: () => void;
    toggleUIProp: (what: ToggleType) => void;
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
