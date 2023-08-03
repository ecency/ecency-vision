import React, { Component } from "react";

import { Button } from "react-bootstrap";

import { proxifyImageSrc, setProxyBase } from "@ecency/render-helper";

import { Global } from "../../store/global/types";
import { ActiveUser } from "../../store/active-user/types";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";

import { getImages, UserImage } from "../../api/private-api";

import { error } from "../feedback";

import { _t } from "../../i18n";
import defaults from "../../constants/defaults.json";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";

setProxyBase(defaults.imageServer);

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  onHide: () => void;
  onPick: (url: string) => void;
  onGallery: () => void;
  onUpload: () => void;
}

interface State {
  loading: boolean;
  items: UserImage[];
}

export class AddImage extends BaseComponent<Props, State> {
  state: State = {
    loading: true,
    items: []
  };

  componentDidMount() {
    this.fetch();
  }

  fetch = () => {
    const { activeUser, global } = this.props;

    if (!global.usePrivate) {
      this.stateSet({ loading: false });
      return;
    }

    this.stateSet({ loading: true });
    getImages(activeUser?.username!)
      .then((items) => {
        this.stateSet({ items: this.sort(items).slice(0, 3), loading: false });
      })
      .catch(() => {
        this.stateSet({ loading: false });
        error(_t("g.server-error"));
      });
  };

  sort = (items: UserImage[]) =>
    items.sort((a, b) => {
      return new Date(b.created).getTime() > new Date(a.created).getTime() ? 1 : -1;
    });

  upload = () => {
    this.props.onUpload();
  };

  gallery = () => {
    this.props.onGallery();
  };

  itemClicked = (item: UserImage) => {
    this.props.onPick(item.url);
  };

  render() {
    const { global } = this.props;
    const { items, loading } = this.state;

    if (loading) {
      return (
        <div className="dialog-placeholder">
          <LinearProgress />
        </div>
      );
    }

    const btnGallery = global.usePrivate ? (
      <Button onClick={this.gallery}>{_t("add-image-mobile.gallery")}</Button>
    ) : null;
    const btnUpload = <Button onClick={this.upload}>{_t("add-image-mobile.upload")}</Button>;

    if (items.length === 0) {
      return (
        <div className="dialog-content">
          <div className="recent-list" />
          <div className="d-flex justify-content-center">{btnUpload}</div>
        </div>
      );
    }

    return (
      <div className="dialog-content">
        <div className="recent-list">
          {items.length > 0 && (
            <>
              <div className="recent-list-title">{_t("add-image-mobile.recent-title")}</div>
              <div className="recent-list-body">
                {items.map((item) => {
                  const src = proxifyImageSrc(
                    item.url,
                    600,
                    500,
                    global.canUseWebp ? "webp" : "match"
                  );
                  return (
                    <div
                      className="recent-list-item"
                      style={{ backgroundImage: `url('${src}')` }}
                      key={item._id}
                      onClick={() => {
                        this.itemClicked(item);
                      }}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="d-flex justify-content-between">
          {btnGallery}
          {btnUpload}
        </div>
      </div>
    );
  }
}

export default class AddImageDialog extends Component<Props> {
  hide = () => {
    const { onHide } = this.props;
    onHide();
  };

  render() {
    return (
      <Modal
        show={true}
        centered={true}
        onHide={this.hide}
        className="add-image-mobile-modal"
        animation={false}
      >
        <ModalHeader closeButton={true}>
          <ModalTitle>{_t("add-image-mobile.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <AddImage {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}
