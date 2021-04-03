import BaseComponent from "../base";
import React, {Component} from "react";
import {Entry} from "../../store/entries/types";
import {Button, Col, Form, FormControl, Modal, Row} from "react-bootstrap";
import {_t} from "../../i18n";

import {getSubscriptions} from "../../api/bridge";
import {Subscription} from "../../store/subscriptions/types";
import {ActiveUser} from "../../store/active-user/types";


interface Props {
    activeUser: ActiveUser;
    entry: Entry;
    onHide: () => void;
}

interface State {
    subscriptions: Subscription[];
    community: string;
    message: string;
}

export class CrossPost extends BaseComponent<Props, State> {
    state: State = {
        subscriptions: [],
        community: "",
        message: ""
    }

    componentDidMount() {
        const {activeUser} = this.props;
        getSubscriptions(activeUser.username).then(r => {
            if (r) {
                this.stateSet({subscriptions: r})
            }
        })
    }

    hide = () => {
        this.props.onHide();
    }

    communityChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        this.stateSet({community: e.target.value});
    }

    messageChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        this.stateSet({message: e.target.value})
    }

    render() {
        const {subscriptions, community, message} = this.state;
        const canSubmit = community !== "" && message.trim() !== "";

        return <>
            <Form.Group controlId="community">
                <Form.Label>{_t("cross-post.community-label")}</Form.Label>
                <Form.Control as="select" value={community} onChange={this.communityChanged} autoFocus={true}>
                    <option value="">{_t("cross-post.community-placeholder")}</option>
                    {subscriptions.map(x => <option key={x[0]} value={x[0]}>{x[1]}</option>)}
                </Form.Control>
            </Form.Group>
            <Form.Group controlId="message">
                <Form.Label>{_t("cross-post.message-label")}</Form.Label>
                <Form.Control value={message} onChange={this.messageChanged} maxLength={200} placeholder={_t("cross-post.message-placeholder")}/>
            </Form.Group>
            <div className="d-flex justify-content-between">
                <Button variant="outline-secondary" onClick={this.hide}>{_t("g.cancel")}</Button>
                <Button variant="primary" disabled={!canSubmit}>{_t("cross-post.submit-label")}</Button>
            </div>
        </>
    }
}

export default class CrossPostDialog extends Component<Props> {
    render() {
        const {onHide} = this.props;

        return <Modal animation={false} show={true} centered={true} onHide={onHide} keyboard={false} className="cross-post-dialog">
            <Modal.Header closeButton={true}>
                <Modal.Title>{_t("cross-post.title")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <CrossPost {...this.props} />
            </Modal.Body>
        </Modal>
    }
}
