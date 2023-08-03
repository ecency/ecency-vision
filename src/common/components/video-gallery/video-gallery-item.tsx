import { ConfirmNsfwContent } from "../video-nsfw";
import { informationSvg } from "../../img/svg";
import { _t } from "../../i18n";
import { dateToFullRelative } from "../../helper/parse-date";
import React, { useState } from "react";
import { ThreeSpeakVideo } from "../../api/threespeak";

interface videoProps {
  status: string;
  owner: string;
  thumbUrl: string;
  permlink: string;
}

interface Props {
  item: ThreeSpeakVideo;
  insertText: (before: string, after?: string) => void;
  setVideoEncoderBeneficiary?: (video: any) => void;
  toggleNsfwC?: () => void;
  setShowGallery: (v: boolean) => void;
}

export function VideoGalleryItem({
  item,
  toggleNsfwC,
  setVideoEncoderBeneficiary,
  insertText,
  setShowGallery
}: Props) {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<any>(null);

  const setBeneficiary = (video: any) => {
    setVideoEncoderBeneficiary && setVideoEncoderBeneficiary(video);
  };

  const getHoveredItem = (item: any) => {
    setHoveredItem(item);
  };

  const embeddVideo = (video: videoProps) => {
    const speakUrl = "https://3speak.tv/watch?v=";
    const speakFile = `[![](${video.thumbUrl})](${speakUrl}${video.owner}/${video.permlink})`;

    const element = ` <center>${speakFile}</center>`;
    insertText(element);
  };

  const statusIcons = (status: string) => {
    return (
      <div className="status-icon-wrapper">
        {status === "publish_manual" ? (
          <div className="status-icon-encoded" />
        ) : status === "encoding_failed" ? (
          <div className="status-icon-failed" />
        ) : status === "published" ? (
          <div>
            <div className="status-icon-published" />
          </div>
        ) : status === "deleted" ? (
          <div className="status-icon-deleted" />
        ) : (
          <div className="status-icon-encoding" />
        )}
      </div>
    );
  };

  const toolTipContent = (status: string) => {
    return status === "publish_manual"
      ? _t("video-gallery.status-encoded")
      : status === "encoding_failed"
      ? _t("video-gallery.status-failed")
      : status === "published"
      ? _t("video-gallery.status-published")
      : status === "deleted"
      ? _t("video-gallery.status-deleted")
      : _t("video-gallery.status-encoding");
  };

  return (
    <div className="video-list-body">
      <div className="thumnail-wrapper">
        <img src={item.thumbUrl} alt="" />
        {item.status === "publish_manual" && (
          <div className="nsfw-wrapper">
            <ConfirmNsfwContent
              toggleNsfwC={toggleNsfwC}
              embeddVideo={embeddVideo}
              item={item}
              setBeneficiary={setBeneficiary}
              setShowGallery={setShowGallery}
            />
          </div>
        )}
      </div>
      <div className="list-details-wrapper">
        <div className="list-title">
          <div className="info-status">
            <div className="status">
              {statusIcons(item.status)}
              {toolTipContent(item.status)}
            </div>
            <div
              onMouseOver={() => {
                getHoveredItem(item);
                setShowMoreInfo(true);
              }}
              onMouseOut={() => setShowMoreInfo(false)}
              className="info-icon-wrapper"
            >
              {informationSvg}
            </div>
          </div>
          <div className="details-title w-100 text-truncate">{item.title}</div>
        </div>
      </div>
      {showMoreInfo && hoveredItem._id === item._id && (
        <div className="more-info">
          <div className="each-info">
            <span>
              {_t("video-gallery.info-created")} {dateToFullRelative(item.created)}
            </span>
          </div>
          {item.status === "published" && (
            <div className="each-info">
              <span>
                {_t("video-gallery.info-views")} {item.views}
              </span>
            </div>
          )}
          <div className="each-info">
            <span>
              {_t("video-gallery.info-duration")} {item.duration}
            </span>
          </div>
          <div className="each-info">
            <span>
              {_t("video-gallery.info-size")} {`${(item.size / (1024 * 1024)).toFixed(2)}MB`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
