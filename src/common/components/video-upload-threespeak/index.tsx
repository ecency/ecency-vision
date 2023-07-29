import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { videoSvg, uploadSvgV } from "../../img/svg";
import { Button, Modal } from "react-bootstrap";
import { _t } from "../../i18n";
import "./index.scss";
import { getAllVideoStatuses, uploadVideoInfo } from "../../api/threespeak";
import * as tus from "tus-js-client";
import VideoGallery from "../video-gallery";
import useMount from "react-use/lib/useMount";
import { success } from "../feedback";
import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  insertText: (before: string, after?: string) => void;
  setVideoEncoderBeneficiary?: (video: any) => void;
  toggleNsfwC?: () => void;
}

export const VideoUpload = (props: Props) => {
  const { activeUser, global, insertText, setVideoEncoderBeneficiary, toggleNsfwC } = props;

  const tusEndPoint = "https://uploads.3speak.tv/files/";
  const fileInput = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<any>(null);
  const [step, setStep] = useState("upload");
  const [videoId, setVideoId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [videoPercentage, setVideoPercentage] = useState("");
  const [thumbPercentage, setThumbPercenrage] = useState("");
  const [isNsfwC, setIsNsfwC] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [duration, setDuration] = useState("");

  const canUpload = thumbUrl && videoUrl;

  useMount(() => setIsMounted(true));

  useEffect(() => {
    // if (isMounted) {
    //   // threespeakAuth(activeUser!.username);
    // }
  }, []);

  const getVideoDuration = () => {
    if (videoRef.current) {
      const { duration } = videoRef.current;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const videoDuration = `${minutes}:${seconds}`;
      setDuration(videoDuration);
    }
  };

  const onChange: any = (event: { target: { files: any[] } }, type: string) => {
    let file = event.target.files[0];

    let upload: any = new tus.Upload(file, {
      // Endpoint is the upload creation URL from your tus server
      endpoint: tusEndPoint,
      // Retry delays will enable tus-js-client to automatically retry on errors
      retryDelays: [0, 3000, 5000, 10000, 20000],
      // Attach additional meta data about the file for the server
      metadata: {
        filename: file.name,
        filetype: file.type
      },
      // Callback for errors which cannot be fixed using retries
      onError: function (error: Error) {
        return console.log(error);
      },
      // Callback for reporting upload progress
      onProgress: function (bytesUploaded: number, bytesTotal: number) {
        let vPercentage;
        let tPercentage;
        if (type === "video") {
          vPercentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setVideoPercentage(vPercentage);
        } else {
          tPercentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setThumbPercenrage(tPercentage);
        }
      },
      // Callback for once the upload is completed
      onSuccess: function () {
        let file = upload?.url.replace(this.endpoint, "");
        if (type === "video") {
          setVideoUrl(file);
          setFileName(upload.file?.name);
          setFileSize(upload.file?.size);
        } else {
          setThumbUrl(file);
          setFileName(upload.file?.name);
          setFileSize(upload.file?.size);
        }
      }
    });
    upload.start();
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
      setVideoId(data._id);
      setIsNsfwC(data.isNsfwContent);
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
