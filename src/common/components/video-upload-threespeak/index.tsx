import React, { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { _t } from "../../i18n";
import { useThreeSpeakVideoUpload, useUploadVideoInfo } from "../../api/threespeak";
import "./index.scss";
import { VideoUploadItem } from "./video-upload-item";
import { createFile } from "../../util/create-file";
import { useMappedStore } from "../../store/use-mapped-store";

const DEFAULT_THUMBNAIL = require("./assets/thumbnail-play.jpg");

interface Props {
  children?: ReactNode;
  show: boolean;
  setShow: (v: boolean) => void;
  setShowGallery: (v: boolean) => void;
}

export const VideoUpload = (props: Props & React.HTMLAttributes<HTMLDivElement>) => {
  const { activeUser, toggleUIProp, global } = useMappedStore();
  const {
    mutateAsync: uploadFile,
    completedByType: { video: videoPercentage, thumbnail: thumbPercentage },
    setCompletedByType
  } = useThreeSpeakVideoUpload();
  const { mutateAsync: uploadInfo } = useUploadVideoInfo();

  const videoRef = useRef<HTMLVideoElement>(null);

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<string>();
  const [step, setStep] = useState("upload");
  const [filevName, setFilevName] = useState("");
  const [fileName, setFileName] = useState("");
  const [filevSize, setFilevSize] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const [duration, setDuration] = useState("");

  const canUpload = videoUrl && videoPercentage === 100;

  // Reset on dialog hide
  useEffect(() => {
    if (!props.show) {
      setSelectedFile(null);
      setCoverImage(undefined);
      setFileName("");
      setFileSize(0);
      setFilevName("");
      setFilevSize(0);
      setVideoUrl("");
      setThumbUrl("");
      setDuration("");
      setStep("upload");
      setCompletedByType({});
    }
  }, [props.show]);

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
        setFilevName(result.fileName);
        setFilevSize(result.fileSize);
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
              fileName: filevName,
              fileSize: filevSize,
              videoUrl,
              thumbUrl,
              activeUser: activeUser!.username,
              duration
            });
            props.setShow(false);
            setStep("upload");
            props.setShowGallery(true);
          }}
        >
          {_t("video-upload.to-gallery")}
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className={"cursor-pointer " + props.className}
      onClick={() => (activeUser ? null : toggleUIProp("login"))}
    >
      <div className="d-flex justify-content-center bg-red">{props.children}</div>
      <div>
        <Modal
          animation={false}
          show={props.show}
          centered={true}
          onHide={() => props.setShow(false)}
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
