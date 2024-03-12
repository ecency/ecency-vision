import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import LinearProgress from "../linear-progress";
import { refreshSvg } from "../../img/svg";
import { _t } from "../../i18n";
import DropDown from "../dropdown";
import { ThreeSpeakVideo, useThreeSpeakVideo } from "../../api/threespeak";
import { VideoGalleryItem } from "./video-gallery-item";
import { useThreeSpeakManager } from "../../util/ThreeSpeakProvider";
import { ActiveUser } from "../../store/active-user/types";
import "./_index.scss";
import { BeneficiaryRoute } from "../../api/operations";

interface Props {
  showGallery: boolean;
  setShowGallery: (val: boolean) => void;
  insertText: (before: string, after?: string) => any;
  setVideoEncoderBeneficiary?: (item: BeneficiaryRoute) => void;
  toggleNsfwC?: () => void;
  preFilter?: string;
  setVideoMetadata?: (v: ThreeSpeakVideo) => void;
  activeUser: ActiveUser;
}

const VideoGallery = ({
  showGallery,
  setShowGallery,
  insertText,
  setVideoEncoderBeneficiary,
  toggleNsfwC,
  preFilter,
  setVideoMetadata,
  activeUser
}: Props) => {
  const { isEditing } = useThreeSpeakManager();

  const [label, setLabel] = useState("All");
  const [filterStatus, setFilterStatus] = useState<ThreeSpeakVideo["status"] | "all">(
    preFilter ?? "all"
  );

  const { data: items, isFetching, refresh } = useThreeSpeakVideo(filterStatus, activeUser, showGallery);

  useEffect(() => {
    if (isEditing) {
      setFilterStatus("published");
    }
  }, [isEditing]);

  useEffect(() => {
    setFilterStatus(preFilter ?? "all");
  }, [activeUser]);

  return (
      <Modal
        show={showGallery}
        centered={true}
        onHide={() => setShowGallery(false)}
        size="lg"
        className="video-gallery-modal"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Video gallery</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="video-status-picker">
            {!preFilter && !isEditing ? (
              <DropDown
                float="left"
                label={label?.toUpperCase()}
                history={"" as any}
                items={[
                  {
                    label: <span id="ascending">All</span>,
                    onClick: () => {
                      setLabel("All");
                      setFilterStatus("all");
                    }
                  },
                  {
                    label: <span id="descending">Published</span>,
                    onClick: () => {
                      setLabel("Published");
                      setFilterStatus("published");
                    }
                  },
                  {
                    label: <span id="by-value">Encoding</span>,
                    onClick: () => {
                      const encoding = "encoding_ipfs" || "encoding_preparing";
                      setLabel("Encoding");
                      setFilterStatus(encoding);
                    }
                  },
                  {
                    label: <span id="by-balance">Encoded</span>,
                    onClick: () => {
                      setLabel("Encoded");
                      setFilterStatus("publish_manual");
                    }
                  },
                  {
                    label: <span id="by-stake">Failed</span>,
                    onClick: () => {
                      setLabel("Failed");
                      setFilterStatus("encoding_failed");
                    }
                  },
                  {
                    label: <span id="delegations-in">Deleted</span>,
                    onClick: () => {
                      setLabel("Deleted");
                      setFilterStatus("deleted");
                    }
                  }
                ]}
              />
            ) : (
              <></>
            )}
            <div className="hint">Refresh</div>
            <Button
              variant="link"
              className="refresh-gallery p-0"
              onClick={() => {
                setFilterStatus(isEditing ? filterStatus : preFilter ?? "all");
                setLabel("All");
                refresh();
              }}
            >
              {refreshSvg}
            </Button>
          </div>
          <div className="dialog-content">
            {isFetching && <LinearProgress />}
            {!isFetching && items?.length != 0 && (
              <div className="video-info">Videos are stored and powered by SPK network, might have some storage and encoding fees.</div>
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
                  activeUser={activeUser}
                />
              ))}
            </div>
            {!isFetching && items?.length === 0 && (
              <div className="video-center">Nothing here</div>
            )}
          </div>
        </Modal.Body>
      </Modal>
  );
};

export default VideoGallery;
