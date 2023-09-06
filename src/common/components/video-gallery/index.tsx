import React, { useEffect, useState } from "react";
import LinearProgress from "../linear-progress";
import { refreshSvg } from "../../img/svg";
import { _t } from "../../i18n";
import "./index.scss";
import DropDown from "../dropdown";
import { ThreeSpeakVideo, useThreeSpeakVideo } from "../../api/threespeak";
import { VideoGalleryItem } from "./video-gallery-item";
import { useMappedStore } from "../../store/use-mapped-store";
import { useThreeSpeakManager } from "../../pages/submit/hooks";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { Button } from "@ui/button";

interface Props {
  showGallery: boolean;
  setShowGallery: React.Dispatch<React.SetStateAction<boolean>>;
  insertText: (before: string, after?: string) => any;
  setVideoEncoderBeneficiary?: (video: any) => void;
  toggleNsfwC?: () => void;
  preFilter?: string;
  setVideoMetadata?: (v: ThreeSpeakVideo) => void;
}

const VideoGallery = ({
  showGallery,
  setShowGallery,
  insertText,
  setVideoEncoderBeneficiary,
  toggleNsfwC,
  preFilter,
  setVideoMetadata
}: Props) => {
  const { activeUser } = useMappedStore();
  const { isEditing } = useThreeSpeakManager();

  const [label, setLabel] = useState("All");
  const [filterStatus, setFilterStatus] = useState<ThreeSpeakVideo["status"] | "all">(
    preFilter ?? "all"
  );

  const { data: items, isFetching, refresh } = useThreeSpeakVideo(filterStatus, showGallery);

  useEffect(() => {
    if (isEditing) {
      setFilterStatus("published");
    }
  }, [isEditing]);

  useEffect(() => {
    setFilterStatus(preFilter ?? "all");
  }, [activeUser]);

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
          <ModalTitle>{_t("video-gallery.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="video-status-picker">
            {!preFilter && !isEditing ? (
              <DropDown
                float="left"
                label={label?.toUpperCase()}
                history={"" as any}
                items={[
                  {
                    label: <span id="ascending">{_t("video-gallery.all")}</span>,
                    onClick: () => {
                      setLabel(_t("video-gallery.all"));
                      setFilterStatus("all");
                    }
                  },
                  {
                    label: <span id="descending">{_t("video-gallery.published")}</span>,
                    onClick: () => {
                      setLabel(_t("video-gallery.published"));
                      setFilterStatus("published");
                    }
                  },
                  {
                    label: <span id="by-value">{_t("video-gallery.encoding")}</span>,
                    onClick: () => {
                      const encoding = "encoding_ipfs" || "encoding_preparing";
                      setLabel(_t("video-gallery.encoding"));
                      setFilterStatus(encoding);
                    }
                  },
                  {
                    label: <span id="by-balance">{_t("video-gallery.encoded")}</span>,
                    onClick: () => {
                      setLabel(_t("video-gallery.encoded"));
                      setFilterStatus("publish_manual");
                    }
                  },
                  {
                    label: <span id="by-stake">{_t("video-gallery.failed")}</span>,
                    onClick: () => {
                      setLabel(_t("video-gallery.failed"));
                      setFilterStatus("encoding_failed");
                    }
                  },
                  {
                    label: <span id="delegations-in">{_t("video-gallery.status-deleted")}</span>,
                    onClick: () => {
                      setLabel(_t("video-gallery.status-deleted"));
                      setFilterStatus("deleted");
                    }
                  }
                ]}
              />
            ) : (
              <></>
            )}
            <div className="hint">{_t("video-gallery.refresh")}</div>
            <Button
              appearance="link"
              noPadding={true}
              className="refresh-gallery"
              onClick={() => {
                setFilterStatus(isEditing ? filterStatus : preFilter ?? "all");
                setLabel(_t("video-gallery.all"));
                refresh();
              }}
              icon={refreshSvg}
            />
          </div>
          <div className="dialog-content">
            {isFetching && <LinearProgress />}
            {!isFetching && items?.length != 0 && (
              <div className="video-info">{_t("video-gallery.video-info")}</div>
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
              <div className="video-center">{_t("g.empty-list")}</div>
            )}
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default VideoGallery;
