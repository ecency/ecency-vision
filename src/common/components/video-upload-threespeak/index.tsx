import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { Button, Modal } from "react-bootstrap";

import { videoSvg, uploadSvgV } from "../../img/svg";
import { _t } from "../../i18n";
import { getAllVideoStatuses, uploadFile, uploadVideoInfo } from "../../api/threespeak";
import VideoGallery from "../video-gallery";
import { success } from "../feedback";
import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";
import "./index.scss";

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  insertText: (before: string, after?: string) => void;
  setVideoEncoderBeneficiary?: (video: any) => void;
  toggleNsfwC?: () => void;
}

export const VideoUpload = (props: Props) => {
  const { activeUser, global, insertText, setVideoEncoderBeneficiary, toggleNsfwC } = props;

  const fileInput = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<any>(null);
  const [step, setStep] = useState("upload");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [videoPercentage, setVideoPercentage] = useState(0);
  const [thumbPercentage, setThumbPercentage] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [duration, setDuration] = useState("");

  const canUpload = thumbUrl && videoUrl && videoPercentage === 100 && thumbPercentage === 100;

  const getVideoDuration = () => {
    if (videoRef.current) {
      const { duration } = videoRef.current;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const videoDuration = `${minutes}:${seconds}`;
      setDuration(videoDuration);
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    let file = event.target.files?.[0];
    if (!file) return;

    uploadFile(file!, type, (percentage: number) => {
      if (type === "video") {
        setVideoPercentage(percentage);
      } else {
        setThumbPercentage(percentage);
      }
    })
      .then((result) => {
        if (type === "video") {
          setVideoUrl(result.fileUrl);
          setFileName(result.fileName);
          setFileSize(result.fileSize);
        } else {
          setThumbUrl(result.fileUrl);
          setFileName(result.fileName);
          setFileSize(result.fileSize);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement | any>) => {
    const file: any = e?.target?.files[0];
    onChange(e, "thumbnail");
    setCoverImage(URL?.createObjectURL(file));
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement | any>) => {
    const file: any = e?.target?.files[0];
    onChange(e, "video");
    setSelectedFile(URL?.createObjectURL(file));
  };

  const uploadInfo = async () => {
    const data = await uploadVideoInfo(
      fileName,
      fileSize,
      videoUrl,
      thumbUrl,
      activeUser!.username,
      duration
    );
    if (data) {
      success(_t("video-upload.success"));
    }
  };

  const checkStat = async () => {
    const allStatus = await getAllVideoStatuses(activeUser!.username);
    return allStatus;
  };

  const uploadVideoModal = (
    <div className="dialog-content">
      <div className="file-input">
        <label htmlFor="video-input">
          {_t("video-upload.choose-video")} {uploadSvgV}
        </label>
        <input
          type="file"
          ref={fileInput}
          accept="video/*"
          id="video-input"
          style={{ display: "none" }}
          onChange={handleVideoChange}
        />
        <div className="progresss">
          {Number(videoPercentage) > 0 && (
            <>
              <div style={{ width: `${Number(videoPercentage)}%` }} className="progress-bar" />
              <span>{`${videoPercentage}%`}</span>
            </>
          )}
        </div>
      </div>
      <div className="file-input">
        <label htmlFor="image-input">
          {_t("video-upload.choose-thumbnail")} {uploadSvgV}
        </label>
        <input
          type="file"
          ref={fileInput}
          accept="image/*"
          id="image-input"
          style={{ display: "none" }}
          onChange={handleThumbnailChange}
        />
        <div className="progresss">
          {Number(thumbPercentage) > 0 && (
            <>
              <div style={{ width: Number(thumbPercentage) + "%" }} className="progress-bar" />
              <span>{`${thumbPercentage}%`}</span>
            </>
          )}
        </div>
      </div>
      <Button
        className="mt-3"
        disabled={!canUpload}
        onClick={() => {
          setStep("preview");
        }}
      >
        {_t("video-upload.continue")}
      </Button>
    </div>
  );

  const previewVideo = (
    <div className="dialog-content">
      <div className="file-input">
        <video
          ref={videoRef}
          onLoadedMetadata={getVideoDuration}
          controls={true}
          poster={coverImage}
        >
          <source src={selectedFile} type="video/mp4" />
        </video>
      </div>
      <div className="d-flex">
        <Button
          className="bg-dark"
          onClick={() => {
            setStep("upload");
          }}
        >
          {_t("g.back")}
        </Button>
        <Button
          className="ml-5"
          disabled={!canUpload}
          onClick={() => {
            uploadInfo();
            setShowModal(false);
            setStep("upload");
            setThumbPercentage(0);
            setVideoPercentage(0);
            setShowGallery(true);
          }}
        >
          {_t("video-upload.to-gallery")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mt-2 cursor-pointer new-feature">
      <div className="d-flex justify-content-center bg-red">
        {videoSvg}
        {activeUser && (
          <div className="sub-tool-menu">
            <div className="sub-tool-menu-item" onClick={() => setShowModal(true)}>
              {_t("video-upload.upload-video")}
            </div>
            {global.usePrivate && (
              <div
                className="sub-tool-menu-item"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  setShowGallery(true);
                }}
              >
                {_t("video-upload.video-gallery")}
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <VideoGallery
          showGallery={showGallery}
          setShowGallery={setShowGallery}
          checkStat={checkStat}
          insertText={insertText}
          setVideoEncoderBeneficiary={setVideoEncoderBeneficiary}
          toggleNsfwC={toggleNsfwC}
        />
      </div>
      <div>
        <Modal
          animation={false}
          show={showModal}
          centered={true}
          onHide={() => setShowModal(false)}
          keyboard={false}
          className="add-image-modal"
          // size="lg"
        >
          <Modal.Header closeButton={true}>
            <Modal.Title>
              {step === "upload" && <p>{_t("video-upload.upload-video")}</p>}
              {step === "preview" && <p>{_t("video-upload.preview")}</p>}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {step === "upload" && uploadVideoModal}
            {step === "preview" && previewVideo}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};
