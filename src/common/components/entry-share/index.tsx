import React from "react";

import { Modal } from "react-bootstrap";

import BaseComponent from "../base";

import { Entry } from "../../store/entries/types";

import { redditSvg, twitterSvg, facebookSvg } from "../../img/svg";

import {
  makeShareUrlFacebook,
  makeShareUrlReddit,
  makeShareUrlTwitter
} from "../../helper/url-share";

import { _t } from "../../i18n";

interface Props {
  entry: Entry;
  onHide: () => void;
}

export const shareReddit = (entry: Entry) => {
  const u = makeShareUrlReddit(entry.category, entry.author, entry.permlink, entry.title);
  window.open(u, "_blank");
};

export const shareTwitter = (entry: Entry) => {
  const u = makeShareUrlTwitter(entry.category, entry.author, entry.permlink, entry.title);
  window.open(u, "_blank");
};

export const shareFacebook = (entry: Entry) => {
  const u = makeShareUrlFacebook(entry.category, entry.author, entry.permlink);
  window.open(u, "_blank");
};

export default class EntryShare extends BaseComponent<Props> {
  reddit = () => {
    shareReddit(this.props.entry);
  };

  twitter = () => {
    shareTwitter(this.props.entry);
  };

  facebook = () => {
    shareFacebook(this.props.entry);
  };

  render() {
    const { onHide } = this.props;
    return (
      <Modal
        animation={false}
        show={true}
        centered={true}
        onHide={onHide}
        className="entry-share-dialog"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>{_t("entry-share.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="share-buttons">
            <div className="share-button" onClick={this.reddit}>
              {redditSvg}
            </div>
            <div className="share-button" onClick={this.twitter}>
              {twitterSvg}
            </div>
            <div className="share-button" onClick={this.facebook}>
              {facebookSvg}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
