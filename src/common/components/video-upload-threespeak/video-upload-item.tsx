import React, { useRef } from "react";
import { uploadSvgV } from "../../img/svg";
import { ProgressBar } from "react-bootstrap";

interface Props {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type: "video" | "thumbnail";
  accept: "video/*" | "image/*";
  label: string;
  completed: number;
}

export function VideoUploadItem({ onFileChange, type, accept, label, completed }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <div
      className="d-flex align-items-center flex-column border rounded p-3 video-upload-item"
      onClick={() => fileInput.current?.click()}
    >
      {uploadSvgV}
      {label}
      <input
        type="file"
        ref={fileInput}
        accept={accept}
        id={type + "-input"}
        style={{ display: "none" }}
        onChange={onFileChange}
      />
      {completed ? (
        <ProgressBar
          className="w-100 mt-3"
          max={100}
          min={0}
          now={completed}
          label={`${completed}%`}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
