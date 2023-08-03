import React, { useEffect, useState } from "react";
import LinearProgress from "../linear-progress";
import { informationVariantSvg, refreshSvg } from "../../img/svg";
import { Modal } from "react-bootstrap";
import { _t } from "../../i18n";
import "./index.scss";
import DropDown from "../dropdown";
import Tooltip from "../tooltip";
import { ConfirmNsfwContent } from "../video-nsfw";
import { dateToFullRelative } from "../../helper/parse-date";

interface videoProps {
  status: string;
  owner: string;
  thumbUrl: string;
  permlink: string;
}

interface Props {
  showGallery: boolean;
  setShowGallery: React.Dispatch<React.SetStateAction<boolean>>;
  checkStat: () => Promise<any>;
  insertText: (before: string, after?: string) => void;
  setVideoEncoderBeneficiary?: (video: any) => void;
  toggleNsfwC?: () => void;
}

const VideoGallery = (props: Props) => {
  const {
    showGallery,
    setShowGallery,
    checkStat,
    insertText,
    setVideoEncoderBeneficiary,
    toggleNsfwC
  } = props;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [isEmbedded, setIsembedded] = useState(false);
  const [label, setLabel] = useState("All");
  const [filtered, setFiltered] = useState<any>([]);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    getAllStatus();
  }, [showGallery]);

  const getAllStatus = async () => {
    setLoading(true);
    const data = await checkStat();
    if (data) {
      setItems(data);
      setLoading(false);
      setLabel("All");
    }
  };

  const setBeneficiary = (video: any) => {
    setVideoEncoderBeneficiary && setVideoEncoderBeneficiary(video);
  };

  const filterList = (type: any) => {
    const itemsFiletred = items.filter((video: videoProps) => video.status === type);
    setFiltered(itemsFiletred);
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

  const dropDown = (
    <div className="video-status-picker">
      <div className="amount">
        {(() => {
          let dropDownConfig: any;
          dropDownConfig = {
            history: "",
            label: label,
            items: [
              {
                label: <span id="ascending">{_t("video-gallery.all")}</span>,
                onClick: () => {
                  setLabel(_t("video-gallery.all"));
                  setFiltered(items);
                  setIsFiltered(true);
                }
              },
              {
                label: <span id="descending">{_t("video-gallery.published")}</span>,
                onClick: () => {
                  setLabel(_t("video-gallery.published"));
                  setIsFiltered(true);
                  filterList("published");
                }
              },
              {
                label: <span id="by-value">{_t("video-gallery.encoding")}</span>,
                onClick: () => {
                  const encoding = "encoding_ipfs" || "encoding_preparing";
                  setLabel(_t("video-gallery.encoding"));
                  filterList(encoding);
                }
              },
              {
                label: <span id="by-balance">{_t("video-gallery.encoded")}</span>,
                onClick: () => {
                  setLabel(_t("video-gallery.encoded"));
                  setIsFiltered(true);
                  filterList("publish_manual");
                }
              },
              {
                label: <span id="by-stake">{_t("video-gallery.failed")}</span>,
                onClick: () => {
                  setLabel(_t("video-gallery.failed"));
                  setIsFiltered(true);
                  filterList("encoding_failed");
                }
              },
              {
                label: <span id="delegations-in">{_t("video-gallery.status-deleted")}</span>,
                onClick: () => {
                  setLabel(_t("video-gallery.status-deleted"));
                  setIsFiltered(true);
                  filterList("deleted");
                }
              }
            ]
          };
          return (
            <div className="amount-actions">
              <DropDown {...dropDownConfig} float="top" />
            </div>
          );
        })()}
      </div>
      <div className="refresh-gallery"
      onClick={() => {
        getAllStatus();
        setIsFiltered(false);
        setFiltered(null)
      }}
      >
        <Tooltip content={_t("video-gallery.refresh")}>
          <span className="info-icon">{refreshSvg}</span>
        </Tooltip>
      </div>
    </div>
  );

  const modalBody = (
    <div className="dialog-content">
      {loading && <LinearProgress />}
      {filtered && label !== "All" && (
        <div className="video-list">
          {filtered?.map((item: any, i: number) => {
            return (
              <div className="video-list-body" key={i}>
                <div
                  className="thumnail-wrapper"
                  // Onclick should embed video
                  //  onClick={() =>{
                  //   }
                  //   }}
                >
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
                    <span className="details-title">{item.title.substring(0, 15)}...</span>
                    <div className="info-status">
                      <Tooltip content={toolTipContent(item.status)}>
                        {statusIcons(item.status)}
                      </Tooltip>
                      <div
                        onMouseOver={() => {
                          getHoveredItem(item);
                          setShowMoreInfo(true);
                        }}
                        onMouseOut={() => setShowMoreInfo(false)}
                        className="info-icon-wrapper"
                      >
                        <span className="info-icon">{informationVariantSvg}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {showMoreInfo && hoveredItem._id === item._id && (
                  <div className="more-info">
                    <div className="each-info">
                      <span>
                        {_t("video-gallery.info-created")} {dateToFullRelative(item.created)}
                      </span>
                    </div>
                   {item.status === "published" && <div className="each-info">
                      <span>
                        {_t("video-gallery.info-views")} {item.views}
                      </span>
                    </div>}
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
                    <div className="each-info d-flex align-items-center">
                      <span className="mr-1"> {_t("video-gallery.status")}</span>
                      <span>
                        <Tooltip content="">{statusIcons(item.status)}</Tooltip>
                      </span>
                      <span>{toolTipContent(item.status)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {isFiltered && filtered.length <= 0 && <div className="gallery-list">{_t("g.empty-list")}</div>}
        </div>
      )}

      {items && label === "All" && (
        <div className="video-list">
          {items?.map((item: any, i: number) => {
            return (
              <div className="video-list-body" key={i}>
                <div
                  className="thumnail-wrapper"
                  //  onClick={() =>{
                  //   }}
                >
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
                    <span className="details-title">{item.title.substring(0, 15)}...</span>
                    <div className="info-status">
                      <Tooltip content={toolTipContent(item.status)}>
                        {statusIcons(item.status)}
                      </Tooltip>
                      <div
                        onMouseOver={() => {
                          getHoveredItem(item);
                          setShowMoreInfo(true);
                        }}
                        onMouseOut={() => setShowMoreInfo(false)}
                        className="info-icon-wrapper"
                      >
                        <span className="info-icon">{informationVariantSvg}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {showMoreInfo && hoveredItem._id === item._id && (
                  <div className="more-info">
                    <div className="each-info">
                      <span>
                        {_t("video-gallery.info-created")} {dateToFullRelative(item.created)}
                      </span>
                    </div>
                    {item.status === "published" && <div className="each-info">
                      <span>
                        {_t("video-gallery.info-views")} {item.views}
                      </span>
                    </div>}
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
                    <div className="each-info d-flex">
                      <span className="mr-1"> {_t("video-gallery.status")}</span>
                      <span>
                        <Tooltip content="">{statusIcons(item.status)}</Tooltip>
                      </span>
                      <span>{toolTipContent(item.status)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!loading && items?.length === 0 && (
            <div className="gallery-list">{_t("g.empty-list")}</div>
          )}
        </div>
      )}
    </div>
  );

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
          {dropDown}
          {modalBody}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default VideoGallery;
