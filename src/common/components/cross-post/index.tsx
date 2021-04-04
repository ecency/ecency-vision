import BaseComponent from "../base";
import React, {Component} from "react";

import {Button, Form, FormControl, Modal} from "react-bootstrap";

import {Entry} from "../../store/entries/types";
import {Subscription} from "../../store/subscriptions/types";
import {ActiveUser} from "../../store/active-user/types";

import {error, success} from "../feedback";

import {comment, formatError} from "../../api/operations";
import {getSubscriptions} from "../../api/bridge";

import {makeCommentOptions, makeApp} from "../../helper/posting";
import {makeCrossPostMessage} from "../../helper/cross-post";

import {_t} from "../../i18n";

import {version} from "../../../../package.json";


interface Props {
    activeUser: ActiveUser;
    entry: Entry;
    onSuccess: (community: string) => void;
    onHide: () => void;
}

interface State {
    subscriptions: Subscription[];
    community: string;
    message: string;
    posting: boolean
}

export class CrossPost extends BaseComponent<Props, State> {
    state: State = {
        subscriptions: [],
        community: "",
        message: "",
        posting: false
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


    submit = () => {
        const {entry, activeUser} = this.props;
        const {community, message} = this.state;

        const {title} = entry;
        const author = activeUser.username;
        const permlink = `${entry.permlink}-${community}`;

        const body = makeCrossPostMessage(entry, author, message);
        const jsonMeta = {
            app: makeApp(version),
            tags: ["cross-post"],
            original_author: entry.author,
            original_permlink: entry.permlink
        }

        const options = {
            ...makeCommentOptions(author, permlink, "dp"),
            allow_curation_rewards: false
        };

        this.stateSet({posting: true});
        comment(author, "", community, permlink, title, body, jsonMeta, options)
            .then(() => {
                success(_t("cross-post.published"));
                this.props.onSuccess(community);
            })
            .catch((e) => {
                error(formatError(e));
            })
            .finally(() => {
                this.stateSet({posting: false});
            });
    }

    render() {
        const {subscriptions, community, message, posting} = this.state;
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
                <Button variant="outline-secondary" onClick={this.hide} disabled={posting}>{_t("g.cancel")}</Button>
                <Button variant="primary" disabled={!canSubmit || posting} onClick={this.submit}>
                    {_t("cross-post.submit-label")} {posting ? "..." : ""}
                </Button>
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
