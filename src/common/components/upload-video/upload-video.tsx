import React, { ChangeEvent, FC, useEffect, useRef, useState } from 'react'
import {Button, Modal} from "react-bootstrap";
import { VideoUploadItem } from './upload-video-item';
import { useThreeSpeakVideoUpload, useUploadVideoInfo } from '../../api/threespeak';
import { _t } from '../../i18n';
import { Global } from '../../store/global/types';
import { ActiveUser } from '../../store/active-user/types';
import { createFile } from "../../util/create-file";
import "./_index.scss";

const DEFAULT_THUMBNAIL = require("./assets/thumbnail.jpg");

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
  setShowGallery: (v: boolean) => void;
  className?: string;
  global: Global;
  activeUser: ActiveUser;
}

const VideoUpload: FC<Props> = ({ activeUser, show, setShow, setShowGallery }) => {

  const {
    mutateAsync: uploadVideo,
    completed: videoPercentage,
    setCompleted: setVideoPercentage
  } = useThreeSpeakVideoUpload("video");
  const {
    mutateAsync: uploadThumbnail,
    completed: thumbnailPercentage,
    setCompleted: setThumbnailPercentage
  } = useThreeSpeakVideoUpload("thumbnail");
  const { mutateAsync: uploadInfo } = useUploadVideoInfo(activeUser);

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
  const [duration, setDuration] = useState("");

  const canUpload = videoUrl && videoPercentage === 100;

  // Reset on dialog hide
  useEffect(() => {
    if (!show) {
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
      setVideoPercentage(0);
      setThumbnailPercentage(0);
    }
  }, [show]);

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

    if (type === "video") {
      const result = await uploadVideo({ file });
      if (result) {
        setVideoUrl(result.fileUrl);
        setFilevName(result.fileName);
        setFilevSize(result.fileSize);
      }
    } else {
      const result = await uploadThumbnail({ file });
      if (result) {
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
          label="Choose video to upload"
          onFileChange={handleVideoChange}
          type="video"
          accept="video/*"
          completed={videoPercentage}
        />
        <VideoUploadItem
          label="Choose thumbnail (optional)"
          onFileChange={handleThumbnailChange}
          type="thumbnail"
          accept="image/*"
          completed={thumbnailPercentage}
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
        Continue upload
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
            setShow(false);
            setStep("upload");
            setShowGallery(true);
          }}
        >
          Upload to gallery
        </Button>
      </div>
    </div>
  );

 return (
        <Modal
          animation={false}
          show={show}
          centered={true}
          onHide={() => setShow(false)}
          keyboard={false}
          className="add-image-modal"
        >
          <Modal.Header closeButton={true}>
            <Modal.Title>
              {step === "upload" && <p>Upload video</p>}
              {step === "preview" && <p>Video preview</p>}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {step === "upload" && uploadVideoModal}
            {step === "preview" && previewVideo}
          </Modal.Body>
        </Modal>
  );
}

export default VideoUpload