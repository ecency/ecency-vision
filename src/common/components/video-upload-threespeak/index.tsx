import React, { ChangeEvent, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";

import { videoSvg } from "../../img/svg";
import { _t } from "../../i18n";
import { useThreeSpeakVideoUpload, useUploadVideoInfo } from "../../api/threespeak";
import VideoGallery from "../video-gallery";
import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";
import "./index.scss";
import { VideoUploadItem } from "./video-upload-item";
import { createFile } from "../../util/create-file";

const DEFAULT_THUMBNAIL = require("./assets/thumbnail-play.jpg");

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  insertText: (before: string, after?: string) => void;
  setVideoEncoderBeneficiary?: (video: any) => void;
  toggleNsfwC?: () => void;
}

export const VideoUpload = (props: Props) => {
  const { activeUser, global, insertText, setVideoEncoderBeneficiary, toggleNsfwC } = props;
  const {
    mutateAsync: uploadFile,
    completedByType: { video: videoPercentage, thumbnail: thumbPercentage }
  } = useThreeSpeakVideoUpload();
  const { mutateAsync: uploadInfo } = useUploadVideoInfo();

  const videoRef = useRef<HTMLVideoElement>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<string>();
  const [step, setStep] = useState("upload");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const [duration, setDuration] = useState("");

  const canUpload = videoUrl && videoPercentage === 100;

  const getVideoDuration = () => {
    if (videoRef.current) {
      const { duration } = videoRef.current;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const videoDuration = `${minutes}:${seconds}`;
      setDuration(videoDuration);
    }
  };

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    let file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadFile({ file, type });
    if (result) {
      if (type === "video") {
        setVideoUrl(result.fileUrl);
        setFileName(result.fileName);
        setFileSize(result.fileSize);
      } else {
        setThumbUrl(result.fileUrl);
        setFileName(result.fileName);
        setFileSize(result.fileSize);
      }
    }
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

  const uploadVideoModal = (
    <div className="dialog-content ">
      <div className="three-speak-video-uploading">
        <VideoUploadItem
          label={_t("video-upload.choose-video")}
          onFileChange={handleVideoChange}
          type="video"
          accept="video/*"
          completed={videoPercentage}
        />
        <VideoUploadItem
          label={_t("video-upload.choose-thumbnail")}
          onFileChange={handleThumbnailChange}
          type="thumbnail"
          accept="image/*"
          completed={thumbPercentage}
        />
      </div>
      <Button
        className="mt-3"
        disabled={!canUpload}
        onClick={async () => {
          if (!thumbUrl) {
            const file = await createFile(DEFAULT_THUMBNAIL);
            onChange({ target: { files: [file] } } as any, "thumbnail");
            setCoverImage(URL?.createObjectURL(file));
          }
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
          onLoadedMetadata={getVideoDuration}
          ref={videoRef}
          controls={true}
          poster={coverImage}
        >
          <source src={selectedFile} type="video/mp4" />
        </video>
      </div>
      <div className="d-flex justify-content-end mt-3">
        <Button
          className="bg-dark"
          onClick={() => {
            setStep("upload");
          }}
        >
          {_t("g.back")}
        </Button>
        <Button
          className="ml-3"
          disabled={!canUpload}
          onClick={() => {
            uploadInfo({
              fileName,
              fileSize,
              videoUrl,
              thumbUrl,
              activeUser: activeUser!.username,
              duration
            });
            setShowModal(false);
            setStep("upload");
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
