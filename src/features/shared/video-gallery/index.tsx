import React, { useEffect, useState } from "react";
import "./index.scss";
import { VideoGalleryItem } from "./video-gallery-item";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { Button } from "@ui/button";
import { ThreeSpeakVideo, useThreeSpeakVideo } from "@/api/threespeak";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { LinearProgress } from "@/features/shared";
import { refreshSvg } from "@ui/svg";
import { useThreeSpeakManager } from "@/features/3speak";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";

interface Props {
  showGallery: boolean;
  setShowGallery: React.Dispatch<React.SetStateAction<boolean>>;
  insertText: (before: string, after?: string) => any;
  setVideoEncoderBeneficiary?: (video: any) => void;
  toggleNsfwC?: () => void;
  setVideoMetadata?: (v: ThreeSpeakVideo) => void;
}

export const VideoGallery = ({
  showGallery,
  setShowGallery,
  insertText,
  setVideoEncoderBeneficiary,
  toggleNsfwC,
  setVideoMetadata
}: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { isEditing } = useThreeSpeakManager();

  const [label, setLabel] = useState("All");
  const [filterStatus, setFilterStatus] = useState<ThreeSpeakVideo["status"] | "all">(
    isEditing ? "published" : "all"
  );

  const { data: items, isFetching, refresh } = useThreeSpeakVideo(filterStatus, showGallery);

  useEffect(() => {
    setFilterStatus(isEditing ? "published" : "all");
  }, [isEditing]);

  useEffect(() => {
    setFilterStatus(isEditing ? "published" : "all");
  }, [activeUser, isEditing]);

  return (
    <div>
      <Modal
        show={showGallery}
        centered={true}
        onHide={() => setShowGallery(false)}
        size="lg"
        className="video-gallery-modal"
      >
        <ModalHeader closeButton={true}>
          <ModalTitle>{i18next.t("video-gallery.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody className="min-h-[400px]">
          <div className="video-status-picker">
            {!isEditing ? (
              <Dropdown>
                <DropdownToggle>{label?.toUpperCase()}</DropdownToggle>
                <DropdownMenu align="left">
                  <DropdownItem
                    onClick={() => {
                      setLabel(i18next.t("video-gallery.all"));
                      setFilterStatus("all");
                    }}
                  >
                    <span id="ascending">{i18next.t("video-gallery.all")}</span>
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      setLabel(i18next.t("video-gallery.published"));
                      setFilterStatus("published");
                    }}
                  >
                    <span id="descending">{i18next.t("video-gallery.published")}</span>
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      const encoding = "encoding_ipfs" || "encoding_preparing";
                      setLabel(i18next.t("video-gallery.encoding"));
                      setFilterStatus(encoding);
                    }}
                  >
                    <span id="by-value">{i18next.t("video-gallery.encoding")}</span>
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      setLabel(i18next.t("video-gallery.encoded"));
                      setFilterStatus("publish_manual");
                    }}
                  >
                    <span id="by-balance">{i18next.t("video-gallery.encoded")}</span>
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      setLabel(i18next.t("video-gallery.failed"));
                      setFilterStatus("encoding_failed");
                    }}
                  >
                    <span id="by-stake">{i18next.t("video-gallery.failed")}</span>
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      setLabel(i18next.t("video-gallery.status-deleted"));
                      setFilterStatus("deleted");
                    }}
                  >
                    <span id="delegations-in">{i18next.t("video-gallery.status-deleted")}</span>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <></>
            )}
            <div className="hint">{i18next.t("video-gallery.refresh")}</div>
            <Button
              appearance="link"
              noPadding={true}
              className="refresh-gallery"
              onClick={() => {
                setFilterStatus(isEditing ? filterStatus : "all");
                setLabel(i18next.t("video-gallery.all"));
                refresh();
              }}
              icon={refreshSvg}
            />
          </div>
          <div className="dialog-content">
            {isFetching && <LinearProgress />}
            {!isFetching && items?.length != 0 && (
              <div className="video-info">{i18next.t("video-gallery.video-info")}</div>
            )}
            <div className="video-list">
              {items?.map((item) => (
                <VideoGalleryItem
                  item={item}
                  key={item._id}
                  insertText={insertText}
                  setVideoEncoderBeneficiary={setVideoEncoderBeneficiary}
                  toggleNsfwC={toggleNsfwC}
                  setShowGallery={setShowGallery}
                  setVideoMetadata={setVideoMetadata}
                />
              ))}
            </div>
            {!isFetching && items?.length === 0 && (
              <div className="video-center">{i18next.t("g.empty-list")}</div>
            )}
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};
