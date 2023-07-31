import React from "react";
import BaseComponent from "../base";
import { Entry } from "../../store/entries/types";
import { facebookSvg, linkedinSvg, redditSvg, twitterSvg } from "../../img/svg";
import {
  makeShareUrlFacebook,
  makeShareUrlLinkedin,
  makeShareUrlReddit,
  makeShareUrlTwitter
} from "../../helper/url-share";

import { _t } from "../../i18n";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "../modal";

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

export const shareLinkedin = (entry: Entry) => {
  const u = makeShareUrlLinkedin(entry.category, entry.author, entry.permlink);
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

  linkedin = () => {
    shareLinkedin(this.props.entry);
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
        <ModalHeader closeButton={true}>
          <ModalTitle>{_t("entry-share.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody className="entry-share-modal-body">
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
            <div className="share-button" onClick={this.linkedin}>
              {linkedinSvg}
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}
