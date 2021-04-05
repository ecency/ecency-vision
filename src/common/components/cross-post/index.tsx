import BaseComponent from "../base";
import React, {Component} from "react";

import {Button, Form, FormControl, Modal} from "react-bootstrap";

import {Entry} from "../../store/entries/types";
import {Subscription} from "../../store/subscriptions/types";
import {ActiveUser} from "../../store/active-user/types";

import {error, success} from "../feedback";
import SuggestionList from "../suggestion-list";

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
    communities: {
        id: string;
        name: string;
    }[];
    community: string;
    message: string;
    posting: boolean
}

export class CrossPost extends BaseComponent<Props, State> {
    state: State = {
        communities: [],
        community: "",
        message: "",
        posting: false
    }

    componentDidMount() {
        const {activeUser} = this.props;
        getSubscriptions(activeUser.username).then(r => {
            if (r) {
                const communities = r.map((x) => ({id: x[0], name: x[1]}));

                this.stateSet({communities});
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
        const {community, communities, message} = this.state;

        const theCommunity = communities.find(x => x.name.toLowerCase() === community.toLowerCase());
        if (!theCommunity) {
            return;
        }

        const {title} = entry;
        const author = activeUser.username;
        const permlink = `${entry.permlink}-${theCommunity.id}`;

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
        comment(author, "", theCommunity.id, permlink, title, body, jsonMeta, options)
            .then(() => {
                success(_t("cross-post.published"));
                this.props.onSuccess(theCommunity.id);
            })
            .catch((e) => {
                error(formatError(e));
            })
            .finally(() => {
                this.stateSet({posting: false});
            });
    }

    communitySelected = (item: any) => {
        this.stateSet({community: item.name});
    }

    render() {
        const {communities, community, message, posting} = this.state;

        const suggestions = communities.filter(x => x.name.toLowerCase().indexOf(community.toLowerCase()) !== -1);
        const theCommunity = communities.find(x => x.name.toLowerCase() === community.toLowerCase());
        const canSubmit = theCommunity && message.trim() !== "";

        return <>
            <Form.Group controlId="community">
                <Form.Label>{_t("cross-post.community-label")}</Form.Label>
                <SuggestionList items={suggestions} onSelect={this.communitySelected} renderer={(x) => x.name}>
                    <Form.Control value={community} onChange={this.communityChanged} type="text" autoFocus={true} placeholder={_t("cross-post.community-placeholder")}/>
                </SuggestionList>
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
