import { copyOutlinSvg, informationSvg } from "../../img/svg";
import { _t } from "../../i18n";
import { dateToFullRelative } from "../../helper/parse-date";
import React, { useEffect, useState } from "react";
import { ThreeSpeakVideo, useThreeSpeakVideo } from "../../api/threespeak";
import { Button } from "@ui/button";
import { proxifyImageSrc } from "@ecency/render-helper";
import { useMappedStore } from "../../store/use-mapped-store";
import useCopyToClipboard from "react-use/lib/useCopyToClipboard";

interface videoProps {
  status: string;
  owner: string;
  thumbUrl: string;
  permlink: string;
  filename: string;
}

interface Props {
  item: ThreeSpeakVideo;
  insertText: (before: string, after?: string) => any;
  setVideoEncoderBeneficiary?: (video: any) => void;
  toggleNsfwC?: () => void;
  setShowGallery: (v: boolean) => void;
  setVideoMetadata?: (v: ThreeSpeakVideo) => void;
}

export function VideoGalleryItem({
  item,
  toggleNsfwC,
  setVideoEncoderBeneficiary,
  insertText,
  setShowGallery,
  setVideoMetadata
}: Props) {
  const { global } = useMappedStore();
  const { data } = useThreeSpeakVideo("all");
  const [_, copyToClipboard] = useCopyToClipboard();

  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [manualPublishSpeakVideos, setManualPublishSpeakVideos] = useState<ThreeSpeakVideo[]>([]);
  const speakUrl = "https://3speak.tv/watch?v=";

  useEffect(() => {
    setManualPublishSpeakVideos(data.filter((i) => i.status === "publish_manual"));
  }, [data]);

  const setBeneficiary = (video: any) => {
    setVideoEncoderBeneficiary && setVideoEncoderBeneficiary(video);
  };

  const getHoveredItem = (item: any) => {
    setHoveredItem(item);
  };

  const insert = async (isNsfw = false) => {
    let nextItem = item;

    setVideoMetadata?.(nextItem);
    const body = insertText("").innerHTML;
    const hup = manualPublishSpeakVideos
      .map((i) => `[![](${i.thumbUrl})](${speakUrl}${i.owner}/${i.permlink})`)
      .some((i) => body.includes(i));

    if (!hup && item.status !== "published") {
      setBeneficiary(nextItem);
    }
    setShowGallery(false);

    if (isNsfw) {
      toggleNsfwC && toggleNsfwC();
    }
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
        <img
          src={proxifyImageSrc(item.thumbUrl, 600, 500, global.canUseWebp ? "webp" : "match")}
          alt=""
        />
      </div>
      <div className="list-details-wrapper">
        <div className="list-details-wrapper-status">
          {statusIcons(item.status)}
          {toolTipContent(item.status)}{" "}
          {item.status == "encoding_ipfs" || item.status == "encoding_preparing"
            ? `${item.encodingProgress.toFixed(2)}%`
            : ""}
        </div>

        <div
          onMouseOver={() => {
            getHoveredItem(item);
            setShowMoreInfo(true);
          }}
          onMouseOut={() => setShowMoreInfo(false)}
          className="list-details-wrapper-info"
        >
          {informationSvg}
        </div>

        <Button
          appearance="link"
          title={_t("g.copy-clipboard")}
          size="sm"
          className="list-details-wrapper-copy px-0 text-muted"
          onClick={() =>
            copyToClipboard(item.filename.replace("ipfs://", "https://ipfs-3speak.b-cdn.net/ipfs/"))
          }
        >
          {copyOutlinSvg}
        </Button>

        <div className="list-details-wrapper-title w-full truncate">{item.title}</div>

        {["publish_manual", "published"].includes(item.status) && (
          <div className="list-details-wrapper-actions">
            <Button size="sm" onClick={() => insert()}>
              {_t("video-gallery.insert-video")}
            </Button>
            {item.status != "published" && (
              <Button appearance="link" size="sm" onClick={() => insert(true)}>
                {_t("video-gallery.insert-nsfw")}
              </Button>
            )}
          </div>
        )}
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
              {_t("video-gallery.info-duration")} {`${item.duration}m`}
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
