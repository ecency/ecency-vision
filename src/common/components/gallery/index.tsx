import React, { Component } from "react";
import { ActiveUser } from "../../store/active-user/types";

import { proxifyImageSrc, setProxyBase } from "@ecency/render-helper";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import PopoverConfirm from "../popover-confirm";
import Tooltip from "../tooltip";

import { deleteImage, getImages, UserImage } from "../../api/private-api";

import { error, success } from "../feedback";

import { _t } from "../../i18n";

import { deleteForeverSvg } from "../../img/svg";

import clipboard from "../../util/clipboard";

import defaults from "../../constants/defaults.json";
import { Global } from "../../store/global/types";
import { useMappedStore } from "../../store/use-mapped-store";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "../modal";

setProxyBase(defaults.imageServer);

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  onHide: () => void;
  onPick?: (url: string) => void;
}

interface State {
  loading: boolean;
  items: UserImage[];
}

export class Gallery extends BaseComponent<Props, State> {
  state: State = {
    loading: true,
    items: []
  };

  componentDidMount() {
    this.fetch();
  }

  fetch = () => {
    const { activeUser } = this.props;

    this.stateSet({ loading: true });
    getImages(activeUser?.username!)
      .then((items) => {
        this.stateSet({ items: this.sort(items), loading: false });
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

  itemClicked = (item: UserImage) => {
    const { onPick } = this.props;
    if (onPick) {
      onPick(item.url);
      return;
    }

    clipboard(item.url);
    success(_t("gallery.copied"));
  };

  delete = (item: UserImage) => {
    const { activeUser } = this.props;

    deleteImage(activeUser?.username!, item._id)
      .then(() => {
        const { items } = this.state;
        const nItems = [...items].filter((x) => x._id !== item._id);
        this.stateSet({ items: this.sort(nItems) });
      })
      .catch(() => {
        error(_t("g.server-error"));
      });
  };

  render() {
    const { global } = this.props;
    const { items, loading } = this.state;

    return (
      <div className="dialog-content">
        {loading && <LinearProgress />}
        {items.length > 0 && (
          <div className="gallery-list">
            <div className="gallery-list-body">
              {items.map((item) => {
                const src = proxifyImageSrc(
                  item.url,
                  600,
                  500,
                  global.canUseWebp ? "webp" : "match"
                );
                return (
                  <div
                    className="gallery-list-item"
                    style={{ backgroundImage: `url('${src}')` }}
                    key={item._id}
                  >
                    <div
                      className="item-inner"
                      onClick={() => {
                        this.itemClicked(item);
                      }}
                    />
                    <div className="item-controls">
                      <PopoverConfirm
                        onConfirm={() => {
                          this.delete(item);
                        }}
                      >
                        <span className="btn-delete">
                          <Tooltip content={_t("g.delete")}>{deleteForeverSvg}</Tooltip>
                        </span>
                      </PopoverConfirm>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {!loading && items.length === 0 && <div className="gallery-list">{_t("g.empty-list")}</div>}
      </div>
    );
  }
}

class GalleryDialog extends Component<Props> {
  hide = () => {
    const { onHide } = this.props;
    onHide();
  };

  render() {
    return (
      <Modal show={true} centered={true} onHide={this.hide} size="lg" className="gallery-modal">
        <ModalHeader closeButton={true}>
          <ModalTitle>{_t("gallery.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Gallery {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}

export default ({ onHide, onPick }: Pick<Props, "onHide" | "onPick">) => {
  const { global, activeUser } = useMappedStore();

  return <GalleryDialog global={global} activeUser={activeUser} onHide={onHide} onPick={onPick} />;
};
