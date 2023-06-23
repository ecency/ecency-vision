import React, { useEffect, useMemo, useState } from "react";
import LinearProgress from "../linear-progress";
import { deleteForeverSvg, informationVariantSvg } from "../../img/svg";
import { Button, Modal, Tooltip } from "react-bootstrap";
import { _t } from "../../i18n";
import "./index.scss";

const VideoGallery = (props: any) => {
  const { showGaller, setShowGallery, checkStat, insertText, setVideoEncoderBeneficiary} = props;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState('')
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [isEmbedded, setIsembedded] = useState(false);

  useEffect(() => {
    getAllStatus();
  }, []);

  const getAllStatus = async () => {
    setLoading(true);
    const data = await checkStat();
    if (data) {
      setItems(data);
      setLoading(false);
    }
  };
  
  const setBeneficiary = (video: any) => {
    setVideoEncoderBeneficiary(video)
  }

  const formatTime = (dateStr: string | number | Date) => {
    const date: any = new Date(dateStr);
    const now: any = new Date();

    const difference = Math.abs(now - date);
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
      if (years === 1) {
        return `${years} year ago`;
      } else {
        return `${years} years ago`;
      }
    } else if (months > 0) {
      if (months === 1) {
        return `${months} month ago`;
      } else {
        return ` ${months} months ago`;
      }
    } else if (days > 0) {
      if (days === 1) {
        return `${days} day ago`;
      } else {
        return `${days} days ago`;
      }
    } else if (hours > 0) {
      if (hours === 1) {
        return `${hours} hour ago`;
      } else {
        return `${hours} hours ago`;
      }
    } else if (minutes > 0) {
      if (minutes === 1) {
        return `${minutes} mintutes ago`;
      } else {
        return `${minutes} minutes ago`;
      }
    } else {
      return `${seconds} seconds ago`;
    }
  };

  const videosDrafts = useMemo(() => {
    if (!filterType) return items
    return items.filter((video: any) => video.status === filterType)
  }, [filterType]);

  const getHoveredItem = (item: any) => {
    setHoveredItem(item);
  };

  const embeddVideo = (video: any) => {
    const speakUrl = "https://3speak.tv/watch?v="
    const speakFile = `[![](${video.thumbUrl})](${speakUrl}${video.owner}/${video.permlink})`

    const element = (
   ` <center>${speakFile}</center>`
    )
    insertText(element)
    setIsembedded(true)
  }

  const modalBodyTop = (
    <div className="video-status-picker">
      <Button
        variant="outline-primary"
        onClick={ () => {
          setFilterType("");
        }}
      >
        {_t("video-gallery.all")}
      </Button>

      <Button
        variant="outline-primary"
        onClick={ () => {
          setFilterType("published");
        }}
      >
        {_t("video-gallery.published")}
      </Button>

      <Button
        variant="outline-primary"
        onClick={ () => {
          setFilterType("encoding_ipfs");
        }}
      >
        {_t("video-gallery.encoding")}
      </Button>

      <Button
        variant="outline-primary"
        onClick={ () => {
          setFilterType("publish_manual");
        }}
      >
        {_t("video-gallery.encoded")}
      </Button>

      <Button
        variant="outline-primary"
        onClick={ () => {
          setFilterType("encoding_failed");
        }}
      >
        {_t("video-gallery.failed")}
      </Button>
    </div>
  );

  const modalBody = (
    <div className="dialog-content">
      {loading && <LinearProgress />}
      {videosDrafts?.length > 0 && filterType !== '' ? (
        <div className="video-list">
          {(videosDrafts || items)?.map((item: any, i: number) => {
            return (
              <div className="video-list-body" key={i}>
                {/* <div className="list-image"> */}
                  <img src={item.thumbUrl} alt="" />
                {/* </div> */}
                <div className="list-details-wrapper">
                  <div className="list-title">
                    <span className="details-title">{item.title}</span>
                    <span
                      onMouseOver={() => {
                        getHoveredItem(item);
                        setShowMoreInfo(true);
                      }}
                      onMouseOut={() => setShowMoreInfo(false)}
                      className="info-icon details-svg"
                    >
                      {_t("video-gallery.view-more")}
                    </span>
                  </div>
                  <div className="list-bottom-wrapper">
                    <span className="video-date">{formatTime(item.created)}</span>
                    {item.status === "publish_manual" ? (
                      <button
                      // disabled={isEmbedded}
                      className="post-video-btn" onClick={() =>{ 
                        embeddVideo(item)
                        setBeneficiary(item)
                        setShowGallery(false)
                        }}>
                        {_t("video-gallery.status-encoded")}
                      </button>
                    ) : item.status === "encoding_failed" ? (
                      <span className="encoding-failed">{_t("video-gallery.status-failed")}</span>
                    ) : item.status === "published" ? (
                      <div>
                        <span className="published">{_t("video-gallery.status-published")}</span>
                        <button className="post-video-btn">view</button>
                      </div>
                    ) : (
                      <span className="encoding">{_t("video-gallery.status-encoding")}</span>
                    )}
                  </div>
                </div>
                {showMoreInfo && hoveredItem._id === item._id && (
                  <div className="more-info">
                    <div className="each-info">
                      <span>
                        {_t("video-gallery.info-created")} {formatTime(item.created)}
                      </span>
                    </div>
                    <div className="each-info">
                      <span>
                        {_t("video-gallery.info-views")} {item.views}
                      </span>
                    </div>
                    <div className="each-info">
                      <span>
                        {_t("video-gallery.info-duration")} {item.duration}
                      </span>
                    </div>
                    <div className="each-info">
                      <span>
                        {_t("video-gallery.info-size")}{" "}
                        {`${(item.size / (1024 * 1024)).toFixed(2)}MB`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="video-list">
          {items?.map((item: any, i: number) => {
            return (
              <div className="video-list-body" key={i}>
                  <img src={item.thumbUrl} alt="" />
                <div className="list-details-wrapper">
                  <div className="list-title">
                    <span className="details-title">{item.title}</span>
                    <span
                      onMouseOver={() => {
                        getHoveredItem(item);
                        setShowMoreInfo(true);
                      }}
                      onMouseOut={() => setShowMoreInfo(false)}
                      className="info-icon details-svg"
                    >
                      {_t("video-gallery.view-more")} 
                    </span>
                  </div>
                  <div className="list-bottom-wrapper">
                    <span className="video-date">{formatTime(item.created)}</span>
                    {item.status === "publish_manual" ? (
                      <button
                      disabled={isEmbedded}
                      className="post-video-btn" onClick={() =>{ 
                        embeddVideo(item)
                        setBeneficiary(item)
                        setShowGallery(false)
                        }}>
                        {_t("video-gallery.status-encoded")}
                      </button>
                    ) : item.status === "encoding_failed" ? (
                      <span className="encoding-failed">{_t("video-gallery.status-failed")}</span>
                    ) : item.status === "published" ? (
                      <div>
                        <span className="published">{_t("video-gallery.status-published")}</span>
                        <button className="post-video-btn">view</button>
                      </div>
                    ) : (
                      <span className="encoding">{_t("video-gallery.status-encoding")}</span>
                    )}
                  </div>
                </div>
                {showMoreInfo && hoveredItem._id === item._id && (
                  <div className="more-info">
                    <div className="each-info">
                      <span>
                        {_t("video-gallery.info-created")} {formatTime(item.created)}
                      </span>
                    </div>
                    <div className="each-info">
                      <span>
                        {_t("video-gallery.info-views")} {item.views}
                      </span>
                    </div>
                    <div className="each-info">
                      <span>
                        {_t("video-gallery.info-duration")} {item.duration}
                      </span>
                    </div>
                    <div className="each-info">
                      <span>
                        {_t("video-gallery.info-size")}{" "}
                        {`${(item.size / (1024 * 1024)).toFixed(2)}MB`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) }
      {!loading && items?.length === 0 && <div className="gallery-list">{_t("g.empty-list")}</div>}
    </div>
  );

  return (
    <div>
      <Modal
        show={showGaller}
        centered={true}
        onHide={() => setShowGallery(false)}
        size="lg"
        className="gallery-modal"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>{_t("video-gallery.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalBodyTop}
          {modalBody}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default VideoGallery;
