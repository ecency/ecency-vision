import { circleSvg, rectSvg } from "../../img/svg";
import React, { useState } from "react";

interface Props {
  noPermission: boolean;
  mediaRecorder?: MediaRecorder;
}

export function VideoUploadRecorderActions({ noPermission, mediaRecorder }: Props) {
  const [recordStarted, setRecordStarted] = useState(false);

  return (
    <div className="actions">
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
      )}
    </div>
  );
}
