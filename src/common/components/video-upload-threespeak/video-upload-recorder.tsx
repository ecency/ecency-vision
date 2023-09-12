import React, { useEffect, useRef, useState } from "react";
import useMount from "react-use/lib/useMount";
import { VideoUploadRecorderActions } from "./video-upload-recorder-actions";
import { VideoUploadRecorderNoPermission } from "./video-upload-recorder-no-permission";
import { Button } from "react-bootstrap";
import { _t } from "../../i18n";
import { useThreeSpeakVideoUpload } from "../../api/threespeak";
import { error } from "../feedback";
import { v4 } from "uuid";
import { useUnmount } from "react-use";

interface Props {
  setVideoUrl: (v: string) => void;
  setFilevName: (v: string) => void;
  setFilevSize: (v: number) => void;
  setSelectedFile: (v: string) => void;
  onReset: () => void;
}

export function VideoUploadRecorder({
  setVideoUrl,
  setFilevName,
  setFilevSize,
  onReset,
  setSelectedFile
}: Props) {
  const [stream, setStream] = useState<MediaStream>();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [recordedVideoSrc, setRecordedVideoSrc] = useState<string>();
  const [recordedBlob, setRecordedBlob] = useState<Blob>();
  const [noPermission, setNoPermission] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<MediaDeviceInfo>();

  const ref = useRef<HTMLVideoElement | null>(null);

  const {
    mutateAsync: uploadVideo,
    completed,
    isLoading,
    isSuccess
  } = useThreeSpeakVideoUpload("video");

  useMount(() => initStream());

  useUnmount(() => {
    stream?.getTracks().forEach((track) => track.stop());
  });

  useEffect(() => {
    initStream();
  }, [currentCamera]);

  useEffect(() => {
    if (stream && ref.current) {
      // @ts-ignore
      ref.current?.srcObject = stream;
    }
  }, [stream, ref]);

  const initStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: currentCamera ? { deviceId: currentCamera.deviceId } : true,
        audio: true
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm"
      });

      setMediaRecorder(mediaRecorder);
      setStream(stream);

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          setRecordedVideoSrc(URL.createObjectURL(event.data));
          setRecordedBlob(event.data);
          stream.getTracks().forEach((track) => track.stop());
        }
      });
    } catch (e) {
      console.error("Video recording:", e);
      setNoPermission(true);
    }
  };

  return (
    <div className="video-upload-recorder">
      {recordedBlob ? (
        <Button className="reset-btn" variant="link" onClick={() => onReset()}>
          {_t("video-upload.reset")}
        </Button>
      ) : (
        <></>
      )}

      {!noPermission && !recordedVideoSrc ? (
        <VideoUploadRecorderActions
          noPermission={noPermission}
          mediaRecorder={mediaRecorder}
          onCameraSelect={(camera) => {
            stream
              ?.getTracks()
              .filter(({ kind }) => kind === "video")
              .forEach((track) => track.stop());

            setCurrentCamera(camera);
          }}
        />
      ) : (
        <></>
      )}

      {noPermission ? (
        <VideoUploadRecorderNoPermission />
      ) : (
        <>
          <video
            hidden={!recordedVideoSrc}
            controls={true}
            src={recordedVideoSrc}
            autoPlay={false}
            playsInline={true}
            id="videoRecorded"
          />
          <video
            hidden={!!recordedVideoSrc}
            ref={ref}
            muted={true}
            autoPlay={true}
            playsInline={true}
            id="videoLive"
          />
          {recordedVideoSrc ? (
            <div className="d-flex align-items-center justify-content-center mt-3">
              {recordedBlob && isSuccess ? (
                <div className="bg-success text-white p-3 text-sm rounded-pill w-100">
                  {_t("video-upload.uploaded")}
                </div>
              ) : (
                <Button
                  disabled={isLoading}
                  onClick={async () => {
                    if (!recordedBlob) {
                      return;
                    }

                    try {
                      const file = new File([recordedBlob], `ecency-recorder-${v4()}.webm`, {
                        type: "video/webm"
                      });
                      const result = await uploadVideo({
                        file
                      });
                      if (result) {
                        setVideoUrl(result.fileUrl);
                        setFilevName(result.fileName);
                        setFilevSize(result.fileSize);
                        setSelectedFile(URL.createObjectURL(file));
                      }
                    } catch (e) {
                      error(e);
                    }
                  }}
                >
                  {isLoading
                    ? _t("video-upload.uploading", { n: completed, total: 100 })
                    : _t("video-upload.confirm-and-upload")}
                </Button>
              )}
            </div>
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
}
