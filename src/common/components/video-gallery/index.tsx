import React, { useEffect, useState } from "react";
import LinearProgress from "../linear-progress";
import { refreshSvg } from "../../img/svg";
import { Button, Modal } from "react-bootstrap";
import { _t } from "../../i18n";
import "./index.scss";
import DropDown from "../dropdown";
import { ThreeSpeakVideo, useThreeSpeakVideo } from "../../api/threespeak";
import { VideoGalleryItem } from "./video-gallery-item";
import { useMappedStore } from "../../store/use-mapped-store";

interface Props {
  showGallery: boolean;
  setShowGallery: React.Dispatch<React.SetStateAction<boolean>>;
  insertText: (before: string, after?: string) => void;
  setVideoEncoderBeneficiary?: (video: any) => void;
  toggleNsfwC?: () => void;
}

const VideoGallery = ({
  showGallery,
  setShowGallery,
  insertText,
  setVideoEncoderBeneficiary,
  toggleNsfwC
}: Props) => {
  const { activeUser } = useMappedStore();
  const [label, setLabel] = useState("All");
  const [filterStatus, setFilterStatus] = useState<ThreeSpeakVideo["status"] | "all">("all");

  const { data: items, isFetching, refresh } = useThreeSpeakVideo(filterStatus, showGallery);

  useEffect(() => {
    setFilterStatus("all");
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
        <Modal.Header closeButton={true}>
          <Modal.Title>{_t("video-gallery.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="video-status-picker">
            <DropDown
              float="left"
              label={label}
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
            <Button
              variant="link"
              className="refresh-gallery p-0"
              onClick={() => {
                setFilterStatus("all");
                setLabel(_t("video-gallery.all"));
                refresh();
              }}
            >
              {refreshSvg}
            </Button>
          </div>
          <div className="dialog-content">
            {isFetching && <LinearProgress />}
            <div className="video-list">
              {items?.map((item) => (
                <VideoGalleryItem
                  item={item}
                  key={item._id}
                  insertText={insertText}
                  setVideoEncoderBeneficiary={setVideoEncoderBeneficiary}
                  toggleNsfwC={toggleNsfwC}
                  setShowGallery={setShowGallery}
                />
              ))}
              {!isFetching && items?.length === 0 && (
                <div className="gallery-list">{_t("g.empty-list")}</div>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default VideoGallery;
