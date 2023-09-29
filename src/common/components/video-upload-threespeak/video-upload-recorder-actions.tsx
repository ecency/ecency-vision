import { circleSvg, rectSvg, switchCameraSvg } from "../../img/svg";
import React, { useState } from "react";
import { useGetCameraList } from "./utils";

interface Props {
  noPermission: boolean;
  mediaRecorder?: MediaRecorder;
  recordButtonShow?: boolean;
  onCameraSelect: (camera: MediaDeviceInfo) => void;
}

export function VideoUploadRecorderActions({
  noPermission,
  mediaRecorder,
  onCameraSelect,
  recordButtonShow
}: Props) {
  const cameraList = useGetCameraList();

  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [recordStarted, setRecordStarted] = useState(false);

  const getNextCameraIndex = (index: number) => (index + 1) % cameraList.length;

  return (
    <div className="actions">
      <div>
        {!recordStarted && cameraList.length > 1 ? (
          <div
            className="switch-camera"
            onClick={() => {
              const nextCameraIndex = getNextCameraIndex(currentCameraIndex);
              onCameraSelect(cameraList[nextCameraIndex]);
              setCurrentCameraIndex(nextCameraIndex);
            }}
          >
            {switchCameraSvg}
          </div>
        ) : (
          <></>
        )}
      </div>

      <div>
        {recordStarted ? (
          <div
            aria-disabled={noPermission}
            className="record-btn"
            onClick={() => {
              mediaRecorder?.stop();
              setRecordStarted(false);
            }}
          >
            {rectSvg}
          </div>
        ) : (
          <></>
        )}
        {!recordStarted && recordButtonShow ? (
          <div
            aria-disabled={noPermission}
            className="record-btn"
            onClick={() => {
              mediaRecorder?.start();
              setRecordStarted(true);
            }}
          >
            {circleSvg}
          </div>
        ) : (
          <></>
        )}
      </div>
      <div />
    </div>
  );
}
