import React, {Component} from "react";

import {Modal} from "react-bootstrap";

import {User} from "../../store/users/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType} from "../../store/ui/types";

interface NotificationProps {
    toggleUIProp: (what: ToggleType) => void;
}

export class Notifications extends Component<NotificationProps> {

    componentDidMount() {
        console.log("henlo")
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
                    <Notifications {...this.props}/>
                </Modal.Body>
            </Modal>
        );
    }
}
