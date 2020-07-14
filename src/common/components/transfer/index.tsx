import React, {Component} from "react";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Modal} from "react-bootstrap";


export class TransferDialog extends Component {
    render() {
        return <div className="transfer-dialog-content">
            Henlo
        </div>
    }
}


interface Props {
    users: User[];
    activeUser: ActiveUser | null;
    onHide: () => void;
}

export default class Transfer extends Component<Props> {
    render() {
        const {onHide} = this.props;
        return (
            <Modal show={true} centered={true} onHide={onHide} className="transfer-dialog">
                <Modal.Header closeButton={true}/>
                <Modal.Body>
                    <TransferDialog {...this.props} />
                </Modal.Body>
            </Modal>
        );
    }
}
