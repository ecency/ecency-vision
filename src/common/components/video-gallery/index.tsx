import React, { useState } from "react";
import LinearProgress from "../linear-progress";
import { refreshSvg } from "../../img/svg";
import { Modal } from "react-bootstrap";
import { _t } from "../../i18n";
import "./index.scss";
import DropDown from "../dropdown";
import Tooltip from "../tooltip";
import { ThreeSpeakVideo, useThreeSpeakVideo } from "../../api/threespeak";
import { VideoGalleryItem } from "./video-gallery-item";
import { useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "../../core";

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
  const queryClient = useQueryClient();

  const [label, setLabel] = useState("All");
  const [filterStatus, setFilterStatus] = useState<ThreeSpeakVideo["status"] | "all">("all");

  const { data: items, isLoading } = useThreeSpeakVideo(filterStatus);

  return (
    <div>
      <Modal
        show={showGallery}
        centered={true}
        onHide={() => setShowGallery(false)}
        size="lg"
        className="gallery-modal"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>{_t("video-gallery.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="video-status-picker">
            <div className="amount">
              <div className="amount-actions">
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
              </div>
            </div>
            <div
              className="refresh-gallery mr-5"
              onClick={() => {
                setFilterStatus("all");
                queryClient.invalidateQueries([QueryIdentifiers.THREE_SPEAK_VIDEO_LIST]);
                queryClient.invalidateQueries([
                  QueryIdentifiers.THREE_SPEAK_VIDEO_LIST_FILTERED,
                  "all"
                ]);
              }}
            >
              <Tooltip content={_t("video-gallery.refresh")}>
                <span className="info-icon">{refreshSvg}</span>
              </Tooltip>
            </div>
          </div>
          <div className="dialog-content">
            {isLoading && <LinearProgress />}
            {items && label === "All" && (
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
                {!isLoading && items?.length === 0 && (
                  <div className="gallery-list">{_t("g.empty-list")}</div>
                )}
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default VideoGallery;
