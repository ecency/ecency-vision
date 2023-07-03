import React, { useEffect, useMemo, useState } from "react";
import LinearProgress from "../linear-progress";
import { deleteForeverSvg, informationVariantSvg } from "../../img/svg";
import { Button, Modal, Tooltip } from "react-bootstrap";
import { _t } from "../../i18n";
import "./index.scss";
import DropDown, { MenuItem } from "../dropdown";

const VideoGallery = (props: any) => {
  const { showGaller, setShowGallery, checkStat, insertText, setVideoEncoderBeneficiary, activeUser, showConfirmNsfwModal} = props;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [isEmbedded, setIsembedded] = useState(false);
  const [label, setLabel] = useState("All");
  const [filtered, setFiltered] = useState<any>([]);
  // const [confirmIsNsfw, setConfirmIsNsfw] = useState(false);
  // const [isNsfw, setIsNsfw] = useState(false)

  useEffect(() => {
    getAllStatus();
  }, [showGaller]);

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
  };

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

  const filterList = (type: any) => {
   const itemsFiletred = items.filter((video: any) => (video.status === type));
   setFiltered(itemsFiletred)
  };

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
  };

  // const handleChange = () => {
  //   setIsNsfw(prevIsNsfw => {
  //     const updatedIsNsfw = !prevIsNsfw;
  //     console.log("updated isNsfw", updatedIsNsfw);
  //     console.log("isNsfw", isNsfw);
  //     return updatedIsNsfw;
  //   });
  // }

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
                  setFiltered(items)
                }
              },
              {
                label: <span id="descending">{_t("video-gallery.published")}</span>,
                onClick: () => {
                  setLabel(_t("video-gallery.published"));
                  filterList("published")
                }
              },
              {
                label: <span id="by-value">{_t("video-gallery.encoding")}</span>,
                onClick: () => {
                  const encoding = "encoding_ipfs" || "encoding_preparing"
                  setLabel(_t("video-gallery.encoding"));
                  filterList(encoding)
                }
              },
              {
                label: <span id="by-balance">{_t("video-gallery.encoded")}</span>,
                onClick: () => {
                  setLabel(_t("video-gallery.encoded"));
                  filterList("publish_manual")
                }
              },
              {
                label: <span id="by-stake">{_t("video-gallery.failed")}</span>,
                onClick: () => {
                  setLabel(_t("video-gallery.failed"));
                  filterList("encoding_failed")
                }
              },
              {
                label: (
                  <span id="delegations-in">{_t("video-gallery.status-deleted")}</span>
                ),
                onClick: () => {
                  setLabel(_t("video-gallery.status-deleted"));
                  filterList("deleted")
                }
              },
            ]
          };
          return (
            <div className="amount-actions">
              <DropDown {...dropDownConfig} float="top" />
            </div>
          );
        })()}
      </div>
    </div>
  )

  const modalBody = (
    <div className="dialog-content">
      {loading && <LinearProgress />}
        {filtered && <div className="video-list">
          {(filtered)?.map((item: any, i: number) => {
            return (
              <div className="video-list-body" key={i}>
                {/* Somehow video delays and make some unnecessary request, will test out later, could be due to network when i tested */}
                 {item.status === "published" ?
                 <div className="video-wrapper">
                    <iframe
                      src={`https://3speak.tv/embed?v=${activeUser.username}/${item.permlink}`}
                      allowFullScreen
                      className="iframe"
                    ></iframe>
                 </div> : 
                <img src={item.thumbUrl} alt="" />
                }
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
                        embeddVideo(item);
                        setBeneficiary(item);
                        setShowGallery(false);
                        showConfirmNsfwModal();
                        }}>
                        {_t("video-gallery.status-encoded")}
                      </button>
                    ) : item.status === "encoding_failed" ? (
                      <span className="encoding-failed">{_t("video-gallery.status-failed")}</span>
                    ) : item.status === "published" ? (
                      <div>
                        <span className="published">{_t("video-gallery.status-published")}</span>
                        {/* <button className="post-video-btn">view</button> */}
                      </div>
                    ) : item.status === "deleted" ? (
                      <div className="deleted">
                        <span className="text-danger">{_t("video-gallery.status-deleted")}</span>
                        {/* <span className="text-danger">{deleteForeverSvg}</span> */}
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
        </div>}

        {items && label === "All" && <div className="video-list">
          {items?.map((item: any, i: number) => {
            return (
              <div className="video-list-body" key={i}>
                  {item.status === "published" ?
                 <div className="video-wrapper">
                    <iframe
                      src={`https://3speak.tv/embed?v=${activeUser.username}/${item.permlink}`}
                      allowFullScreen
                      className="iframe"
                    ></iframe>
                 </div> : 
                <img src={item.thumbUrl} alt="" />
                }
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
                      className="post-video-btn" 
                      onClick={() =>{ 
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
                        {/* <button className="post-video-btn">view</button> */}
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
        </div>}
        
      {!loading && items?.length === 0 || filtered?.length === 0 && <div className="gallery-list">{_t("g.empty-list")}</div>}
    </div>
  );

  // const confirmNsfw = (
  //   <div className="d-flex flex-column m-3">
  //     <div>        
  //       <input type="checkbox" checked={isNsfw} onChange={handleChange} ></input>
  //       <label className="text-danger ml-3">Please check if your content is NSFW</label>
  //     </div>
  //     <Button className="w-50 align-self-center">Confirm</Button>
  //   </div>
  // )

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
          {dropDown}
          {modalBody}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default VideoGallery;
