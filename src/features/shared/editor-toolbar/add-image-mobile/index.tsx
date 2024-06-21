import React from "react";
import { proxifyImageSrc, setProxyBase } from "@ecency/render-helper";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { Button } from "@ui/button";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import { getImagesQuery } from "@/api/queries";
import defaults from "@/defaults.json";

setProxyBase(defaults.imageServer);

interface Props {
  onHide: () => void;
  onPick: (url: string) => void;
  onGallery: () => void;
  onUpload: () => void;
}

export function AddImageMobile({ onHide, onPick, onUpload, onGallery }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  const { data: items } = getImagesQuery(activeUser?.username).useClientQuery();

  return (
    <Modal
      show={true}
      centered={true}
      onHide={onHide}
      className="add-image-mobile-modal"
      animation={false}
    >
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("add-image-mobile.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {items && items.length > 0 && (
          <div className="dialog-content">
            <div className="recent-list">
              <div className="recent-list-title">{i18next.t("add-image-mobile.recent-title")}</div>
              <div className="recent-list-body">
                {items.map((item) => {
                  const src = proxifyImageSrc(item.url, 600, 500, canUseWebp ? "webp" : "match");
                  return (
                    <div
                      className="recent-list-item"
                      style={{ backgroundImage: `url('${src}')` }}
                      key={item._id}
                      onClick={() => {
                        onPick(item.url);
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex justify-between">
              {usePrivate && (
                <Button onClick={onGallery}>{i18next.t("add-image-mobile.gallery")}</Button>
              )}
              <Button onClick={onUpload}>{i18next.t("add-image-mobile.upload")}</Button>
            </div>
          </div>
        )}
        {items?.length === 0 && (
          <div className="dialog-content">
            <div className="recent-list" />
            <div className="flex justify-center">
              <Button onClick={onUpload}>{i18next.t("add-image-mobile.upload")}</Button>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
