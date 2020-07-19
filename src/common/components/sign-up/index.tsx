import React, {Component} from "react";

import {Modal, Form, Button} from "react-bootstrap";

interface Props {
    onHide: () => void;
}

export class SignUp extends Component<Props> {
    render() {

        return (
            <>
                <Form>
                    <div className="form-header">Sign Up</div>
                    <Form.Group>
                        <Form.Control type="email" placeholder="pick a username" autoFocus={true}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Control type="email" placeholder="Enter your email address"/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Control type="text" placeholder="referred user (optional)"/>
                    </Form.Group>
                    <div className="d-flex justify-content-center">
                        <Button variant="primary" type="submit">
                            Continue
                        </Button>
                    </div>
                </Form>
            </>
        );
    }
}

export default class SignUpDialog extends Component<Props> {
    render() {
        const {onHide} = this.props;
        return (
            <Modal show={true} centered={true} onHide={onHide} animation={false} className="sign-up-modal modal-thin-header">
                <Modal.Header closeButton={true}/>
                <Modal.Body>
                    <SignUp {...this.props} />
                </Modal.Body>
            </Modal>
        );
    }
}
