import React from "react";

import {Modal} from "react-bootstrap";

import BaseComponent from "../base";

import {Entry} from "../../store/entries/types";

import {redditSvg, twitterSvg, facebookSvg} from "../../img/svg";

import {makeShareUrlFacebook, makeShareUrlReddit, makeShareUrlTwitter} from "../../helper/url-share";

import {_t} from "../../i18n";

interface Props {
    entry: Entry;
    onHide: () => void;
}

export default class EntryShare extends BaseComponent<Props> {
    reddit = () => {
        const {entry} = this.props;
        const u = makeShareUrlReddit(entry.category, entry.author, entry.permlink, entry.title);
        window.open(u, "_blank");
    };

    twitter = () => {
        const {entry} = this.props;
        const u = makeShareUrlTwitter(entry.category, entry.author, entry.permlink, entry.title);
        window.open(u, "_blank");
    };

    facebook = () => {
        const {entry} = this.props;
        const u = makeShareUrlFacebook(entry.category, entry.author, entry.permlink);
        window.open(u, "_blank");
    };

    render() {
        const {onHide} = this.props;
        return (
            <Modal animation={false} show={true} centered={true} onHide={onHide} className="entry-share-dialog">
                <Modal.Header closeButton={true}>
                    <Modal.Title>{_t("entry-share.title")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="share-buttons">
                        <div className="share-button" onClick={this.reddit}>{redditSvg}</div>
                        <div className="share-button" onClick={this.twitter}>{twitterSvg}</div>
                        <div className="share-button" onClick={this.facebook}>{facebookSvg}</div>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
